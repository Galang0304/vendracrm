import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { webhookService } from '@/lib/webhook'
import { UserRole } from '@prisma/client'

// POST - Import CSV data
export async function POST(request: NextRequest) {
  // Set longer timeout for large imports
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minutes timeout
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userCompanyId = session.user.companyId
    if (!userCompanyId && session.user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { message: 'Company ID not found' },
        { status: 400 }
      )
    }

    // Check subscription limits for FREE users
    const subscriptionTier = session.user.subscriptionTier || 'FREE'
    if (subscriptionTier === 'FREE') {
      const existingProductCount = await prisma.product.count({
        where: { companyId: userCompanyId }
      })
      
      if (existingProductCount >= 100) {
        return NextResponse.json(
          { 
            message: 'Batas maksimal 100 produk untuk paket FREE telah tercapai. Upgrade ke paket berbayar untuk menambah lebih banyak produk.',
            limit: 'PRODUCT_LIMIT_EXCEEDED'
          },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const { csvData, importType = 'transactions', storeId, companyId } = body

    // Debug: Log company ID resolution
    console.log('🔍 Import Debug:', {
      userCompanyId,
      frontendCompanyId: companyId,
      storeId,
      userRole: session.user.role,
      userId: session.user.id
    })

    if (!csvData || !Array.isArray(csvData)) {
      return NextResponse.json(
        { message: 'Invalid CSV data format' },
        { status: 400 }
      )
    }

    console.log(`🔄 Starting CSV import for ${csvData.length} records...`)

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      transactions: [] as string[],
      products: [] as string[]
    }

    // Batch processing untuk data besar
    const BATCH_SIZE = 100 // Process 100 records at a time
    const totalBatches = Math.ceil(csvData.length / BATCH_SIZE)
    
    console.log(`📦 Processing ${csvData.length} records in ${totalBatches} batches of ${BATCH_SIZE}`)

    // Process each CSV row - ROBUST: tidak stop di error
    for (let i = 0; i < csvData.length; i++) {
      // Progress indicator untuk batch besar
      if (i % BATCH_SIZE === 0) {
        const currentBatch = Math.floor(i / BATCH_SIZE) + 1
        console.log(`📊 Processing batch ${currentBatch}/${totalBatches} (${i + 1}-${Math.min(i + BATCH_SIZE, csvData.length)})`)
      }
      try {
        const row = csvData[i]
        
        // Skip completely empty rows (semua field kosong)
        const hasData = Object.values(row).some(value => value && value.toString().trim())
        if (!hasData) {
          console.log(`Row ${i + 1}: Skipping completely empty row`)
          continue
        }
        
        // Map CSV fields to our database structure
        const mappedData = mapCsvToDatabase(row)
        
        // Import the transaction and items - ROBUST error handling
        const finalCompanyId = companyId || userCompanyId || 'default'
        
        // Debug: Log final company ID for each transaction
        if (i === 0) { // Only log for first transaction to avoid spam
          console.log('🔍 Final Company ID Resolution:', {
            finalCompanyId,
            companyIdFromFrontend: companyId,
            userCompanyId,
            willUseCompanyId: finalCompanyId
          })
        }
        
        const result = await importTransactionFromCsv(mappedData, finalCompanyId, storeId, subscriptionTier)
        
        if (result.success) {
          results.success++
          results.transactions.push(result.transactionId || '')
          if (result.productId) {
            results.products.push(result.productId)
          }
        } else {
          results.failed++
          results.errors.push(`Row ${i + 1}: ${result.error}`)
          console.warn(`Row ${i + 1} failed:`, result.error)
        }
        
      } catch (error) {
        results.failed++
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Error processing row ${i + 1}:`, error)
        // ✅ CONTINUE processing next row - tidak stop di error
      }
    }
    
    console.log(`✅ Import completed: ${results.success} success, ${results.failed} failed`)
    
    // Clear timeout
    clearTimeout(timeoutId)
    
    // Send webhook notification for successful import
    if (results.success > 0) {
      try {
        await webhookService.sendImportWebhook({
          importType,
          totalRecords: csvData.length,
          successCount: results.success,
          failedCount: results.failed,
          companyId: companyId || userCompanyId,
          storeId,
          importedBy: session.user.email,
          importedAt: new Date().toISOString(),
          summary: {
            message: `Import completed: ${results.success} success, ${results.failed} failed`,
            successRate: ((results.success / csvData.length) * 100).toFixed(2) + '%'
          }
        })
        console.log('📤 Webhook notification sent for import completion')
      } catch (webhookError) {
        console.warn('⚠️ Failed to send webhook notification:', webhookError)
        // Don't fail the import if webhook fails
      }
    }
    
    return NextResponse.json({
      message: `Import completed: ${results.success} success, ${results.failed} failed`,
      results
    })

  } catch (error) {
    // Clear timeout on error
    clearTimeout(timeoutId)
    console.error('Error in CSV import:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Map CSV fields to database structure
function mapCsvToDatabase(csvRow: any) {
  // Debug log untuk melihat struktur data
  console.log('🔍 CSV Row Keys:', Object.keys(csvRow))
  console.log('🔍 CSV Row Values:', Object.values(csvRow))
  console.log('🔍 Full CSV Row:', JSON.stringify(csvRow, null, 2))
  
  // Parse date dengan format yang benar
  const parseDate = (dateStr: string) => {
    if (!dateStr || dateStr.trim() === '') {
      return new Date() // Default ke sekarang jika kosong
    }
    
    // Coba berbagai format tanggal
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      // Jika gagal, coba format lain atau default
      console.warn('Invalid date format:', dateStr)
      return new Date()
    }
    return date
  }

  const orderNo = csvRow['order no'] || csvRow.orderNo || `TRX${Date.now()}${Math.random().toString(36).substr(2, 5)}`
  console.log('🔍 Order No mapping:', {
    'csvRow["order no"]': csvRow['order no'],
    'csvRow.orderNo': csvRow.orderNo,
    'final orderNo': orderNo,
    'orderNo type': typeof orderNo
  })

  return {
    // Transaction fields - ROBUST handling untuk data kosong/null
    orderNo: orderNo,
    orderTime: parseDate(csvRow['order time'] || csvRow.orderTime || ''),
    currency: csvRow.currency || 'IDR',
    paymentType: csvRow['payment type'] || csvRow.paymentType || 'CASH',
    
    // Customer fields - NEW: support customer dari CSV
    customerName: (csvRow['customer name'] || csvRow.customerName || '').trim(),
    customerPhone: (csvRow['customer phone'] || csvRow.customerPhone || '').trim(),
    customerEmail: (csvRow['customer email'] || csvRow.customerEmail || '').trim(),
    
    // Product fields - Handle empty brand, name, dll
    brand: (csvRow.brand && csvRow.brand.trim()) || 'Unknown Brand',
    brandCommissionRate: parseFloat(csvRow['brand comission rate'] || csvRow.brandCommissionRate || '0') || 0,
    brandCommissionAmount: parseFloat(csvRow['brand comission amount'] || csvRow.brandCommissionAmount || '0') || 0,
    itemGroup: (csvRow['item group'] && csvRow['item group'].trim()) || 'General',
    itemName: (csvRow['item name'] && csvRow['item name'].trim()) || 'Unknown Product',
    itemSku: (csvRow['item sku'] && csvRow['item sku'].trim()) || `SKU${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
    
    // Transaction item fields - Handle NaN dan empty values
    qty: Math.max(1, parseInt(csvRow.qty || '1') || 1), // Minimal 1
    price: Math.max(0, parseFloat(csvRow.price || '0') || 0),
    addOnPrice: Math.max(0, parseFloat(csvRow['add-on price'] || csvRow.addOnPrice || '0') || 0),
    discountPercent: Math.max(0, parseFloat(csvRow['discount percent'] || csvRow.discountPercent || '0') || 0),
    discountAmount: Math.max(0, parseFloat(csvRow['discount amount'] || csvRow.discountAmount || '0') || 0),
    amount: Math.max(0, parseFloat(csvRow.amount || '0') || 0),
    taxAmount: Math.max(0, parseFloat(csvRow['tax amount'] || csvRow.taxAmount || '0') || 0),
    costPerUnit: Math.max(0, parseFloat(csvRow['cost perunit'] || csvRow.costPerUnit || '0') || 0),
    totalCost: Math.max(0, parseFloat(csvRow['total cost'] || csvRow.totalCost || '0') || 0),
    profit: parseFloat(csvRow.profit || '0') || 0, // Profit bisa negatif
    paidToBrand: Math.max(0, parseFloat(csvRow['paid to brand'] || csvRow.paidToBrand || '0') || 0)
  }
}

// Import single transaction from CSV data
async function importTransactionFromCsv(data: any, companyId: string, storeId?: string, subscriptionTier: string = 'FREE') {
  try {
    // Use selected store or get/create default store for import
    let store
    if (storeId) {
      store = await prisma.store.findFirst({
        where: { 
          id: storeId,
          companyId
        }
      })
    }

    if (!store) {
      store = await prisma.store.findFirst({
        where: { 
          companyId,
          name: { contains: 'Import' }
        }
      })
    }

    if (!store) {
      store = await prisma.store.create({
        data: {
          name: 'Import Store',
          code: 'IMP001',
          address: 'Imported from CSV',
          phone: '-',
          isActive: true,
          companyId
        }
      })
    }

    // Check if transaction already exists
    let transaction = await prisma.transaction.findUnique({
      where: { transactionNo: data.orderNo }
    })

    // Create transaction if not exists
    if (!transaction) {

      // Create or find customer based on CSV data
      let customer
      
      // Jika ada data customer di CSV, cari atau buat customer tersebut
      if (data.customerName || data.customerPhone || data.customerEmail) {
        // Cari customer berdasarkan phone (prioritas) atau email
        if (data.customerPhone) {
          customer = await prisma.customer.findFirst({
            where: { 
              companyId,
              phone: data.customerPhone
            }
          })
        }
        
        if (!customer && data.customerEmail) {
          customer = await prisma.customer.findFirst({
            where: { 
              companyId,
              email: data.customerEmail
            } 
          })
        }
        
        // Jika belum ada, buat customer baru dari data CSV
        if (!customer) {
          customer = await prisma.customer.create({
            data: {
              uniqueId: `CUST${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
              name: data.customerName || 'Customer',
              phone: data.customerPhone || null,
              email: data.customerEmail || null,
              companyId,
              isActive: true,
              isMember: false,
              membershipPoints: 0,
              membershipDiscount: 0
            }
          })
          console.log(`✅ Created new customer: ${customer.name} (${customer.phone || customer.email})`)
        } else {
          console.log(`✅ Using existing customer: ${customer.name} (${customer.phone || customer.email})`)
        }
      } else {
        // Fallback: gunakan default customer jika tidak ada data customer di CSV
        customer = await prisma.customer.findFirst({
          where: { 
            companyId,
            name: 'Import Customer'
          }
        })

        if (!customer) {
          customer = await prisma.customer.create({
            data: {
              uniqueId: `CUST${Date.now()}`,
              name: 'Import Customer',
              companyId,
              isActive: true,
              isMember: false,
              membershipPoints: 0,
              membershipDiscount: 0
            }
          })
        }
      }

      // Validate and clean data before creating transaction
      const transactionData = {
        transactionNo: data.orderNo,
        date: data.orderTime, // sudah di-parse di mapCsvToDatabase
        subtotal: Math.max(0, data.amount || 0),
        tax: Math.max(0, data.taxAmount || 0),
        discount: Math.max(0, data.discountAmount || 0),
        total: Math.max(0, data.amount || 0),
        paymentMethod: data.paymentType || 'CASH', // Keep original payment type from CSV
        paymentStatus: 'COMPLETED',
        companyId,
        customerId: customer.id,
        storeId: store.id
      }

      console.log('Creating transaction with data:', transactionData)
      
      transaction = await prisma.transaction.create({
        data: transactionData
      })
    }

    // ✅ PRIORITAS CEK: 1) Nama produk exact match, 2) SKU match
    // Ini mencegah produk duplikat dengan nama sama tapi SKU berbeda
    let product = await prisma.product.findFirst({
      where: {
        name: data.itemName,
        companyId
      }
    })

    if (product) {
      console.log(`✅ Using existing product by NAME: ${product.name} (SKU: ${product.sku})`)
    } else {
      // Jika tidak ada berdasarkan nama, cek berdasarkan SKU
      product = await prisma.product.findFirst({
        where: {
          sku: data.itemSku,
          companyId
        }
      })

      if (product) {
        console.log(`✅ Using existing product by SKU: ${product.name} (SKU: ${product.sku})`)
      }
    }

    // Jika belum ada produk sama sekali, baru buat baru
    if (!product) {
      // Check product limits for FREE users before creating new product
      if (subscriptionTier === 'FREE') {
        const existingProductCount = await prisma.product.count({
          where: { companyId }
        })
        
        if (existingProductCount >= 100) {
          throw new Error('Batas maksimal 100 produk untuk paket FREE telah tercapai')
        }
      }

      // Only create new product if both NAME and SKU don't exist
      console.log(`🆕 Creating NEW product: ${data.itemName} (SKU: ${data.itemSku})`)

      const productData: any = {
        name: data.itemName || 'Unknown Product',
        sku: data.itemSku,
        price: Math.max(0, data.price || 0),
        cost: Math.max(0, data.costPerUnit || 0),
        stock: 100, // Default stock
        category: data.itemGroup || 'General',
        brand: data.brand || 'Unknown Brand',
        companyId,
        storeId: store.id,
        unit: 'pcs'
      }

      // Optional fields - hanya tambahkan jika ada data
      if (data.barcode && data.barcode.trim()) {
        productData.barcode = data.barcode.trim()
      }
      if (data.description && data.description.trim()) {
        productData.description = data.description.trim()
      }
      if (data.weight && !isNaN(parseFloat(data.weight))) {
        productData.weight = parseFloat(data.weight)
      }

      console.log('Creating product with data:', productData)
      
      try {
        product = await prisma.product.create({
          data: productData
        })
        console.log(`✅ Successfully created product: ${product.name} (ID: ${product.id})`)
      } catch (createError) {
        // If creation fails, coba cari lagi by name atau SKU
        console.warn('Product creation failed, searching existing product:', createError)
        
        // Cari berdasarkan nama dulu (prioritas)
        product = await prisma.product.findFirst({
          where: {
            name: data.itemName,
            companyId
          }
        })
        
        if (!product) {
          // Jika tidak ada, cari berdasarkan SKU
          product = await prisma.product.findFirst({
            where: {
              sku: data.itemSku,
              companyId
            }
          })
        }
        
        if (!product) {
          throw new Error(`Failed to create or find product: ${data.itemName} (SKU: ${data.itemSku})`)
        }
        
        console.log(`✅ Using existing product after creation failed: ${product.name}`)
      }
    }

    // Create transaction item with ALL Olsera fields
    const transactionItemData = {
      quantity: Math.max(1, data.qty || 1),
      unitPrice: Math.max(0, data.price || 0),
      totalPrice: Math.max(0, data.amount || 0),
      transactionId: transaction.id,
      productId: product.id,
      // ✅ TAMBAHAN FIELD OLSERA YANG HILANG:
      addOnPrice: Math.max(0, data.addOnPrice || 0),
      discountPercent: Math.max(0, data.discountPercent || 0),
      discountAmount: Math.max(0, data.discountAmount || 0),
      totalCost: Math.max(0, data.totalCost || 0),
      profit: data.profit || 0, // Bisa negatif
      paidToBrand: Math.max(0, data.paidToBrand || 0)
    }

    console.log('Creating transaction item with data:', transactionItemData)
    
    try {
      const transactionItem = await prisma.transactionItem.create({
        data: transactionItemData
      })
      console.log('✅ Transaction item created successfully:', transactionItem.id)
    } catch (itemError) {
      console.error('❌ Error creating transaction item:', itemError)
      throw itemError
    }

    return {
      success: true,
      transactionId: transaction.id,
      productId: product.id
    }

  } catch (error) {
    console.error('Error importing transaction:', error)
    console.error('Failed data:', JSON.stringify(data, null, 2))
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

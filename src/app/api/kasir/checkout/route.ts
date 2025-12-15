import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface CheckoutItem {
  productId: string
  quantity: number
  unitPrice: number
}

interface CheckoutRequest {
  items: CheckoutItem[]
  customerId?: string
  paymentMethod: string
  totalAmount: number
  storeId?: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'KASIR') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: CheckoutRequest = await request.json()
    const { items, customerId, paymentMethod, totalAmount, storeId } = body

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json(
        { message: 'Items tidak boleh kosong' },
        { status: 400 }
      )
    }

    if (!paymentMethod || totalAmount <= 0) {
      return NextResponse.json(
        { message: 'Payment method dan total amount harus valid' },
        { status: 400 }
      )
    }

    // Get employee data
    const employee = await prisma.employee.findUnique({
      where: { email: session.user.email! },
      include: { company: true }
    })

    if (!employee) {
      return NextResponse.json(
        { message: 'Employee not found' },
        { status: 404 }
      )
    }

    // Create default customer if not provided
    let finalCustomerId = customerId
    if (!customerId) {
      const defaultCustomer = await prisma.customer.findFirst({
        where: {
          companyId: employee.companyId,
          email: 'walk-in@customer.com'
        }
      })

      if (!defaultCustomer) {
        // Generate unique ID for customer
        const uniqueId = `CUST-${Date.now()}`
        const newCustomer = await prisma.customer.create({
          data: {
            uniqueId,
            name: 'Walk-in Customer',
            email: 'walk-in@customer.com',
            phone: '-',
            companyId: employee.companyId,
            isMember: false
          }
        })
        finalCustomerId = newCustomer.id
      } else {
        finalCustomerId = defaultCustomer.id
      }
    }

    // Validate products and check stock
    const productIds = items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        companyId: employee.companyId,
        isActive: true
      }
    })

    if (products.length !== items.length) {
      return NextResponse.json(
        { message: 'Beberapa produk tidak ditemukan' },
        { status: 400 }
      )
    }

    // Check stock availability
    for (const item of items) {
      const product = products.find(p => p.id === item.productId)
      if (!product) {
        return NextResponse.json(
          { message: `Produk tidak ditemukan` },
          { status: 400 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { message: `Stok ${product.name} tidak mencukupi. Tersedia: ${product.stock}` },
          { status: 400 }
        )
      }
    }

    // Ensure finalCustomerId is not undefined
    if (!finalCustomerId) {
      return NextResponse.json(
        { message: 'Customer ID tidak valid' },
        { status: 400 }
      )
    }

    // Generate transaction number
    const transactionNo = `TRX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-4)}`

    // Create transaction with items
    const transaction = await prisma.transaction.create({
      data: {
        transactionNo,
        subtotal: totalAmount,
        tax: 0,
        discount: 0,
        total: totalAmount,
        paymentMethod,
        paymentStatus: 'completed',
        companyId: employee.companyId,
        customerId: finalCustomerId,
        storeId: storeId || employee.storeId,
        employeeId: employee.id,
        items: {
          create: items.map(item => {
            const product = products.find(p => p.id === item.productId)!
            const totalPrice = item.quantity * item.unitPrice
            const totalCost = item.quantity * (Number(product.cost) || 0)
            const profit = totalPrice - totalCost
            
            return {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: totalPrice,
              addOnPrice: 0,
              discountPercent: 0,
              discountAmount: 0,
              totalCost: totalCost,
              profit: profit,
              paidToBrand: totalPrice // Assuming full amount goes to brand
            }
          })
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true,
        employee: true,
        store: true
      }
    })

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })
    }

    return NextResponse.json({
      message: 'Transaksi berhasil',
      transaction: {
        id: transaction.id,
        transactionNo: transaction.transactionNo,
        total: transaction.total,
        paymentMethod: transaction.paymentMethod,
        createdAt: transaction.createdAt,
        customer: transaction.customer,
        items: transaction.items.map((item: any) => ({
          product: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        }))
      }
    })

  } catch (error) {
    console.error('Error processing checkout:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

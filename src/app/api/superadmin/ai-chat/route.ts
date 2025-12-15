import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { generateGeminiResponse, getGeminiSystemPrompt } from '@/lib/geminiAI'
import { getCurrentGeminiKey } from '@/lib/geminiKeyRotation'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { message, systemStats } = await request.json()

    // Get comprehensive system data for AI context
    const [
      totalUsers,
      totalCompanies,
      activeCompanies,
      pendingApprovals,
      recentTransactions,
      companiesWithDetails
    ] = await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
      prisma.company.count({ where: { isActive: true } }),
      prisma.user.count({ where: { status: 'PENDING' } }),
      prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          store: { include: { company: true } },
          items: { include: { product: true } }
        }
      }),
      prisma.company.findMany({
        include: {
          owner: true,
          stores: true,
          employees: true,
          _count: {
            select: {
              employees: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ])

    // Calculate total revenue
    const allTransactions = await prisma.transaction.findMany({
      include: { items: true }
    })
    
    const totalRevenue = allTransactions.reduce((sum, transaction) => {
      return sum + transaction.items.reduce((itemSum, item) => {
        return itemSum + Number(item.totalPrice)
      }, 0)
    }, 0)

    // Prepare context for AI
    const systemContext = {
      totalUsers,
      totalCompanies,
      activeCompanies,
      pendingApprovals,
      totalRevenue,
      recentTransactions: recentTransactions.map(t => ({
        transactionNo: t.transactionNo,
        date: t.createdAt.toISOString().split('T')[0],
        company: t.store?.company?.name || 'Unknown',
        store: t.store?.name || 'Unknown',
        total: t.items.reduce((sum, item) => sum + Number(item.totalPrice), 0)
      })),
      companiesOverview: companiesWithDetails.map(c => ({
        name: c.name,
        subscriptionTier: c.subscriptionTier,
        isActive: c.isActive,
        storeCount: c.stores.length,
        employeeCount: c._count.employees,
        owner: c.owner?.name || 'No Owner'
      }))
    }

    // Generate AI response using Gemini AI
    let response: string
    
    try {
      const geminiKey = getCurrentGeminiKey()
      if (!geminiKey) {
        throw new Error('No Gemini API key available')
      }

      const systemPrompt = getGeminiSystemPrompt('SUPERADMIN', 'Vendra CRM Platform', session.user.name || 'SuperAdmin')
      
      // Create context-rich prompt for Gemini
      const contextPrompt = `
Konteks Sistem Saat Ini:
- Total Pengguna: ${systemContext.totalUsers}
- Total Perusahaan: ${systemContext.totalCompanies}
- Perusahaan Aktif: ${systemContext.activeCompanies}
- Persetujuan Tertunda: ${systemContext.pendingApprovals}
- Total Pendapatan: Rp ${systemContext.totalRevenue.toLocaleString()}

Transaksi Terbaru:
${systemContext.recentTransactions.slice(0, 3).map((t: any) => 
  `- ${t.transactionNo}: ${t.company} - Rp ${t.total.toLocaleString()}`
).join('\n')}

Perusahaan Overview:
${systemContext.companiesOverview.slice(0, 3).map((c: any) => 
  `- ${c.name}: ${c.storeCount} toko, ${c.employeeCount} karyawan (${c.subscriptionTier})`
).join('\n')}

Pertanyaan User: ${message}
`

      let rawResponse = await generateGeminiResponse(
        geminiKey,
        contextPrompt,
        systemPrompt,
        1000,
        0.7
      )
      
      // Clean up markdown formatting (remove asterisks and other markdown)
      response = rawResponse
        .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold markdown
        .replace(/\*(.*?)\*/g, '$1')     // Remove italic markdown
        .replace(/#{1,6}\s/g, '')        // Remove headers
        .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // Remove code blocks
        .trim()
      
    } catch (error) {
      console.error('Gemini AI error, using fallback:', error)
      // Fallback to static response if Gemini fails
      response = generateSuperAdminResponse(message, systemContext)
    }

    return NextResponse.json({ response })

  } catch (error) {
    console.error('Error in SuperAdmin AI chat:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateSuperAdminResponse(message: string, context: any): string {
  const lowerMessage = message.toLowerCase()

  // System overview
  if (lowerMessage.includes('system overview') || lowerMessage.includes('platform summary') || 
      lowerMessage.includes('ringkasan sistem') || lowerMessage.includes('tampilkan ringkasan')) {
    return `📊 **Ringkasan Sistem**

**Statistik Platform:**
• Total Pengguna: ${context.totalUsers.toLocaleString()}
• Total Perusahaan: ${context.totalCompanies}
• Perusahaan Aktif: ${context.activeCompanies}
• Persetujuan Tertunda: ${context.pendingApprovals}
• Total Pendapatan: Rp ${context.totalRevenue.toLocaleString()}

**Aktivitas Terbaru:**
${context.recentTransactions.slice(0, 5).map((t: any) => 
  `• ${t.transactionNo} - ${t.company} (${t.store}) - Rp ${t.total.toLocaleString()}`
).join('\n')}

**Perusahaan Teratas:**
${context.companiesOverview.slice(0, 5).map((c: any) => 
  `• ${c.name} - ${c.storeCount} toko, ${c.employeeCount} karyawan (${c.subscriptionTier})`
).join('\n')}`
  }

  // Pending approvals
  if (lowerMessage.includes('pending') || lowerMessage.includes('approval') || 
      lowerMessage.includes('persetujuan') || lowerMessage.includes('tertunda')) {
    return `⏳ **Persetujuan Tertunda**

Saat ini terdapat **${context.pendingApprovals}** pengguna yang menunggu persetujuan.

**Tindakan Diperlukan:**
• Tinjau pendaftaran pengguna tertunda di Manajemen Pengguna
• Setujui pemilik bisnis yang sah
• Tolak aplikasi yang mencurigakan atau tidak lengkap

**Status Perusahaan:**
• Aktif: ${context.activeCompanies}
• Total: ${context.totalCompanies}
• Tingkat Aktivasi: ${((context.activeCompanies / context.totalCompanies) * 100).toFixed(1)}%`
  }

  // Company analysis
  if (lowerMessage.includes('companies') || lowerMessage.includes('business') || 
      lowerMessage.includes('perusahaan') || lowerMessage.includes('perlu perhatian')) {
    const inactiveCompanies = context.companiesOverview.filter((c: any) => !c.isActive)
    
    return `🏢 **Analisis Perusahaan**

**Perusahaan Aktif:** ${context.activeCompanies}/${context.totalCompanies}

**Perusahaan yang Perlu Perhatian:**
${inactiveCompanies.length > 0 ? 
  inactiveCompanies.slice(0, 5).map((c: any) => 
    `• ${c.name} - Tidak Aktif (${c.storeCount} toko)`
  ).join('\n') : 
  '• Semua perusahaan saat ini aktif ✅'
}

**Perusahaan Berkinerja Terbaik:**
${context.companiesOverview.filter((c: any) => c.isActive).slice(0, 5).map((c: any) => 
  `• ${c.name} - ${c.storeCount} toko, ${c.employeeCount} karyawan`
).join('\n')}`
  }

  // Revenue analysis
  if (lowerMessage.includes('revenue') || lowerMessage.includes('financial') || 
      lowerMessage.includes('pendapatan') || lowerMessage.includes('analisis pendapatan')) {
    return `💰 **Analisis Pendapatan**

**Total Pendapatan Platform:** Rp ${context.totalRevenue.toLocaleString()}
**Rata-rata per Perusahaan:** Rp ${Math.round(context.totalRevenue / context.activeCompanies).toLocaleString()}

**Tren Transaksi Terbaru:**
${context.recentTransactions.slice(0, 5).map((t: any) => 
  `• ${t.date} - ${t.company}: Rp ${t.total.toLocaleString()}`
).join('\n')}

**Rekomendasi:**
• Pantau perusahaan dengan volume transaksi menurun
• Dorong perusahaan tidak aktif untuk melanjutkan operasi
• Pertimbangkan kampanye promosi untuk toko berkinerja rendah`
  }

  // User growth
  if (lowerMessage.includes('user') || lowerMessage.includes('growth') || 
      lowerMessage.includes('pengguna') || lowerMessage.includes('pertumbuhan')) {
    return `👥 **Ringkasan Manajemen Pengguna**

**Total Pengguna:** ${context.totalUsers.toLocaleString()}
**Persetujuan Tertunda:** ${context.pendingApprovals}
**Tingkat Persetujuan:** ${(((context.totalUsers - context.pendingApprovals) / context.totalUsers) * 100).toFixed(1)}%

**Distribusi Pengguna:**
${context.companiesOverview.map((c: any) => 
  `• ${c.name}: ${c.employeeCount + 1} pengguna (Pemilik + ${c.employeeCount} karyawan)`
).slice(0, 5).join('\n')}

**Item Tindakan:**
• Proses persetujuan tertunda dengan cepat
• Pantau aktivitas pengguna di seluruh perusahaan
• Pastikan penugasan peran yang tepat`
  }

  // Performance summary
  if (lowerMessage.includes('performance') || lowerMessage.includes('metrics') || 
      lowerMessage.includes('performa') || lowerMessage.includes('ringkasan performa')) {
    return `📈 **Ringkasan Performa Platform**

**Metrik Kesehatan:**
• Tingkat Aktivasi Perusahaan: ${((context.activeCompanies / context.totalCompanies) * 100).toFixed(1)}%
• Tingkat Persetujuan Pengguna: ${(((context.totalUsers - context.pendingApprovals) / context.totalUsers) * 100).toFixed(1)}%
• Rata-rata Toko per Perusahaan: ${(context.companiesOverview.reduce((sum: number, c: any) => sum + c.storeCount, 0) / context.totalCompanies).toFixed(1)}

**Aktivitas Terbaru:**
• ${context.recentTransactions.length} transaksi terbaru
• Total Pendapatan: Rp ${context.totalRevenue.toLocaleString()}

**Rekomendasi:**
• Fokus pada aktivasi perusahaan tidak aktif
• Sederhanakan proses persetujuan pengguna
• Pantau tren transaksi untuk tanda peringatan dini`
  }

  // Default response
  return `Halo! Saya adalah Asisten AI SuperAdmin Anda. Saya dapat membantu Anda dengan:

🔍 **Analisis Sistem:**
• "Tampilkan ringkasan sistem" - Statistik platform lengkap
• "Ringkasan performa platform" - Metrik utama dan indikator kesehatan

👥 **Manajemen Pengguna:**
• "Apa saja persetujuan yang tertunda?" - Pengguna yang menunggu persetujuan
• "Tren pertumbuhan pengguna" - Pola pendaftaran dan aktivitas pengguna

🏢 **Wawasan Perusahaan:**
• "Perusahaan mana yang perlu perhatian?" - Perusahaan tidak aktif atau berkinerja buruk
• "Analisis pendapatan lintas perusahaan" - Rincian kinerja keuangan

📊 **Data & Analitik:**
• Tren dan pola transaksi
• Perbandingan kinerja perusahaan
• Metrik pertumbuhan platform

Informasi spesifik apa yang ingin Anda ketahui tentang platform Anda?`
}

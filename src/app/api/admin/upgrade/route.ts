import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { SubscriptionTier } from '@prisma/client'
import { sendEmail } from '@/lib/email'
import { getUpgradeRequestNotificationTemplate } from '@/lib/email-templates/upgrade-request-notification'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const paymentProof = formData.get('paymentProof') as File
    const subscriptionTier = formData.get('subscriptionTier') as string
    const paymentMethod = formData.get('paymentMethod') as string

    if (!paymentProof || !subscriptionTier || !paymentMethod) {
      return NextResponse.json(
        { message: 'Semua field wajib diisi' },
        { status: 400 }
      )
    }

    // Validate subscription tier
    if (!['BASIC', 'PREMIUM', 'ENTERPRISE'].includes(subscriptionTier)) {
      return NextResponse.json(
        { message: 'Paket tidak valid' },
        { status: 400 }
      )
    }

    // Check if user exists and get company
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!user || !user.company) {
      return NextResponse.json(
        { message: 'User atau company tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if already on paid plan
    if (user.company.subscriptionTier !== 'FREE') {
      return NextResponse.json(
        { message: 'Anda sudah menggunakan paket berbayar' },
        { status: 400 }
      )
    }

    // Save payment proof file
    const bytes = await paymentProof.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'payments')
    await mkdir(uploadsDir, { recursive: true })
    
    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = paymentProof.name.split('.').pop()
    const filename = `upgrade-${user.id}-${timestamp}.${fileExtension}`
    const filepath = join(uploadsDir, filename)
    
    await writeFile(filepath, buffer)
    
    // Create upgrade request record
    const upgradeRequest = await prisma.upgradeRequest.create({
      data: {
        userId: user.id,
        companyId: user.company.id,
        requestedTier: subscriptionTier as SubscriptionTier,
        paymentProof: `/uploads/payments/${filename}`,
        paymentMethod: paymentMethod,
        status: 'PENDING',
        requestedAt: new Date()
      }
    })

    // Send notification email to SuperAdmin
    try {
      // Get SuperAdmin email (you might want to configure this in env or database)
      const superAdminEmail = process.env.SUPERADMIN_EMAIL || 'admin@vendra.com'
      
      const emailTemplate = getUpgradeRequestNotificationTemplate({
        userName: user.name || 'User',
        companyName: user.company.name || 'Company',
        userEmail: user.email,
        requestedTier: subscriptionTier,
        paymentMethod: paymentMethod,
        requestDate: new Date().toLocaleString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        adminUrl: `${process.env.NEXTAUTH_URL}/superadmin/upgrades`
      })

      const emailSent = await sendEmail(
        superAdminEmail,
        emailTemplate.subject,
        emailTemplate.html,
        emailTemplate.text
      )

      if (!emailSent) {
        console.error('Failed to send upgrade request notification to SuperAdmin:', superAdminEmail)
      }
    } catch (emailError) {
      console.error('Error sending upgrade request notification:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      message: 'Permintaan upgrade berhasil dikirim',
      filename: filename
    })

  } catch (error) {
    console.error('Upgrade request error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

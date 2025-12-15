import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, SubscriptionTier } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { sendEmail } from '@/lib/email'
import { getUpgradeRequestNotificationTemplate } from '@/lib/email-templates/upgrade-request-notification'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const paymentProof = formData.get('paymentProof') as File
    const paymentMethod = formData.get('paymentMethod') as string
    const subscriptionTier = formData.get('subscriptionTier') as string

    if (!email || !paymentProof || !paymentMethod) {
      return NextResponse.json(
        { message: 'Semua field wajib diisi' },
        { status: 400 }
      )
    }

    // Find verified user
    const user = await prisma.user.findFirst({
      where: {
        email: email,
        isVerified: true,
        isActive: false
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User tidak ditemukan atau belum terverifikasi' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'payments')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Save payment proof file
    const bytes = await paymentProof.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const fileName = `payment_${user.id}_${Date.now()}_${paymentProof.name}`
    const filePath = path.join(uploadsDir, fileName)
    
    await writeFile(filePath, buffer)

    // Get user's company
    const userWithCompany = await prisma.user.findUnique({
      where: { id: user.id },
      include: { company: true }
    })

    if (!userWithCompany?.company) {
      return NextResponse.json(
        { message: 'Company tidak ditemukan untuk user ini' },
        { status: 400 }
      )
    }

    // Create upgrade request for paid subscription
    if (subscriptionTier && subscriptionTier !== 'FREE') {
      await prisma.upgradeRequest.create({
        data: {
          userId: user.id,
          companyId: userWithCompany.company.id,
          requestedTier: subscriptionTier as SubscriptionTier,
          paymentProof: `/uploads/payments/${fileName}`,
          paymentMethod: paymentMethod,
          status: 'PENDING'
        }
      })

      // Send notification email to SuperAdmin
      try {
        const superAdminEmail = process.env.SUPERADMIN_EMAIL || 'admin@vendra.com'
        
        const emailTemplate = getUpgradeRequestNotificationTemplate({
          userName: user.name || 'User',
          companyName: userWithCompany.company.name || 'Company',
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

        await sendEmail(
          superAdminEmail,
          emailTemplate.subject,
          emailTemplate.html,
          emailTemplate.text
        )
      } catch (emailError) {
        console.error('Error sending upgrade request notification:', emailError)
        // Don't fail the request if email fails
      }
    }

    // Update user with payment info
    await prisma.user.update({
      where: { id: user.id },
      data: {
        paymentProof: `/uploads/payments/${fileName}`,
        paymentMethod: paymentMethod,
        paymentUploadedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Bukti pembayaran berhasil diupload. Menunggu persetujuan SuperAdmin.'
    })

  } catch (error) {
    console.error('Payment upload error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

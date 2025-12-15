import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { UserRole, ApprovalStatus, SubscriptionTier } from '@prisma/client'
import { generateApiKey, generateApiKeyExpiry } from '@/lib/apiKey'
import { generateOTP, sendOTPEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      password,
      companyName,
      companyEmail,
      phone,
      address,
      subscriptionTier
    } = body

    // Validation
    if (!name || !email || !password || !companyName || !companyEmail) {
      return NextResponse.json(
        { message: 'Semua field wajib diisi' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Check if company email already exists
    const existingCompany = await prisma.company.findUnique({
      where: { email: companyEmail }
    })

    if (existingCompany) {
      return NextResponse.json(
        { message: 'Email perusahaan sudah terdaftar' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Generate OTP
    const otp = generateOTP()
    const otpExpires = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes (extended from 10)

    // Determine if FREE plan (auto-approve) or paid plan (needs approval)
    const isFree = (subscriptionTier as SubscriptionTier || SubscriptionTier.FREE) === SubscriptionTier.FREE
    
    // Create user and company in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: UserRole.OWNER,
          status: isFree ? ApprovalStatus.APPROVED : ApprovalStatus.PENDING,
          otpCode: otp,
          otpExpires: otpExpires,
          isVerified: false,
          isActive: false,
          approvedAt: isFree ? new Date() : null,
        }
      })

      // Create company
      const company = await tx.company.create({
        data: {
          name: companyName,
          email: companyEmail,
          phone: phone || null,
          address: address || null,
          subscriptionTier: subscriptionTier as SubscriptionTier || SubscriptionTier.FREE,
          // isActive: isFree, // FREE plan company is active immediately
          ownerId: user.id,
        }
      })

      return { user, company }
    })

    // Auto-generate API key for new user (stored in database)
    const apiKey = generateApiKey()
    const apiKeyExpiry = generateApiKeyExpiry()
    
    // Update user with API key
    await prisma.user.update({
      where: { id: result.user.id },
      data: { 
        apiKey: apiKey,
        apiKeyExpiry: apiKeyExpiry
      }
    })
    
    console.log(`✅ Auto-generated API key for new user: ${result.user.email}`)

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, name)
    
    if (!emailSent) {
      // If email fails, still allow registration but notify user
      console.error('Failed to send OTP email to:', email)
    }

    return NextResponse.json(
      { 
        message: 'Registrasi berhasil! Kode OTP telah dikirim ke email Anda.',
        userId: result.user.id,
        apiKeyGenerated: true,
        emailSent: emailSent
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

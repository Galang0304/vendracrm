import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP, sendOTPEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: 'Email wajib diisi' },
        { status: 400 }
      )
    }

    // Find user that needs verification
    const user = await prisma.user.findUnique({
      where: { 
        email: email,
        isVerified: false
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User tidak ditemukan atau sudah terverifikasi' },
        { status: 400 }
      )
    }

    // Generate new OTP with extended expiry
    const otp = generateOTP()
    const otpExpires = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    // Update user with new OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: otp,
        otpExpires: otpExpires
      }
    })

    // Send new OTP email
    const emailSent = await sendOTPEmail(email, otp, user.name || 'User')
    
    if (!emailSent) {
      return NextResponse.json(
        { message: 'Gagal mengirim email OTP' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Kode OTP baru telah dikirim ke email Anda (berlaku 30 menit)',
      emailSent: true
    })

  } catch (error) {
    console.error('Resend OTP error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

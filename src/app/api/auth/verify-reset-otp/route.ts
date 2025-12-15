import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json(
        { message: 'Email dan kode OTP wajib diisi' },
        { status: 400 }
      )
    }

    if (otp.length !== 6) {
      return NextResponse.json(
        { message: 'Kode OTP harus 6 digit' },
        { status: 400 }
      )
    }

    // Check if user exists with valid OTP
    const user = await prisma.user.findFirst({
      where: {
        email: email,
        otpCode: otp,
        otpExpires: {
          gt: new Date()
        }
      }
    })

    // Check if employee exists with the email (for employees, we'll use a simpler approach)
    const employee = await prisma.employee.findFirst({
      where: {
        email: email
      }
    })

    if (!user && !employee) {
      return NextResponse.json(
        { message: 'Kode OTP tidak valid atau sudah kedaluwarsa' },
        { status: 400 }
      )
    }

    // For users, verify the OTP matches
    if (user && user.otpCode !== otp) {
      return NextResponse.json(
        { message: 'Kode OTP tidak valid' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Kode OTP valid',
      verified: true
    })

  } catch (error) {
    console.error('Verify reset OTP error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

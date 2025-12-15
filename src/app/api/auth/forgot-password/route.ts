import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP, sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: 'Email wajib diisi' },
        { status: 400 }
      )
    }

    // Check if user exists (both User and Employee tables)
    const user = await prisma.user.findUnique({
      where: { email }
    })

    const employee = await prisma.employee.findUnique({
      where: { email }
    })

    if (!user && !employee) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        message: 'Jika email terdaftar, link reset password akan dikirim'
      })
    }

    // Generate reset token (using OTP system)
    const resetToken = generateOTP()
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Update the appropriate table with reset token
    if (user) {
      await prisma.user.update({
        where: { email },
        data: {
          otpCode: resetToken,
          otpExpires: resetExpires
        }
      })
      
      // Send reset email
      await sendPasswordResetEmail(email, resetToken)
    }

    if (employee) {
      await prisma.employee.update({
        where: { email },
        data: {
          otpCode: resetToken,
          otpExpires: resetExpires
        }
      })
      
      // Send reset email
      await sendPasswordResetEmail(email, resetToken)
    }

    return NextResponse.json({
      message: 'Link reset password telah dikirim ke email Anda'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

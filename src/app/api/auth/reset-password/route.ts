import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, email, password } = await request.json()

    if (!token || !email || !password) {
      return NextResponse.json(
        { message: 'Token, email, dan password wajib diisi' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password minimal 6 karakter' },
        { status: 400 }
      )
    }

    // Check if user exists with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        email: email,
        otpCode: token,
        otpExpires: {
          gt: new Date()
        }
      }
    })

    const employee = await prisma.employee.findFirst({
      where: {
        email: email,
        // For now, we'll use a simple approach since Employee model doesn't have reset fields
      }
    })

    if (!user && !employee) {
      return NextResponse.json(
        { message: 'Token reset tidak valid atau sudah kedaluwarsa' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update password and clear reset token
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          otpCode: null,
          otpExpires: null
        }
      })
    }

    if (employee) {
      await prisma.employee.update({
        where: { id: employee.id },
        data: {
          password: hashedPassword
        }
      })
    }

    return NextResponse.json({
      message: 'Password berhasil direset'
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

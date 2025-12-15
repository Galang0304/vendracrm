import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile with company info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: null, // Temporary: field not in current schema
      address: null, // Temporary: field not in current schema
      profileImage: user.image, // Use existing 'image' field
      company: user.company
    })

  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const profileImageFile = formData.get('profileImage') as File

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { message: 'Name and email are required' },
        { status: 400 }
      )
    }

    let profileImagePath = null

    // Handle profile image upload
    if (profileImageFile && profileImageFile.size > 0) {
      // Validate file type
      if (!profileImageFile.type.startsWith('image/')) {
        return NextResponse.json(
          { message: 'Invalid file type. Please upload an image.' },
          { status: 400 }
        )
      }

      // Validate file size (5MB max)
      if (profileImageFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { message: 'File size too large. Maximum 5MB allowed.' },
          { status: 400 }
        )
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'profiles')
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }

      // Generate unique filename
      const timestamp = Date.now()
      const fileExtension = profileImageFile.name.split('.').pop()
      const fileName = `profile_${session.user.id}_${timestamp}.${fileExtension}`
      const filePath = join(uploadsDir, fileName)

      // Save file
      const bytes = await profileImageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      profileImagePath = `/uploads/profiles/${fileName}`
    }

    // Update user profile (only update existing fields for now)
    const updateData: any = {
      name,
      email
    }

    // Only update image field that exists in current schema
    if (profileImagePath) {
      updateData.image = profileImagePath // Use existing 'image' field instead of 'profileImage'
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: null, // Temporary: field not in current schema
      address: null, // Temporary: field not in current schema
      profileImage: updatedUser.image, // Use existing 'image' field
      company: updatedUser.company
    })

  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Script untuk mengganti password SuperAdmin
// Jalankan dengan: node scripts/change-superadmin-password.js

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function changeSuperAdminPassword() {
  try {
    console.log('🔐 Changing SuperAdmin Password...')
    
    // Email SuperAdmin yang ingin diganti passwordnya
    const superAdminEmail = 'superadmin@vendra.com'
    
    // Password baru (ganti sesuai kebutuhan)
    const newPassword = 'superadmin123'
    
    console.log(`📧 Looking for SuperAdmin: ${superAdminEmail}`)
    
    // Cari SuperAdmin
    const superAdmin = await prisma.user.findUnique({
      where: { email: superAdminEmail },
      select: { id: true, email: true, name: true, role: true }
    })
    
    if (!superAdmin) {
      console.log('❌ SuperAdmin not found!')
      console.log('📝 Creating new SuperAdmin...')
      
      // Buat SuperAdmin baru jika tidak ada
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      
      const newSuperAdmin = await prisma.user.create({
        data: {
          email: superAdminEmail,
          name: 'Super Administrator',
          password: hashedPassword,
          role: 'SUPERADMIN',
          status: 'APPROVED'
        }
      })
      
      console.log('✅ New SuperAdmin created successfully!')
      console.log(`📧 Email: ${newSuperAdmin.email}`)
      console.log(`🔑 Password: ${newPassword}`)
      console.log(`👤 Role: ${newSuperAdmin.role}`)
      
    } else {
      console.log(`✅ SuperAdmin found: ${superAdmin.name} (${superAdmin.role})`)
      
      // Hash password baru
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      
      // Update password
      await prisma.user.update({
        where: { id: superAdmin.id },
        data: { password: hashedPassword }
      })
      
      console.log('✅ Password changed successfully!')
      console.log(`📧 Email: ${superAdmin.email}`)
      console.log(`🔑 New Password: ${newPassword}`)
      console.log(`👤 Role: ${superAdmin.role}`)
    }
    
    console.log('\n🎉 SuperAdmin password update completed!')
    const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || `http://localhost:${process.env.PORT || '3000'}`
    console.log(`🔗 You can now login at: ${appUrl}/auth/signin`)
    
  } catch (error) {
    console.error('❌ Error changing SuperAdmin password:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Jalankan script
changeSuperAdminPassword()

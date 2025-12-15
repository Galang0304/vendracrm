import { PrismaClient, UserRole, ApprovalStatus, SubscriptionTier } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Hash password default
  const defaultPassword = await bcrypt.hash('admin123', 12)
  const superAdminPassword = await bcrypt.hash('superadmin123', 12)

  // 1. Buat SuperAdmin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@vendra.com' },
    update: {},
    create: {
      email: 'superadmin@vendra.com',
      name: 'Super Administrator',
      password: superAdminPassword,
      role: UserRole.SUPERADMIN,
      status: ApprovalStatus.APPROVED,
      emailVerified: new Date(),
    },
  })

  console.log('✅ SuperAdmin created:', superAdmin.email)

  // 2. Buat Admin Demo Company
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      name: 'Demo Admin',
      password: defaultPassword,
      role: UserRole.OWNER,
      status: ApprovalStatus.APPROVED,
      emailVerified: new Date(),
    },
  })

  // 3. Buat Demo Company
  const demoCompany = await prisma.company.upsert({
    where: { email: 'demo@company.com' },
    update: {},
    create: {
      name: 'Demo Company',
      email: 'demo@company.com',
      phone: '+62812345678',
      address: 'Jl. Demo No. 123, Jakarta',
      subscriptionTier: SubscriptionTier.PREMIUM,
      subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      isActive: true,
      ownerId: adminUser.id,
    },
  })

  console.log('✅ Demo Company created:', demoCompany.name)

  // 4. Buat Employee Demo (Marketing & Kasir)
  const marketingEmployee = await prisma.employee.create({
    data: {
      email: 'marketing@demo.com',
      name: 'Marketing Staff',
      password: defaultPassword,
      role: UserRole.MARKETING,
      companyId: demoCompany.id,
    },
  })

  const kasirEmployee = await prisma.employee.create({
    data: {
      email: 'kasir@demo.com',
      name: 'Kasir Staff',
      password: defaultPassword,
      role: UserRole.KASIR,
      companyId: demoCompany.id,
    },
  })

  console.log('✅ Demo Employees created')

  // 5. Buat beberapa Owner yang pending approval
  const pendingOwners = [
    {
      email: 'owner1@example.com',
      name: 'John Doe',
      companyName: 'ABC Store',
      companyEmail: 'contact@abcstore.com',
    },
    {
      email: 'owner2@example.com',
      name: 'Jane Smith',
      companyName: 'XYZ Mart',
      companyEmail: 'info@xyzmart.com',
    },
  ]

  for (const ownerData of pendingOwners) {
    const owner = await prisma.user.create({
      data: {
        email: ownerData.email,
        name: ownerData.name,
        password: defaultPassword,
        role: UserRole.OWNER,
        status: ApprovalStatus.PENDING,
      },
    })

    await prisma.company.create({
      data: {
        name: ownerData.companyName,
        email: ownerData.companyEmail,
        subscriptionTier: SubscriptionTier.FREE,
        isActive: false,
        ownerId: owner.id,
      },
    })

    console.log(`✅ Pending Owner created: ${ownerData.name} - ${ownerData.companyName}`)
  }

  console.log('🎉 Database seeding completed!')
  console.log('\n📋 Default Login Credentials:')
  console.log('SuperAdmin: superadmin@vendra.com / superadmin123')
  console.log('Admin Demo: admin@demo.com / admin123')
  console.log('Marketing: marketing@demo.com / admin123')
  console.log('Kasir: kasir@demo.com / admin123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

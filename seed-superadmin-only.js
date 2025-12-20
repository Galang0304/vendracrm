const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creating superadmin account...');
  
  const hashedPassword = await bcrypt.hash('Superadmin123!', 10);
  
  const superadmin = await prisma.user.upsert({
    where: { email: 'superadmin@vendra.id' },
    update: {},
    create: {
      email: 'superadmin@vendra.id',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPERADMIN',
      status: 'APPROVED',
      emailVerified: new Date(),
      isVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Superadmin created:', superadmin.email);
  console.log('📧 Email: superadmin@vendra.id');
  console.log('🔑 Password: Superadmin123!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

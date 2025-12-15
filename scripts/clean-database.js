const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function cleanDatabase() {
  try {
    console.log('🧹 Starting database cleanup...')
    console.log('⚠️  This will delete all data EXCEPT users and stores')
    console.log('')

    // Delete in correct order (child tables first, then parent tables)
    
    console.log('1️⃣ Deleting transaction items...')
    const transactionItems = await prisma.transactionItem.deleteMany({})
    console.log(`   ✅ Deleted ${transactionItems.count} transaction items`)

    console.log('2️⃣ Deleting transactions...')
    const transactions = await prisma.transaction.deleteMany({})
    console.log(`   ✅ Deleted ${transactions.count} transactions`)

    console.log('3️⃣ Deleting products...')
    const products = await prisma.product.deleteMany({})
    console.log(`   ✅ Deleted ${products.count} products`)

    console.log('4️⃣ Deleting customers...')
    const customers = await prisma.customer.deleteMany({})
    console.log(`   ✅ Deleted ${customers.count} customers`)

    console.log('5️⃣ Deleting chat messages...')
    const chatMessages = await prisma.chatMessage.deleteMany({})
    console.log(`   ✅ Deleted ${chatMessages.count} chat messages`)

    console.log('6️⃣ Deleting chat sessions...')
    const chatSessions = await prisma.chatSession.deleteMany({})
    console.log(`   ✅ Deleted ${chatSessions.count} chat sessions`)

    console.log('7️⃣ Deleting employees...')
    const employees = await prisma.employee.deleteMany({})
    console.log(`   ✅ Deleted ${employees.count} employees`)

    console.log('')
    console.log('✨ Database cleanup completed!')
    console.log('✅ Preserved tables: User, Store, Company')
    console.log('')

    // Show remaining data count
    const userCount = await prisma.user.count()
    const storeCount = await prisma.store.count()
    const companyCount = await prisma.company.count()

    console.log('📊 Remaining data:')
    console.log(`   👤 Users: ${userCount}`)
    console.log(`   🏪 Stores: ${storeCount}`)
    console.log(`   🏢 Companies: ${companyCount}`)

  } catch (error) {
    console.error('❌ Error cleaning database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

cleanDatabase()
  .then(() => {
    console.log('\n✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })

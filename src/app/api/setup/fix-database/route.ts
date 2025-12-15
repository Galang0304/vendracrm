import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Fix database schema issues
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fixing database schema...')

    // Execute raw SQL to add missing columns
    const sqlCommands = [
      // Add missing columns to users table
      `ALTER TABLE users 
       ADD COLUMN IF NOT EXISTS profileImage VARCHAR(255) NULL,
       ADD COLUMN IF NOT EXISTS phone VARCHAR(50) NULL,
       ADD COLUMN IF NOT EXISTS address TEXT NULL,
       ADD COLUMN IF NOT EXISTS apiKey VARCHAR(255) NULL,
       ADD COLUMN IF NOT EXISTS apiKeyExpiry DATETIME NULL`,
      
      // Add missing columns to companies table
      `ALTER TABLE companies
       ADD COLUMN IF NOT EXISTS subscriptionExpiry DATETIME NULL,
       ADD COLUMN IF NOT EXISTS maxUsers INT DEFAULT 10,
       ADD COLUMN IF NOT EXISTS maxProducts INT DEFAULT 1000,
       ADD COLUMN IF NOT EXISTS features JSON NULL`,
      
      // Add missing columns to employees table  
      `ALTER TABLE employees
       ADD COLUMN IF NOT EXISTS profileImage VARCHAR(255) NULL,
       ADD COLUMN IF NOT EXISTS phone VARCHAR(50) NULL,
       ADD COLUMN IF NOT EXISTS address TEXT NULL,
       ADD COLUMN IF NOT EXISTS salary DECIMAL(15,2) NULL,
       ADD COLUMN IF NOT EXISTS hireDate DATE NULL`
    ]

    const results = []
    
    for (const sql of sqlCommands) {
      try {
        await prisma.$executeRawUnsafe(sql)
        results.push({ sql: sql.substring(0, 50) + '...', status: 'success' })
        console.log('✅ Executed:', sql.substring(0, 50) + '...')
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.log('⚠️ SQL Error (might be expected):', errorMessage)
        results.push({ 
          sql: sql.substring(0, 50) + '...', 
          status: 'error', 
          error: errorMessage 
        })
      }
    }

    // Try to add unique constraint for apiKey if it doesn't exist
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE users ADD UNIQUE INDEX IF NOT EXISTS users_apiKey_key (apiKey)`)
      results.push({ sql: 'Add unique constraint for apiKey', status: 'success' })
    } catch (error) {
      results.push({ 
        sql: 'Add unique constraint for apiKey', 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    console.log('✅ Database schema fix completed')

    return NextResponse.json({
      message: 'Database schema fix completed',
      results: results,
      success: true
    })

  } catch (error) {
    console.error('Error fixing database:', error)
    return NextResponse.json(
      { 
        message: 'Database fix failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    )
  }
}

// GET - Check database schema status
export async function GET(request: NextRequest) {
  try {
    // Check if tables exist and get their structure
    const tableChecks = await Promise.allSettled([
      prisma.$queryRaw`DESCRIBE users`,
      prisma.$queryRaw`DESCRIBE companies`,
      prisma.$queryRaw`DESCRIBE employees`
    ])

    const results = {
      users: tableChecks[0].status === 'fulfilled' ? tableChecks[0].value : null,
      companies: tableChecks[1].status === 'fulfilled' ? tableChecks[1].value : null,
      employees: tableChecks[2].status === 'fulfilled' ? tableChecks[2].value : null,
      errors: tableChecks.filter(check => check.status === 'rejected').map(check => check.reason?.message)
    }

    return NextResponse.json({
      message: 'Database schema check completed',
      results: results
    })

  } catch (error) {
    console.error('Error checking database:', error)
    return NextResponse.json(
      { 
        message: 'Database check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

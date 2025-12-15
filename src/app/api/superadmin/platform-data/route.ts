import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  getPlatformStats, 
  getAllCompaniesOverview, 
  getTopPerformingCompanies,
  getRecentPlatformTransactions,
  getPlatformRevenueAnalytics,
  getPlatformUserData
} from '@/lib/superAdminDataAccess'

// GET - Get platform-wide data for SuperAdmin
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Only SuperAdmin can access platform-wide data
    if (!session || session.user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized - SuperAdmin access required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const dataType = searchParams.get('type') || 'stats'

    let data

    switch (dataType) {
      case 'stats':
        data = await getPlatformStats()
        break
      
      case 'companies':
        data = await getAllCompaniesOverview()
        break
      
      case 'top-companies':
        const limit = parseInt(searchParams.get('limit') || '10')
        data = await getTopPerformingCompanies(limit)
        break
      
      case 'transactions':
        const transactionLimit = parseInt(searchParams.get('limit') || '50')
        data = await getRecentPlatformTransactions(transactionLimit)
        break
      
      case 'revenue':
        data = await getPlatformRevenueAnalytics()
        break
      
      case 'users':
        data = await getPlatformUserData()
        break
      
      default:
        return NextResponse.json(
          { message: 'Invalid data type requested' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Platform ${dataType} data retrieved successfully`
    })

  } catch (error) {
    console.error('Error getting platform data:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

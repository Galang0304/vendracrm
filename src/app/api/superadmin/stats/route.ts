import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole, ApprovalStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all stats in parallel
    const [
      totalUsers, 
      totalCompanies, 
      pendingApprovals, 
      activeCompanies,
      totalStores,
      totalOwners,
      totalCashiers,
      totalAdmins
    ] = await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
      prisma.user.count({
        where: {
          status: ApprovalStatus.PENDING
        }
      }),
      prisma.company.count({
        where: {
          isActive: true
        }
      }),
      prisma.store.count(),
      prisma.user.count({
        where: {
          role: UserRole.OWNER
        }
      }),
      prisma.user.count({
        where: {
          role: UserRole.KASIR
        }
      }),
      prisma.user.count({
        where: {
          role: UserRole.ADMIN
        }
      })
    ])

    // Get detailed company data with owner and store counts
    const companiesWithDetails = await prisma.company.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true
          }
        },
        stores: {
          select: {
            id: true,
            name: true,
            code: true,
            isActive: true
          }
        },
        employees: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Get all users by company for detailed counts
    const allUsersByCompany = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        company: {
          select: {
            id: true
          }
        }
      }
    })

    const stats = {
      totalUsers,
      totalCompanies,
      pendingApprovals,
      activeCompanies,
      totalStores,
      totalOwners,
      totalCashiers,
      totalAdmins,
      companiesWithDetails: companiesWithDetails.map(company => {
        // Get all users for this company from the separate query
        const allCompanyUsers = allUsersByCompany.filter(u => u.company?.id === company.id)
        
        return {
          id: company.id,
          name: company.name,
          email: company.email,
          subscriptionTier: company.subscriptionTier,
          isActive: company.isActive,
          createdAt: company.createdAt,
          ownerCount: allCompanyUsers.filter(u => u.role === UserRole.OWNER).length,
          adminCount: allCompanyUsers.filter(u => u.role === UserRole.ADMIN).length,
          cashierCount: allCompanyUsers.filter(u => u.role === UserRole.KASIR).length,
          storeCount: company.stores?.length || 0,
          activeStoreCount: company.stores?.filter((s: any) => s.isActive).length || 0,
          owner: company.owner,
          employees: company.employees || [],
          stores: company.stores || []
        }
      })
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

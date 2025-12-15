'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/vendra/DashboardLayout'
import { 
  Users, 
  Building2, 
  TrendingUp, 
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from 'lucide-react'

interface PendingOwner {
  id: string
  name: string
  email: string
  status: string
  company: {
    id: string
    name: string
    email: string
    subscriptionTier: string
    createdAt: string
  }
  createdAt: string
}

interface Stats {
  totalUsers: number
  totalCompanies: number
  pendingApprovals: number
  activeCompanies: number
  totalStores: number
  totalOwners: number
  totalCashiers: number
  totalAdmins: number
  companiesWithDetails: Array<{
    id: string
    name: string
    email: string
    subscriptionTier: string
    isActive: boolean
    createdAt: string
    ownerCount: number
    adminCount: number
    cashierCount: number
    storeCount: number
    activeStoreCount: number
    owner: any
    employees: any[]
    stores: any[]
  }>
}

export default function SuperAdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pendingOwners, setPendingOwners] = useState<PendingOwner[]>([])
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCompanies: 0,
    pendingApprovals: 0,
    activeCompanies: 0,
    totalStores: 0,
    totalOwners: 0,
    totalCashiers: 0,
    totalAdmins: 0,
    companiesWithDetails: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'SUPERADMIN') {
      router.push('/unauthorized')
      return
    }

    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data for SuperAdmin...')
      
      // Fetch pending owners
      const pendingResponse = await fetch('/api/superadmin/pending-owners')
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json()
        setPendingOwners(pendingData)
        console.log('Pending owners fetched:', pendingData.length)
      } else {
        console.error('Failed to fetch pending owners:', pendingResponse.status)
        const errorText = await pendingResponse.text()
        console.error('Error details:', errorText)
      }

      // Fetch stats
      const statsResponse = await fetch('/api/superadmin/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
        console.log('Stats fetched:', statsData)
      } else {
        console.error('Failed to fetch stats:', statsResponse.status)
        const errorText = await statsResponse.text()
        console.error('Error details:', errorText)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (userId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/superadmin/approve-owner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, action }),
      })

      if (response.ok) {
        // Refresh data
        fetchDashboardData()
      }
    } catch (error) {
      console.error('Error processing approval:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout title="SuperAdmin Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">
            {status === 'loading' ? 'Checking authentication...' : 'Loading dashboard...'}
          </span>
        </div>
      </DashboardLayout>
    )
  }

  if (!session || session.user.role !== 'SUPERADMIN') {
    return (
      <DashboardLayout title="SuperAdmin Dashboard">
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-4">You need SuperAdmin privileges to access this page.</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="SuperAdmin Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-3xl font-bold mb-3">
            Welcome, SuperAdmin!
          </h2>
          <p className="text-purple-100 text-lg">
            System Management Dashboard • Vendra AI CRM
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <Building2 className="h-7 w-7 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Companies</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCompanies}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Building2 className="h-7 w-7 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Stores</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStores}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="h-7 w-7 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Role Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-teal-100 rounded-xl">
                <Users className="h-7 w-7 text-teal-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cashiers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCashiers}</p>
              </div>
            </div>
          </div>
        </div>


        {/* Companies Detail Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">📊 Companies Overview</h2>
            <p className="text-sm text-gray-600">Detailed breakdown of all registered companies with user counts and store information</p>
          </div>
          
          <div className="overflow-x-auto">
            {stats.companiesWithDetails.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No companies registered yet</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stores
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Users
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.companiesWithDetails
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{company.name}</div>
                          <div className="text-sm text-gray-500">{company.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{company.owner?.name || 'No Owner'}</div>
                          <div className="text-sm text-gray-500">{company.owner?.email || ''}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className="font-medium">{company.storeCount}</span> total
                        </div>
                        <div className="text-sm text-gray-500">
                          <span className="text-green-600">{company.activeStoreCount}</span> active
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Owners:</span>
                            <span className="font-medium text-indigo-600">{company.ownerCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Admins:</span>
                            <span className="font-medium text-orange-600">{company.adminCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cashiers:</span>
                            <span className="font-medium text-teal-600">{company.cashierCount}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          company.subscriptionTier === 'FREE' ? 'bg-gray-100 text-gray-800' :
                          company.subscriptionTier === 'BASIC' ? 'bg-blue-100 text-blue-800' :
                          company.subscriptionTier === 'PREMIUM' ? 'bg-purple-100 text-purple-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {company.subscriptionTier}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          company.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {company.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(company.createdAt).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Stores</span>
                <span className="text-sm font-medium text-gray-900">{stats.totalStores}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Companies</span>
                <span className="text-sm font-medium text-gray-900">{stats.activeCompanies}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending Reviews</span>
                <span className="text-sm font-medium text-yellow-600">{stats.pendingApprovals}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Business Owners</span>
                <span className="text-sm font-medium text-indigo-600">{stats.totalOwners}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">System Admins</span>
                <span className="text-sm font-medium text-orange-600">{stats.totalAdmins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cashier Accounts</span>
                <span className="text-sm font-medium text-teal-600">{stats.totalCashiers}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  )
}

'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/vendra/DashboardLayout'
import SubscriptionLimitsCard from '@/components/vendra/SubscriptionLimitsCard'
import StorageUsageCard from '@/components/vendra/StorageUsageCard'
import Link from 'next/link'
import { 
  Store,
  Crown,
  Star,
  Package,
  Building2,
  UserCheck,
  Settings,
  ArrowRight,
  Users,
  Zap,
  CheckCircle
} from 'lucide-react'

// Subscription Plan Component
function SubscriptionPlan({ tier }: { tier: string }) {
  const getPlanInfo = (tier: string) => {
    switch (tier) {
      case 'FREE':
        return {
          name: 'Free Plan',
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: Store,
          limit: 'Up to 50 transactions/month'
        }
      case 'BASIC':
        return {
          name: 'Basic Plan',
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: Star,
          limit: 'Up to 200K transactions/month'
        }
      case 'PREMIUM':
        return {
          name: 'Premium Plan',
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: Crown,
          limit: 'Up to 500K transactions/month'
        }
      case 'ENTERPRISE':
        return {
          name: 'Enterprise Plan',
          color: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border-orange-300',
          icon: Crown,
          limit: 'Unlimited transactions'
        }
      default:
        return {
          name: 'Unknown Plan',
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: Store,
          limit: 'Contact support'
        }
    }
  }

  const planInfo = getPlanInfo(tier)
  const IconComponent = planInfo.icon

  return (
    <div className={`inline-flex items-center px-4 py-2 rounded-lg border-2 ${planInfo.color} backdrop-blur-sm bg-white/20`}>
      <IconComponent className="h-4 w-4 mr-2" />
      <div className="text-right">
        <div className="text-sm font-semibold">{planInfo.name}</div>
        <div className="text-xs opacity-80">{planInfo.limit}</div>
      </div>
    </div>
  )
}

interface BusinessStats {
  totalSales: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  todaySales: number
  todayOrders: number
  monthlyGrowth: number
  lowStockItems: number
}

interface RecentActivity {
  id: string
  type: 'sale' | 'order' | 'customer' | 'product'
  description: string
  amount?: number
  timestamp: string
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<BusinessStats>({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    todaySales: 0,
    todayOrders: 0,
    monthlyGrowth: 0,
    lowStockItems: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      console.log('🔄 Fetching dashboard data...')
      
      // Fetch business stats
      const statsResponse = await fetch('/api/admin/stats')
      console.log('📊 Stats response status:', statsResponse.status)
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        console.log('📊 Stats data received:', statsData)
        setStats(statsData)
      } else {
        console.error('❌ Stats API error:', statsResponse.status, statsResponse.statusText)
      }

      // Fetch recent activity
      const activityResponse = await fetch('/api/admin/recent-activity')
      console.log('📋 Activity response status:', activityResponse.status)
      
      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        console.log('📋 Activity data received:', activityData)
        setRecentActivity(activityData)
      } else {
        console.error('❌ Activity API error:', activityResponse.status, activityResponse.statusText)
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Business Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Business Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-3">
                Welcome back, {session?.user.name}!
              </h2>
              <p className="text-blue-100 text-lg">
                {session?.user.companyName} • Business Dashboard
              </p>
            </div>
            {session?.user?.subscriptionTier && (
              <div className="mt-4 sm:mt-0">
                <SubscriptionPlan tier={session.user.subscriptionTier} />
              </div>
            )}
          </div>
        </div>

        {/* Subscription Information Section */}
        {session?.user?.subscriptionTier && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Paket Aktif */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Paket Aktif</h3>
                <div className="flex items-center space-x-2">
                  {session.user.subscriptionTier === 'FREE' ? (
                    <Store className="h-5 w-5 text-gray-600" />
                  ) : session.user.subscriptionTier === 'BASIC' ? (
                    <Star className="h-5 w-5 text-blue-600" />
                  ) : session.user.subscriptionTier === 'PREMIUM' ? (
                    <Crown className="h-5 w-5 text-purple-600" />
                  ) : (
                    <Crown className="h-5 w-5 text-yellow-600" />
                  )}
                  <span className="text-sm font-medium text-gray-600">
                    {session.user.subscriptionTier} Plan
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                {session.user.subscriptionTier === 'FREE' && (
                  <>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Maksimal 1 toko</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Maksimal 1 kasir</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Storage 100GB</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Aktif selamanya</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-red-600">
                      <span>✕</span>
                      <span>Tanpa fitur AI</span>
                    </div>
                  </>
                )}
                
                {session.user.subscriptionTier !== 'FREE' && (
                  <>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Toko unlimited</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Karyawan unlimited</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <span>Fitur AI tersedia</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Storage unlimited</span>
                    </div>
                  </>
                )}
              </div>

              {session.user.subscriptionTier === 'FREE' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link
                    href="/admin/upgrade"
                    className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center text-sm font-semibold py-2 px-4 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Upgrade Sekarang
                  </Link>
                </div>
              )}
            </div>

            {/* Usage Limits */}
            <div>
              <SubscriptionLimitsCard subscriptionTier={session.user.subscriptionTier} />
            </div>

            {/* Storage Usage */}
            <div>
              <StorageUsageCard subscriptionTier={session.user.subscriptionTier} />
            </div>
          </div>
        )}

        {/* Key Metrics - Clickable Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Total Customers Card - Links to Customers */}
          <Link href="/admin/customers" className="block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-purple-200 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                    <Users className="h-7 w-7 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                    <p className="text-sm text-purple-600 font-medium">Active customers</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
              </div>
            </div>
          </Link>

          {/* Total Products Card - Links to Products */}
          <Link href="/admin/products" className="block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-orange-200 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors">
                    <Package className="h-7 w-7 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                    <p className="text-sm text-orange-600 font-medium">In inventory</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
              </div>
            </div>
          </Link>
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Store Management */}
          <Link href="/admin/stores" className="block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-indigo-100 rounded-xl group-hover:bg-indigo-200 transition-colors">
                    <Building2 className="h-7 w-7 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Store Management</p>
                    <p className="text-lg font-bold text-gray-900">Manage Stores</p>
                    <p className="text-sm text-indigo-600 font-medium">View all stores</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </div>
          </Link>

          {/* Employee Management */}
          <Link href="/admin/employees" className="block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-teal-200 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-teal-100 rounded-xl group-hover:bg-teal-200 transition-colors">
                    <UserCheck className="h-7 w-7 text-teal-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Employee Management</p>
                    <p className="text-lg font-bold text-gray-900">Manage Staff</p>
                    <p className="text-sm text-teal-600 font-medium">View all employees</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
              </div>
            </div>
          </Link>

          {/* Inventory Management */}
          <Link href="/admin/products" className="block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-amber-200 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors">
                    <Package className="h-7 w-7 text-amber-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Inventory Management</p>
                    <p className="text-lg font-bold text-gray-900">Manage Products</p>
                    <p className="text-sm text-amber-600 font-medium">Stock & pricing</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
              </div>
            </div>
          </Link>

          {/* Settings */}
          <Link href="/admin/settings" className="block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-slate-200 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition-colors">
                    <Settings className="h-7 w-7 text-slate-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Settings</p>
                    <p className="text-lg font-bold text-gray-900">Account Settings</p>
                    <p className="text-sm text-slate-600 font-medium">Profile & preferences</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-slate-600 transition-colors" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}

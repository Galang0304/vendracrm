'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/vendra/DashboardLayout'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Star, 
  Gift, 
  Edit, 
  ArrowLeft,
  Crown,
  TrendingUp,
  ShoppingBag
} from 'lucide-react'

interface Customer {
  id: string
  uniqueId: string
  name: string
  email?: string
  phone?: string
  address?: string
  dateOfBirth?: string
  gender?: string
  isMember: boolean
  membershipId?: string
  membershipTier?: string
  membershipPoints: number
  membershipDiscount: number
  membershipJoinDate?: string
  membershipExpiry?: string
  createdAt: string
  updatedAt: string
  storeName?: string
  totalTransactions?: number
  totalSpent?: number
}

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchCustomer()
    }
  }, [params.id])

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/admin/customers/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCustomer(data)
      } else {
        console.error('Failed to fetch customer')
      }
    } catch (error) {
      console.error('Error fetching customer:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMembershipBadge = () => {
    if (!customer?.isMember) return null

    const tierColors = {
      bronze: 'bg-orange-100 text-orange-800 border-orange-200',
      silver: 'bg-gray-100 text-gray-800 border-gray-200',
      gold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      platinum: 'bg-purple-100 text-purple-800 border-purple-200'
    }

    const tierColor = tierColors[customer.membershipTier as keyof typeof tierColors] || 'bg-blue-100 text-blue-800 border-blue-200'

    return (
      <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${tierColor}`}>
        <Crown className="h-4 w-4 mr-2" />
        {customer.membershipTier?.toUpperCase() || 'MEMBER'}
      </div>
    )
  }

  if (loading) {
    return (
      <DashboardLayout title="Detail Customer">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!customer) {
    return (
      <DashboardLayout title="Customer Tidak Ditemukan">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Customer tidak ditemukan</h2>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Kembali
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={`Detail Customer - ${customer.name}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Kembali ke daftar customer"
              aria-label="Kembali ke daftar customer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detail Customer</h1>
              <p className="text-gray-600">Informasi lengkap customer</p>
            </div>
          </div>
          
          <button
            onClick={() => router.push(`/admin/customers/${customer.id}/edit`)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Customer
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Informasi Dasar</h2>
                {getMembershipBadge()}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Nama</label>
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{customer.name}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Customer ID</label>
                    <div className="flex items-center">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded">
                        {customer.uniqueId}
                      </span>
                    </div>
                  </div>

                  {customer.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Nomor HP</label>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{customer.phone}</span>
                      </div>
                    </div>
                  )}

                  {customer.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{customer.email}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {customer.address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Alamat</label>
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                        <span className="text-gray-900">{customer.address}</span>
                      </div>
                    </div>
                  )}

                  {customer.dateOfBirth && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Tanggal Lahir</label>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {new Date(customer.dateOfBirth).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>
                  )}

                  {customer.gender && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Jenis Kelamin</label>
                      <span className="text-gray-900 capitalize">{customer.gender}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Bergabung</label>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {new Date(customer.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Membership Information */}
            {customer.isMember && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Informasi Membership</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Member ID</label>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                        {customer.membershipId}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Tier</label>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-2" />
                        <span className="text-gray-900 capitalize">
                          {customer.membershipTier || 'Bronze'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Points</label>
                      <div className="flex items-center">
                        <Gift className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-gray-900">{customer.membershipPoints} points</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Discount</label>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-gray-900">{customer.membershipDiscount}%</span>
                      </div>
                    </div>

                    {customer.membershipJoinDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Member Sejak</label>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-900">
                            {new Date(customer.membershipJoinDate).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </div>
                    )}

                    {customer.storeName && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Store</label>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-900">{customer.storeName}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistik</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <ShoppingBag className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-blue-900">Total Transaksi</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {customer.totalTransactions || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-green-900">Total Belanja</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    Rp {(customer.totalSpent || 0).toLocaleString('id-ID')}
                  </span>
                </div>

                {customer.isMember && (
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <Gift className="h-5 w-5 text-yellow-600 mr-3" />
                      <span className="text-sm font-medium text-yellow-900">Points</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-600">
                      {customer.membershipPoints}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status Customer</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Aktif
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Membership</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    customer.isMember 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {customer.isMember ? 'Member' : 'Non-Member'}
                  </span>
                </div>

                {customer.isMember && customer.membershipExpiry && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Expired</span>
                    <span className="text-sm text-gray-900">
                      {new Date(customer.membershipExpiry).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

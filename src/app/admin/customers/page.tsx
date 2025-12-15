'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/vendra/DashboardLayout'
import Link from 'next/link'
import { 
  Users, 
  Plus, 
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Star,
  Gift,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Crown,
  Award,
  TrendingUp
} from 'lucide-react'

interface Customer {
  id: string
  uniqueId: string
  name: string
  email?: string
  phone?: string
  isMember: boolean
  membershipId?: string
  membershipTier?: string
  membershipPoints: number
  membershipDiscount: number
  membershipJoinDate?: string
  createdAt: string
  totalTransactions?: number
  totalSpent?: number
  storeName?: string
}

interface Store {
  id: string
  name: string
  code: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStore, setSelectedStore] = useState('all')
  const [memberFilter, setMemberFilter] = useState('all') // all, members, non-members
  const [tierFilter, setTierFilter] = useState('all') // all, bronze, silver, gold, platinum
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  // const [membershipStoreFilter, setMembershipStoreFilter] = useState('all') // all, specific store id

  useEffect(() => {
    fetchStores()
    fetchCustomers()
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [searchTerm, selectedStore, memberFilter, tierFilter])

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/admin/stores')
      if (response.ok) {
        const data = await response.json()
        setStores(data)
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        ...(selectedStore !== 'all' && { storeId: selectedStore }),
        ...(memberFilter === 'members' && { memberOnly: 'true' }),
        ...(memberFilter === 'non-members' && { nonMemberOnly: 'true' }),
        ...(tierFilter !== 'all' && { tier: tierFilter }),
        // ...(membershipStoreFilter !== 'all' && { membershipStoreId: membershipStoreFilter })
      })

      const response = await fetch(`/api/admin/customers?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCustomers(data || [])
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus customer ini?')) return

    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchCustomers() // Refresh list
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
    }
  }

  const handleCreateCustomer = async (formData: any) => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowCreateModal(false)
        fetchCustomers() // Refresh list
        alert('Customer berhasil dibuat!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      console.error('Error creating customer:', error)
      alert('Terjadi kesalahan saat membuat customer')
    } finally {
      setIsCreating(false)
    }
  }

  const getMembershipBadge = (customer: Customer) => {
    if (!customer.isMember) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Regular
        </span>
      )
    }

    const tierColors = {
      bronze: 'bg-orange-100 text-orange-800',
      silver: 'bg-gray-100 text-gray-800',
      gold: 'bg-yellow-100 text-yellow-800',
      platinum: 'bg-purple-100 text-purple-800'
    }

    const tierIcons = {
      bronze: Award,
      silver: Star,
      gold: Crown,
      platinum: Crown
    }

    const tierColor = tierColors[customer.membershipTier as keyof typeof tierColors] || 'bg-blue-100 text-blue-800'
    const TierIcon = tierIcons[customer.membershipTier as keyof typeof tierIcons] || Star

    return (
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tierColor}`}>
          <TierIcon className="h-3 w-3 mr-1" />
          {customer.membershipTier?.toUpperCase() || 'MEMBER'}
        </span>
        {customer.membershipPoints > 0 && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Gift className="h-3 w-3 mr-1" />
            {customer.membershipPoints} pts
          </span>
        )}
      </div>
    )
  }

  const getCustomerStats = () => {
    const totalCustomers = customers.length
    const totalMembers = customers.filter(c => c.isMember).length
    const membershipRate = totalCustomers > 0 ? (totalMembers / totalCustomers * 100) : 0
    
    const tierCounts = {
      bronze: customers.filter(c => c.membershipTier === 'bronze').length,
      silver: customers.filter(c => c.membershipTier === 'silver').length,
      gold: customers.filter(c => c.membershipTier === 'gold').length,
      platinum: customers.filter(c => c.membershipTier === 'platinum').length
    }

    return { totalCustomers, totalMembers, membershipRate, tierCounts }
  }

  const stats = getCustomerStats()

  if (loading) {
    return (
      <DashboardLayout title="Customer Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Customer Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Customer Management</h1>
            <p className="text-sm sm:text-base text-gray-600">Kelola customer dan member program</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center sm:justify-start"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Tambah Customer</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-xl">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-xl">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-xl">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Membership Rate</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.membershipRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-xl">
                <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Gold+ Members</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {stats.tierCounts.gold + stats.tierCounts.platinum}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pencarian</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Transaction Store Filter */}
            <div>
              <label htmlFor="storeFilter" className="block text-sm font-medium text-gray-700 mb-1">Toko Transaksi</label>
              <select
                id="storeFilter"
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                title="Filter customer berdasarkan toko transaksi"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Semua Toko Transaksi</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name} ({store.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Member Filter */}
            <div>
              <label htmlFor="memberFilter" className="block text-sm font-medium text-gray-700 mb-1">Status Member</label>
              <select
                id="memberFilter"
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
                title="Filter customer berdasarkan status membership"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Semua Customer</option>
                <option value="members">Hanya Member</option>
                <option value="non-members">Non-Member</option>
              </select>
            </div>

            {/* Tier Filter */}
            <div>
              <label htmlFor="tierFilter" className="block text-sm font-medium text-gray-700 mb-1">Tier Member</label>
              <select
                id="tierFilter"
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                title="Filter customer berdasarkan tier membership"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Semua Tier</option>
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>

            {/* Membership Store Filter */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Toko Member</label>
              <select
                value={membershipStoreFilter}
                onChange={(e) => setMembershipStoreFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Semua Toko Member</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name} ({store.code})
                  </option>
                ))}
              </select>
            </div> */}
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Membership
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Store
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">Belum ada customer</p>
                      <p className="text-sm">Tambah customer pertama Anda</p>
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.uniqueId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {customer.phone && (
                            <div className="flex items-center mb-1">
                              <Phone className="h-3 w-3 mr-1 text-gray-400" />
                              {customer.phone}
                            </div>
                          )}
                          {customer.email && (
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1 text-gray-400" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        {getMembershipBadge(customer)}
                        {customer.membershipDiscount > 0 && (
                          <div className="text-xs text-green-600 mt-1">
                            {customer.membershipDiscount}% discount
                          </div>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {customer.storeName || 'All Stores'}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {customer.membershipJoinDate 
                            ? new Date(customer.membershipJoinDate).toLocaleDateString('id-ID')
                            : new Date(customer.createdAt).toLocaleDateString('id-ID')
                          }
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <Link
                            href={`/admin/customers/${customer.id}`}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/customers/${customer.id}/edit`}
                            className="text-yellow-600 hover:text-yellow-900 p-1"
                            title="Edit Customer"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Hapus Customer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Customer Modal */}
      {showCreateModal && (
        <CreateCustomerModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateCustomer}
          isLoading={isCreating}
        />
      )}
    </DashboardLayout>
  )
}

// Create Customer Modal Component
interface CreateCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  isLoading: boolean
}

function CreateCustomerModal({ isOpen, onClose, onSubmit, isLoading }: CreateCustomerModalProps) {
  const [stores, setStores] = useState<Store[]>([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    isMember: false,
    membershipTier: 'bronze',
    membershipDiscount: 5,
    membershipStoreId: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchStores()
    }
  }, [isOpen])

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/admin/stores')
      if (response.ok) {
        const data = await response.json()
        setStores(data)
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
    }
  }

  const getMembershipDiscount = (tier: string) => {
    const discounts = {
      bronze: 5,
      silver: 10,
      gold: 15,
      platinum: 20
    }
    return discounts[tier as keyof typeof discounts] || 5
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      membershipDiscount: formData.isMember ? getMembershipDiscount(formData.membershipTier) : 0
    })
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      gender: '',
      isMember: false,
      membershipTier: 'bronze',
      membershipDiscount: 5,
      membershipStoreId: ''
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        // Auto-set discount when membership is toggled
        membershipDiscount: checked && name === 'isMember' ? getMembershipDiscount(prev.membershipTier) : prev.membershipDiscount
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        // Auto-update discount when tier changes
        membershipDiscount: name === 'membershipTier' && prev.isMember ? getMembershipDiscount(value) : prev.membershipDiscount
      }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tambah Customer Baru</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nama *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan nama customer"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="customer@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                No. Telepon
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="08123456789"
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Alamat
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Alamat lengkap"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Lahir
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Kelamin
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pilih jenis kelamin</option>
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>

            {/* Membership */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isMember"
                  checked={formData.isMember}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Daftar sebagai Member</span>
              </label>
            </div>

            {/* Membership Details (if member) */}
            {formData.isMember && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 flex items-center">
                  <Crown className="h-4 w-4 mr-2" />
                  Pengaturan Membership
                </h4>
                
                <div className="grid grid-cols-1 gap-4">
                  {/* Membership Tier */}
                  <div>
                    <label htmlFor="membershipTier" className="block text-sm font-medium text-gray-700 mb-1">
                      Tier Membership
                    </label>
                    <select
                      id="membershipTier"
                      name="membershipTier"
                      value={formData.membershipTier}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="bronze">Bronze (5% discount)</option>
                      <option value="silver">Silver (10% discount)</option>
                      <option value="gold">Gold (15% discount)</option>
                      <option value="platinum">Platinum (20% discount)</option>
                    </select>
                  </div>

                  {/* Store Assignment */}
                  <div>
                    <label htmlFor="membershipStoreId" className="block text-sm font-medium text-gray-700 mb-1">
                      Store Assignment
                    </label>
                    <select
                      id="membershipStoreId"
                      name="membershipStoreId"
                      value={formData.membershipStoreId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Stores</option>
                      {stores.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.name} ({store.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Discount Preview */}
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <p className="text-sm text-green-800">
                      <Star className="h-4 w-4 inline mr-1" />
                      Member akan mendapat discount: <strong>{getMembershipDiscount(formData.membershipTier)}%</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.name}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Buat Customer'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

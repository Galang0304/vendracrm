'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Users, Search, Shield, ShieldX, Crown, User, AlertTriangle } from 'lucide-react'

interface UserData {
  id: string
  name: string
  email: string
  role: string
  status: string
  company: {
    id: string
    name: string
    subscriptionTier: string
    subscriptionExpiry: string | null
    isActive: boolean
  }
  createdAt: string
}

export default function UserManagementPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [actionType, setActionType] = useState<'ban' | 'downgrade' | 'upgrade' | null>(null)
  const [reason, setReason] = useState('')
  const [newRole, setNewRole] = useState('')
  const [newTier, setNewTier] = useState('')
  const [processing, setProcessing] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        alert('Failed to fetch users')
      }
    } catch (error) {
      alert('Error fetching users')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.company.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleUserAction = async () => {
    if (!selectedUser || !actionType) return

    setProcessing(true)
    try {
      const payload: any = {
        userId: selectedUser.id,
        action: actionType,
        reason
      }

      if (actionType === 'downgrade' || actionType === 'upgrade') {
        payload.newRole = newRole
        payload.newTier = newTier
      }

      const response = await fetch('/api/admin/user-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        alert(`User ${actionType} successful`)
        fetchUsers()
        setSelectedUser(null)
        setActionType(null)
        setReason('')
        setNewRole('')
        setNewTier('')
        setShowModal(false)
      } else {
        const error = await response.json()
        alert(error.message || `Failed to ${actionType} user`)
      }
    } catch (error) {
      alert(`Error ${actionType}ing user`)
    } finally {
      setProcessing(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPERADMIN': return <Crown className="w-4 h-4" />
      case 'OWNER': return <Shield className="w-4 h-4" />
      case 'ADMIN': return <ShieldX className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'BANNED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'FREE': return 'bg-gray-100 text-gray-800'
      case 'PREMIUM': return 'bg-blue-100 text-blue-800'
      case 'ENTERPRISE': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDaysRemaining = (expiryDate: string | null) => {
    if (!expiryDate) return null
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-gray-600">Kelola pengguna dan status berlangganan</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Filter & Search</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search Users</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cari nama, email, atau perusahaan..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Role</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={roleFilter}
              onChange={(e: any) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="OWNER">Owner</option>
              <option value="ADMIN">Admin</option>
              <option value="KASIR">Kasir</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
              <option value="BANNED">Banned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="grid gap-4">
        {filteredUsers.map((user) => {
          const daysRemaining = getDaysRemaining(user.company.subscriptionExpiry)
          return (
            <div key={user.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(user.role)}
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium border border-gray-300">
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium">{user.company.name}</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(user.company.subscriptionTier)}`}>
                        {user.company.subscriptionTier}
                      </span>
                      {daysRemaining !== null && (
                        <span className={`text-sm ${
                          daysRemaining < 7 ? 'text-red-600' : 
                          daysRemaining < 30 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {daysRemaining > 0 ? `${daysRemaining} hari` : 'Expired'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {user.status !== 'BANNED' && (
                      <button
                        className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-1"
                        onClick={() => {
                          setSelectedUser(user)
                          setActionType('ban')
                          setShowModal(true)
                        }}
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Ban
                      </button>
                    )}

                    <button
                      className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
                      onClick={() => {
                        setSelectedUser(user)
                        setActionType('downgrade')
                        setNewRole(user.role)
                        setNewTier(user.company.subscriptionTier)
                        setShowModal(true)
                      }}
                    >
                      <Users className="w-4 h-4" />
                      Modify
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
          <p className="text-gray-600">
            Tidak ada user yang sesuai dengan filter yang dipilih.
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {actionType === 'ban' ? 'Ban User' : 'Modify User'}
            </h3>
            <p className="text-gray-600 mb-4">
              {actionType === 'ban' 
                ? `Anda akan memban user ${selectedUser.name}. Tindakan ini akan menonaktifkan akun mereka.`
                : `Ubah role dan subscription tier untuk ${selectedUser.name}`
              }
            </p>
            
            <div className="space-y-4">
              {actionType !== 'ban' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">New Role</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newRole}
                      onChange={(e: any) => setNewRole(e.target.value)}
                    >
                      <option value="OWNER">Owner</option>
                      <option value="ADMIN">Admin</option>
                      <option value="KASIR">Kasir</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">New Subscription Tier</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newTier}
                      onChange={(e: any) => setNewTier(e.target.value)}
                    >
                      <option value="FREE">FREE</option>
                      <option value="PREMIUM">PREMIUM</option>
                      <option value="ENTERPRISE">ENTERPRISE</option>
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {actionType === 'ban' ? 'Alasan Ban' : 'Alasan Perubahan'}
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder={actionType === 'ban' ? 'Masukkan alasan ban...' : 'Masukkan alasan perubahan...'}
                  value={reason}
                  onChange={(e: any) => setReason(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => {
                  setShowModal(false)
                  setSelectedUser(null)
                  setActionType(null)
                  setReason('')
                  setNewRole('')
                  setNewTier('')
                }}
              >
                Cancel
              </button>
              <button
                className={`flex-1 px-4 py-2 rounded-md text-white ${
                  actionType === 'ban' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                } disabled:opacity-50`}
                onClick={handleUserAction}
                disabled={processing || !reason}
              >
                {processing ? 'Processing...' : (actionType === 'ban' ? 'Ban User' : 'Update User')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/vendra/DashboardLayout'
import { Users, Search, Shield, ShieldX, Crown, User, Calendar, Zap, Ban, ArrowUp, ArrowDown } from 'lucide-react'

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
  const [actionType, setActionType] = useState<'ban' | 'upgrade' | 'downgrade' | null>(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [newTier, setNewTier] = useState('')
  const [processing, setProcessing] = useState(false)

  // Check if user is SuperAdmin
  if (session && session.user.role !== 'SUPERADMIN') {
    return (
      <DashboardLayout title="Access Denied">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-6xl mb-4">🚫</div>
          <h3 className="text-xl font-semibold text-red-800 mb-2">
            Access Denied
          </h3>
          <p className="text-red-600">
            Only SuperAdmin can access user management.
          </p>
        </div>
      </DashboardLayout>
    )
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])


  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <DashboardLayout title="User Management">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  const handleUserAction = async (userId: string, action: string, newTier?: string) => {
    setProcessing(true)
    try {
      const response = await fetch('/api/admin/user-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action,
          newTier
        }),
      })

      if (response.ok) {
        await fetchUsers() // Refresh the list
        setShowActionModal(false)
        setSelectedUser(null)
        setActionType(null)
        setNewTier('')
        alert('Action completed successfully!')
      } else {
        alert('Failed to perform action')
      }
    } catch (error) {
      console.error('Error performing action:', error)
      alert('An error occurred')
    } finally {
      setProcessing(false)
    }
  }

  const openActionModal = (user: UserData, action: 'ban' | 'upgrade' | 'downgrade') => {
    setSelectedUser(user)
    setActionType(action)
    setShowActionModal(true)
    if (action === 'upgrade' || action === 'downgrade') {
      setNewTier(user.company.subscriptionTier)
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPERADMIN': return Shield
      case 'ADMIN': return ShieldX
      case 'OWNER': return Crown
      default: return User
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPERADMIN': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'ADMIN': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'OWNER': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-50 border-green-200'
      case 'BANNED': return 'text-red-600 bg-red-50 border-red-200'
      case 'PENDING': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'BASIC': return Crown
      case 'PREMIUM': return Crown
      case 'ENTERPRISE': return Zap
      default: return User
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BASIC': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'PREMIUM': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'ENTERPRISE': return 'text-pink-600 bg-pink-50 border-pink-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="User Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="User Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <p className="text-gray-600 mt-1">Manage users, roles, and subscription tiers</p>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-blue-700 font-semibold">{filteredUsers.length} Users</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Roles</option>
                <option value="OWNER">Owner</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="BANNED">Banned</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
            <p className="text-gray-600">No users match your current filters.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map((user) => {
              const RoleIcon = getRoleIcon(user.role)
              const TierIcon = getTierIcon(user.company.subscriptionTier)
              
              return (
                <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-gray-600">{user.email}</p>
                        <p className="text-sm text-gray-500">Company: {user.company.name}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(user.role)}`}>
                        <RoleIcon className="inline h-4 w-4 mr-1" />
                        {user.role}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(user.status)}`}>
                        {user.status}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <TierIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Subscription</p>
                        <div className={`px-2 py-1 rounded text-sm font-medium border ${getTierColor(user.company.subscriptionTier)}`}>
                          {user.company.subscriptionTier}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Expiry</p>
                        <p className="font-semibold text-gray-900">
                          {user.company.subscriptionExpiry 
                            ? new Date(user.company.subscriptionExpiry).toLocaleDateString('id-ID')
                            : 'No expiry'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2">
                      {user.status !== 'BANNED' && (
                        <button
                          onClick={() => openActionModal(user, 'ban')}
                          className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          <Ban className="h-4 w-4" />
                          <span>Ban</span>
                        </button>
                      )}
                      <button
                        onClick={() => openActionModal(user, 'upgrade')}
                        className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        <ArrowUp className="h-4 w-4" />
                        <span>Upgrade</span>
                      </button>
                      <button
                        onClick={() => openActionModal(user, 'downgrade')}
                        className="flex items-center space-x-1 bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                      >
                        <ArrowDown className="h-4 w-4" />
                        <span>Downgrade</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Action Modal */}
        {showActionModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {actionType === 'ban' ? 'Ban User' : 
                 actionType === 'upgrade' ? 'Upgrade Subscription' : 'Downgrade Subscription'}
              </h3>
              
              <div className="mb-4">
                <p className="text-gray-600">User: <strong>{selectedUser.name}</strong></p>
                <p className="text-gray-600">Email: <strong>{selectedUser.email}</strong></p>
                {actionType !== 'ban' && (
                  <p className="text-gray-600">Current Tier: <strong>{selectedUser.company.subscriptionTier}</strong></p>
                )}
              </div>

              {(actionType === 'upgrade' || actionType === 'downgrade') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Subscription Tier
                  </label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="FREE">FREE</option>
                    <option value="BASIC">BASIC</option>
                    <option value="PREMIUM">PREMIUM</option>
                    <option value="ENTERPRISE">ENTERPRISE</option>
                  </select>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => handleUserAction(selectedUser.id, actionType!, newTier)}
                  disabled={processing}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Confirm'}
                </button>
                <button
                  onClick={() => {
                    setShowActionModal(false)
                    setSelectedUser(null)
                    setActionType(null)
                    setNewTier('')
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

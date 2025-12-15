'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/vendra/DashboardLayout'
import { 
  Key, 
  Copy, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Calendar,
  User,
  Building,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react'

interface UserWithApiKey {
  id: string
  name: string
  email: string
  role: string
  status: string
  apiKey: string | null
  apiKeyExpiry: string | null
  createdAt: string
  company: {
    name: string
    email: string
  } | null
}

export default function ApiKeysPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<UserWithApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [visibleApiKeys, setVisibleApiKeys] = useState<Set<string>>(new Set())
  const [copiedApiKey, setCopiedApiKey] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user.role === 'SUPERADMIN') {
      fetchUsers()
    }
  }, [session])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/superadmin/api-keys')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateNewApiKey = async (userId: string) => {
    try {
      const response = await fetch('/api/superadmin/api-keys/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      })

      if (response.ok) {
        fetchUsers() // Refresh data
      }
    } catch (error) {
      console.error('Error generating API key:', error)
    }
  }

  const revokeApiKey = async (userId: string) => {
    if (!confirm('Apakah Anda yakin ingin mencabut API key ini?')) return

    try {
      const response = await fetch('/api/superadmin/api-keys/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      })

      if (response.ok) {
        fetchUsers() // Refresh data
      }
    } catch (error) {
      console.error('Error revoking API key:', error)
    }
  }

  const copyApiKey = async (apiKey: string) => {
    try {
      await navigator.clipboard.writeText(apiKey)
      setCopiedApiKey(apiKey)
      setTimeout(() => setCopiedApiKey(null), 2000)
    } catch (error) {
      console.error('Error copying API key:', error)
    }
  }

  const bulkGenerateApiKeys = async () => {
    if (!confirm('Generate API keys untuk semua user yang belum punya? Proses ini tidak bisa dibatalkan.')) return

    try {
      setLoading(true)
      const response = await fetch('/api/superadmin/api-keys/bulk-generate', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Bulk generation berhasil!\n\nGenerated: ${data.summary.generated}\nSkipped: ${data.summary.skipped}\nTotal: ${data.summary.totalUsers}`)
        fetchUsers() // Refresh data
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.message}`)
      }
    } catch (error) {
      console.error('Error bulk generating API keys:', error)
      alert('Terjadi kesalahan saat bulk generate API keys')
    } finally {
      setLoading(false)
    }
  }

  const toggleApiKeyVisibility = (userId: string) => {
    const newVisible = new Set(visibleApiKeys)
    if (newVisible.has(userId)) {
      newVisible.delete(userId)
    } else {
      newVisible.add(userId)
    }
    setVisibleApiKeys(newVisible)
  }

  const maskApiKey = (apiKey: string): string => {
    if (apiKey.length < 12) return apiKey
    const start = apiKey.substring(0, 8)
    const end = apiKey.substring(apiKey.length - 4)
    const middle = '*'.repeat(apiKey.length - 12)
    return `${start}${middle}${end}`
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      APPROVED: 'bg-green-100 text-green-800 border-green-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />
      case 'PENDING':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return null
    }
  }

  const isApiKeyExpired = (expiry: string | null): boolean => {
    if (!expiry) return true
    return new Date() > new Date(expiry)
  }


  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    
    const matchesStatus = statusFilter === '' || user.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (session?.user.role !== 'SUPERADMIN') {
    return (
      <DashboardLayout title="API Keys Management">
        <div className="text-center py-12">
          <Key className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Only SuperAdmin can access API Keys management.</p>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout title="API Keys Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="API Keys Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Key className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">API Keys Management</h1>
              <p className="text-purple-100">
                Kelola API keys untuk semua users dan companies
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800 mb-1">
                Fitur Dalam Pengembangan
              </h3>
              <p className="text-yellow-700 text-sm">
                API Keys management sedang dalam tahap pengembangan. Database schema perlu diperbarui untuk mendukung fitur ini.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <Key className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active API Keys</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.apiKey && !isApiKeyExpired(u.apiKeyExpiry)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-xl">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expired Keys</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.apiKey && isApiKeyExpired(u.apiKeyExpiry)).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users, companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="flex items-end space-x-3">
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              
              <button
                onClick={bulkGenerateApiKeys}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Key className="h-4 w-4 mr-2" />
                {loading ? 'Generating...' : 'Bulk Generate'}
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Users & API Keys</h3>
            <p className="text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User & Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    API Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.company && (
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <Building className="h-3 w-3 mr-1" />
                              {user.company.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(user.status)}`}>
                        {getStatusIcon(user.status)}
                        <span className="ml-1">{user.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.apiKey ? (
                        <div className="flex items-center space-x-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                            {visibleApiKeys.has(user.id) ? user.apiKey : maskApiKey(user.apiKey)}
                          </code>
                          <button
                            onClick={() => toggleApiKeyVisibility(user.id)}
                            className="text-gray-400 hover:text-gray-600"
                            title={visibleApiKeys.has(user.id) ? 'Hide API Key' : 'Show API Key'}
                          >
                            {visibleApiKeys.has(user.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => copyApiKey(user.apiKey!)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Copy API Key"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          {copiedApiKey === user.apiKey && (
                            <span className="text-xs text-green-600">Copied!</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 italic">No API Key</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.apiKeyExpiry ? (
                        <div className="text-sm">
                          <div className={`${isApiKeyExpired(user.apiKeyExpiry) ? 'text-red-600' : 'text-gray-900'}`}>
                            {new Date(user.apiKeyExpiry).toLocaleDateString('id-ID')}
                          </div>
                          {isApiKeyExpired(user.apiKeyExpiry) && (
                            <div className="text-xs text-red-500">Expired</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => generateNewApiKey(user.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Generate New API Key"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        {user.apiKey && (
                          <button
                            onClick={() => revokeApiKey(user.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Revoke API Key"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

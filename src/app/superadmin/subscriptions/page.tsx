'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/vendra/DashboardLayout'
import { Calendar, Clock, RefreshCw, Building2, User, Crown, Zap, CheckCircle, XCircle, Plus, Minus } from 'lucide-react'

interface SubscriptionAccount {
  id: string
  user: {
    name: string
    email: string
  }
  company: {
    name: string
    subscriptionTier: string
    subscriptionExpiry: string | null
    isActive: boolean
  }
  daysRemaining: number
  isExpired: boolean
}

export default function SubscriptionsPage() {
  const { data: session } = useSession()
  const [accounts, setAccounts] = useState<SubscriptionAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<SubscriptionAccount | null>(null)
  const [timeAmount, setTimeAmount] = useState(1)
  const [timeUnit, setTimeUnit] = useState<'days' | 'weeks' | 'months'>('months')
  const [timeAction, setTimeAction] = useState<'add' | 'subtract'>('add')

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
            Only SuperAdmin can access subscription management.
          </p>
        </div>
      </DashboardLayout>
    )
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/admin/subscriptions')
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts)
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetExpiry = async (accountId: string) => {
    setProcessingId(accountId)
    
    try {
      const response = await fetch('/api/admin/reset-expiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId }),
      })

      if (response.ok) {
        fetchSubscriptions() // Refresh the list
        alert('Masa aktif berhasil direset!')
      } else {
        alert('Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Error resetting expiry:', error)
      alert('Terjadi kesalahan')
    } finally {
      setProcessingId(null)
    }
  }

  const openTimeModal = (account: SubscriptionAccount, action: 'add' | 'subtract') => {
    setSelectedAccount(account)
    setTimeAction(action)
    setShowTimeModal(true)
    setTimeAmount(1)
    setTimeUnit('months')
  }

  const handleTimeAdjustment = async () => {
    if (!selectedAccount) return
    
    setProcessingId(selectedAccount.id)
    
    try {
      const response = await fetch('/api/admin/adjust-expiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: selectedAccount.id,
          action: timeAction,
          amount: timeAmount,
          unit: timeUnit
        }),
      })

      if (response.ok) {
        fetchSubscriptions() // Refresh the list
        setShowTimeModal(false)
        setSelectedAccount(null)
        alert(`Masa aktif berhasil ${timeAction === 'add' ? 'ditambah' : 'dikurangi'}!`)
      } else {
        alert('Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Error adjusting expiry:', error)
      alert('Terjadi kesalahan')
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'BASIC': return Crown
      case 'PREMIUM': return Crown
      case 'ENTERPRISE': return Zap
      default: return Crown
    }
  }

  const getPlanColor = (tier: string) => {
    switch (tier) {
      case 'BASIC': return 'from-blue-500 to-blue-600'
      case 'PREMIUM': return 'from-blue-600 to-purple-600'
      case 'ENTERPRISE': return 'from-purple-600 to-pink-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getStatusColor = (account: SubscriptionAccount) => {
    if (account.isExpired) return 'text-red-600 bg-red-50 border-red-200'
    if (account.daysRemaining <= 7) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-green-600 bg-green-50 border-green-200'
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Manajemen Berlangganan">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Manajemen Berlangganan">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Akun Berlangganan</h2>
              <p className="text-gray-600 mt-1">Kelola masa aktif berlangganan pengguna</p>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-blue-700 font-semibold">{accounts.length} Akun</span>
            </div>
          </div>
        </div>

        {/* Subscription Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Aktif</p>
                <p className="text-xl font-bold text-gray-900">
                  {accounts.filter(a => !a.isExpired).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Segera Expired</p>
                <p className="text-xl font-bold text-gray-900">
                  {accounts.filter(a => !a.isExpired && a.daysRemaining <= 7).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-xl font-bold text-gray-900">
                  {accounts.filter(a => a.isExpired).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{accounts.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Accounts List */}
        {accounts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Akun</h3>
            <p className="text-gray-600">Belum ada akun berlangganan yang terdaftar.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {accounts.map((account) => {
              const PlanIcon = getPlanIcon(account.company.subscriptionTier)
              const planColor = getPlanColor(account.company.subscriptionTier)
              const statusColor = getStatusColor(account)
              
              return (
                <div key={account.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${planColor}`}>
                        <PlanIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {account.company.name}
                        </h3>
                        <p className="text-gray-600">{account.company.subscriptionTier} Plan</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColor}`}>
                      {account.isExpired ? 'Expired' : 'Active'}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Owner</p>
                        <p className="font-semibold text-gray-900">{account.user.name}</p>
                        <p className="text-sm text-gray-600">{account.user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Masa Aktif</p>
                        <p className="font-semibold text-gray-900">
                          {account.company.subscriptionExpiry 
                            ? formatDate(account.company.subscriptionExpiry)
                            : 'Tidak ada'
                          }
                        </p>
                        <p className={`text-sm font-medium ${
                          account.isExpired ? 'text-red-600' : 
                          account.daysRemaining <= 7 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {account.isExpired 
                            ? 'Sudah expired'
                            : `${account.daysRemaining} hari tersisa`
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openTimeModal(account, 'add')}
                        disabled={processingId === account.id}
                        className="flex items-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Tambah Waktu</span>
                      </button>
                      <button
                        onClick={() => openTimeModal(account, 'subtract')}
                        disabled={processingId === account.id}
                        className="flex items-center space-x-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="h-4 w-4" />
                        <span>Kurangi Waktu</span>
                      </button>
                      <button
                        onClick={() => handleResetExpiry(account.id)}
                        disabled={processingId === account.id}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RefreshCw className={`h-4 w-4 ${processingId === account.id ? 'animate-spin' : ''}`} />
                        <span>{processingId === account.id ? 'Mereset...' : 'Reset Masa Aktif'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Time Adjustment Modal */}
        {showTimeModal && selectedAccount && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {timeAction === 'add' ? 'Tambah Waktu Berlangganan' : 'Kurangi Waktu Berlangganan'}
              </h3>
              
              <div className="mb-4">
                <p className="text-gray-600">Company: <strong>{selectedAccount.company.name}</strong></p>
                <p className="text-gray-600">Owner: <strong>{selectedAccount.user.name}</strong></p>
                <p className="text-gray-600">Current Expiry: <strong>
                  {selectedAccount.company.subscriptionExpiry 
                    ? formatDate(selectedAccount.company.subscriptionExpiry)
                    : 'Tidak ada'
                  }
                </strong></p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Waktu
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={timeAmount}
                    onChange={(e) => setTimeAmount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan jumlah"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Satuan Waktu
                  </label>
                  <select
                    value={timeUnit}
                    onChange={(e) => setTimeUnit(e.target.value as 'days' | 'weeks' | 'months')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="days">Hari</option>
                    <option value="weeks">Minggu</option>
                    <option value="months">Bulan</option>
                  </select>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Aksi: <strong className={timeAction === 'add' ? 'text-green-600' : 'text-red-600'}>
                      {timeAction === 'add' ? 'Menambah' : 'Mengurangi'} {timeAmount} {
                        timeUnit === 'days' ? 'hari' : 
                        timeUnit === 'weeks' ? 'minggu' : 'bulan'
                      }
                    </strong>
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleTimeAdjustment}
                  disabled={processingId === selectedAccount.id}
                  className={`flex-1 text-white py-2 rounded-lg transition-colors disabled:opacity-50 ${
                    timeAction === 'add' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {processingId === selectedAccount.id ? 'Memproses...' : 
                   timeAction === 'add' ? 'Tambah Waktu' : 'Kurangi Waktu'}
                </button>
                <button
                  onClick={() => {
                    setShowTimeModal(false)
                    setSelectedAccount(null)
                    setTimeAmount(1)
                    setTimeUnit('months')
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

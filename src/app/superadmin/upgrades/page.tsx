'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/vendra/DashboardLayout'
import { Check, X, Eye, Crown, Zap, CreditCard, Calendar, User, Building2 } from 'lucide-react'

interface UpgradeRequest {
  id: string
  user: {
    id: string
    name: string
    email: string
  }
  company: {
    id: string
    name: string
    email: string
    subscriptionTier?: string
  }
  requestedTier: string
  paymentMethod: string
  paymentProof: string
  requestedAt: string
  status: string
  approvedAt?: string
  approvedBy?: string
}

export default function SuperAdminUpgradesPage() {
  const { data: session } = useSession()
  const [upgradeRequests, setUpgradeRequests] = useState<UpgradeRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    fetchUpgradeRequests()
  }, [])

  const fetchUpgradeRequests = async () => {
    try {
      const response = await fetch('/api/admin/upgrade-requests')
      if (response.ok) {
        const data = await response.json()
        setUpgradeRequests(data.requests)
      }
    } catch (error) {
      console.error('Error fetching upgrade requests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveUpgrade = async (requestId: string, action: 'approve' | 'reject') => {
    setProcessingId(requestId)
    
    try {
      const endpoint = action === 'approve' 
        ? `/api/admin/upgrade-requests/${requestId}/approve`
        : `/api/admin/upgrade-requests/${requestId}/reject`
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: action === 'reject' ? JSON.stringify({ reason: 'Rejected by SuperAdmin' }) : undefined,
      })

      if (response.ok) {
        // Refresh the list
        fetchUpgradeRequests()
        alert(action === 'approve' ? 'Upgrade berhasil disetujui!' : 'Upgrade ditolak!')
      } else {
        alert('Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Error processing upgrade:', error)
      alert('Terjadi kesalahan')
    } finally {
      setProcessingId(null)
    }
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

  const getPlanPrice = (tier: string) => {
    switch (tier) {
      case 'BASIC': return 'Rp 200.000/bulan'
      case 'PREMIUM': return 'Rp 500.000/bulan'
      case 'ENTERPRISE': return 'Rp 1.500.000/bulan'
      default: return 'Unknown'
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Manajemen Upgrade">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Manajemen Upgrade">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Permintaan Upgrade Akun</h2>
              <p className="text-gray-600 mt-1">Kelola permintaan upgrade dari pengguna</p>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-blue-700 font-semibold">{upgradeRequests.length} Permintaan</span>
            </div>
          </div>
        </div>

        {/* Upgrade Requests List */}
        {upgradeRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Permintaan</h3>
            <p className="text-gray-600">Belum ada permintaan upgrade dari pengguna.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {upgradeRequests.map((request) => {
              const PlanIcon = getPlanIcon(request.requestedTier)
              const planColor = getPlanColor(request.requestedTier)
              const planPrice = getPlanPrice(request.requestedTier)
              
              return (
                <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${planColor}`}>
                          <PlanIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Upgrade ke {request.requestedTier}
                          </h3>
                          <p className="text-gray-600">{planPrice}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          request.status === 'APPROVED' 
                            ? 'bg-green-100 text-green-800' 
                            : request.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status === 'APPROVED' ? 'Disetujui' : 
                           request.status === 'REJECTED' ? 'Ditolak' : 'Pending'}
                        </div>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Pengguna</p>
                            <p className="font-semibold text-gray-900">{request.user?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-600">{request.user?.email || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Building2 className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Perusahaan</p>
                            <p className="font-semibold text-gray-900">{request.company?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-600">
                              Saat ini: {request.company?.subscriptionTier || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Metode Pembayaran</p>
                            <p className="font-semibold text-gray-900">{request.paymentMethod || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Tanggal Permintaan</p>
                            <p className="font-semibold text-gray-900">
                              {request.requestedAt ? new Date(request.requestedAt).toLocaleDateString('id-ID') : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Proof */}
                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-700 mb-2">Bukti Pembayaran:</p>
                      <div className="flex items-center space-x-4">
                        {request.paymentProof ? (
                          <>
                            <img
                              src={request.paymentProof}
                              alt="Payment Proof"
                              className="w-20 h-20 object-cover rounded-lg border cursor-pointer hover:opacity-75 transition-opacity"
                              onClick={() => setSelectedImage(request.paymentProof)}
                            />
                            <button
                              onClick={() => setSelectedImage(request.paymentProof)}
                              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="text-sm">Lihat Bukti Pembayaran</span>
                            </button>
                          </>
                        ) : (
                          <div className="text-gray-500 text-sm">Tidak ada bukti pembayaran</div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {request.status === 'PENDING' && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleApproveUpgrade(request.id, 'approve')}
                          disabled={processingId === request.id}
                          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check className="h-4 w-4" />
                          <span>{processingId === request.id ? 'Memproses...' : 'Setujui'}</span>
                        </button>
                        <button
                          onClick={() => handleApproveUpgrade(request.id, 'reject')}
                          disabled={processingId === request.id}
                          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="h-4 w-4" />
                          <span>Tolak</span>
                        </button>
                      </div>
                    )}
                    
                    {/* Show processed info for approved/rejected requests */}
                    {request.status !== 'PENDING' && (
                      <div className="text-sm text-gray-600">
                        {request.status === 'APPROVED' ? 'Upgrade telah disetujui' : 'Upgrade telah ditolak'}
                        {request.approvedAt && (
                          <span className="block text-xs text-gray-500 mt-1">
                            Diproses pada: {new Date(request.approvedAt).toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-white text-gray-800 rounded-full p-2 hover:bg-gray-100 transition-colors z-10"
              >
                <X className="h-6 w-6" />
              </button>
              <img
                src={selectedImage}
                alt="Payment Proof"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import DashboardLayout from '@/components/vendra/DashboardLayout'
import RFMAnalysis from '@/components/admin/RFMAnalysis'
import { Shield } from 'lucide-react'

export default function RFMAnalysisPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (!['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      router.push('/unauthorized')
      return
    }

    // Check subscription tier - FREE users cannot access RFM Analysis
    if (session.user.subscriptionTier === 'FREE') {
      // Don't redirect, just show upgrade message
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
    return null
  }

  // Show upgrade message for FREE users
  if (session.user.subscriptionTier === 'FREE') {
    return (
      <DashboardLayout title="Analisis Segmentasi RFM">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Fitur Premium
              </h2>
              <p className="text-gray-600 mb-6">
                Analisis RFM hanya tersedia untuk pengguna berbayar. Upgrade paket Anda untuk mengakses fitur analisis pelanggan lanjutan.
              </p>
              <button
                onClick={() => window.location.href = '/admin/upgrade'}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Upgrade Sekarang
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Analisis Segmentasi RFM">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Segmentasi Pelanggan RFM</h1>
              <p className="text-blue-100">
                Analisis perilaku pelanggan menggunakan metrik Recency, Frequency, dan Monetary
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">📊</div>
              <div className="text-sm text-blue-100 mt-1">Analisis Lanjutan</div>
            </div>
          </div>
        </div>

        <RFMAnalysis />
      </div>
    </DashboardLayout>
  )
}

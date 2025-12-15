'use client'

import { useSession } from 'next-auth/react'
import { Calendar, Clock, CheckCircle } from 'lucide-react'

export default function SubscriptionStatus() {
  const { data: session } = useSession()

  if (!session?.user) return null

  const subscriptionTier = session.user.subscriptionTier || 'FREE'
  const company = session.user.company

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  const getDaysRemaining = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusColor = () => {
    if (subscriptionTier === 'FREE') return 'text-orange-600'
    if (company?.subscriptionExpiry) {
      const daysRemaining = getDaysRemaining(company.subscriptionExpiry)
      if (daysRemaining <= 7) return 'text-red-600'
      if (daysRemaining <= 30) return 'text-yellow-600'
    }
    return 'text-green-600'
  }

  const getStatusBg = () => {
    if (subscriptionTier === 'FREE') return 'bg-orange-50 border-orange-200'
    if (company?.subscriptionExpiry) {
      const daysRemaining = getDaysRemaining(company.subscriptionExpiry)
      if (daysRemaining <= 7) return 'bg-red-50 border-red-200'
      if (daysRemaining <= 30) return 'bg-yellow-50 border-yellow-200'
    }
    return 'bg-green-50 border-green-200'
  }

  return (
    <div className={`rounded-lg p-4 border ${getStatusBg()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor().replace('text-', 'bg-')}`}></div>
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-700">
            Status Berlangganan
          </span>
        </div>
        {subscriptionTier !== 'FREE' && (
          <CheckCircle className={`h-4 w-4 ${getStatusColor()}`} />
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-900">{subscriptionTier} Plan</span>
          {subscriptionTier !== 'FREE' && company?.subscriptionExpiry && (
            <span className={`text-xs font-medium ${getStatusColor()}`}>
              {isExpired(company.subscriptionExpiry) ? 'Expired' : 'Active'}
            </span>
          )}
        </div>

        {subscriptionTier === 'FREE' ? (
          <div className="text-xs text-gray-600">
            <div className="flex items-center space-x-1 mb-1">
              <Clock className="h-3 w-3" />
              <span>Aktif selamanya</span>
            </div>
            <div className="text-xs text-gray-500">
              • Maksimal 1 toko<br/>
              • Maksimal 1 kasir<br/>
              • Tanpa fitur AI
            </div>
          </div>
        ) : (
          company?.subscriptionExpiry && (
            <div className="text-xs text-gray-600">
              <div className="flex items-center space-x-1 mb-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {isExpired(company.subscriptionExpiry) 
                    ? `Expired: ${formatDate(company.subscriptionExpiry)}`
                    : `Berlaku hingga: ${formatDate(company.subscriptionExpiry)}`
                  }
                </span>
              </div>
              {!isExpired(company.subscriptionExpiry) && (
                <div className={`text-xs font-medium ${getStatusColor()}`}>
                  {getDaysRemaining(company.subscriptionExpiry)} hari tersisa
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  )
}

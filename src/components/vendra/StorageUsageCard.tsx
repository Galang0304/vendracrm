'use client'

import { useState, useEffect } from 'react'
import { HardDrive, AlertTriangle, CheckCircle, Zap } from 'lucide-react'
import Link from 'next/link'

interface StorageUsage {
  totalUsed: number
  limit: number
  percentage: number
  isOverLimit: boolean
  canUpload: boolean
  formattedUsed: string
  formattedLimit: string
}

interface StorageUsageCardProps {
  subscriptionTier: string
  showUpgradeButton?: boolean
}

export default function StorageUsageCard({ subscriptionTier, showUpgradeButton = true }: StorageUsageCardProps) {
  const [usage, setUsage] = useState<StorageUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStorageUsage()
  }, [])

  const fetchStorageUsage = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/storage/usage')
      const data = await response.json()
      
      if (data.success) {
        setUsage(data.data)
      } else {
        setError(data.error || 'Failed to fetch storage usage')
      }
    } catch (err) {
      setError('Failed to fetch storage usage')
      console.error('Storage usage fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center space-x-3">
          <HardDrive className="h-5 w-5 text-gray-400" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !usage) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center space-x-3 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <span className="text-sm">Unable to load storage info</span>
        </div>
      </div>
    )
  }

  const getStorageColor = () => {
    if (usage.isOverLimit) return 'text-red-600'
    if (usage.percentage > 80) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getProgressColor = () => {
    if (usage.isOverLimit) return 'bg-red-500'
    if (usage.percentage > 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getBackgroundColor = () => {
    if (usage.isOverLimit) return 'bg-red-50 border-red-200'
    if (usage.percentage > 80) return 'bg-yellow-50 border-yellow-200'
    return 'bg-green-50 border-green-200'
  }

  return (
    <div className={`rounded-lg border p-4 ${getBackgroundColor()}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <HardDrive className={`h-5 w-5 ${getStorageColor()}`} />
          <div>
            <h3 className="text-sm font-medium text-gray-900">Storage Usage</h3>
            <p className="text-xs text-gray-600">{subscriptionTier} Plan</p>
          </div>
        </div>
        
        {usage.canUpload ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-red-500" />
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Used:</span>
          <span className={`font-medium ${getStorageColor()}`}>
            {usage.formattedUsed}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Limit:</span>
          <span className="font-medium text-gray-900">
            {usage.formattedLimit}
          </span>
        </div>

        {usage.limit !== -1 && (
          <>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${Math.min(usage.percentage, 100)}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">
                {usage.percentage}% used
              </span>
              {usage.isOverLimit && (
                <span className="text-red-600 font-medium">
                  Over limit!
                </span>
              )}
            </div>
          </>
        )}

        {usage.limit === -1 && (
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <Zap className="h-4 w-4" />
            <span className="font-medium">Unlimited Storage</span>
          </div>
        )}
      </div>

      {/* Upgrade button for FREE and BASIC users */}
      {showUpgradeButton && (subscriptionTier === 'FREE' || (subscriptionTier === 'BASIC' && usage.percentage > 70)) && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <Link
            href="/admin/upgrade"
            className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center text-xs font-semibold py-2 px-3 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            {usage.isOverLimit ? 'Upgrade Now - Storage Full!' : 'Upgrade for More Storage'}
          </Link>
        </div>
      )}

      {/* Warning for near-limit users */}
      {usage.percentage > 90 && !usage.isOverLimit && (
        <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
          <AlertTriangle className="h-3 w-3 inline mr-1" />
          Storage almost full. Consider upgrading or cleaning up files.
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Store, Users, Package, AlertTriangle, CheckCircle, Lock } from 'lucide-react'
import Link from 'next/link'

interface UsageSummary {
  stores: {
    current: number
    limit: number
    percentage: number
    canAdd: boolean
  }
  employees: {
    current: number
    limit: number
    percentage: number
    canAdd: boolean
  }
  products: {
    current: number
    limit: number
    percentage: number
    canAdd: boolean
  }
  features: {
    hasAIAccess: boolean
    hasRFMAnalysis: boolean
  }
}

interface SubscriptionLimitsCardProps {
  subscriptionTier: string
}

export default function SubscriptionLimitsCard({ subscriptionTier }: SubscriptionLimitsCardProps) {
  const [usage, setUsage] = useState<UsageSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLimits()
  }, [])

  const fetchLimits = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/subscription/limits')
      const data = await response.json()
      
      if (data.success && data.data.limits) {
        // Transform API response to match our interface
        const limits = data.data.limits
        const transformedUsage: UsageSummary = {
          stores: {
            current: limits.stores.current || 0,
            limit: limits.stores.max || 0,
            percentage: limits.stores.max > 0 ? Math.round((limits.stores.current / limits.stores.max) * 100) : 0,
            canAdd: limits.stores.canAdd || false
          },
          employees: {
            current: limits.employees.current || 0,
            limit: limits.employees.max || 0,
            percentage: limits.employees.max > 0 ? Math.round((limits.employees.current / limits.employees.max) * 100) : 0,
            canAdd: limits.employees.canAdd || false
          },
          products: {
            current: limits.products.current || 0,
            limit: limits.products.max || 0,
            percentage: limits.products.max > 0 ? Math.round((limits.products.current / limits.products.max) * 100) : 0,
            canAdd: limits.products.canAdd || false
          },
          features: {
            hasAIAccess: data.data.subscriptionTier !== 'FREE',
            hasRFMAnalysis: data.data.subscriptionTier !== 'FREE'
          }
        }
        setUsage(transformedUsage)
      } else {
        setError(data.error || 'Failed to fetch limits')
      }
    } catch (err) {
      setError('Failed to fetch limits')
      console.error('Limits fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatLimit = (current: number, limit: number): string => {
    if (limit === -1) return `${current} / Unlimited`
    return `${current} / ${limit}`
  }

  const getStatusColor = (percentage: number, canAdd: boolean) => {
    if (!canAdd) return 'text-red-600'
    if (percentage > 80) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getProgressColor = (percentage: number, canAdd: boolean) => {
    if (!canAdd) return 'bg-red-500'
    if (percentage > 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
          <span className="text-sm">Unable to load limits</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Usage Limits</h3>
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
          {subscriptionTier}
        </span>
      </div>

      <div className="space-y-4">
        {/* Stores */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Store className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">Toko</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${getStatusColor(usage.stores.percentage, usage.stores.canAdd)}`}>
                {formatLimit(usage.stores.current, usage.stores.limit)}
              </span>
              {usage.stores.canAdd ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Lock className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
          {usage.stores.limit !== -1 && (
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${getProgressColor(usage.stores.percentage, usage.stores.canAdd)}`}
                style={{ width: `${Math.min(usage.stores.percentage, 100)}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Employees */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">Karyawan</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${getStatusColor(usage.employees.percentage, usage.employees.canAdd)}`}>
                {formatLimit(usage.employees.current, usage.employees.limit)}
              </span>
              {usage.employees.canAdd ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Lock className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
          {usage.employees.limit !== -1 && (
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${getProgressColor(usage.employees.percentage, usage.employees.canAdd)}`}
                style={{ width: `${Math.min(usage.employees.percentage, 100)}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Products */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">Produk</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${getStatusColor(usage.products.percentage, usage.products.canAdd)}`}>
                {formatLimit(usage.products.current, usage.products.limit)}
              </span>
              {usage.products.canAdd ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Lock className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
          {usage.products.limit !== -1 && (
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${getProgressColor(usage.products.percentage, usage.products.canAdd)}`}
                style={{ width: `${Math.min(usage.products.percentage, 100)}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>

      {/* Warning for FREE users at limits */}
      {subscriptionTier === 'FREE' && (!usage.stores.canAdd || !usage.employees.canAdd) && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
            <div className="text-xs text-orange-800">
              <p className="font-medium mb-1">Batas paket FREE tercapai!</p>
              <p>Paket FREE hanya dapat memiliki 1 toko dan 1 kasir. Upgrade untuk menambah lebih banyak.</p>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade button */}
      {subscriptionTier === 'FREE' && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <Link
            href="/admin/upgrade"
            className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center text-xs font-semibold py-2 px-3 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Upgrade untuk Lebih Banyak
          </Link>
        </div>
      )}
    </div>
  )
}

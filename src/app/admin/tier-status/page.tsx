'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { RefreshCw, TrendingUp, Users, Database, Bot, AlertTriangle } from 'lucide-react'

interface TierStatus {
  company: {
    name: string
    tier: string
  }
  limits: {
    requestsPerHour: number
    requestsPerDay: number
    tokensPerRequest: number
    tokensPerDay: number
    aiEnabled: boolean
    aiCapacity?: number
    dataLimit: number
    kasirLimit: number
    manajerLimit: number
  }
  current: {
    data: number
    kasir: number
    manajer: number
    breakdown: {
      products: number
      customers: number
      transactions: number
    }
  }
  status: {
    dataAllowed: boolean
    kasirAllowed: boolean
    manajerAllowed: boolean
    aiEnabled: boolean
  }
  aiUsage?: {
    requestsThisHour: number
    requestsToday: number
    tokensToday: number
    totalRequests: number
    totalTokensUsed: number
    lastRequestTime: string
  }
  timestamp: string
}

export default function TierStatusPage() {
  const [tierStatus, setTierStatus] = useState<TierStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTierStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/tier-status')
      if (!response.ok) {
        throw new Error('Failed to fetch tier status')
      }
      const data = await response.json()
      setTierStatus(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTierStatus()
  }, [])

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'FREE': return 'bg-gray-500'
      case 'MID': return 'bg-blue-500'
      case 'PRO': return 'bg-purple-500'
      case 'UNLIMITED': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((current / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading tier status...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>Error: {error}</span>
            </div>
            <Button onClick={fetchTierStatus} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!tierStatus) return null

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tier Status & Usage</h1>
          <p className="text-muted-foreground">
            Monitor your subscription limits and usage
          </p>
        </div>
        <Button onClick={fetchTierStatus} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            {tierStatus.company.name}
          </CardTitle>
          <CardDescription>
            <Badge className={getTierColor(tierStatus.company.tier)}>
              {tierStatus.company.tier} TIER
            </Badge>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Data Usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Data Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used: {tierStatus.current.data.toLocaleString()}</span>
                <span>
                  Limit: {tierStatus.limits.dataLimit === -1 ? 'Unlimited' : tierStatus.limits.dataLimit.toLocaleString()}
                </span>
              </div>
              {tierStatus.limits.dataLimit !== -1 && (
                <Progress 
                  value={getUsagePercentage(tierStatus.current.data, tierStatus.limits.dataLimit)}
                  className="h-2"
                />
              )}
              <div className="text-xs text-muted-foreground">
                Products: {tierStatus.current.breakdown.products} • 
                Customers: {tierStatus.current.breakdown.customers} • 
                Transactions: {tierStatus.current.breakdown.transactions}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              User Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Kasir: {tierStatus.current.kasir}</span>
                  <span>
                    Limit: {tierStatus.limits.kasirLimit === -1 ? 'Unlimited' : tierStatus.limits.kasirLimit}
                  </span>
                </div>
                {tierStatus.limits.kasirLimit !== -1 && (
                  <Progress 
                    value={getUsagePercentage(tierStatus.current.kasir, tierStatus.limits.kasirLimit)}
                    className="h-1 mt-1"
                  />
                )}
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Manajer: {tierStatus.current.manajer}</span>
                  <span>
                    Limit: {tierStatus.limits.manajerLimit === -1 ? 'Unlimited' : tierStatus.limits.manajerLimit}
                  </span>
                </div>
                {tierStatus.limits.manajerLimit !== -1 && (
                  <Progress 
                    value={getUsagePercentage(tierStatus.current.manajer, tierStatus.limits.manajerLimit)}
                    className="h-1 mt-1"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Bot className="h-4 w-4 mr-2" />
              AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tierStatus.status.aiEnabled ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Requests Today: {tierStatus.aiUsage?.requestsToday || 0}</span>
                    <span>
                      Limit: {tierStatus.limits.requestsPerDay === 0 ? 'None' : tierStatus.limits.requestsPerDay}
                    </span>
                  </div>
                  {tierStatus.limits.requestsPerDay > 0 && (
                    <Progress 
                      value={getUsagePercentage(tierStatus.aiUsage?.requestsToday || 0, tierStatus.limits.requestsPerDay)}
                      className="h-2"
                    />
                  )}
                  <div className="text-xs text-muted-foreground">
                    Tokens Today: {tierStatus.aiUsage?.tokensToday?.toLocaleString() || 0} / {tierStatus.limits.tokensPerDay.toLocaleString()}
                  </div>
                  {tierStatus.limits.aiCapacity && (
                    <div className="text-xs text-muted-foreground">
                      Capacity: {(tierStatus.limits.aiCapacity * 100)}%
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  AI Assistant not available for {tierStatus.company.tier} tier
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed AI Usage */}
      {tierStatus.status.aiEnabled && tierStatus.aiUsage && (
        <Card>
          <CardHeader>
            <CardTitle>AI Usage Details</CardTitle>
            <CardDescription>
              Detailed AI Assistant usage statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{tierStatus.aiUsage.requestsThisHour}</div>
                <div className="text-sm text-muted-foreground">Requests This Hour</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{tierStatus.aiUsage.requestsToday}</div>
                <div className="text-sm text-muted-foreground">Requests Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{tierStatus.aiUsage.totalRequests.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Requests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{tierStatus.aiUsage.totalTokensUsed.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Tokens</div>
              </div>
            </div>
            {tierStatus.aiUsage.lastRequestTime && (
              <div className="mt-4 text-sm text-muted-foreground">
                Last AI request: {new Date(tierStatus.aiUsage.lastRequestTime).toLocaleString('id-ID')}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upgrade Recommendations */}
      {(!tierStatus.status.dataAllowed || !tierStatus.status.kasirAllowed || !tierStatus.status.manajerAllowed) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Upgrade Recommended
            </CardTitle>
            <CardDescription className="text-yellow-700">
              You're approaching or have reached your tier limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {!tierStatus.status.dataAllowed && (
                <div>• Data storage limit reached ({tierStatus.current.data}/{tierStatus.limits.dataLimit})</div>
              )}
              {!tierStatus.status.kasirAllowed && (
                <div>• Kasir account limit reached ({tierStatus.current.kasir}/{tierStatus.limits.kasirLimit})</div>
              )}
              {!tierStatus.status.manajerAllowed && (
                <div>• Manajer account limit reached ({tierStatus.current.manajer}/{tierStatus.limits.manajerLimit})</div>
              )}
            </div>
            <Button className="mt-4" size="sm">
              Upgrade Subscription
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {new Date(tierStatus.timestamp).toLocaleString('id-ID')}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/vendra/DashboardLayout'
import { 
  Bot, 
  DollarSign, 
  Activity, 
  Users, 
  Clock,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  BarChart3
} from 'lucide-react'

interface CompanyUsage {
  companyId: string
  companyName: string
  subscriptionTier: string
  isActive: boolean
  owner: {
    name: string
    email: string
  }
  totalRequests: number
  totalTokensUsed: number
  requestsThisHour: number
  lastRequestTime: string | null
  estimatedCost: number
  rateLimits: {
    requestsPerHour: number
    tokensPerRequest: number
  }
}

interface UsageStats {
  totalCompanies: number
  activeCompanies: number
  companiesWithUsage: number
  totalRequests: number
  totalTokensUsed: number
  totalEstimatedCost: number
  currentHourActivity: number
  usageByTier: {
    [key: string]: {
      companies: number
      requests: number
      tokens: number
      cost: number
    }
  }
}

export default function AIUsagePage() {
  const { data: session } = useSession()
  const [companies, setCompanies] = useState<CompanyUsage[]>([])
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [vendraConfig, setVendraConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsageData()
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchUsageData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchUsageData = async () => {
    try {
      const response = await fetch('/api/superadmin/ai-usage')
      if (response.ok) {
        const data = await response.json()
        setStats(data.totalStats)
        setCompanies(data.companies)
        setVendraConfig(data.vendraConfig)
      }
    } catch (error) {
      console.error('Error fetching usage data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(amount)
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'ENTERPRISE': return 'bg-purple-100 text-purple-800'
      case 'PREMIUM': return 'bg-blue-100 text-blue-800'
      case 'BASIC': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (session?.user.role !== 'SUPERADMIN') {
    return (
      <DashboardLayout title="AI Usage Analytics">
        <div className="text-center py-12">
          <Bot className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Only SuperAdmin can access AI usage analytics.</p>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout title="AI Usage Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="AI Usage Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Vendra AI Usage Analytics</h2>
              <p className="text-green-100">
                Monitor OpenAI costs and usage across all customers
              </p>
              {vendraConfig && (
                <div className="mt-3 flex items-center space-x-4 text-sm">
                  <span className={`flex items-center ${vendraConfig.isEnabled ? 'text-green-200' : 'text-red-200'}`}>
                    {vendraConfig.isEnabled ? <CheckCircle className="h-4 w-4 mr-1" /> : <AlertCircle className="h-4 w-4 mr-1" />}
                    AI {vendraConfig.isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <span>Model: {vendraConfig.model}</span>
                  <span className={vendraConfig.hasApiKey ? 'text-green-200' : 'text-red-200'}>
                    API Key: {vendraConfig.hasApiKey ? 'Configured' : 'Missing'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Bot className="h-12 w-12 text-green-200" />
              <button
                onClick={fetchUsageData}
                className="flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-xl">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Cost (Est.)</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalEstimatedCost)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRequests.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Tokens</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTokensUsed.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Hour</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.currentHourActivity}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Usage by Tier */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage by Subscription Tier</h3>
              <div className="space-y-4">
                {Object.entries(stats.usageByTier).map(([tier, data]) => (
                  <div key={tier} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(tier)}`}>
                        {tier}
                      </span>
                      <span className="text-sm text-gray-600">{data.companies} companies</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(data.cost)}</div>
                      <div className="text-xs text-gray-500">{data.requests} requests</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Limits by Tier</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">FREE</span>
                  <span className="text-sm text-gray-600">10 req/hour, 500 tokens</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">BASIC</span>
                  <span className="text-sm text-gray-600">50 req/hour, 800 tokens</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">PREMIUM</span>
                  <span className="text-sm text-gray-600">200 req/hour, 1000 tokens</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium">ENTERPRISE</span>
                  <span className="text-sm text-gray-600">1000 req/hour, 2000 tokens</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Companies Usage Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Company Usage Details</h3>
            <p className="text-sm text-gray-600">
              Showing {companies.length} companies sorted by usage
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tokens Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Est. Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    This Hour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.map((company) => (
                  <tr key={company.companyId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {company.companyName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {company.owner.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(company.subscriptionTier)}`}>
                        {company.subscriptionTier}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.totalRequests.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.totalTokensUsed.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(company.estimatedCost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900">{company.requestsThisHour}</span>
                        <span className="text-xs text-gray-500 ml-1">
                          / {company.rateLimits.requestsPerHour}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {company.lastRequestTime 
                        ? new Date(company.lastRequestTime).toLocaleString('id-ID')
                        : 'Never'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cost Analysis */}
        {stats && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start">
              <TrendingUp className="h-6 w-6 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <h4 className="text-lg font-medium text-yellow-900 mb-2">
                  Cost Analysis & Recommendations
                </h4>
                <div className="text-yellow-800 space-y-2">
                  <p>• <strong>Current Monthly Estimate:</strong> {formatCurrency(stats.totalEstimatedCost * 30)} (based on current usage)</p>
                  <p>• <strong>Most Active Tier:</strong> {Object.entries(stats.usageByTier).sort((a, b) => b[1].requests - a[1].requests)[0][0]} with {Object.entries(stats.usageByTier).sort((a, b) => b[1].requests - a[1].requests)[0][1].requests} requests</p>
                  <p>• <strong>Cost per Request:</strong> {stats.totalRequests > 0 ? formatCurrency(stats.totalEstimatedCost / stats.totalRequests) : '$0.0000'}</p>
                  <p>• <strong>Active Companies:</strong> {stats.companiesWithUsage} out of {stats.totalCompanies} companies using AI</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

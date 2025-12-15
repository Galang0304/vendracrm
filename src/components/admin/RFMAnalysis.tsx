'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  Eye,
  Heart,
  ShoppingCart,
  Repeat,
  Star,
  UserX,
  RefreshCw,
  BarChart3,
  PieChart,
  Search,
  DollarSign,
  Clock,
  Calendar
} from 'lucide-react'

interface RFMCustomer {
  customerId: string
  customerName: string
  customerEmail: string
  recency: number
  frequency: number
  monetary: number
  rScore: number
  fScore: number
  mScore: number
  rfmSegment: string
  rfmScore: number
  label: string
  lastPurchaseDate: string
  totalRevenue: number
  averageOrderValue: number
}

interface RFMSegment {
  count: number
  percentage: number
  totalRevenue: number
  averageRecency: number
  averageFrequency: number
  averageMonetary: number
}

interface RFMAnalysisData {
  customers: RFMCustomer[]
  segments: { [key: string]: RFMSegment }
  summary: {
    totalCustomers: number
    totalRevenue: number
    averageRecency: number
    averageFrequency: number
    averageMonetary: number
    analysisDate: string
  }
  topProducts: {
    [segment: string]: Array<{
      productName: string
      quantity: number
      revenue: number
      percentage: number
    }>
  }
}

export default function RFMAnalysis() {
  const { data: session } = useSession()
  const router = useRouter()
  const [data, setData] = useState<RFMAnalysisData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSegment, setSelectedSegment] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [showTopCustomers, setShowTopCustomers] = useState(false)
  const [selectedStore, setSelectedStore] = useState<string>('all')
  const [stores, setStores] = useState<any[]>([])

  useEffect(() => {
    fetchStores()
  }, [])

  useEffect(() => {
    fetchRFMData()
  }, [session?.user?.id, selectedStore])

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/admin/stores')
      if (response.ok) {
        const storesData = await response.json()
        setStores(storesData)
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
    }
  }

  const fetchRFMData = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (selectedStore !== 'all') {
        params.append('storeId', selectedStore)
      }
      
      const response = await fetch(`/api/admin/rfm-analysis?${params}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`HTTP ${response.status}: ${errorData.message || 'Failed to fetch RFM data'}`)
      }

      const result = await response.json()
      console.log('✅ RFM data received:', result)
      setData(result)
    } catch (error) {
      console.error('❌ Error fetching RFM data:', error)
      
      // More detailed error handling
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message)
        setError(`RFM Analysis Error: ${error.message}`)
      } else {
        console.error('❌ Unknown error:', error)
        setError('Failed to fetch RFM data. Please check your connection and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRFMData()
  }, [session?.user?.id])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const navigateToDataSource = (segment?: string) => {
    // Navigate to admin/data with filters based on segment
    let url = '/admin/data'
    
    if (segment && segment !== 'all') {
      // Add query parameters to filter by segment characteristics
      const params = new URLSearchParams()
      
      // Map segment to filter criteria
      switch (segment.toLowerCase()) {
        case 'champions':
        case 'loyal customers':
          params.append('dateFrom', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          break
        case 'potential loyalists':
        case 'new customers':
          params.append('dateFrom', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          break
        case 'at risk':
        case 'cannot lose them':
          params.append('dateFrom', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          params.append('dateTo', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          break
        default:
          // For other segments, show recent data
          params.append('dateFrom', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      }
      
      if (selectedStore !== 'all') {
        params.append('storeId', selectedStore)
      }
      
      if (params.toString()) {
        url += '?' + params.toString()
      }
    }
    
    router.push(url)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getSegmentColor = (segment: string) => {
    const colors: { [key: string]: string } = {
      'Pelanggan Terbaik': 'bg-green-100 text-green-800 border-green-200',
      'Juara': 'bg-purple-100 text-purple-800 border-purple-200',
      'Pelanggan Setia': 'bg-blue-100 text-blue-800 border-blue-200',
      'Pembeli Besar': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Calon Setia': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Pelanggan Baru': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Berisiko Hilang': 'bg-orange-100 text-orange-800 border-orange-200',
      'Hampir Hilang': 'bg-red-100 text-red-800 border-red-200',
      'Pelanggan Hilang': 'bg-gray-100 text-gray-800 border-gray-200',
      'Pelanggan Hilang Murah': 'bg-gray-100 text-gray-600 border-gray-200',
      'Lainnya': 'bg-slate-100 text-slate-800 border-slate-200',
      // Fallback untuk label English (backward compatibility)
      'Best Customers': 'bg-green-100 text-green-800 border-green-200',
      'Champions': 'bg-purple-100 text-purple-800 border-purple-200',
      'Loyal Customers': 'bg-blue-100 text-blue-800 border-blue-200',
      'Big Spenders': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Potential Loyalists': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'New Customers': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'At Risk': 'bg-orange-100 text-orange-800 border-orange-200',
      'Almost Lost': 'bg-red-100 text-red-800 border-red-200',
      'Lost Customers': 'bg-gray-100 text-gray-800 border-gray-200',
      'Lost Cheap Customers': 'bg-gray-100 text-gray-600 border-gray-200',
      'Others': 'bg-slate-100 text-slate-800 border-slate-200'
    }
    return colors[segment] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const filteredCustomers = data?.customers.filter(customer => {
    const matchesSegment = selectedSegment === 'all' || customer.label === selectedSegment
    const matchesSearch = customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSegment && matchesSearch
  }) || []

  // Get top customers berdasarkan RFM Score dan Monetary Value
  const getTopCustomers = () => {
    if (!data?.customers) return []
    
    return [...data.customers]
      .sort((a, b) => {
        // Sort by RFM Score first, then by Monetary value
        if (a.rfmScore !== b.rfmScore) {
          return b.rfmScore - a.rfmScore
        }
        return b.monetary - a.monetary
      })
      .slice(0, 10) // Top 10 customers
  }

  const topCustomers = getTopCustomers()

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mr-3" />
          <span className="text-lg text-gray-600">Menganalisis data pelanggan...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <BarChart3 className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Analisis</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchRFMData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  if (!data || data.customers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <Users className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Data Pelanggan</h3>
          <p className="text-gray-600">Tidak ada data transaksi untuk analisis RFM.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-7 h-7 mr-3 text-blue-600" />
              Analisis Segmentasi Pelanggan RFM
            </h2>
            <p className="text-gray-600 mt-1">
              Analisis Recency, Frequency, Monetary untuk segmentasi pelanggan
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showDetails ? 'Sembunyikan Detail' : 'Tampilkan Detail'}
            </button>
            <button
              onClick={() => setShowTopCustomers(!showTopCustomers)}
              className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg font-medium flex items-center"
            >
              <Users className="w-4 h-4 mr-2" />
              {showTopCustomers ? 'Sembunyikan Top Customer' : 'Top Customer'}
            </button>
            <button
              onClick={fetchRFMData}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Perbarui Analisis
            </button>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Pelanggan</p>
                <p className="text-blue-900 text-2xl font-bold">{data.summary.totalCustomers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Total Pendapatan</p>
                <p className="text-green-900 text-xl font-bold">{formatCurrency(data.summary.totalRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Rata-rata Frekuensi</p>
                <p className="text-purple-900 text-2xl font-bold">{data.summary.averageFrequency.toFixed(1)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Rata-rata Recency</p>
                <p className="text-orange-900 text-2xl font-bold">{Math.round(data.summary.averageRecency)} hari</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-blue-600" />
            Segmen Pelanggan
          </h3>
          <button
            onClick={() => navigateToDataSource()}
            className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            title="Lihat semua data transaksi"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            View All Data
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(data.segments).map(([segment, stats]) => (
            <div 
              key={segment} 
              onClick={() => navigateToDataSource(segment)}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
              title={`Klik untuk melihat data sumber ${segment}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{segment}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSegmentColor(segment)}`}>
                    {stats.percentage.toFixed(1)}%
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Pelanggan:</span>
                  <span className="font-medium">{stats.count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pendapatan:</span>
                  <span className="font-medium">{formatCurrency(stats.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rata-rata Recency:</span>
                  <span className="font-medium">{Math.round(stats.averageRecency)} hari</span>
                </div>
                <div className="flex justify-between">
                  <span>Rata-rata Frekuensi:</span>
                  <span className="font-medium">{stats.averageFrequency.toFixed(1)}</span>
                </div>
              </div>
              
              {/* Click indicator */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-center text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                  <Eye className="w-3 h-3 mr-1" />
                  Klik untuk lihat data
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Customers */}
      {showTopCustomers && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-600" />
              Top 10 Pelanggan Terbaik
            </h3>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Kontribusi Revenue</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(topCustomers.reduce((sum, customer) => sum + customer.monetary, 0))}
              </p>
            </div>
          </div>

          {/* Top Customer Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Avg RFM Score</p>
                  <p className="text-green-900 text-xl font-bold">
                    {topCustomers.length > 0 ? Math.round(topCustomers.reduce((sum, c) => sum + c.rfmScore, 0) / topCustomers.length) : 0}
                  </p>
                </div>
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Avg Frequency</p>
                  <p className="text-blue-900 text-xl font-bold">
                    {topCustomers.length > 0 ? (topCustomers.reduce((sum, c) => sum + c.frequency, 0) / topCustomers.length).toFixed(1) : 0}
                  </p>
                </div>
                <RefreshCw className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Avg Monetary</p>
                  <p className="text-purple-900 text-lg font-bold">
                    {topCustomers.length > 0 ? formatCurrency(topCustomers.reduce((sum, c) => sum + c.monetary, 0) / topCustomers.length) : formatCurrency(0)}
                  </p>
                </div>
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Avg Recency</p>
                  <p className="text-orange-900 text-xl font-bold">
                    {topCustomers.length > 0 ? Math.round(topCustomers.reduce((sum, c) => sum + c.recency, 0) / topCustomers.length) : 0} hari
                  </p>
                </div>
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {topCustomers.map((customer, index) => (
              <div key={customer.customerId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{customer.customerName}</h4>
                      <p className="text-sm text-gray-500">{customer.customerEmail}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSegmentColor(customer.label)}`}>
                    {customer.label}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">RFM Score:</span>
                    <span className="font-bold text-blue-600 ml-2">{customer.rfmScore}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Segment:</span>
                    <span className="font-medium text-gray-900 ml-2">{customer.rfmSegment}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Belanja:</span>
                    <span className="font-bold text-green-600 ml-2">{formatCurrency(customer.monetary)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Frekuensi:</span>
                    <span className="font-medium text-purple-600 ml-2">{customer.frequency} pesanan</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Recency:</span>
                    <span className="font-medium text-orange-600 ml-2">{customer.recency} hari</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Terakhir Beli:</span>
                    <span className="font-medium text-gray-600 ml-2">{formatDate(customer.lastPurchaseDate)}</span>
                  </div>
                </div>
                
                {/* Customer Value Indicator */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Customer Value</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full mr-1 ${
                            i < Math.min(5, Math.floor(customer.rfmScore / 100)) 
                              ? 'bg-green-500' 
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-600 ml-2">
                        {customer.rfmScore >= 400 ? 'Excellent' :
                         customer.rfmScore >= 300 ? 'Very Good' :
                         customer.rfmScore >= 200 ? 'Good' : 'Average'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {topCustomers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada data pelanggan untuk ditampilkan.</p>
            </div>
          )}
        </div>
      )}

      {/* Customer List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Detail Pelanggan ({filteredCustomers.length})
          </h3>
          
          <div className="flex space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari pelanggan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="Filter by customer segment"
            >
              <option value="all">Semua Segmen</option>
              {Object.keys(data.segments).map(segment => (
                <option key={segment} value={segment}>{segment}</option>
              ))}
            </select>

            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="Filter by store"
            >
              <option value="all">Semua Toko</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name} ({store.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segmen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skor RFM</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frekuensi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monetary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembelian Terakhir</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.slice(0, 50).map((customer) => (
                <tr key={customer.customerId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{customer.customerName}</div>
                      <div className="text-sm text-gray-500">{customer.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSegmentColor(customer.label)}`}>
                      {customer.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.rfmSegment}</div>
                    <div className="text-xs text-gray-500">Skor: {customer.rfmScore}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.recency} hari
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.frequency} pesanan
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(customer.monetary)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(customer.lastPurchaseDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length > 50 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Menampilkan 50 pelanggan pertama. Gunakan filter untuk mempersempit hasil.
          </div>
        )}
      </div>

      {/* Top Products by Segment */}
      {showDetails && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Produk Terlaris per Segmen
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(data.topProducts).map(([segment, products]) => (
              <div key={segment} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">{segment}</h4>
                <div className="space-y-2">
                  {products.slice(0, 5).map((product, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700 truncate">{product.productName}</span>
                      <div className="text-right">
                        <div className="font-medium">{product.quantity} qty</div>
                        <div className="text-xs text-gray-500">{product.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

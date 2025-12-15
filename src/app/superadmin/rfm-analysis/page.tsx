'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/vendra/DashboardLayout'
// Using basic HTML elements instead of UI components
// Card components will be replaced with div elements
// Badge, Button, Input, Select will use basic HTML
import { Loader2, Users, DollarSign, BarChart3, Calendar, RefreshCw, AlertCircle } from 'lucide-react'

interface RFMCustomer {
  id: string
  name: string
  email: string
  companyName: string
  segment: string
  recency: number
  frequency: number
  monetary: number
  rfmScore: string
  lastPurchase: string
  totalOrders: number
  totalSpent: number
}

interface RFMStats {
  totalCustomers: number
  totalRevenue: number
  avgFrequency: number
  avgRecency: number
}

interface SegmentData {
  segment: string
  count: number
  revenue: number
  avgRecency: number
  avgFrequency: number
  percentage: number
}

interface RFMAnalysisData {
  customers: RFMCustomer[]
  stats: RFMStats
  segments: SegmentData[]
}

const getSegmentColor = (segment: string): string => {
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
    'Pelanggan Hilang Murah': 'bg-slate-100 text-slate-800 border-slate-200',
    'Lainnya': 'bg-neutral-100 text-neutral-800 border-neutral-200',
    // English fallbacks
    'Best Customers': 'bg-green-100 text-green-800 border-green-200',
    'Champions': 'bg-purple-100 text-purple-800 border-purple-200',
    'Loyal Customers': 'bg-blue-100 text-blue-800 border-blue-200',
    'Big Spenders': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Potential Loyalists': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'New Customers': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'At Risk': 'bg-orange-100 text-orange-800 border-orange-200',
    'Almost Lost': 'bg-red-100 text-red-800 border-red-200',
    'Lost Customers': 'bg-gray-100 text-gray-800 border-gray-200',
    'Lost Cheap Customers': 'bg-slate-100 text-slate-800 border-slate-200',
    'Others': 'bg-neutral-100 text-neutral-800 border-neutral-200'
  }
  return colors[segment] || 'bg-gray-100 text-gray-800 border-gray-200'
}

export default function SuperAdminRFMAnalysis() {
  const { data: session, status } = useSession()
  const [data, setData] = useState<RFMAnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSegment, setSelectedSegment] = useState<string>('all')
  const [selectedCompany, setSelectedCompany] = useState<string>('all')
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'SUPERADMIN') {
      redirect('/auth/signin')
    }
    
    fetchRFMData()
  }, [session, status])

  const fetchRFMData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/superadmin/rfm-analysis')
      if (!response.ok) {
        throw new Error('Gagal mengambil data analisis RFM')
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error fetching RFM data:', err)
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui')
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = data?.customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSegment = selectedSegment === 'all' || customer.segment === selectedSegment
    const matchesCompany = selectedCompany === 'all' || customer.companyName === selectedCompany
    return matchesSearch && matchesSegment && matchesCompany
  }) || []

  const uniqueSegments = [...new Set(data?.customers.map(c => c.segment) || [])]
  const uniqueCompanies = [...new Set(data?.customers.map(c => c.companyName) || [])]

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout title="Analisis Segmentasi RFM - SuperAdmin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Menganalisis data pelanggan...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout title="Analisis Segmentasi RFM - SuperAdmin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Analisis</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchRFMData} 
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Coba Lagi
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!data || data.customers.length === 0) {
    return (
      <DashboardLayout title="Analisis Segmentasi RFM - SuperAdmin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Data Pelanggan</h3>
            <p className="text-gray-600">Tidak ada data transaksi untuk analisis RFM</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Analisis Segmentasi RFM - SuperAdmin">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Analisis Segmentasi Pelanggan RFM - SuperAdmin</h1>
          <p className="text-blue-100">
            Analisis Recency, Frequency, Monetary untuk segmentasi pelanggan lintas semua perusahaan
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Total Pelanggan</h3>
              <Users className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold">{data.stats.totalCustomers.toLocaleString()}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Total Pendapatan</h3>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold">Rp {data.stats.totalRevenue.toLocaleString()}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Rata-rata Frekuensi</h3>
              <BarChart3 className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold">{data.stats.avgFrequency.toFixed(1)}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Rata-rata Recency</h3>
              <Calendar className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold">{data.stats.avgRecency.toFixed(0)} hari</div>
          </div>
        </div>

        {/* Customer Segments */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Segmen Pelanggan</h2>
            <p className="text-sm text-gray-600">Distribusi pelanggan berdasarkan analisis RFM</p>
          </div>
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.segments.map((segment) => (
                <div key={segment.segment} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSegmentColor(segment.segment)}`}>
                      {segment.segment}
                    </span>
                    <span className="text-sm text-gray-500">{segment.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Pelanggan:</span>
                      <span className="font-medium">{segment.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pendapatan:</span>
                      <span className="font-medium">Rp {segment.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rata-rata Recency:</span>
                      <span className="font-medium">{segment.avgRecency.toFixed(0)} hari</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rata-rata Frekuensi:</span>
                      <span className="font-medium">{segment.avgFrequency.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters and Customer Details */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Detail Pelanggan</h2>
                <p className="text-sm text-gray-600">Data lengkap pelanggan dengan skor RFM</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Sembunyikan Detail' : 'Tampilkan Detail'}
                </button>
                <button 
                  onClick={fetchRFMData} 
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Perbarui Analisis
                </button>
              </div>
            </div>
          </div>
          
          {showDetails && (
            <div>
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Cari pelanggan..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <select 
                  value={selectedCompany} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCompany(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Perusahaan</option>
                  {uniqueCompanies.map((company) => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
                
                <select 
                  value={selectedSegment} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSegment(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Segmen</option>
                  {uniqueSegments.map((segment) => (
                    <option key={segment} value={segment}>{segment}</option>
                  ))}
                </select>
                
                <div className="text-sm text-gray-500 flex items-center">
                  Menampilkan {filteredCustomers.length} dari {data.customers.length} pelanggan
                </div>
              </div>

              {/* Customer Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-2 text-left">Pelanggan</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Perusahaan</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Segmen</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Skor RFM</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Recency</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Frekuensi</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Monetary</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Pembelian Terakhir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.slice(0, 50).map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-2">
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                          </div>
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          <span className="text-sm font-medium">{customer.companyName}</span>
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSegmentColor(customer.segment)}`}>
                            {customer.segment}
                          </span>
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          <span className="font-mono text-sm">{customer.rfmScore}</span>
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          {customer.recency} hari
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          {customer.frequency} pesanan
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          Rp {customer.monetary.toLocaleString()}
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          {customer.lastPurchase}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredCustomers.length > 50 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  Menampilkan 50 pelanggan pertama...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

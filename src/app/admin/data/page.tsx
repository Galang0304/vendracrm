'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/vendra/DashboardLayout'
import { 
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  Eye,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Users,
  Store,
  Edit,
  Trash2,
  Save,
  X,
  AlertTriangle
} from 'lucide-react'

interface OlseraTransaction {
  id: string
  transactionNo: string
  orderTime: string
  brand: string
  brandCommissionRate: number
  brandCommissionAmount: number
  itemGroup: string
  itemName: string
  itemSku: string
  qty: number
  currency: string
  price: number
  addOnPrice: number
  discountPercent: number
  discountAmount: number
  amount: number
  taxAmount: number
  costPerUnit: number
  totalCost: number
  profit: number
  paidToBrand: number
  paymentType: string
  storeName?: string
  companyName?: string
}

interface FilterOptions {
  dateFrom: string
  dateTo: string
  year: string
  month: string
  brand: string
  itemGroup: string
  paymentType: string
  companyId: string
  storeId: string
}

export default function OlseraDataPage() {
  const { data: session } = useSession()
  const [transactions, setTransactions] = useState<OlseraTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalStats, setTotalStats] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    totalOrders: 0,
    totalItems: 0
  })
  const [highlightMode, setHighlightMode] = useState<'revenue' | 'profit' | 'orders' | 'items' | null>(null)
  const [filters, setFilters] = useState<FilterOptions>({
    dateFrom: '',
    dateTo: '',
    year: '',
    month: '',
    brand: '',
    itemGroup: '',
    paymentType: '',
    companyId: '',
    storeId: ''
  })
  
  const [companies, setCompanies] = useState<Array<{id: string, name: string}>>([])
  const [stores, setStores] = useState<Array<{id: string, name: string}>>([])
  const [brands, setBrands] = useState<string[]>([])
  const [itemGroups, setItemGroups] = useState<string[]>([])
  const [paymentTypes, setPaymentTypes] = useState<string[]>([])
  
  // Edit/Delete states
  const [editingTransaction, setEditingTransaction] = useState<OlseraTransaction | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingTransaction, setDeletingTransaction] = useState<OlseraTransaction | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const itemsPerPage = 50
  const isSuperAdmin = session?.user?.role === 'SUPERADMIN'

  useEffect(() => {
    if (isSuperAdmin) {
      fetchCompanies()
    }
    fetchStores()
  }, [isSuperAdmin])

  // Fetch data when page or filters change
  useEffect(() => {
    fetchOlseraData()
  }, [currentPage, filters, searchTerm])

  // Reset to first page when filters change (but don't fetch again)
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, searchTerm])

  const fetchOlseraData = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        ...filters
      })

      const response = await fetch(`/api/admin/data?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Frontend received data:', {
          count: data.transactions?.length || 0,
          firstItem: data.transactions?.[0] || null,
          totalStats: data.totalStats
        })
        setTransactions(data.transactions || [])
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage))
        
        // Set total stats from API response
        if (data.totalStats) {
          setTotalStats(data.totalStats)
        }
        
        // Extract unique values for filters
        setBrands([...new Set(data.transactions?.map((t: OlseraTransaction) => t.brand).filter(Boolean))] as string[])
        setItemGroups([...new Set(data.transactions?.map((t: OlseraTransaction) => t.itemGroup).filter(Boolean))] as string[])
        setPaymentTypes([...new Set(data.transactions?.map((t: OlseraTransaction) => t.paymentType).filter(Boolean))] as string[])
      }
    } catch (error) {
      console.error('Error fetching Olsera data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/admin/companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data || [])
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/admin/stores')
      if (response.ok) {
        const data = await response.json()
        setStores(data || [])
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
    }
  }

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams({
        export: 'true',
        search: searchTerm,
        ...filters
      })

      const response = await fetch(`/api/admin/data?${queryParams}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `data-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Gagal export data')
    }
  }

  const handleEdit = (transaction: OlseraTransaction) => {
    setEditingTransaction({ ...transaction })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editingTransaction) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/data/${editingTransaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingTransaction)
      })

      if (response.ok) {
        // Refresh data
        await fetchOlseraData()
        setShowEditModal(false)
        setEditingTransaction(null)
        alert('Data berhasil diupdate!')
      } else {
        const error = await response.json()
        alert(`Gagal update data: ${error.message}`)
      }
    } catch (error) {
      console.error('Error updating transaction:', error)
      alert('Gagal update data')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = (transaction: OlseraTransaction) => {
    setDeletingTransaction(transaction)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!deletingTransaction) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/data/${deletingTransaction.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Refresh data
        await fetchOlseraData()
        setShowDeleteModal(false)
        setDeletingTransaction(null)
        alert('Data berhasil dihapus!')
      } else {
        const error = await response.json()
        alert(`Gagal hapus data: ${error.message}`)
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert('Gagal hapus data')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Use total stats from API (all data) instead of current page only
  const totalRevenue = totalStats.totalRevenue
  const totalProfit = totalStats.totalProfit
  const totalItems = totalStats.totalItems
  const uniqueOrders = totalStats.totalOrders

  if (loading) {
    return (
      <DashboardLayout title="Data All">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Data All">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data All</h1>
            <p className="text-gray-600">
              {isSuperAdmin ? 'Semua data transaksi dan import' : 'Semua data transaksi perusahaan Anda'}
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex gap-3">
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue Card */}
          <div 
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              highlightMode === 'revenue' ? 'ring-2 ring-green-500 bg-green-50' : ''
            }`}
            onClick={() => setHighlightMode(highlightMode === 'revenue' ? null : 'revenue')}
            title="Klik untuk highlight kolom Amount di tabel"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <div className="group relative">
                    <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-600 cursor-help">
                      ?
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                      Total pendapatan dari semua penjualan (SUM amount)
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalRevenue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Jumlah seluruh penjualan</p>
              </div>
              <div className={`p-3 rounded-full ${highlightMode === 'revenue' ? 'bg-green-200' : 'bg-green-100'}`}>
                <DollarSign className={`h-6 w-6 ${highlightMode === 'revenue' ? 'text-green-700' : 'text-green-600'}`} />
              </div>
            </div>
          </div>

          {/* Total Profit Card */}
          <div 
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              highlightMode === 'profit' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => setHighlightMode(highlightMode === 'profit' ? null : 'profit')}
            title="Klik untuk highlight kolom Profit di tabel"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-600">Total Profit</p>
                  <div className="group relative">
                    <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-600 cursor-help">
                      ?
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                      Keuntungan bersih setelah dikurangi biaya (SUM profit)
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalProfit)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Revenue - Total Cost</p>
              </div>
              <div className={`p-3 rounded-full ${highlightMode === 'profit' ? 'bg-blue-200' : 'bg-blue-100'}`}>
                <TrendingUp className={`h-6 w-6 ${highlightMode === 'profit' ? 'text-blue-700' : 'text-blue-600'}`} />
              </div>
            </div>
          </div>

          {/* Total Orders Card */}
          <div 
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              highlightMode === 'orders' ? 'ring-2 ring-purple-500 bg-purple-50' : ''
            }`}
            onClick={() => setHighlightMode(highlightMode === 'orders' ? null : 'orders')}
            title="Klik untuk highlight kolom Order No di tabel"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <div className="group relative">
                    <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-600 cursor-help">
                      ?
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                      Jumlah transaksi unik (COUNT DISTINCT transactionNo)
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{uniqueOrders}</p>
                <p className="text-xs text-gray-500 mt-1">Invoice/pesanan unik</p>
              </div>
              <div className={`p-3 rounded-full ${highlightMode === 'orders' ? 'bg-purple-200' : 'bg-purple-100'}`}>
                <FileText className={`h-6 w-6 ${highlightMode === 'orders' ? 'text-purple-700' : 'text-purple-600'}`} />
              </div>
            </div>
          </div>

          {/* Total Items Card */}
          <div 
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              highlightMode === 'items' ? 'ring-2 ring-orange-500 bg-orange-50' : ''
            }`}
            onClick={() => setHighlightMode(highlightMode === 'items' ? null : 'items')}
            title="Klik untuk highlight kolom Qty di tabel"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <div className="group relative">
                    <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-600 cursor-help">
                      ?
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                      Total kuantitas produk yang terjual (SUM quantity)
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                <p className="text-xs text-gray-500 mt-1">Jumlah barang terjual</p>
              </div>
              <div className={`p-3 rounded-full ${highlightMode === 'items' ? 'bg-orange-200' : 'bg-orange-100'}`}>
                <Package className={`h-6 w-6 ${highlightMode === 'items' ? 'text-orange-700' : 'text-orange-600'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8 gap-4">
            {/* Search */}
            <div className="xl:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari order no, produk, SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Date From */}
            <div>
              <label htmlFor="dateFrom" className="sr-only">Date From</label>
              <input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                placeholder="Date From"
                title="Filter by start date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date To */}
            <div>
              <label htmlFor="dateTo" className="sr-only">Date To</label>
              <input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                placeholder="Date To"
                title="Filter by end date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Year Filter */}
            <div>
              <label htmlFor="yearFilter" className="sr-only">Year Filter</label>
              <select
                id="yearFilter"
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                title="Filter by year"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Tahun</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
              </select>
            </div>

            {/* Month Filter */}
            <div>
              <label htmlFor="monthFilter" className="sr-only">Month Filter</label>
              <select
                id="monthFilter"
                value={filters.month}
                onChange={(e) => handleFilterChange('month', e.target.value)}
                title="Filter by month"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Bulan</option>
                <option value="01">Januari</option>
                <option value="02">Februari</option>
                <option value="03">Maret</option>
                <option value="04">April</option>
                <option value="05">Mei</option>
                <option value="06">Juni</option>
                <option value="07">Juli</option>
                <option value="08">Agustus</option>
                <option value="09">September</option>
                <option value="10">Oktober</option>
                <option value="11">November</option>
                <option value="12">Desember</option>
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label htmlFor="brandFilter" className="sr-only">Brand Filter</label>
              <select
                id="brandFilter"
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                title="Filter by brand"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Brand</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Store Filter */}
            <div>
              <label htmlFor="storeFilter" className="sr-only">Store Filter</label>
              <select
                id="storeFilter"
                value={filters.storeId}
                onChange={(e) => handleFilterChange('storeId', e.target.value)}
                title="Filter by store"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Toko</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </div>

            {/* Company Filter (Super Admin Only) */}
            {isSuperAdmin && (
              <div>
                <label htmlFor="companyFilter" className="sr-only">Company Filter</label>
                <select
                  id="companyFilter"
                  value={filters.companyId}
                  onChange={(e) => handleFilterChange('companyId', e.target.value)}
                  title="Filter by company"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua Perusahaan</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Data Display - Responsive Cards + Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Mobile Card View */}
          <div className="block lg:hidden">
            <div className="p-4 space-y-4">
              {transactions.map((transaction, index) => {
                const rowNumber = (currentPage - 1) * itemsPerPage + index + 1
                return (
                <div key={`mobile-${transaction.transactionNo}-${transaction.itemSku}-${index}`} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  {/* Header Info */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-white bg-blue-500 rounded-full">
                          {rowNumber}
                        </span>
                        <p className="font-semibold text-gray-900 text-sm">{transaction.transactionNo}</p>
                      </div>
                      <p className="text-xs text-gray-500 ml-8">{formatDate(transaction.orderTime)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(transaction.amount)}</p>
                      <p className="text-xs text-gray-500">{transaction.paymentType}</p>
                    </div>
                  </div>
                  
                  {/* Product Info */}
                  <div className="border-t pt-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Brand:</p>
                        <p className="font-medium">{transaction.brand}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Qty:</p>
                        <p className="font-medium">{transaction.qty}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500">Product:</p>
                        <p className="font-medium">{transaction.itemName}</p>
                        <p className="text-xs text-gray-400">{transaction.itemSku}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Financial Info */}
                  <div className="border-t pt-3">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Price:</p>
                        <p className="font-medium">{formatCurrency(transaction.price)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Profit:</p>
                        <p className="font-medium text-green-600">{formatCurrency(transaction.profit)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Cost:</p>
                        <p className="font-medium">{formatCurrency(transaction.totalCost)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t pt-3">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-xs"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(transaction)}
                        className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-xs"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                )
              })}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[60px]">No</th>
                    <th className={`sticky left-0 z-10 px-3 py-3 text-left text-xs font-medium uppercase tracking-wider min-w-[140px] ${
                      highlightMode === 'orders' ? 'bg-purple-200 text-purple-800' : 'bg-gray-50 text-gray-500'
                    }`}>Order No</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Date</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Brand</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">Product</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">SKU</th>
                    <th className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider min-w-[60px] ${
                      highlightMode === 'items' ? 'bg-orange-200 text-orange-800' : 'text-gray-500'
                    }`}>Qty</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Price</th>
                    <th className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider min-w-[100px] ${
                      highlightMode === 'revenue' ? 'bg-green-200 text-green-800' : 'text-gray-500'
                    }`}>Amount</th>
                    <th className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider min-w-[100px] ${
                      highlightMode === 'profit' ? 'bg-blue-200 text-blue-800' : 'text-gray-500'
                    }`}>Profit</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Payment</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Group</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Commission</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Discount</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Cost</th>
                    {isSuperAdmin && (
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Company</th>
                    )}
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction, index) => {
                    const rowNumber = (currentPage - 1) * itemsPerPage + index + 1
                    return (
                    <tr key={`desktop-${transaction.transactionNo}-${transaction.itemSku}-${index}`} className="hover:bg-gray-50">
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-center font-medium">
                        {rowNumber}
                      </td>
                      <td className={`sticky left-0 z-10 bg-white px-3 py-4 whitespace-nowrap text-sm font-medium border-r border-gray-200 ${
                        highlightMode === 'orders' ? 'bg-purple-100 text-purple-900 font-bold' : 'text-gray-900'
                      }`}>
                        {transaction.transactionNo}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(transaction.orderTime)}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.brand || '-'}</td>
                      <td className="px-3 py-4 text-sm text-gray-900 max-w-[180px] truncate" title={transaction.itemName}>
                        {transaction.itemName}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.itemSku || '-'}</td>
                      <td className={`px-3 py-4 whitespace-nowrap text-sm text-center ${
                        highlightMode === 'items' ? 'bg-orange-100 text-orange-900 font-bold' : 'text-gray-900'
                      }`}>{transaction.qty}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(transaction.price)}</td>
                      <td className={`px-3 py-4 whitespace-nowrap text-sm font-semibold text-right ${
                        highlightMode === 'revenue' ? 'bg-green-100 text-green-900 font-bold' : 'text-gray-900'
                      }`}>{formatCurrency(transaction.amount)}</td>
                      <td className={`px-3 py-4 whitespace-nowrap text-sm font-semibold text-right ${
                        highlightMode === 'profit' ? 'bg-blue-100 text-blue-900 font-bold' : 'text-green-600'
                      }`}>{formatCurrency(transaction.profit)}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.paymentType}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.itemGroup}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(transaction.brandCommissionAmount)}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(transaction.discountAmount)}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(transaction.totalCost)}</td>
                      {isSuperAdmin && (
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.companyName || '-'}</td>
                      )}
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Edit transaction"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete transaction"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      title="Previous page"
                      aria-label="Go to previous page"
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      title="Next page"
                      aria-label="Go to next page"
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {showEditModal && editingTransaction && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Edit Transaction</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction No</label>
                    <input
                      type="text"
                      value={editingTransaction.transactionNo}
                      onChange={(e) => setEditingTransaction({...editingTransaction, transactionNo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <input
                      type="text"
                      value={editingTransaction.brand}
                      onChange={(e) => setEditingTransaction({...editingTransaction, brand: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input
                      type="text"
                      value={editingTransaction.itemName}
                      onChange={(e) => setEditingTransaction({...editingTransaction, itemName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item SKU</label>
                    <input
                      type="text"
                      value={editingTransaction.itemSku}
                      onChange={(e) => setEditingTransaction({...editingTransaction, itemSku: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={editingTransaction.qty}
                      onChange={(e) => setEditingTransaction({...editingTransaction, qty: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      value={editingTransaction.price}
                      onChange={(e) => setEditingTransaction({...editingTransaction, price: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      value={editingTransaction.amount}
                      onChange={(e) => setEditingTransaction({...editingTransaction, amount: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                    <select
                      value={editingTransaction.paymentType}
                      onChange={(e) => setEditingTransaction({...editingTransaction, paymentType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Payment Type</option>
                      {paymentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Group</label>
                    <select
                      value={editingTransaction.itemGroup}
                      onChange={(e) => setEditingTransaction({...editingTransaction, itemGroup: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Item Group</option>
                      {itemGroups.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount</label>
                    <input
                      type="number"
                      value={editingTransaction.discountAmount}
                      onChange={(e) => setEditingTransaction({...editingTransaction, discountAmount: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && deletingTransaction && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Transaction</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Are you sure you want to delete transaction <strong>{deletingTransaction.transactionNo}</strong>?
                  This action cannot be undone.
                </p>
                
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

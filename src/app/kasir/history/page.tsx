'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/vendra/DashboardLayout'
import { 
  History,
  User,
  CreditCard,
  Receipt,
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  X
} from 'lucide-react'

interface Transaction {
  id: string
  transactionNo: string
  total: number
  paymentMethod: string
  paymentStatus: string
  createdAt: string
  customer: {
    name: string
    email?: string
    isMember: boolean
  }
  store: {
    name: string
    code: string
  }
  itemCount: number
  items: TransactionItem[]
}

interface TransactionItem {
  id: string
  product: {
    name: string
    sku: string
  }
  quantity: number
  unitPrice: number
  totalPrice: number
}

export default function KasirHistoryPage() {
  const { data: session } = useSession()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/kasir/transactions')
      if (response.ok) {
        const data = await response.json()
        console.log('Transactions data:', data) // Debug log
        // API returns { transactions: [...], pagination: {...} }
        const transactionsArray = data.transactions || []
        setTransactions(Array.isArray(transactionsArray) ? transactionsArray : [])
      } else {
        console.error('Failed to fetch transactions:', response.status)
        setTransactions([])
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = (transactions || []).filter(transaction =>
    transaction.transactionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Selesai
          </span>
        )
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        )
      case 'FAILED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Gagal
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH':
        return '💵'
      case 'CARD':
        return '💳'
      case 'TRANSFER':
        return '🏦'
      case 'E_WALLET':
        return '📱'
      default:
        return '💰'
    }
  }

  const viewTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowDetails(true)
  }

  if (loading) {
    return (
      <DashboardLayout title="History Transaksi">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Transaksi Hari Ini">
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <History className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Transaksi Hari Ini - {new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <p className="text-xs text-blue-600 mt-1">
                Untuk keamanan, hanya transaksi hari ini yang ditampilkan
              </p>
            </div>
          </div>
        </div>

        {/* Search Only */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Transaksi Hari Ini
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="No. transaksi atau customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Simple Transactions Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Transaksi Hari Ini ({filteredTransactions.length})
            </h3>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Belum ada transaksi hari ini</p>
              <p className="text-sm text-gray-500 mt-2">
                Mulai melakukan transaksi atau coba ubah kata kunci pencarian
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No. Transaksi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pembayaran
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.transactionNo}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {transaction.customer.isMember ? (
                              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                            ) : (
                              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.customer.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transaction.customer.isMember ? 'Member' : 'Walk-in'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">
                            {getPaymentMethodIcon(transaction.paymentMethod)}
                          </span>
                          <span className="text-sm text-gray-900">
                            {transaction.paymentMethod}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Rp {transaction.total.toLocaleString('id-ID')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.itemCount} item(s)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentStatusBadge(transaction.paymentStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(transaction.createdAt).toLocaleDateString('id-ID')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(transaction.createdAt).toLocaleTimeString('id-ID')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => viewTransactionDetails(transaction)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Simple Transaction Details Modal */}
      {showDetails && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Detail Transaksi
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Tutup detail transaksi"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">No. Transaksi</p>
                <p className="text-lg font-semibold text-gray-900">{selectedTransaction.transactionNo}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Customer</p>
                <p className="text-sm text-gray-900">{selectedTransaction.customer.name}</p>
                <p className="text-xs text-gray-500">
                  {selectedTransaction.customer.isMember ? 'Member' : 'Walk-in Customer'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Pembayaran</p>
                <div className="flex items-center mt-1">
                  <span className="text-lg mr-2">
                    {getPaymentMethodIcon(selectedTransaction.paymentMethod)}
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedTransaction.paymentMethod}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-xl font-bold text-gray-900">
                  Rp {selectedTransaction.total.toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedTransaction.itemCount} item(s)
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div className="mt-1">
                  {getPaymentStatusBadge(selectedTransaction.paymentStatus)}
                </div>
              </div>

              <div className="text-center text-sm text-gray-500 border-t pt-4">
                {new Date(selectedTransaction.createdAt).toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

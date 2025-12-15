'use client'

import { useState, useEffect } from 'react'
import { Search, User, UserPlus, Star, Gift, Phone, Mail, Calendar } from 'lucide-react'

interface Customer {
  id: string
  uniqueId: string
  name: string
  email?: string
  phone?: string
  isMember: boolean
  membershipId?: string
  membershipTier?: string
  membershipPoints: number
  membershipDiscount: number
  membershipJoinDate?: string
}

interface CustomerSearchProps {
  onCustomerSelect: (customer: Customer | null) => void
  selectedCustomer: Customer | null
  isKasirMode?: boolean  // New prop to indicate kasir usage
}

export default function CustomerSearch({ onCustomerSelect, selectedCustomer, isKasirMode = false }: CustomerSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)

  // New customer form state
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    isMember: false
  })

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchCustomers()
    } else {
      setCustomers([])
      setShowResults(false)
    }
  }, [searchTerm])

  const searchCustomers = async () => {
    setIsSearching(true)
    try {
      // Use different API endpoint based on kasir mode
      const apiEndpoint = isKasirMode 
        ? `/api/kasir/customers/search?q=${encodeURIComponent(searchTerm)}`
        : `/api/customers/search?q=${encodeURIComponent(searchTerm)}`
        
      const response = await fetch(apiEndpoint)
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
        setShowResults(true)
      }
    } catch (error) {
      console.error('Error searching customers:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleCustomerSelect = (customer: Customer) => {
    onCustomerSelect(customer)
    setSearchTerm('')
    setShowResults(false)
  }

  const handleCreateCustomer = async () => {
    if (!newCustomer.name.trim()) return

    try {
      // Use different API endpoint based on kasir mode
      const apiEndpoint = isKasirMode ? '/api/kasir/customers' : '/api/customers'
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCustomer)
      })

      if (response.ok) {
        const customer = await response.json()
        onCustomerSelect(customer)
        setNewCustomer({ name: '', phone: '', email: '', isMember: false })
        setShowNewCustomerForm(false)
        setSearchTerm('')
      }
    } catch (error) {
      console.error('Error creating customer:', error)
    }
  }

  const getMembershipBadge = (customer: Customer) => {
    if (!customer.isMember) return null

    const tierColors = {
      bronze: 'bg-orange-100 text-orange-800',
      silver: 'bg-gray-100 text-gray-800',
      gold: 'bg-yellow-100 text-yellow-800',
      platinum: 'bg-purple-100 text-purple-800'
    }

    const tierColor = tierColors[customer.membershipTier as keyof typeof tierColors] || 'bg-blue-100 text-blue-800'

    return (
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tierColor}`}>
          <Star className="h-3 w-3 mr-1" />
          {customer.membershipTier?.toUpperCase() || 'MEMBER'}
        </span>
        {customer.membershipPoints > 0 && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Gift className="h-3 w-3 mr-1" />
            {customer.membershipPoints} pts
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Selected Customer Display */}
      {selectedCustomer && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">{selectedCustomer.name}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {selectedCustomer.uniqueId}
                  </span>
                </div>
                {getMembershipBadge(selectedCustomer)}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-blue-700">
                {selectedCustomer.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {selectedCustomer.phone}
                  </div>
                )}
                {selectedCustomer.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {selectedCustomer.email}
                  </div>
                )}
                {selectedCustomer.membershipDiscount > 0 && (
                  <div className="flex items-center font-medium text-green-700">
                    <Gift className="h-4 w-4 mr-1" />
                    Diskon {selectedCustomer.membershipDiscount}%
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={() => onCustomerSelect(null)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Ganti Customer
            </button>
          </div>
        </div>
      )}

      {/* Customer Search */}
      {!selectedCustomer && (
        <div className="space-y-4">
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari customer (nama, phone, member ID)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Search Results */}
            {showResults && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2">Mencari customer...</p>
                  </div>
                ) : customers.length > 0 ? (
                  customers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleCustomerSelect(customer)}
                      className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">{customer.name}</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {customer.uniqueId}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            {customer.phone && <span>{customer.phone}</span>}
                            {customer.email && <span>{customer.email}</span>}
                          </div>
                        </div>
                        
                        {getMembershipBadge(customer)}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p>Customer tidak ditemukan</p>
                    <button
                      onClick={() => setShowNewCustomerForm(true)}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Buat customer baru
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-2">
            <button
              onClick={() => onCustomerSelect(null)}
              className="flex-1 py-3 px-4 border-2 border-green-300 bg-green-50 rounded-lg text-green-700 hover:bg-green-100 hover:border-green-400 font-medium transition-colors"
            >
              <div className="flex items-center justify-center space-x-2">
                <User className="h-4 w-4" />
                <span>Checkout Tanpa Member</span>
              </div>
            </button>
            <button
              onClick={() => setShowNewCustomerForm(true)}
              className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Buat Customer Baru
            </button>
          </div>
        </div>
      )}

      {/* New Customer Form Modal */}
      {showNewCustomerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Baru</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Customer *
                </label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan nama customer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor HP
                </label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="customer@email.com"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isMember"
                  checked={newCustomer.isMember}
                  onChange={(e) => setNewCustomer({ ...newCustomer, isMember: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isMember" className="ml-2 block text-sm text-gray-900">
                  Daftarkan sebagai member
                </label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowNewCustomerForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleCreateCustomer}
                disabled={!newCustomer.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

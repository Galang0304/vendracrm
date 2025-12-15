'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/vendra/DashboardLayout'
import CustomerSearch from '@/components/CustomerSearch'
import { 
  Store,
  User,
  Clock,
  MapPin,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Package,
  CreditCard,
  Receipt,
  CheckCircle
} from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  barcode: string
  category: string
}

interface CartItem {
  product: Product
  quantity: number
  subtotal: number
}

interface KasirInfo {
  employeeName: string
  employeeEmail: string
  storeName: string
  storeAddress: string
  companyName: string
  currentShift: string
}

export default function KasirDashboard() {
  const { data: session } = useSession()
  const [kasirInfo, setKasirInfo] = useState<KasirInfo | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<any>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)

  useEffect(() => {
    fetchKasirInfo()
    fetchProducts()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchKasirInfo = async () => {
    try {
      const response = await fetch('/api/kasir/info')
      if (response.ok) {
        const data = await response.json()
        setKasirInfo(data)
      }
    } catch (error) {
      console.error('Error fetching kasir info:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/kasir/products')
      if (response.ok) {
        const data = await response.json()
        const formattedProducts = data.map((product: any) => ({
          ...product,
          price: product.price ? Number(product.price) : 0
        }))
        setProducts(formattedProducts)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id)
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * product.price }
            : item
        ))
      }
    } else {
      setCart([...cart, { product, quantity: 1, subtotal: product.price }])
    }
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId)
      return
    }

    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.product.price }
        : item
    ))
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Keranjang kosong!')
      return
    }

    setIsProcessing(true)
    try {
      const items = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.price
      }))

      const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0)

      const response = await fetch('/api/kasir/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          customerId: selectedCustomer?.id,
          paymentMethod,
          totalAmount
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setLastTransaction(data.transaction)
        setShowSuccess(true)
        setCart([])
        setSelectedCustomer(null)
        
        // Refresh products to update stock
        fetchProducts()
        
        setTimeout(() => {
          setShowSuccess(false)
        }, 3000)
      } else {
        const error = await response.json()
        alert(error.message || 'Gagal memproses transaksi')
      }
    } catch (error) {
      console.error('Error during checkout:', error)
      alert('Terjadi kesalahan saat memproses transaksi')
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  )

  if (loading) {
    return (
      <DashboardLayout title="Kasir POS">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Kasir POS">
      <div className="space-y-6">
        {/* Kasir Info Header */}
        {kasirInfo && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg text-white p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Kasir Info */}
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-full p-2">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm opacity-90">Kasir</p>
                  <p className="font-semibold">{kasirInfo.employeeName}</p>
                </div>
              </div>

              {/* Store Info */}
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm opacity-90">Toko</p>
                  <p className="font-semibold">{kasirInfo.storeName}</p>
                  <p className="text-xs opacity-75">{kasirInfo.companyName}</p>
                </div>
              </div>

              {/* Time & Shift Info */}
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm opacity-90">{kasirInfo.currentShift}</p>
                  <p className="font-semibold">
                    {currentTime.toLocaleTimeString('id-ID', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                  <p className="text-xs opacity-75">
                    {currentTime.toLocaleDateString('id-ID', { 
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Store Address */}
            {kasirInfo.storeAddress && kasirInfo.storeAddress !== '-' && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 opacity-75" />
                  <p className="text-sm opacity-90">{kasirInfo.storeAddress}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Success Message */}
        {showSuccess && lastTransaction && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-green-800">Transaksi Berhasil!</h3>
                <p className="text-sm text-green-700">
                  {lastTransaction.transactionNo} - Total: Rp {lastTransaction.total.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* POS System */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Product Selection */}
              <div className="lg:col-span-2">
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari produk atau scan barcode..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Produk Toko</h3>
                  
                  {products.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Tidak ada produk tersedia</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Hubungi admin untuk menambahkan produk ke toko
                      </p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Produk tidak ditemukan</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Coba ubah kata kunci pencarian
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => addToCart(product)}
                          className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
                        >
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="font-medium text-sm text-gray-900 mb-1">{product.name}</h3>
                            <p className="text-lg font-bold text-blue-600">
                              Rp {product.price.toLocaleString('id-ID')}
                            </p>
                            <p className="text-xs text-gray-500">Stok: {product.stock}</p>
                            {product.stock <= 5 && (
                              <p className="text-xs text-red-500 mt-1">Stok Rendah!</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Shopping Cart */}
              <div className="lg:col-span-1">
                <div className="border rounded-lg p-4 sticky top-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Keranjang</h3>
                    <div className="flex items-center">
                      <ShoppingCart className="h-5 w-5 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600">{getTotalItems()} item</span>
                    </div>
                  </div>

                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Keranjang kosong</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Pilih produk untuk memulai transaksi
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                        {cart.map((item) => (
                          <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-gray-900">{item.product.name}</h4>
                              <p className="text-sm text-gray-600">
                                Rp {item.product.price.toLocaleString('id-ID')} x {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="p-1 hover:bg-gray-200 rounded"
                                title="Kurangi quantity"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="p-1 hover:bg-gray-200 rounded"
                                disabled={item.quantity >= item.product.stock}
                                title="Tambah quantity"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => removeFromCart(item.product.id)}
                                className="p-1 hover:bg-red-100 text-red-600 rounded"
                                title="Hapus dari keranjang"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-semibold text-gray-900">Total:</span>
                          <span className="text-xl font-bold text-blue-600">
                            Rp {getTotalAmount().toLocaleString('id-ID')}
                          </span>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Customer (Opsional)
                          </label>
                          <CustomerSearch
                            selectedCustomer={selectedCustomer}
                            onCustomerSelect={setSelectedCustomer}
                            isKasirMode={true}
                          />
                          {selectedCustomer && (
                            <div className="mt-2 p-2 bg-green-50 rounded-lg">
                              <p className="text-sm text-green-800">
                                <strong>{selectedCustomer.name}</strong>
                                {selectedCustomer.isMember && (
                                  <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                                    Member - Diskon {selectedCustomer.membershipDiscount}%
                                  </span>
                                )}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Metode Pembayaran
                          </label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            title="Pilih metode pembayaran"
                          >
                            <option value="CASH">Cash</option>
                            <option value="CARD">Card</option>
                            <option value="TRANSFER">Transfer</option>
                            <option value="E_WALLET">E-Wallet</option>
                          </select>
                        </div>

                        <button
                          onClick={handleCheckout}
                          disabled={isProcessing || cart.length === 0}
                          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {isProcessing ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <CreditCard className="h-5 w-5 mr-2" />
                              Proses Pembayaran
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

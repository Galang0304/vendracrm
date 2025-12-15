'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/vendra/DashboardLayout'
import Link from 'next/link'
import { 
  Package, 
  Plus, 
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  Barcode,
  Download
} from 'lucide-react'

interface ProductData {
  id: string
  name: string
  description?: string
  sku: string
  barcode?: string
  price: number
  cost?: number
  stock: number
  minStock: number
  category?: string
  brand?: string
  unit: string
  isActive: boolean
  createdAt: string
  store?: {
    id: string
    name: string
    code: string
  }
}

export default function ProductsPage() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [storeFilter, setStoreFilter] = useState('')
  const [stores, setStores] = useState<Array<{id: string, name: string, code: string}>>([])

  useEffect(() => {
    fetchProducts()
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/admin/stores')
      if (response.ok) {
        const storesData = await response.json()
        setStores(storesData || [])
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      if (response.ok) {
        const data = await response.json()
        console.log('Products data:', data.slice(0, 3)) // Debug log
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchProducts() // Refresh list
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const downloadBarcode = (barcode: string, productName: string) => {
    if (!barcode) {
      alert('Produk ini tidak memiliki barcode')
      return
    }

    try {
      // Import JsBarcode dynamically
      import('jsbarcode').then((JsBarcode) => {
        const canvas = document.createElement('canvas')
        JsBarcode.default(canvas, barcode, {
          format: "EAN13",
          width: 2,
          height: 100,
          displayValue: true,
          fontSize: 14,
          textMargin: 5,
          background: "#ffffff",
          lineColor: "#000000"
        })

        // Create download canvas with product name
        const downloadCanvas = document.createElement('canvas')
        const ctx = downloadCanvas.getContext('2d')
        if (!ctx) return

        const padding = 20
        const nameHeight = 30
        
        downloadCanvas.width = canvas.width + (padding * 2)
        downloadCanvas.height = canvas.height + (padding * 2) + nameHeight

        // Fill background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height)

        // Add product name
        ctx.fillStyle = '#000000'
        ctx.font = 'bold 16px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(
          productName, 
          downloadCanvas.width / 2, 
          padding + 20
        )

        // Draw barcode
        ctx.drawImage(canvas, padding, padding + nameHeight)

        // Download
        const link = document.createElement('a')
        link.download = `barcode-${barcode}-${productName.replace(/[^a-zA-Z0-9]/g, '_')}.png`
        link.href = downloadCanvas.toDataURL('image/png')
        link.click()
      })
    } catch (error) {
      console.error('Error downloading barcode:', error)
      alert('Gagal mendownload barcode')
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.barcode && product.barcode.includes(searchTerm))
    const matchesCategory = !categoryFilter || product.category === categoryFilter
    const matchesStore = !storeFilter || product.store?.id === storeFilter
    
    // Debug log untuk filter
    if (storeFilter && product.name.includes('Hampera')) {
      console.log('Filter debug:', {
        productName: product.name,
        productStoreId: product.store?.id,
        selectedStoreFilter: storeFilter,
        matchesStore,
        storeData: product.store
      })
    }
    
    return matchesSearch && matchesCategory && matchesStore
  })

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))]
  const lowStockProducts = products.filter(p => p.stock <= p.minStock)
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)

  if (loading) {
    return (
      <DashboardLayout title="Manajemen Produk">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Manajemen Produk">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Manajemen Produk</h1>
            <p className="text-sm sm:text-base text-gray-600">Kelola inventory dan produk Anda</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => {
                const productsWithBarcode = products.filter(p => p.barcode)
                if (productsWithBarcode.length === 0) {
                  alert('Tidak ada produk dengan barcode untuk didownload')
                  return
                }
                
                // Download all barcodes as ZIP would be complex, so let's show instruction
                alert(`Ditemukan ${productsWithBarcode.length} produk dengan barcode. Klik tombol download (⬇️) di setiap produk untuk mendownload barcode individual.`)
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center sm:justify-start"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Download Barcode</span>
              <span className="sm:hidden">Download</span>
            </button>
            <Link
              href="/admin/products/add"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center sm:justify-start"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Tambah Produk</span>
              <span className="sm:hidden">Tambah</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-xl">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Produk</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-xl">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Produk Aktif</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {products.filter(p => p.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Stok Rendah</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{lowStockProducts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-xl">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Nilai Inventory</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  Rp {totalValue.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari produk, SKU, atau barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Store Filter */}
            <div className="sm:w-48">
              <label htmlFor="storeFilter" className="sr-only">Filter Toko</label>
              <select
                id="storeFilter"
                value={storeFilter}
                onChange={(e) => setStoreFilter(e.target.value)}
                title="Filter produk berdasarkan toko"
                aria-label="Pilih toko untuk filter produk"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Toko</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name} ({store.code})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Category Filter */}
            <div className="sm:w-48">
              <label htmlFor="categoryFilter" className="sr-only">Filter Kategori</label>
              <select
                id="categoryFilter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                title="Filter produk berdasarkan kategori"
                aria-label="Pilih kategori untuk filter produk"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Kategori</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              Daftar Produk ({filteredProducts.length})
            </h2>
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                {products.length === 0 ? 'Belum Ada Produk' : 'Tidak Ada Produk Ditemukan'}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                {products.length === 0 
                  ? 'Mulai dengan menambahkan produk pertama Anda'
                  : 'Coba ubah kata kunci pencarian atau filter kategori'
                }
              </p>
              {products.length === 0 && (
                <Link
                  href="/admin/products/add"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center text-sm sm:text-base"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Produk Pertama
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produk
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU/Barcode
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harga
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stok
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Toko
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                          {/* Show SKU/Barcode on mobile */}
                          <div className="md:hidden mt-1">
                            <div className="text-xs text-gray-600">
                              SKU: {product.sku}
                              {product.barcode && (
                                <span className="ml-2 flex items-center">
                                  <Barcode className="h-3 w-3 mr-1" />
                                  {product.barcode}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">SKU: {product.sku}</div>
                        {product.barcode && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Barcode className="h-4 w-4 mr-1" />
                            {product.barcode}
                          </div>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Rp {product.price.toLocaleString('id-ID')}
                        </div>
                        {product.cost && (
                          <div className="text-xs text-gray-500">
                            Cost: Rp {product.cost.toLocaleString('id-ID')}
                          </div>
                        )}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.stock} {product.unit}
                        </div>
                        {product.stock <= product.minStock && (
                          <div className="text-xs text-red-600 flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Stok Rendah
                          </div>
                        )}
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.category || '-'}
                        </div>
                        {product.brand && (
                          <div className="text-xs text-gray-500">{product.brand}</div>
                        )}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.store?.name || 'Tidak Ada Store'}
                        </div>
                        {product.store?.code && (
                          <div className="text-xs text-gray-500">({product.store.code})</div>
                        )}
                        {/* Debug info */}
                        {process.env.NODE_ENV === 'development' && (
                          <div className="text-xs text-red-500">
                            StoreId: {product.store?.id || 'NULL'}
                          </div>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isActive ? 'Aktif' : 'Non-Aktif'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          {product.barcode && (
                            <button
                              onClick={() => downloadBarcode(product.barcode!, product.name)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Download Barcode"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="text-yellow-600 hover:text-yellow-900 p-1"
                            title="Edit Produk"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Hapus Produk"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

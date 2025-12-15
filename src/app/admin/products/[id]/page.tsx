'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/vendra/DashboardLayout'
import BarcodeGenerator from '@/components/BarcodeGenerator'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit, 
  Package,
  DollarSign,
  BarChart3,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle
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
  weight?: number
  dimensions?: string
  imageUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  store?: {
    id: string
    name: string
    code: string
  }
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<ProductData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchProductDetail()
    }
  }, [params.id])

  const fetchProductDetail = async () => {
    try {
      const response = await fetch(`/api/admin/products/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
      } else {
        router.push('/admin/products')
      }
    } catch (error) {
      console.error('Error fetching product detail:', error)
      router.push('/admin/products')
    } finally {
      setLoading(false)
    }
  }

  const toggleActiveStatus = async () => {
    if (!product) return
    
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          isActive: !product.isActive
        }),
      })

      if (response.ok) {
        const updatedProduct = await response.json()
        setProduct(updatedProduct)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.message || 'Failed to update product status'}`)
      }
    } catch (error) {
      console.error('Error updating product status:', error)
      alert('Error updating product status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Detail Produk">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!product) {
    return (
      <DashboardLayout title="Detail Produk">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Produk Tidak Ditemukan</h3>
          <Link
            href="/admin/products"
            className="text-blue-600 hover:text-blue-800"
          >
            Kembali ke Daftar Produk
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const isLowStock = product.stock <= product.minStock
  const inventoryValue = product.price * product.stock
  const profitMargin = product.cost ? ((product.price - product.cost) / product.price * 100) : 0

  return (
    <DashboardLayout title="Detail Produk">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/products"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-sm sm:text-base text-gray-600">SKU: {product.sku}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => toggleActiveStatus()}
              disabled={updating}
              className={`px-4 py-2 rounded-lg flex items-center text-sm font-medium disabled:opacity-50 ${
                product.isActive
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
              title={product.isActive ? 'Nonaktifkan produk' : 'Aktifkan produk'}
            >
              {updating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  {product.isActive ? 'Menonaktifkan...' : 'Mengaktifkan...'}
                </>
              ) : product.isActive ? (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Nonaktifkan
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aktifkan
                </>
              )}
            </button>
            
            <Link
              href={`/admin/products/${product.id}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Produk
            </Link>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center space-x-3">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
            product.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {product.isActive ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Aktif
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-1" />
                Non-Aktif
              </>
            )}
          </span>
          {isLowStock && (
            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Stok Rendah
            </span>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Informasi Produk
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nama Produk</label>
                  <p className="text-base text-gray-900 mt-1">{product.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">SKU</label>
                  <p className="text-base text-gray-900 mt-1 font-mono bg-gray-50 px-2 py-1 rounded">
                    {product.sku}
                  </p>
                </div>
                {product.description && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Deskripsi</label>
                    <p className="text-base text-gray-900 mt-1">{product.description}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Kategori</label>
                  <p className="text-base text-gray-900 mt-1">{product.category || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Brand</label>
                  <p className="text-base text-gray-900 mt-1">{product.brand || '-'}</p>
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Harga & Inventory
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Harga Jual</label>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                </div>
                {product.cost && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Harga Beli</label>
                    <p className="text-base text-gray-900 mt-1">
                      Rp {product.cost.toLocaleString('id-ID')}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Stok Saat Ini</label>
                  <p className={`text-xl font-bold mt-1 ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                    {product.stock} {product.unit}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Minimum Stok</label>
                  <p className="text-base text-gray-900 mt-1">{product.minStock} {product.unit}</p>
                </div>
              </div>
            </div>

            {/* Physical Properties */}
            {(product.weight || product.dimensions) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Properti Fisik</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {product.weight && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Berat</label>
                      <p className="text-base text-gray-900 mt-1">{product.weight} kg</p>
                    </div>
                  )}
                  {product.dimensions && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Dimensi</label>
                      <p className="text-base text-gray-900 mt-1">{product.dimensions}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Barcode */}
            {product.barcode && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Barcode</h3>
                <BarcodeGenerator 
                  value={product.barcode}
                  productName={product.name}
                  showDownload={true}
                />
              </div>
            )}

            {/* Statistics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Statistik
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nilai Inventory</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    Rp {inventoryValue.toLocaleString('id-ID')}
                  </p>
                </div>
                {product.cost && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Margin Keuntungan</label>
                    <p className="text-lg font-bold text-green-600 mt-1">
                      {profitMargin.toFixed(1)}%
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Satuan</label>
                  <p className="text-base text-gray-900 mt-1">{product.unit}</p>
                </div>
              </div>
            </div>

            {/* Store Assignment */}
            {product.store && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Penempatan
                </h3>
                <div>
                  <label className="text-sm font-medium text-gray-500">Toko</label>
                  <p className="text-base text-gray-900 mt-1">{product.store.name}</p>
                  <p className="text-sm text-gray-500">({product.store.code})</p>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Dibuat</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(product.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Terakhir Diupdate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(product.updatedAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/vendra/DashboardLayout'
import Link from 'next/link'
import { 
  Store, 
  Plus, 
  MapPin, 
  Phone, 
  Mail,
  User,
  Edit,
  Trash2,
  Eye,
  Lock,
  AlertTriangle
} from 'lucide-react'

interface StoreData {
  id: string
  name: string
  code: string
  address: string
  phone?: string
  email?: string
  manager?: string
  isActive: boolean
  createdAt: string
}

export default function StoresPage() {
  const { data: session } = useSession()
  const [stores, setStores] = useState<StoreData[]>([])
  const [loading, setLoading] = useState(true)
  const [canAddStore, setCanAddStore] = useState(true)
  const [limitMessage, setLimitMessage] = useState('')

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/admin/stores')
      if (response.ok) {
        const data = await response.json()
        setStores(data)
        
        // Check if user can add more stores
        await checkStoreLimits()
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkStoreLimits = async () => {
    try {
      const response = await fetch('/api/subscription/limits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'store' })
      })
      
      if (response.ok) {
        const data = await response.json()
        setCanAddStore(data.data.allowed)
        if (!data.data.allowed) {
          setLimitMessage(data.data.message)
        }
      }
    } catch (error) {
      console.error('Error checking store limits:', error)
    }
  }

  const handleDeleteStore = async (storeId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus toko ini?')) return

    try {
      const response = await fetch(`/api/admin/stores/${storeId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchStores() // Refresh list
      }
    } catch (error) {
      console.error('Error deleting store:', error)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Manajemen Toko">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Manajemen Toko">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Manajemen Toko</h1>
            <p className="text-sm sm:text-base text-gray-600">Kelola semua cabang toko Anda</p>
          </div>
          {canAddStore ? (
            <Link
              href="/admin/stores/add"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center sm:justify-start"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Tambah Toko</span>
              <span className="sm:hidden">Tambah</span>
            </Link>
          ) : (
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => alert(limitMessage)}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed flex items-center justify-center sm:justify-start"
                disabled
              >
                <Lock className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Tambah Toko</span>
                <span className="sm:hidden">Tambah</span>
              </button>
              <p className="text-xs text-red-600 text-right max-w-xs">
                Batas paket tercapai
              </p>
            </div>
          )}
        </div>

        {/* Limit Warning for FREE users */}
        {!canAddStore && session?.user?.subscriptionTier === 'FREE' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-orange-800">Batas Paket FREE</h3>
                <p className="text-sm text-orange-700 mt-1">
                  {limitMessage}
                </p>
                <Link
                  href="/admin/upgrade"
                  className="inline-flex items-center mt-2 text-sm font-medium text-orange-800 hover:text-orange-900"
                >
                  Upgrade Paket →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-xl">
                <Store className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Toko</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stores.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-xl">
                <Store className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Toko Aktif</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {stores.filter(store => store.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-orange-100 rounded-xl">
                <Store className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Toko Non-Aktif</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {stores.filter(store => !store.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stores List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Daftar Toko</h2>
          </div>
          
          {stores.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <Store className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Belum Ada Toko</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">Mulai dengan menambahkan toko pertama Anda</p>
              <Link
                href="/admin/stores/add"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center text-sm sm:text-base"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Toko Pertama
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Toko
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alamat
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kontak
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Manager
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
                  {stores.map((store) => (
                    <tr key={store.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{store.name}</div>
                          <div className="text-xs sm:text-sm text-gray-500">Kode: {store.code}</div>
                          {/* Show address on mobile */}
                          <div className="md:hidden mt-1">
                            <div className="flex items-center text-xs text-gray-600">
                              <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                              <span className="truncate">{store.address}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{store.address}</span>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {store.phone && (
                            <div className="flex items-center text-sm text-gray-900">
                              <Phone className="h-4 w-4 mr-2 text-gray-400" />
                              {store.phone}
                            </div>
                          )}
                          {store.email && (
                            <div className="flex items-center text-sm text-gray-900">
                              <Mail className="h-4 w-4 mr-2 text-gray-400" />
                              {store.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                        {store.manager ? (
                          <div className="flex items-center text-sm text-gray-900">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            {store.manager}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          store.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {store.isActive ? 'Aktif' : 'Non-Aktif'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <Link
                            href={`/admin/stores/${store.id}`}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/stores/${store.id}/edit`}
                            className="text-yellow-600 hover:text-yellow-900 p-1"
                            title="Edit Toko"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteStore(store.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Hapus Toko"
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

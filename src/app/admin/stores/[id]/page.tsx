'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/vendra/DashboardLayout'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit, 
  MapPin, 
  Phone, 
  Mail,
  User,
  Store,
  Calendar,
  ToggleLeft,
  ToggleRight
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
  updatedAt: string
}

export default function StoreDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [store, setStore] = useState<StoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchStoreDetail()
    }
  }, [params.id])

  const fetchStoreDetail = async () => {
    try {
      const response = await fetch(`/api/admin/stores/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setStore(data)
      } else {
        router.push('/admin/stores')
      }
    } catch (error) {
      console.error('Error fetching store detail:', error)
      router.push('/admin/stores')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!store) return
    
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/stores/${store.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...store,
          isActive: !store.isActive
        }),
      })

      if (response.ok) {
        const updatedStore = await response.json()
        setStore(updatedStore)
      }
    } catch (error) {
      console.error('Error updating store status:', error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Detail Toko">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!store) {
    return (
      <DashboardLayout title="Detail Toko">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Toko Tidak Ditemukan</h3>
          <Link
            href="/admin/stores"
            className="text-blue-600 hover:text-blue-800"
          >
            Kembali ke Daftar Toko
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Detail Toko">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/stores"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{store.name}</h1>
              <p className="text-sm sm:text-base text-gray-600">Kode: {store.code}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleToggleStatus}
              disabled={updating}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                store.isActive
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {updating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              ) : store.isActive ? (
                <ToggleRight className="h-4 w-4 mr-2" />
              ) : (
                <ToggleLeft className="h-4 w-4 mr-2" />
              )}
              {store.isActive ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
            <Link
              href={`/admin/stores/${store.id}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Toko
            </Link>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center space-x-3">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
            store.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {store.isActive ? 'Aktif' : 'Non-Aktif'}
          </span>
        </div>

        {/* Store Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Store className="h-5 w-5 mr-2" />
              Informasi Dasar
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nama Toko</label>
                <p className="text-base text-gray-900 mt-1">{store.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Kode Toko</label>
                <p className="text-base text-gray-900 mt-1 font-mono bg-gray-50 px-2 py-1 rounded">
                  {store.code}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Alamat</label>
                <div className="flex items-start mt-1">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                  <p className="text-base text-gray-900">{store.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kontak & Manajemen</h3>
            <div className="space-y-4">
              {store.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Telepon</label>
                  <div className="flex items-center mt-1">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-base text-gray-900">{store.phone}</p>
                  </div>
                </div>
              )}
              
              {store.email && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="flex items-center mt-1">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-base text-gray-900">{store.email}</p>
                  </div>
                </div>
              )}

              {store.manager && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Manager</label>
                  <div className="flex items-center mt-1">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-base text-gray-900">{store.manager}</p>
                  </div>
                </div>
              )}

              {!store.phone && !store.email && !store.manager && (
                <p className="text-sm text-gray-500 italic">Tidak ada informasi kontak tersedia</p>
              )}
            </div>
          </div>
        </div>

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
                {new Date(store.createdAt).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Terakhir Diupdate</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(store.updatedAt).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

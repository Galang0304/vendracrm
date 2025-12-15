'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/vendra/DashboardLayout'
import Link from 'next/link'
import { 
  Users, 
  Plus, 
  Mail, 
  Shield,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Search,
  Filter,
  Store,
  Download
} from 'lucide-react'

interface EmployeeData {
  id: string
  name: string
  email: string
  role: 'KASIR'
  isActive: boolean
  createdAt: string
  store?: {
    id: string
    name: string
    code: string
  }
}

interface StoreData {
  id: string
  name: string
  code: string
}

export default function EmployeesPage() {
  const { data: session } = useSession()
  const [employees, setEmployees] = useState<EmployeeData[]>([])
  const [stores, setStores] = useState<StoreData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStore, setSelectedStore] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  useEffect(() => {
    fetchEmployees()
    fetchStores()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/admin/employees')
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/admin/stores')
      if (response.ok) {
        const data = await response.json()
        setStores(data)
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
    }
  }

  const handleToggleStatus = async (employeeId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/employees/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        fetchEmployees() // Refresh list
      }
    } catch (error) {
      console.error('Error updating employee status:', error)
    }
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) return

    try {
      const response = await fetch(`/api/admin/employees/${employeeId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchEmployees() // Refresh list
      }
    } catch (error) {
      console.error('Error deleting employee:', error)
    }
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      KASIR: 'bg-green-100 text-green-800'
    }
    return styles[role as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getRoleLabel = (role: string) => {
    const labels = {
      KASIR: 'Kasir'
    }
    return labels[role as keyof typeof labels] || role
  }

  // Filter employees based on search term, store, and status
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStore = selectedStore === '' || 
                        (selectedStore === 'all' && !employee.store) ||
                        employee.store?.id === selectedStore
    
    const matchesStatus = selectedStatus === '' ||
                         (selectedStatus === 'active' && employee.isActive) ||
                         (selectedStatus === 'inactive' && !employee.isActive)
    
    return matchesSearch && matchesStore && matchesStatus
  })

  if (loading) {
    return (
      <DashboardLayout title="Manajemen Karyawan">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  const kasirCount = employees.filter(emp => emp.role === 'KASIR').length
  const activeCount = employees.filter(emp => emp.isActive).length
  const filteredActiveCount = filteredEmployees.filter(emp => emp.isActive).length
  const filteredKasirCount = filteredEmployees.filter(emp => emp.role === 'KASIR').length

  return (
    <DashboardLayout title="Manajemen Karyawan">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Karyawan</h1>
            <p className="text-gray-600">Kelola akun Kasir</p>
          </div>
          <Link
            href="/admin/employees/add"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Karyawan
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="storeFilter" className="block text-sm font-medium text-gray-700 mb-2">Toko</label>
              <select
                id="storeFilter"
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Pilih toko"
                aria-label="Filter berdasarkan toko"
              >
                <option value="">Semua Toko</option>
                <option value="all">Semua Toko (Unassigned)</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name} ({store.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                id="statusFilter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Pilih status"
                aria-label="Filter berdasarkan status"
              >
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Non-Aktif</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Karyawan</p>
                <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
                <p className="text-xs text-gray-500">Semua karyawan</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Filter className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Filtered Results</p>
                <p className="text-2xl font-bold text-gray-900">{filteredEmployees.length}</p>
                <p className="text-xs text-gray-500">Hasil filter</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktif</p>
                <p className="text-2xl font-bold text-gray-900">{filteredActiveCount}</p>
                <p className="text-xs text-gray-500">dari {activeCount} total</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Store className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Kasir</p>
                <p className="text-2xl font-bold text-gray-900">{filteredKasirCount}</p>
                <p className="text-xs text-gray-500">dari {kasirCount} total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Employees List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Daftar Karyawan</h2>
              <p className="text-sm text-gray-500">
                Menampilkan {filteredEmployees.length} dari {employees.length} karyawan
              </p>
            </div>
            {(searchTerm || selectedStore || selectedStatus) && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedStore('')
                  setSelectedStatus('')
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Reset Filter
              </button>
            )}
          </div>
          
          {filteredEmployees.length === 0 ? (
            <div className="p-12 text-center">
              {employees.length === 0 ? (
                <>
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Karyawan</h3>
                  <p className="text-gray-600 mb-4">Mulai dengan menambahkan karyawan pertama Anda</p>
                  <Link
                    href="/admin/employees/add"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Karyawan Pertama
                  </Link>
                </>
              ) : (
                <>
                  <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Hasil</h3>
                  <p className="text-gray-600 mb-4">Tidak ada karyawan yang sesuai dengan filter yang dipilih</p>
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedStore('')
                      setSelectedStatus('')
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 inline-flex items-center"
                  >
                    Reset Filter
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Karyawan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Toko
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bergabung
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {employee.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {employee.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(employee.role)}`}>
                          {getRoleLabel(employee.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {employee.store ? (
                          <div className="text-sm text-gray-900">
                            <div className="font-medium">{employee.store.name}</div>
                            <div className="text-gray-500">({employee.store.code})</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 italic">Semua Toko</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(employee.id, employee.isActive)}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                            employee.isActive 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {employee.isActive ? 'Aktif' : 'Non-Aktif'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(employee.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/employees/${employee.id}/edit`}
                            className="text-yellow-600 hover:text-yellow-900 p-1"
                            title="Edit Karyawan"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Hapus Karyawan"
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

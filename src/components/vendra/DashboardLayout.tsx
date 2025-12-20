'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { VendraLogoSidebar } from './VendraLogo'
import StorageUsageCard from './StorageUsageCard'
import SubscriptionLimitsCard from './SubscriptionLimitsCard'
import { 
  Users, 
  Package, 
  Store, 
  FileText, 
  Upload, 
  Settings, 
  X, 
  BarChart3, 
  History,
  LayoutDashboard,
  TrendingUp,
  Bot,
  UserCheck,
  LogOut,
  Menu,
  User,
  Calendar,
  Lock
} from 'lucide-react'
import { useState } from 'react'
import { UserRole } from '@prisma/client'

interface NavigationItem {
  name: string
  href: string
  icon: any
  current?: boolean
  disabled?: boolean
  locked?: boolean
}

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Check if user needs verification or approval
  const needsVerification = !session.user.isVerified
  const needsApproval = session.user.status === 'PENDING'
  const isRejected = session.user.status === 'REJECTED'

  const handleSignOut = async () => {
    try {
      // Clear localStorage and sessionStorage
      localStorage.clear()
      sessionStorage.clear()
      
      // Delete all cookies explicitly
      const deleteCookie = (name: string) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
      }
      
      // Delete NextAuth cookies
      deleteCookie('next-auth.session-token')
      deleteCookie('__Secure-next-auth.session-token')
      deleteCookie('next-auth.csrf-token')
      deleteCookie('__Host-next-auth.csrf-token')
      deleteCookie('next-auth.callback-url')
      deleteCookie('__Secure-next-auth.callback-url')
      
      // Call logout API
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      })
      
      // SignOut from NextAuth
      await signOut({ 
        redirect: false,
        callbackUrl: '/auth/signin'
      })
      
      // Force clear all cookies again
      document.cookie.split(";").forEach((c) => {
        const name = c.split("=")[0].trim()
        deleteCookie(name)
      })
      
      // Wait to ensure everything is cleared
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Force hard redirect (bypass cache)
      window.location.replace('/auth/signin')
      
    } catch (error) {
      console.error('Logout error:', error)
      // Emergency fallback
      localStorage.clear()
      sessionStorage.clear()
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
      })
      window.location.replace('/auth/signin')
    }
  }

  // Show verification/approval notifications for non-SuperAdmin users
  if (session.user.role !== UserRole.SUPERADMIN && (needsVerification || needsApproval || isRejected)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          {isRejected && (
            <>
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Akun Ditolak
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Maaf, pendaftaran akun Anda telah ditolak oleh administrator. 
                Silakan hubungi customer service untuk informasi lebih lanjut.
              </p>
              <button
                onClick={handleSignOut}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                Keluar
              </button>
            </>
          )}
          
          {needsApproval && !isRejected && (
            <>
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
                <UserCheck className="w-6 h-6 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Menunggu Persetujuan
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Akun Anda sedang dalam proses review oleh administrator. 
                Anda akan mendapat notifikasi email setelah akun disetujui.
              </p>
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Status:</strong> Menunggu Persetujuan<br/>
                    <strong>Email:</strong> {session.user.email}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Keluar
                </button>
              </div>
            </>
          )}

          {needsVerification && !needsApproval && !isRejected && (
            <>
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-orange-100 rounded-full mb-4">
                <User className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Verifikasi Email Diperlukan
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Silakan verifikasi email Anda terlebih dahulu. 
                Cek inbox atau folder spam untuk link verifikasi.
              </p>
              <div className="space-y-3">
                <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                  <p className="text-sm text-orange-800">
                    <strong>Email:</strong> {session.user.email}<br/>
                    <strong>Status:</strong> Belum Terverifikasi
                  </p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/auth/resend-otp', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          email: session.user.email
                        }),
                      })

                      const data = await response.json()

                      if (response.ok) {
                        alert('Email verifikasi berhasil dikirim ulang! Silakan cek inbox Anda.')
                        // Redirect to OTP verification page
                        router.push(`/auth/verify-otp?email=${encodeURIComponent(session.user.email)}`)
                      } else {
                        // If user is already verified, refresh the page to update session
                        if (data.message?.includes('sudah terverifikasi')) {
                          alert('User sudah terverifikasi! Halaman akan dimuat ulang.')
                          window.location.reload()
                        } else {
                          alert(data.message || 'Gagal mengirim email verifikasi')
                        }
                      }
                    } catch (error) {
                      console.error('Resend OTP error:', error)
                      alert('Terjadi kesalahan, silakan coba lagi')
                    }
                  }}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
                >
                  Kirim Ulang Email Verifikasi
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Keluar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  const getDefaultRoute = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPERADMIN: return '/superadmin'
      case UserRole.OWNER:
      case UserRole.ADMIN: return '/admin'
      case UserRole.KASIR: return '/kasir'
      default: return '/dashboard'
    }
  }

  const getDashboardPath = () => getDefaultRoute(session.user.role)
  const userRole = session.user.role

    const getNavigationItems = (): NavigationItem[] => {
      const baseItems: NavigationItem[] = [
        { name: 'Dashboard', href: getDashboardPath(), icon: LayoutDashboard }
      ]

      switch (userRole) {
        case UserRole.SUPERADMIN:
          return [
            ...baseItems,
            { name: 'User Management', href: '/superadmin/user-management', icon: UserCheck },
            { name: 'Manajemen Upgrade', href: '/superadmin/upgrades', icon: TrendingUp },
            { name: 'Manajemen Berlangganan', href: '/superadmin/subscriptions', icon: Calendar },
            { name: 'Pengaturan Profil', href: '/superadmin/profile', icon: User },
            { name: 'Analisis Segmentasi RFM', href: '/superadmin/rfm-analysis', icon: TrendingUp, current: pathname === '/superadmin/rfm-analysis' },
            { name: 'Data All', href: '/superadmin/data', icon: FileText, current: pathname === '/superadmin/data' },
            { name: 'AI Assistant', href: '/superadmin/ai-assistant', icon: Bot, current: pathname === '/superadmin/ai-assistant' }
          ]
        
        case UserRole.OWNER:
        case UserRole.ADMIN:
          const subscriptionTier = session?.user?.subscriptionTier || 'FREE'
          const isFree = subscriptionTier === 'FREE'
          
          return [
            ...baseItems,
            { name: 'Manajemen Produk', href: '/admin/products', icon: Package, current: pathname === '/admin/products' },
            { name: 'Manajemen Toko', href: '/admin/stores', icon: Store, current: pathname === '/admin/stores' },
            { name: 'Manajemen Karyawan', href: '/admin/employees', icon: Users, current: pathname === '/admin/employees' },
            { name: 'Customer & Member', href: '/admin/customers', icon: Users, current: pathname === '/admin/customers' },
            { 
              name: 'Analisis Segmentasi RFM', 
              href: isFree ? '#' : '/admin/rfm-analysis', 
              icon: isFree ? Lock : TrendingUp, 
              current: pathname === '/admin/rfm-analysis',
              disabled: isFree,
              locked: isFree
            },
            { name: 'Data All', href: '/admin/data', icon: FileText, current: pathname === '/admin/data' },
            { name: 'Import Data CSV', href: '/admin/import', icon: Upload, current: pathname === '/admin/import' },
            { 
              name: 'AI Assistant', 
              href: isFree ? '#' : '/admin/ai-assistant', 
              icon: isFree ? Lock : Bot, 
              current: pathname === '/admin/ai-assistant',
              disabled: isFree,
              locked: isFree
            },
            { name: 'Settings', href: '/admin/settings', icon: Settings }
          ]
        
        case UserRole.KASIR:
          return [
            ...baseItems,
            { name: 'History Transaksi', href: '/kasir/history', icon: History, current: pathname === '/kasir/history' }
          ]
        
        default:
          return baseItems
      }
    }

  const navigationItems = getNavigationItems()

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0`}>
        
        <div className="flex items-center h-16 px-6 border-b space-x-3">
          <VendraLogoSidebar />
          <div className="flex-1">
            <div className="text-sm font-semibold text-blue-600">Welcome</div>
            <div className="text-xs text-slate-500">to Dashboard</div>
          </div>
        </div>


        {/* Subscription Status Card for FREE users (not for SuperAdmin) */}
        {session.user?.subscriptionTier === 'FREE' && session.user?.role !== UserRole.SUPERADMIN && (
          <div className="mx-4 mt-4 mb-2">
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
                  Paket Aktif
                </span>
              </div>
              <div className="text-sm font-bold text-gray-900 mb-1">FREE Plan</div>
              <div className="text-xs text-gray-600 mb-3">
                • Maksimal 1 toko<br/>
                • Maksimal 1 kasir<br/>
                • Tanpa fitur AI<br/>
                • Storage 100GB<br/>
                • Aktif selamanya
              </div>
              <Link
                href="/admin/upgrade"
                className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center text-xs font-semibold py-2 px-3 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Upgrade Sekarang
              </Link>
            </div>
          </div>
        )}


        {/* Navigation */}
        <nav className="mt-4 flex-1">
          {navigationItems.map((item, index) => (
            <Link
              key={`nav-${userRole}-${item.href}-${index}`}
              href={item.href}
              className={`flex items-center px-6 py-3 text-sm ${
                item.disabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={(e) => {
                if (item.disabled) {
                  e.preventDefault()
                  alert('Fitur ini hanya tersedia untuk pengguna berbayar. Upgrade paket Anda untuk mengakses fitur ini.')
                }
              }}
            >
              <item.icon className="mr-3 h-5 w-5" />
              <span className="flex-1">{item.name}</span>
              {item.locked && (
                <Lock className="h-4 w-4 text-gray-400 ml-2" />
              )}
            </Link>
          ))}
        </nav>

        {/* Sign out - moved to bottom of sidebar */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="ml-2 text-xl font-semibold text-gray-900">{title}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Subscription Status for Admin/Owner */}
              {(session?.user?.role === UserRole.OWNER || session?.user?.role === UserRole.ADMIN) && (
                <div className="flex items-center space-x-3">
                  {session.user.subscriptionTier === 'FREE' ? (
                    <div className="flex items-center space-x-2 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span className="text-xs font-medium text-orange-700">FREE Plan</span>
                      <span className="text-xs text-orange-600">Aktif Selamanya</span>
                    </div>
                  ) : (
                    session.user.company?.subscriptionExpiry && (
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${
                        new Date(session.user.company.subscriptionExpiry) < new Date()
                          ? 'bg-red-50 border-red-200'
                          : Math.ceil((new Date(session.user.company.subscriptionExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 7
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-green-50 border-green-200'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          new Date(session.user.company.subscriptionExpiry).getTime() - new Date().getTime() <= 0
                            ? 'bg-red-400'
                            : Math.ceil((new Date(session.user.company.subscriptionExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 7
                            ? 'bg-yellow-400'
                            : 'bg-green-400'
                        }`}></div>
                        <span className={`text-xs font-medium ${
                          new Date(session.user.company.subscriptionExpiry).getTime() - new Date().getTime() <= 0
                            ? 'text-red-700'
                            : Math.ceil((new Date(session.user.company.subscriptionExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 7
                            ? 'text-yellow-700'
                            : 'text-green-700'
                        }`}>
                          {session.user.subscriptionTier} Plan
                        </span>
                        <span className={`text-xs ${
                          new Date(session.user.company.subscriptionExpiry) < new Date()
                            ? 'text-red-600'
                            : Math.ceil((new Date(session.user.company.subscriptionExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 7
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}>
                          {new Date(session.user.company.subscriptionExpiry) < new Date()
                            ? 'Expired'
                            : `${Math.ceil((new Date(session.user.company.subscriptionExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} hari`
                          }
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}

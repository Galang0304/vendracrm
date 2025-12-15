'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Shield, ArrowLeft, Home } from 'lucide-react'
import { VendraLogoAuth } from '@/components/vendra/VendraLogo'

export default function UnauthorizedPage() {
  const { data: session } = useSession()

  const getDashboardPath = () => {
    if (!session?.user.role) return '/'
    
    const getRedirectPath = (role: string) => {
      switch (role) {
        case 'SUPERADMIN': return '/superadmin'
        case 'OWNER':
        case 'ADMIN': return '/admin'
        case 'KASIR': return '/kasir'
        default: return '/'
      }
    }

    return getRedirectPath(session.user.role)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <VendraLogoAuth />
          </div>

          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-red-500" />
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>

          {/* User Info */}
          {session?.user && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Logged in as:</p>
              <p className="font-medium text-gray-900">{session.user.name}</p>
              <p className="text-sm text-gray-500">{session.user.role}</p>
              {session.user.companyName && (
                <p className="text-sm text-gray-500">{session.user.companyName}</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href={getDashboardPath()}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-teal-600 transition-all inline-flex items-center justify-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Link>
            
            <Link
              href="/"
              className="w-full border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-gray-400 transition-all inline-flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Need help?</strong> Contact your system administrator or SuperAdmin for access permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

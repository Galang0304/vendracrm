'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Key, 
  User,
  Database,
  Settings
} from 'lucide-react'

export default function SetupPage() {
  const [superAdminExists, setSuperAdminExists] = useState<boolean | null>(null)
  const [superAdminData, setSuperAdminData] = useState<any>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    checkSuperAdmin()
  }, [])

  const checkSuperAdmin = async () => {
    try {
      const response = await fetch('/api/setup/superadmin')
      const data = await response.json()
      
      setSuperAdminExists(data.exists)
      if (data.exists) {
        setSuperAdminData(data.superAdmin)
      }
    } catch (error) {
      console.error('Error checking SuperAdmin:', error)
      setError('Failed to check SuperAdmin status')
    }
  }

  const createSuperAdmin = async () => {
    setIsCreating(true)
    setError('')

    try {
      const response = await fetch('/api/setup/superadmin', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSetupComplete(true)
        setSuperAdminExists(true)
        checkSuperAdmin() // Refresh data
      } else {
        setError(data.message || 'Failed to create SuperAdmin')
      }
    } catch (error) {
      console.error('Error creating SuperAdmin:', error)
      setError('Failed to create SuperAdmin')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Settings className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendra CRM Setup</h1>
          <p className="text-gray-600">
            Initial system setup and SuperAdmin configuration
          </p>
        </div>

        {/* Setup Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* SuperAdmin Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-purple-600" />
              SuperAdmin Status
            </h2>

            {superAdminExists === null ? (
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-gray-600">Checking SuperAdmin status...</span>
              </div>
            ) : superAdminExists ? (
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-green-800 font-medium">SuperAdmin exists</p>
                    <p className="text-green-600 text-sm">System is ready to use</p>
                  </div>
                </div>

                {superAdminData && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">SuperAdmin Details:</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Email:</strong> {superAdminData.email}</p>
                      <p><strong>Name:</strong> {superAdminData.name}</p>
                      <p><strong>Status:</strong> {superAdminData.status}</p>
                      <p><strong>Created:</strong> {new Date(superAdminData.createdAt).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-medium text-blue-900 mb-2">Login Credentials:</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Email:</strong> <code className="bg-blue-100 px-2 py-1 rounded">superadmin@vendra.com</code></p>
                    <p><strong>Password:</strong> <code className="bg-blue-100 px-2 py-1 rounded">superadmin123</code></p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-yellow-800 font-medium">SuperAdmin not found</p>
                    <p className="text-yellow-600 text-sm">System needs initial setup</p>
                  </div>
                </div>

                <button
                  onClick={createSuperAdmin}
                  disabled={isCreating}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating SuperAdmin...
                    </>
                  ) : (
                    <>
                      <User className="h-5 w-5 mr-2" />
                      Create SuperAdmin
                    </>
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {setupComplete && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 font-medium">✅ SuperAdmin created successfully!</p>
                <p className="text-green-600 text-sm mt-1">You can now login with the credentials above.</p>
              </div>
            )}
          </div>

          {/* Setup Steps */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Setup Steps</h3>
            <div className="space-y-3">
              <div className={`flex items-center p-3 rounded-lg ${superAdminExists ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${superAdminExists ? 'bg-green-600' : 'bg-gray-400'}`}>
                  {superAdminExists ? (
                    <CheckCircle className="h-4 w-4 text-white" />
                  ) : (
                    <span className="text-white text-xs">1</span>
                  )}
                </div>
                <span className={superAdminExists ? 'text-green-800' : 'text-gray-600'}>
                  Create SuperAdmin user
                </span>
              </div>

              <div className="flex items-center p-3 rounded-lg bg-gray-50">
                <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center mr-3">
                  <span className="text-white text-xs">2</span>
                </div>
                <span className="text-gray-600">Login to SuperAdmin dashboard</span>
              </div>

              <div className="flex items-center p-3 rounded-lg bg-gray-50">
                <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center mr-3">
                  <span className="text-white text-xs">3</span>
                </div>
                <span className="text-gray-600">Configure system settings</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {superAdminExists && (
            <div className="border-t pt-6 mt-6">
              <div className="flex space-x-4">
                <a
                  href="/auth/signin"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-center"
                >
                  Go to Login
                </a>
                <a
                  href="/superadmin"
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 text-center"
                >
                  SuperAdmin Dashboard
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Vendra AI CRM - Smart Business Management System</p>
        </div>
      </div>
    </div>
  )
}

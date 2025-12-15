'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Key, 
  Copy, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Shield,
  ExternalLink,
  Download
} from 'lucide-react'

export default function ApiKeyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [apiKeyExpiry, setApiKeyExpiry] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/login')
      return
    }

    fetchApiKey()
  }, [session, status, router])

  const fetchApiKey = async () => {
    try {
      const response = await fetch('/api/auth/my-api-key')
      if (response.ok) {
        const data = await response.json()
        setApiKey(data.apiKey)
        setApiKeyExpiry(data.apiKeyExpiry)
      } else {
        console.error('Failed to fetch API key')
      }
    } catch (error) {
      console.error('Error fetching API key:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyApiKey = async () => {
    if (!apiKey) return

    try {
      await navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying API key:', error)
    }
  }

  const maskApiKey = (key: string): string => {
    if (key.length < 12) return key
    const start = key.substring(0, 8)
    const end = key.substring(key.length - 4)
    const middle = '*'.repeat(key.length - 12)
    return `${start}${middle}${end}`
  }

  const isExpired = (expiry: string | null): boolean => {
    if (!expiry) return true
    return new Date() > new Date(expiry)
  }

  const downloadApiKeyInfo = () => {
    if (!apiKey) return

    const info = {
      apiKey: apiKey,
      expiry: apiKeyExpiry,
      generatedAt: new Date().toISOString(),
      userId: session?.user.id,
      userEmail: session?.user.email,
      instructions: {
        usage: "Include this API key in your requests as 'Authorization: Bearer YOUR_API_KEY'",
        baseUrl: "https://your-api-domain.com/api",
        documentation: "https://docs.your-api-domain.com"
      }
    }

    const blob = new Blob([JSON.stringify(info, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `api-key-${session?.user.email}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Key className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your API Key</h1>
          <p className="text-gray-600">
            Gunakan API key ini untuk mengakses layanan Vendra CRM API
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* API Key Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">API Key Details</h2>
                {apiKey && (
                  <div className="flex items-center space-x-2">
                    {isExpired(apiKeyExpiry) ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Expired
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    )}
                  </div>
                )}
              </div>

              {apiKey ? (
                <div className="space-y-6">
                  {/* API Key Display */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg p-3">
                        <code className="text-sm font-mono text-gray-900 break-all">
                          {isVisible ? apiKey : maskApiKey(apiKey)}
                        </code>
                      </div>
                      <button
                        onClick={() => setIsVisible(!isVisible)}
                        className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg"
                        title={isVisible ? 'Hide API Key' : 'Show API Key'}
                      >
                        {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={copyApiKey}
                        className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg"
                        title="Copy API Key"
                      >
                        <Copy className="h-5 w-5" />
                      </button>
                    </div>
                    {copied && (
                      <p className="text-sm text-green-600 mt-2">API Key copied to clipboard!</p>
                    )}
                  </div>

                  {/* Expiry Date */}
                  {apiKeyExpiry && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(apiKeyExpiry).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={downloadApiKeyInfo}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Info
                    </button>
                    <button
                      onClick={() => window.open('https://docs.vendra.com', '_blank')}
                      className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      API Documentation
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No API Key Available</h3>
                  <p className="text-gray-600 mb-4">
                    Your API key will be generated after your account is approved by SuperAdmin.
                  </p>
                  <div className="text-sm text-gray-500">
                    Status: {session?.user.status || 'Pending'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Security Tips */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-600" />
                Security Tips
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                  <p>Jangan pernah share API key Anda dengan orang lain</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                  <p>Simpan API key di environment variables, bukan di code</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                  <p>Monitor penggunaan API key secara berkala</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                  <p>Hubungi support jika API key terkompromi</p>
                </div>
              </div>
            </div>

            {/* Usage Example */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Example</h3>
              <div className="bg-gray-900 rounded-lg p-4 text-sm">
                <code className="text-green-400">
                  {`curl -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     https://api.vendra.com/v1/products`}
                </code>
              </div>
            </div>

            {/* Support */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-sm text-blue-700 mb-4">
                Jika Anda membutuhkan bantuan dengan API integration, hubungi tim support kami.
              </p>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Contact Support →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

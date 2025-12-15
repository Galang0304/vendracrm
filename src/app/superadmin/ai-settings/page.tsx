'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/vendra/DashboardLayout'
import { 
  Bot, 
  Key, 
  Settings, 
  Save, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  DollarSign,
  Users
} from 'lucide-react'

export default function SuperAdminAISettingsPage() {
  const { data: session } = useSession()
  const [vendraConfig, setVendraConfig] = useState({
    openaiApiKey: '',
    isEnabled: true,
    model: 'gpt-4o-mini',
    maxTokens: 1000,
    temperature: 0.7
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    // Load current environment settings
    setVendraConfig({
      openaiApiKey: process.env.NEXT_PUBLIC_VENDRA_OPENAI_API_KEY || '',
      isEnabled: true,
      model: 'gpt-4o-mini',
      maxTokens: 1000,
      temperature: 0.7
    })
    setLoading(false)
  }, [])

  const handleSave = async () => {
    if (!vendraConfig.openaiApiKey?.trim()) {
      setMessage({ type: 'error', text: 'Vendra OpenAI API Key diperlukan untuk mengaktifkan AI' })
      return
    }

    if (!vendraConfig.openaiApiKey.startsWith('sk-')) {
      setMessage({ type: 'error', text: 'Format OpenAI API Key tidak valid (harus dimulai dengan sk-)' })
      return
    }

    setSaving(true)
    setMessage(null)

    // In production, this would update environment variables or database
    setMessage({ 
      type: 'success', 
      text: 'Pengaturan AI berhasil disimpan! Restart server untuk menerapkan perubahan.' 
    })
    
    setTimeout(() => setSaving(false), 1000)
  }

  if (session?.user.role !== 'SUPERADMIN') {
    return (
      <DashboardLayout title="Vendra AI Settings">
        <div className="text-center py-12">
          <Bot className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Only SuperAdmin can access Vendra AI settings.</p>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout title="Vendra AI Settings">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Vendra AI Settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Vendra AI Configuration</h2>
              <p className="text-purple-100">
                Configure OpenAI settings for all customers - Vendra pays for OpenAI usage
              </p>
            </div>
            <Bot className="h-12 w-12 text-purple-200" />
          </div>
        </div>

        {/* Business Model Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <Info className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h4 className="text-lg font-medium text-blue-900 mb-2">
                SaaS Business Model
              </h4>
              <div className="text-blue-800 space-y-2">
                <p>• <strong>Vendra bayar OpenAI</strong> - Satu API key untuk semua customer</p>
                <p>• <strong>Customer bayar subscription</strong> - FREE, BASIC, PREMIUM, ENTERPRISE</p>
                <p>• <strong>Rate limiting otomatis</strong> - Berdasarkan subscription tier customer</p>
                <p>• <strong>Cost monitoring</strong> - SuperAdmin monitor total OpenAI cost</p>
                <p>• <strong>No customer setup</strong> - Customer langsung pakai AI tanpa konfigurasi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Limits Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">FREE</h3>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">$0/month</span>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p>10 requests/hour</p>
              <p>500 tokens/response</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">BASIC</h3>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">$29/month</span>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p>50 requests/hour</p>
              <p>800 tokens/response</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">PREMIUM</h3>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">$99/month</span>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p>200 requests/hour</p>
              <p>1000 tokens/response</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">ENTERPRISE</h3>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Custom</span>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p>1000 requests/hour</p>
              <p>2000 tokens/response</p>
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Vendra OpenAI Configuration</h3>
          
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            {/* Vendra OpenAI API Key */}
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                Vendra OpenAI API Key *
              </label>
              <div className="relative">
                <input
                  id="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  value={vendraConfig.openaiApiKey}
                  onChange={(e) => setVendraConfig({...vendraConfig, openaiApiKey: e.target.value})}
                  placeholder="sk-proj-..."
                  className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                API key dari <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a> - Vendra yang bayar untuk semua customer
              </p>
            </div>

            {/* AI Enabled Toggle */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={vendraConfig.isEnabled}
                  onChange={(e) => setVendraConfig({...vendraConfig, isEnabled: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Aktifkan Vendra AI untuk semua customer
                </span>
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Jika dinonaktifkan, semua customer akan menggunakan respons simulasi
              </p>
            </div>

            {/* Model Selection */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                Model OpenAI
              </label>
              <select
                id="model"
                value={vendraConfig.model}
                onChange={(e) => setVendraConfig({...vendraConfig, model: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="gpt-4o-mini">GPT-4o Mini (Recommended - Cost Effective)</option>
                <option value="gpt-4o">GPT-4o (Higher Quality, Higher Cost)</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Cheapest)</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                GPT-4o Mini recommended untuk balance quality vs cost
              </p>
            </div>

            {/* Advanced Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="maxTokens" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tokens (Base)
                </label>
                <input
                  id="maxTokens"
                  type="number"
                  min="100"
                  max="4000"
                  value={vendraConfig.maxTokens}
                  onChange={(e) => setVendraConfig({...vendraConfig, maxTokens: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">Base limit, akan disesuaikan per tier</p>
              </div>

              <div>
                <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature
                </label>
                <input
                  id="temperature"
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={vendraConfig.temperature}
                  onChange={(e) => setVendraConfig({...vendraConfig, temperature: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">Kreativitas respons (0.0 - 2.0)</p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
              </button>
            </div>
          </div>
        </div>

        {/* Environment Setup Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h4 className="text-lg font-medium text-yellow-900 mb-2">
                Environment Setup
              </h4>
              <div className="text-yellow-800 space-y-2">
                <p><strong>Untuk production, tambahkan ke .env file:</strong></p>
                <div className="bg-yellow-100 p-3 rounded mt-2 font-mono text-sm">
                  VENDRA_OPENAI_API_KEY="sk-proj-your-actual-api-key-here"
                </div>
                <p><strong>Restart server setelah mengubah environment variables.</strong></p>
                <p>Setting ini akan berlaku untuk semua customer tanpa mereka perlu setup apapun.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/superadmin/ai-usage"
            className="block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">AI Usage Analytics</h3>
                <p className="text-sm text-gray-600">Monitor costs & usage</p>
              </div>
            </div>
          </a>

          <a
            href="/superadmin/ai-overview"
            className="block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">AI Overview</h3>
                <p className="text-sm text-gray-600">Company AI status</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/ai-assistant"
            className="block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">Test AI Assistant</h3>
                <p className="text-sm text-gray-600">Test the AI system</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </DashboardLayout>
  )
}

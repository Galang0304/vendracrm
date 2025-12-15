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
  Zap
} from 'lucide-react'

interface AISettings {
  openaiApiKey: string | null
  aiEnabled: boolean
  model: string
  maxTokens: number
  temperature: number
}

export default function AISettingsPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<AISettings>({
    openaiApiKey: '',
    aiEnabled: false,
    model: 'gpt-4o-mini',
    maxTokens: 1000,
    temperature: 0.7
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/ai-settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
        setHasApiKey(data.hasApiKey)
      }
    } catch (error) {
      console.error('Error fetching AI settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings.openaiApiKey?.trim()) {
      setMessage({ type: 'error', text: 'OpenAI API Key diperlukan untuk mengaktifkan AI' })
      return
    }

    // Clean API key before validation
    let cleanKey = settings.openaiApiKey.trim()
    if (cleanKey.startsWith('sk-sk-')) {
      cleanKey = cleanKey.replace(/^sk-sk-/, 'sk-')
      setSettings({...settings, openaiApiKey: cleanKey})
    }

    if (!cleanKey.startsWith('sk-')) {
      setMessage({ type: 'error', text: 'Format OpenAI API Key tidak valid (harus dimulai dengan sk-)' })
      return
    }

    if (cleanKey.length < 20) {
      setMessage({ type: 'error', text: 'OpenAI API Key terlalu pendek, pastikan key lengkap' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/ai-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Pengaturan AI berhasil disimpan!' })
        setHasApiKey(true)
        // Hide API key after saving for security
        setShowApiKey(false)
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.message || 'Gagal menyimpan pengaturan' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat menyimpan pengaturan' })
    } finally {
      setSaving(false)
    }
  }

  if (session?.user.role !== 'ADMIN' && session?.user.role !== 'OWNER' && session?.user.role !== 'SUPERADMIN') {
    return (
      <DashboardLayout title="AI Settings">
        <div className="text-center py-12">
          <Bot className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Only Admin, Owner, and SuperAdmin can access AI settings.</p>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout title="AI Settings">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="AI Settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">AI Assistant Settings</h2>
              <p className="text-blue-100">
                Konfigurasi AI Assistant dengan OpenAI untuk analisis bisnis yang lebih canggih
              </p>
            </div>
            <Bot className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        {/* AI Status Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Status AI Assistant</h3>
            <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              hasApiKey && settings.aiEnabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {hasApiKey && settings.aiEnabled ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  AI Aktif
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  AI Tidak Aktif
                </>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Key className="h-5 w-5 text-gray-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">API Key</span>
              </div>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {hasApiKey ? 'Configured' : 'Not Set'}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-gray-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Model</span>
              </div>
              <p className="text-lg font-bold text-gray-900 mt-1">{settings.model}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-gray-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Max Tokens</span>
              </div>
              <p className="text-lg font-bold text-gray-900 mt-1">{settings.maxTokens}</p>
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Konfigurasi OpenAI</h3>
          
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
            {/* OpenAI API Key */}
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI API Key *
              </label>
              <div className="relative">
                <input
                  id="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  value={settings.openaiApiKey || ''}
                  onChange={(e) => setSettings({...settings, openaiApiKey: e.target.value})}
                  placeholder="sk-..."
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
                Dapatkan API key dari <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a>
              </p>
            </div>

            {/* AI Enabled Toggle */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.aiEnabled}
                  onChange={(e) => setSettings({...settings, aiEnabled: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Aktifkan AI Assistant dengan OpenAI
                </span>
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Jika dinonaktifkan, sistem akan menggunakan respons simulasi
              </p>
            </div>

            {/* Model Selection */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                Model OpenAI
              </label>
              <select
                id="model"
                value={settings.model}
                onChange={(e) => setSettings({...settings, model: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="gpt-4o-mini">GPT-4o Mini (Recommended)</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>

            {/* Advanced Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="maxTokens" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tokens
                </label>
                <input
                  id="maxTokens"
                  type="number"
                  min="100"
                  max="4000"
                  value={settings.maxTokens}
                  onChange={(e) => setSettings({...settings, maxTokens: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">Maksimal token untuk respons AI</p>
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
                  value={settings.temperature}
                  onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})}
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
                {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </div>
          </div>
        </div>

        {/* Troubleshooting Card */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h4 className="text-lg font-medium text-yellow-900 mb-2">
                Troubleshooting AI Issues
              </h4>
              <div className="text-yellow-800 space-y-2">
                <p><strong>Error 401 - Incorrect API key:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Pastikan API key dimulai dengan "sk-" (bukan "sk-sk-")</li>
                  <li>Copy API key langsung dari <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI Platform</a></li>
                  <li>Pastikan API key memiliki credit/balance yang cukup</li>
                  <li>Jangan ada spasi di awal atau akhir API key</li>
                </ul>
                <p><strong>AI tidak merespons:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Pastikan "Aktifkan AI Assistant" sudah dicentang</li>
                  <li>Coba refresh halaman AI Assistant setelah menyimpan settings</li>
                  <li>Jika masih error, sistem akan otomatis fallback ke respons simulasi</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <Info className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h4 className="text-lg font-medium text-blue-900 mb-2">
                Tentang AI Assistant
              </h4>
              <div className="text-blue-800 space-y-2">
                <p>• AI Assistant menggunakan OpenAI GPT untuk memberikan analisis bisnis yang lebih akurat</p>
                <p>• Setiap company memiliki konfigurasi AI terpisah dengan API key masing-masing</p>
                <p>• Respons AI akan disesuaikan dengan role Anda (SuperAdmin, Owner, Admin)</p>
                <p>• Jika AI tidak aktif, sistem akan menggunakan respons simulasi sebagai fallback</p>
                <p>• API key disimpan dengan aman dan hanya digunakan untuk generate respons AI</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

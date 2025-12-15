'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/vendra/DashboardLayout'
import { Check, Crown, Zap, Upload, CreditCard } from 'lucide-react'

export default function UpgradePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<'BASIC' | 'PREMIUM' | 'ENTERPRISE'>('BASIC')
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const plans = {
    BASIC: {
      name: 'Basic',
      price: 'Rp 200.000',
      period: '/bulan',
      icon: Crown,
      color: 'from-blue-500 to-blue-600',
      features: [
        'AI analisis limit 50%',
        '2000 data',
        '1/2 api',
        'Email Support'
      ]
    },
    PREMIUM: {
      name: 'Premium',
      price: 'Rp 500.000',
      period: '/bulan',
      icon: Crown,
      color: 'from-blue-600 to-purple-600',
      features: [
        'AI analisis limit 100%',
        '2000 data + akun kasir 3',
        'Manajer 3',
        'Priority Support'
      ]
    },
    ENTERPRISE: {
      name: 'Enterprise',
      price: 'Rp 1.500.000',
      period: '/bulan',
      icon: Zap,
      color: 'from-purple-600 to-pink-600',
      features: [
        'Tidak ada limit',
        'Semua akses',
        'Support prioritas',
        'Dedicated Manager'
      ]
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Ukuran file maksimal 5MB')
        return
      }
      setPaymentProof(file)
      setError('')
    }
  }

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!paymentProof) {
      setError('Silakan upload bukti pembayaran')
      setIsLoading(false)
      return
    }

    if (!paymentMethod) {
      setError('Silakan pilih metode pembayaran')
      setIsLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('paymentProof', paymentProof)
      formData.append('subscriptionTier', selectedPlan)
      formData.append('paymentMethod', paymentMethod)

      const response = await fetch('/api/admin/upgrade', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.message || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan, silakan coba lagi')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <DashboardLayout title="Upgrade Akun">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="p-4 bg-green-100 rounded-full">
                <Check className="h-12 w-12 text-green-600" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Permintaan Upgrade Terkirim!</h1>
            <p className="text-gray-600 mb-6">
              Terima kasih! Permintaan upgrade ke paket <strong>{plans[selectedPlan].name}</strong> Anda telah diterima. 
              Tim kami akan memverifikasi pembayaran dalam 1x24 jam.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-700 text-sm">
                <strong>Catatan:</strong> Anda akan menerima email konfirmasi setelah pembayaran diverifikasi. 
                Akun Anda akan otomatis di-upgrade dan fitur baru akan aktif.
              </p>
            </div>

            <button
              onClick={() => router.push('/admin')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Upgrade Akun">
      <div className="max-w-6xl mx-auto">
        {/* Current Plan Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Paket Saat Ini</h2>
              <p className="text-gray-600">FREE Plan - Fitur terbatas</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">FREE</div>
              <div className="text-sm text-gray-500">Aktif selamanya</div>
            </div>
          </div>
        </div>

        {/* Plan Selection */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {Object.entries(plans).map(([key, plan]) => {
            const PlanIcon = plan.icon
            const isSelected = selectedPlan === key
            
            return (
              <div
                key={key}
                onClick={() => setSelectedPlan(key as 'BASIC' | 'PREMIUM' | 'ENTERPRISE')}
                className={`relative bg-white rounded-2xl shadow-lg p-8 cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-blue-500 shadow-xl' : 'hover:shadow-xl'
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Dipilih
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${plan.color} mb-4`}>
                    <PlanIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Informasi Pembayaran</h3>
          
          <form onSubmit={handleUpgrade} className="space-y-6">
            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['BCA', 'MANDIRI', 'DANA', 'OVO'].map((method) => (
                  <label key={method} className="relative">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all ${
                      paymentMethod === method 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <CreditCard className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <div className="font-semibold text-gray-900">{method}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Instructions */}
            {paymentMethod && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Instruksi Pembayaran</h4>
                {(paymentMethod === 'BCA' || paymentMethod === 'MANDIRI') ? (
                  <>
                    <p className="text-blue-700 text-sm mb-2">
                      Transfer ke rekening {paymentMethod}: <strong>1234567890</strong>
                    </p>
                    <p className="text-blue-700 text-sm">
                      Atas nama: <strong>PT Vendra Technology</strong>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-blue-700 text-sm mb-2">
                      Transfer ke {paymentMethod}: <strong>081234567890</strong>
                    </p>
                    <p className="text-blue-700 text-sm">
                      Atas nama: <strong>Vendra Technology</strong>
                    </p>
                  </>
                )}
                <p className="text-blue-700 text-sm">
                  Jumlah: <strong>{plans[selectedPlan].price}</strong>
                </p>
              </div>
            )}

            {/* Upload Payment Proof */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Bukti Pembayaran
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="paymentProof"
                />
                <label
                  htmlFor="paymentProof"
                  className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                >
                  Klik untuk upload file
                </label>
                <p className="text-gray-500 text-sm mt-2">
                  Format: JPG, PNG, PDF (Maksimal 5MB)
                </p>
                {paymentProof && (
                  <p className="text-green-600 text-sm mt-2">
                    ✓ File terpilih: {paymentProof.name}
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Memproses...' : `Upgrade ke ${plans[selectedPlan].name}`}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}

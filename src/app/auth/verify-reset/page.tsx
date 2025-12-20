'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { VendraLogoAuth } from '@/components/vendra/VendraLogo'

function VerifyResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    } else {
      setError('Email tidak valid')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!otp || otp.length !== 6) {
      setError('Masukkan kode OTP 6 digit')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to reset password page with verified token
        router.push(`/auth/reset-password?token=${otp}&email=${encodeURIComponent(email)}`)
      } else {
        setError(data.message || 'Kode OTP tidak valid atau sudah kedaluwarsa')
      }
    } catch (error) {
      setError('Terjadi kesalahan, silakan coba lagi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        alert('Kode OTP baru telah dikirim ke email Anda')
      } else {
        setError('Gagal mengirim ulang kode OTP')
      }
    } catch (error) {
      setError('Terjadi kesalahan saat mengirim ulang OTP')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link
          href="/auth/forgot-password"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mb-6 flex justify-center">
              <VendraLogoAuth />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Verifikasi Kode OTP</h1>
            <p className="text-gray-600 mt-2">
              Masukkan kode 6 digit yang dikirim ke email Anda
            </p>
            {email && (
              <p className="text-sm text-blue-600 mt-1">{email}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Kode OTP
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-2xl font-mono tracking-widest"
                placeholder="000000"
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                Masukkan 6 digit kode yang dikirim ke email Anda
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Memverifikasi...' : 'Verifikasi Kode'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm mb-3">
              Tidak menerima kode?
            </p>
            <button
              onClick={handleResendOTP}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors disabled:opacity-50"
            >
              Kirim Ulang Kode OTP
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Tips:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• Kode OTP berlaku selama 1 jam</div>
              <div>• Cek folder spam jika email tidak masuk</div>
              <div>• Pastikan email yang dimasukkan benar</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyResetPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <VerifyResetForm />
    </Suspense>
  )
}

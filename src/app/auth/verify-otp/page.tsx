'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

function VerifyOTPForm() {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!otp || otp.length !== 6) {
      setError('Masukkan kode OTP 6 digit yang valid')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // OTP verified successfully, sign in the user
        const result = await signIn('credentials', {
          email,
          password: 'verified', // Special flag for verified users
          redirect: false,
        })

        if (result?.ok) {
          router.push('/admin')
        } else {
          setError('Gagal masuk setelah verifikasi')
        }
      } else {
        setError(data.message || 'Kode OTP tidak valid')
      }
    } catch (error) {
      console.error('Verify OTP error:', error)
      setError('Terjadi kesalahan, silakan coba lagi')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!email) {
      setError('Email tidak ditemukan')
      return
    }

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('Kode OTP baru telah dikirim ke email Anda')
        setError('')
      } else {
        setError(data.message || 'Gagal mengirim ulang kode OTP')
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      setError('Terjadi kesalahan, silakan coba lagi')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verifikasi Kode OTP
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Masukkan kode 6 digit yang dikirim ke email Anda
          </p>
          {email && (
            <p className="mt-1 text-center text-sm text-blue-600 font-medium">
              {email}
            </p>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="otp" className="sr-only">
              Kode OTP
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              maxLength={6}
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-center text-2xl font-mono tracking-widest"
              placeholder="000000"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                setOtp(value)
              }}
            />
            <p className="mt-2 text-xs text-gray-500 text-center">
              Masukkan kode yang dikirim ke email Anda
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Memverifikasi...' : 'Verifikasi Kode'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Tidak menerima kode?{' '}
              <button
                type="button"
                onClick={handleResendOTP}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Kirim Ulang Kode OTP
              </button>
            </p>
          </div>

          <div className="text-center">
            <Link
              href="/auth/signin"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              ← Kembali ke Login
            </Link>
          </div>
        </form>

        <div className="mt-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Tips:</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Cek folder spam jika email tidak masuk ke inbox</li>
                    <li>Kode OTP berlaku selama 10 menit</li>
                    <li>Jangan bagikan kode ini kepada siapa pun</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyOTP() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <VerifyOTPForm />
    </Suspense>
  )
}

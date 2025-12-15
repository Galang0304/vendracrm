'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, ArrowLeft, CheckCircle, Upload, Mail, CreditCard, Clock } from 'lucide-react'
import { VendraLogoAuth } from '@/components/vendra/VendraLogo'

export default function SignUpPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    companyEmail: '',
    phone: '',
    address: '',
    subscriptionTier: 'FREE'
  })
  const [otpData, setOtpData] = useState({
    otp: '',
    isVerified: false
  })
  const [paymentData, setPaymentData] = useState({
    paymentProof: null as File | null,
    paymentMethod: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtpData({
      ...otpData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPaymentData({
        ...paymentData,
        paymentProof: file
      })
    }
  }

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPaymentData({
      ...paymentData,
      paymentMethod: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter')
      setIsLoading(false)
      return
    }

    try {
      // Step 1: Register user and send OTP
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          step: 'register'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setCurrentStep(2) // Move to OTP verification
      } else {
        setError(data.message || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan, silakan coba lagi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    console.log('Submitting OTP:', { email: formData.email, otp: otpData.otp, subscriptionTier: formData.subscriptionTier })

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otpData.otp
        }),
      })

      const data = await response.json()
      console.log('OTP Verification response:', { status: response.status, data })

      if (response.ok) {
        console.log('OTP verification successful, setting verified state')
        setOtpData({ ...otpData, isVerified: true })
        
        // If FREE plan, auto-approve and redirect
        if (formData.subscriptionTier === 'FREE') {
          console.log('FREE plan detected, setting success to true')
          setSuccess(true)
        } else {
          console.log('Paid plan detected, moving to step 3')
          // If paid plan, move to payment proof upload
          setCurrentStep(3)
        }
      } else {
        console.log('OTP verification failed:', data.message)
        setError(data.message || 'Kode OTP tidak valid')
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      setError('Terjadi kesalahan, silakan coba lagi')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!paymentData.paymentProof) {
      setError('Silakan upload bukti pembayaran')
      setIsLoading(false)
      return
    }

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('email', formData.email)
      formDataToSend.append('paymentProof', paymentData.paymentProof)
      formDataToSend.append('paymentMethod', paymentData.paymentMethod)
      formDataToSend.append('subscriptionTier', formData.subscriptionTier)

      const response = await fetch('/api/auth/upload-payment', {
        method: 'POST',
        body: formDataToSend,
      })

      const data = await response.json()

      if (response.ok) {
        setCurrentStep(4) // Move to waiting approval
      } else {
        setError(data.message || 'Gagal mengupload bukti pembayaran')
      }
    } catch (error) {
      setError('Terjadi kesalahan, silakan coba lagi')
    } finally {
      setIsLoading(false)
    }
  }

  // Success page for FREE plan (auto-approved)
  if (success && formData.subscriptionTier === 'FREE') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Akun Berhasil Dibuat!</h1>
            <p className="text-gray-600 mb-6">
              Selamat! Akun FREE Anda telah berhasil dibuat dan langsung aktif. 
              Anda dapat langsung masuk dan mulai menggunakan Vendra CRM.
            </p>
            <Link
              href="/auth/signin"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              Masuk Sekarang
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Waiting approval page for paid plans
  if (currentStep === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Menunggu Persetujuan</h1>
            <p className="text-gray-600 mb-6">
              Terima kasih! Bukti pembayaran Anda telah berhasil diupload. 
              Akun Anda sedang menunggu persetujuan dari SuperAdmin. 
              Anda akan menerima email konfirmasi setelah akun disetujui.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-700">
                <strong>Paket:</strong> {formData.subscriptionTier}<br/>
                <strong>Status:</strong> Pending Approval
              </p>
            </div>
            <Link
              href="/auth/signin"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Beranda
        </Link>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="mb-6 flex justify-center">
              <VendraLogoAuth />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Daftar ke Vendra</h1>
            <p className="text-gray-600 mt-2">Mulai kelola bisnis Anda hari ini</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                1
              </div>
              <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                2
              </div>
              {formData.subscriptionTier !== 'FREE' && (
                <>
                  <div className={`w-12 h-1 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    3
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Step 1: Registration Form */}
          {currentStep === 1 && (
            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Informasi Personal</h3>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                      placeholder="Minimal 6 karakter"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                      placeholder="Ulangi password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Company Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Informasi Perusahaan</h3>
                
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Perusahaan
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="PT. Contoh Perusahaan"
                  />
                </div>

                <div>
                  <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Perusahaan
                  </label>
                  <input
                    id="companyEmail"
                    name="companyEmail"
                    type="email"
                    value={formData.companyEmail}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="info@perusahaan.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+62812345678"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Jl. Contoh No. 123, Jakarta"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
            </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Verifikasi Email</h2>
                <p className="text-gray-600 mb-6">
                  Kami telah mengirim kode OTP ke email <strong>{formData.email}</strong>
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    Masukkan Kode OTP
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    value={otpData.otp}
                    onChange={handleOtpChange}
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                    placeholder="000000"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Memverifikasi...' : 'Verifikasi OTP'}
                </button>
                
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/auth/resend-otp', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          email: formData.email
                        }),
                      })

                      const data = await response.json()

                      if (response.ok) {
                        alert('Kode OTP baru telah dikirim ke email Anda!')
                      } else {
                        setError(data.message || 'Gagal mengirim kode OTP')
                      }
                    } catch (error) {
                      console.error('Resend OTP error:', error)
                      setError('Terjadi kesalahan, silakan coba lagi')
                    }
                  }}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-all"
                >
                  Kirim Ulang Kode OTP
                </button>
              </form>
            </div>
          )}

          {/* Step 3: Payment Proof Upload (Only for paid plans) */}
          {currentStep === 3 && formData.subscriptionTier !== 'FREE' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Bukti Pembayaran</h2>
                <p className="text-gray-600 mb-6">
                  Silakan upload bukti pembayaran untuk paket <strong>{formData.subscriptionTier}</strong>
                </p>
              </div>

              {/* Payment Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Informasi Pembayaran</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Bank BCA:</strong> 1234567890 (PT. Vendra Technology)</p>
                  <p><strong>Bank Mandiri:</strong> 0987654321 (PT. Vendra Technology)</p>
                  <p><strong>DANA:</strong> 08123456789</p>
                  <p><strong>OVO:</strong> 08123456789</p>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                    Metode Pembayaran
                  </label>
                  <select
                    id="paymentMethod"
                    value={paymentData.paymentMethod}
                    onChange={handlePaymentMethodChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Pilih metode pembayaran</option>
                    <option value="BCA">Transfer Bank BCA</option>
                    <option value="MANDIRI">Transfer Bank Mandiri</option>
                    <option value="DANA">DANA</option>
                    <option value="OVO">OVO</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="paymentProof" className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Bukti Pembayaran
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <input
                      id="paymentProof"
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,.pdf"
                      required
                      className="hidden"
                    />
                    <label htmlFor="paymentProof" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700 font-medium">
                        Klik untuk upload file
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        Format: JPG, PNG, PDF (Max 5MB)
                      </p>
                    </label>
                    {paymentData.paymentProof && (
                      <p className="text-sm text-green-600 mt-2">
                        File terpilih: {paymentData.paymentProof.name}
                      </p>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Mengupload...' : 'Upload Bukti Pembayaran'}
                </button>
              </form>
            </div>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Sudah punya akun?{' '}
              <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-medium">
                Masuk di sini
              </Link>
            </p>
          </div>

          {/* Note */}
          {currentStep === 1 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Catatan:</strong> 
                {formData.subscriptionTier === 'FREE' ? (
                  ' Paket FREE akan langsung aktif setelah verifikasi email.'
                ) : (
                  ' Paket berbayar memerlukan upload bukti pembayaran dan persetujuan SuperAdmin.'
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

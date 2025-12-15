'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Users, BarChart3, ShoppingCart, Zap, Star, Shield, Clock, TrendingUp, Award, Building2, Sparkles, Database, Bot, Cpu, Globe, Lock, Smartphone, Menu, X } from 'lucide-react'
import { VendraLogoNav, VendraLogoFooter } from '@/components/vendra/VendraLogo'
import { useState } from 'react'

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-slate-200 animate-fade-in-down relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 animate-fade-in-left">
              <div className="transform scale-125">
                <VendraLogoNav />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-semibold text-blue-600">Welcome</span>
                <span className="text-sm text-slate-600 block leading-tight">to Vendra AI CRM</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 animate-fade-in-right">
              <Link href="#features" className="text-slate-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105">
                Fitur
              </Link>
              <Link href="#pricing" className="text-slate-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105">
                Harga
              </Link>
              <Link href="#testimonials" className="text-slate-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105">
                Testimoni
              </Link>
              <Link
                href="/auth/signin"
                className="text-slate-700 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 hover-lift"
              >
                Masuk
              </Link>
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg btn-interactive hover:scale-105 hover-glow"
              >
                Daftar Gratis
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-700 hover:text-blue-600 p-2 rounded-md transition-all duration-300 hover:bg-blue-50"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <div className={`md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg border-t border-slate-200 transform transition-all duration-300 ease-in-out z-50 ${
          isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}>
          <div className="px-4 py-6 space-y-4">
            <Link 
              href="#features" 
              className="block text-slate-700 hover:text-blue-600 px-3 py-3 rounded-md text-base font-medium transition-all duration-300 hover:bg-blue-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Fitur
            </Link>
            <Link 
              href="#pricing" 
              className="block text-slate-700 hover:text-blue-600 px-3 py-3 rounded-md text-base font-medium transition-all duration-300 hover:bg-blue-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Harga
            </Link>
            <Link 
              href="#testimonials" 
              className="block text-slate-700 hover:text-blue-600 px-3 py-3 rounded-md text-base font-medium transition-all duration-300 hover:bg-blue-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Testimoni
            </Link>
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <Link
                href="/auth/signin"
                className="block text-slate-700 hover:text-slate-900 px-3 py-3 rounded-md text-base font-medium transition-all duration-300 hover:bg-slate-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Masuk
              </Link>
              <Link
                href="/auth/signup"
                className="block bg-blue-600 text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-blue-700 transition-all duration-300 shadow-md text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Daftar Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-blue-100">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="text-center">
            {/* Floating CRM Icons */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-20 left-10 animate-float">
                <div className="bg-blue-500 p-3 rounded-lg shadow-lg opacity-20">
                  <Database className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="absolute top-32 right-20 animate-float-delayed">
                <div className="bg-blue-600 p-3 rounded-lg shadow-lg opacity-20">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="absolute bottom-20 left-20 animate-float-slow">
                <div className="bg-blue-400 p-3 rounded-lg shadow-lg opacity-20">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="absolute bottom-32 right-10 animate-bounce-slow">
                <div className="bg-blue-700 p-3 rounded-lg shadow-lg opacity-20">
                  <Bot className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 animate-fade-in-up">
              <span className="bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
                Vendra AI CRM
              </span>
              <br />
              <span className="text-blue-900">Smart Business Management</span>
            </h1>
            <p className="text-xl text-blue-800 mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-300">
              Solusi lengkap untuk mengelola bisnis Anda dengan sistem POS modern, 
              analisis RFM yang canggih, dan manajemen pelanggan yang cerdas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-600">
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-500 flex items-center justify-center shadow-lg hover:shadow-xl btn-interactive hover:scale-110 hover-glow group"
              >
                Mulai Gratis Sekarang
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link
                href="/auth/signin"
                className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all duration-300 hover:scale-105 hover-lift"
              >
                Login
              </Link>
              <Link
                href="#features"
                className="border-2 border-blue-300 text-blue-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 hover:scale-105 hover-lift"
              >
                Pelajari Lebih Lanjut
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-12 flex flex-col items-center animate-fade-in-up animation-delay-900">
              <p className="text-sm text-blue-600 font-medium mb-4">Dipercaya oleh 1000+ bisnis di Indonesia</p>
              <div className="flex items-center gap-8 opacity-60">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-blue-700">SSL Secured</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-blue-700">24/7 Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-blue-700">ISO Certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b border-blue-100 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="grid grid-cols-8 gap-4 h-full">
              {[...Array(32)].map((_, i) => (
                <div key={i} className="bg-blue-500 opacity-10 animate-pulse" style={{animationDelay: `${i * 100}ms`}}></div>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center group hover:scale-110 transition-all duration-500 hover-lift animate-fade-in-up">
              <div className="bg-blue-100 p-3 rounded-full mb-3 group-hover:bg-blue-200 transition-all duration-300 group-hover:animate-heartbeat hover-glow">
                <Building2 className="h-6 w-6 text-blue-600 group-hover:animate-wiggle" />
              </div>
              <div className="text-2xl font-bold text-blue-900 group-hover:text-blue-700 transition-colors counter-animate">1000+</div>
              <div className="text-sm text-blue-700 group-hover:text-blue-800 transition-colors">Bisnis Aktif</div>
            </div>
            <div className="flex flex-col items-center group hover:scale-110 transition-all duration-500 hover-lift animate-fade-in-up animation-delay-200">
              <div className="bg-blue-100 p-3 rounded-full mb-3 group-hover:bg-blue-200 transition-all duration-300 group-hover:animate-pulse hover-glow">
                <TrendingUp className="h-6 w-6 text-blue-600 group-hover:animate-bounce" />
              </div>
              <div className="text-2xl font-bold text-blue-900 group-hover:text-blue-700 transition-colors counter-animate">99.9%</div>
              <div className="text-sm text-blue-700 group-hover:text-blue-800 transition-colors">Uptime</div>
            </div>
            <div className="flex flex-col items-center group hover:scale-110 transition-all duration-500 hover-lift animate-fade-in-up animation-delay-400">
              <div className="bg-blue-100 p-3 rounded-full mb-3 group-hover:bg-blue-200 transition-all duration-300 group-hover:animate-spin hover-glow">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-900 group-hover:text-blue-700 transition-colors counter-animate">50K+</div>
              <div className="text-sm text-blue-700 group-hover:text-blue-800 transition-colors">Pengguna</div>
            </div>
            <div className="flex flex-col items-center group hover:scale-110 transition-all duration-500 hover-lift animate-fade-in-up animation-delay-600">
              <div className="bg-blue-100 p-3 rounded-full mb-3 group-hover:bg-blue-200 transition-all duration-300 group-hover:animate-bounce hover-glow">
                <Star className="h-6 w-6 text-blue-600 group-hover:animate-spin" />
              </div>
              <div className="text-2xl font-bold text-blue-900 group-hover:text-blue-700 transition-colors counter-animate">4.9/5</div>
              <div className="text-sm text-blue-700 group-hover:text-blue-800 transition-colors">Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative overflow-hidden">
        {/* Floating decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 animate-float opacity-10">
            <Cpu className="h-16 w-16 text-blue-500" />
          </div>
          <div className="absolute top-40 right-20 animate-float-delayed opacity-10">
            <Globe className="h-12 w-12 text-blue-600" />
          </div>
          <div className="absolute bottom-20 left-1/4 animate-float-slow opacity-10">
            <Lock className="h-14 w-14 text-blue-400" />
          </div>
          <div className="absolute bottom-40 right-1/3 animate-bounce-slow opacity-10">
            <Smartphone className="h-10 w-10 text-blue-700" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4 gradient-text">
              Fitur Unggulan Vendra
            </h2>
            <p className="text-xl text-blue-700 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Semua yang Anda butuhkan untuk mengelola bisnis modern dalam satu platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover-lift group animate-fade-in-up animation-delay-300">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:animate-wiggle transition-all duration-300 group-hover:bg-blue-700">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-3 group-hover:text-blue-700 transition-colors">
                Sistem POS Modern
              </h3>
              <p className="text-blue-700 group-hover:text-blue-800 transition-colors">
                Point of Sale dengan barcode scanner, multi-payment methods, dan interface yang user-friendly
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover-lift group animate-fade-in-up animation-delay-400">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:animate-pulse-glow transition-all duration-300 group-hover:bg-blue-700">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-3 group-hover:text-blue-700 transition-colors">
                Analisis RFM
              </h3>
              <p className="text-blue-700 group-hover:text-blue-800 transition-colors">
                Analisis pelanggan mendalam untuk memahami perilaku dan preferensi konsumen
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover-lift group animate-fade-in-up animation-delay-500">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:animate-rotate-360 transition-all duration-300 group-hover:bg-blue-700">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-3 group-hover:text-blue-700 transition-colors">
                Multi-Role Management
              </h3>
              <p className="text-blue-700 group-hover:text-blue-800 transition-colors">
                Sistem role lengkap: SuperAdmin, Admin, dan Kasir dengan akses kontrol yang ketat
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover-lift group animate-fade-in-up animation-delay-600">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:animate-heartbeat transition-all duration-300 group-hover:bg-blue-700">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-3 group-hover:text-blue-700 transition-colors">
                AI-Powered Analytics
              </h3>
              <p className="text-blue-700 group-hover:text-blue-800 transition-colors">
                Business insights otomatis dengan kecerdasan buatan untuk pengambilan keputusan yang lebih baik
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-blue-50 to-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              Apa Kata Pelanggan Kami
            </h2>
            <p className="text-xl text-blue-700 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Ribuan bisnis telah merasakan manfaat Vendra CRM
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-100 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover-lift group animate-fade-in-left animation-delay-300">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current group-hover:animate-pulse" style={{animationDelay: `${i * 100}ms`}} />
                ))}
              </div>
              <p className="text-blue-800 mb-6 italic group-hover:text-blue-900 transition-colors">
                "Vendra CRM mengubah cara kami mengelola bisnis. Sistem POS yang mudah dan analisis yang mendalam membantu kami meningkatkan penjualan 40%."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-blue-200 group-hover:animate-bounce transition-all">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-blue-900 group-hover:text-blue-700 transition-colors">Budi Santoso</div>
                  <div className="text-sm text-blue-600 group-hover:text-blue-800 transition-colors">Owner, Toko Elektronik Maju</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-100 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover-lift group animate-fade-in-up animation-delay-400">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current group-hover:animate-wiggle" style={{animationDelay: `${i * 150}ms`}} />
                ))}
              </div>
              <p className="text-blue-800 mb-6 italic group-hover:text-blue-900 transition-colors">
                "Interface yang user-friendly dan fitur AI yang canggih. Tim kami langsung bisa menggunakan tanpa training yang rumit."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-blue-200 group-hover:animate-pulse transition-all">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-blue-900 group-hover:text-blue-700 transition-colors">Sari Dewi</div>
                  <div className="text-sm text-blue-600 group-hover:text-blue-800 transition-colors">Manager, Minimarket Berkah</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-100 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover-lift group animate-fade-in-right animation-delay-500">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current group-hover:animate-spin" style={{animationDelay: `${i * 200}ms`}} />
                ))}
              </div>
              <p className="text-blue-800 mb-6 italic group-hover:text-blue-900 transition-colors">
                "Analisis RFM membantu kami memahami pelanggan lebih baik. Sekarang strategi marketing kami lebih tepat sasaran."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-blue-200 group-hover:animate-heartbeat transition-all">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-blue-900 group-hover:text-blue-700 transition-colors">Ahmad Rizki</div>
                  <div className="text-sm text-blue-600 group-hover:text-blue-800 transition-colors">CEO, Fashion Store Online</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              Paket Berlangganan
            </h2>
            <p className="text-xl text-blue-700">
              Pilih paket yang sesuai dengan kebutuhan bisnis Anda
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Free</h3>
              <p className="text-gray-600 mb-4">Untuk bisnis kecil</p>
              <div className="text-3xl font-bold text-gray-900 mb-6">
                Gratis
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-gray-600">1000+ data penyimpanan</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-gray-600">1 kasir</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-gray-600">Fitur dasar</span>
                </li>
                <li className="flex items-center">
                  <Shield className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-gray-600">SSL Security</span>
                </li>
              </ul>
              <Link
                href="/auth/signup"
                className="w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-all block text-center"
              >
                Mulai Gratis
              </Link>
            </div>

            {/* Basic Plan */}
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Basic</h3>
              <p className="text-gray-600 mb-4">Untuk bisnis berkembang</p>
              <div className="text-3xl font-bold text-gray-900 mb-6">
                200K<span className="text-lg text-gray-600">/bulan</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-gray-600">AI analisis limit 50%</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-gray-600">2000 data</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-gray-600">1/2 api</span>
                </li>
                <li className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-gray-600">Email Support</span>
                </li>
              </ul>
              <Link
                href="/auth/signup"
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-all block text-center shadow-md hover:shadow-lg btn-interactive"
              >
                Pilih Basic
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="bg-blue-600 p-8 rounded-xl shadow-lg text-white relative hover:shadow-2xl transition-all duration-500 hover:scale-105 group animate-fade-in-up animation-delay-200 ring-4 ring-blue-300 ring-opacity-50">
              <div className="absolute top-4 right-4 bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-semibold animate-pulse shadow-lg">
                Popular
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium</h3>
              <p className="text-blue-100 mb-4">Untuk bisnis profesional</p>
              <div className="text-3xl font-bold mb-6">
                500K<span className="text-lg text-blue-100">/bulan</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-white mr-2" />
                  <span className="text-blue-100">AI analisis limit 100%</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-white mr-2" />
                  <span className="text-blue-100">2000 data + akun kasir 3</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-white mr-2" />
                  <span className="text-blue-100">Manajer 3</span>
                </li>
                <li className="flex items-center">
                  <Star className="h-5 w-5 text-white mr-2" />
                  <span className="text-blue-100">Priority Support</span>
                </li>
              </ul>
              <Link
                href="/auth/signup"
                className="w-full bg-white text-blue-600 py-3 px-4 rounded-lg font-semibold hover:bg-blue-50 transition-all block text-center shadow-md hover:shadow-lg"
              >
                Pilih Premium
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise</h3>
              <p className="text-gray-600 mb-4">Untuk perusahaan besar</p>
              <div className="text-3xl font-bold text-gray-900 mb-6">
                1.5JT<span className="text-lg text-gray-600">/bulan</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-gray-600">Tidak ada limit</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-gray-600">Semua akses</span>
                </li>
                <li className="flex items-center">
                  <Award className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-gray-600">Support prioritas</span>
                </li>
                <li className="flex items-center">
                  <Shield className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-gray-600">Dedicated Manager</span>
                </li>
              </ul>
              <Link
                href="/contact"
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-all block text-center"
              >
                Hubungi Kami
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-slate-800 to-slate-900 relative overflow-hidden">
        {/* Animated particles */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full opacity-30 animate-ping"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-white rounded-full opacity-40 animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-3 h-3 bg-white rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute bottom-10 right-10 w-2 h-2 bg-white rounded-full opacity-30 animate-ping animation-delay-1000"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 animate-fade-in-up">
            Siap Mengembangkan Bisnis Anda?
          </h2>
          <p className="text-xl text-slate-200 mb-8 animate-fade-in-up animation-delay-300">
            Bergabunglah dengan ribuan bisnis yang sudah mempercayai Vendra untuk mengelola operasional mereka
          </p>
          <Link
            href="/auth/signup"
            className="bg-white text-slate-800 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-slate-50 transition-all duration-500 inline-flex items-center hover:scale-110 hover:shadow-2xl animate-fade-in-up animation-delay-600 group btn-interactive hover-glow"
          >
            Daftar Sekarang - Gratis!
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 group-hover:animate-bounce transition-all duration-300" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <VendraLogoFooter />
              </div>
              <p className="text-gray-400">
                Solusi CRM dan POS terdepan untuk bisnis modern
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produk</h4>
              <ul className="space-y-2 text-gray-400">
                <li><span className="cursor-default opacity-60">POS System</span></li>
                <li><span className="cursor-default opacity-60">CRM</span></li>
                <li><span className="cursor-default opacity-60">Analytics</span></li>
                <li><span className="cursor-default opacity-60">Inventory</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-gray-400">
                <li><span className="cursor-default opacity-60">Tentang Kami</span></li>
                <li><span className="cursor-default opacity-60">Karir</span></li>
                <li><span className="cursor-default opacity-60">Blog</span></li>
                <li><span className="cursor-default opacity-60">Kontak</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Dukungan</h4>
              <ul className="space-y-2 text-gray-400">
                <li><span className="cursor-default opacity-60">Help Center</span></li>
                <li><span className="cursor-default opacity-60">Dokumentasi</span></li>
                <li><span className="cursor-default opacity-60">API</span></li>
                <li><span className="cursor-default opacity-60">Status</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Vendra. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

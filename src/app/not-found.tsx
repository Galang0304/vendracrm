import Link from "next/link";
import { Home, Search } from "lucide-react";
import { VendraLogoAuth } from "@/components/vendra/VendraLogo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <VendraLogoAuth />
          </div>

          {/* 404 Error */}
          <div className="mb-6">
            <h1 className="text-6xl font-bold text-gray-300 mb-2">404</h1>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Halaman Tidak Ditemukan</h2>
            <p className="text-gray-600">
              Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman telah dipindahkan atau URL salah.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/"
              className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-teal-600 transition-all inline-flex items-center justify-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Link>
            
            <Link
              href="/auth/signin"
              className="w-full border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-gray-400 transition-all inline-flex items-center justify-center"
            >
              <Search className="h-4 w-4 mr-2" />
              Login ke Dashboard
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              Jika Anda yakin URL benar, silakan hubungi administrator sistem.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Vendra AI CRM. All rights reserved.
        </p>
      </div>
    </div>
  );
}

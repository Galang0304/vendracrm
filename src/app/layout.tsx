import { Outfit } from 'next/font/google';
import './globals.css';

import { AuthProvider } from '@/components/vendra/AuthProvider';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'Vendra AI CRM - Smart Business Management',
  description: 'Solusi lprocess.env.NEXTAUTH_URL || process.env.APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || '3000'}`bisnis Anda dengan sistem POS modern, analisis RFM yang canggih, dan manajemen pelanggan yang cerdas.',
  keywords: 'CRM, POS, Point of Sale, RFM Analysis, Business Management, Inventory Management, Customer Analytics, Kasir, Retail',
  authors: [{ name: 'Vendra Team' }],
  creator: 'Vendra',
  publisher: 'Vendra',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Vendra AI CRM - Smart Business Management',
    description: 'Solusi lengkap untuk mengelola bisnis Anda dengan sistem POS modern, analisis RFM yang canggih, dan manajemen pelanggan yang cerdas.',
    url: 'https://vendra.com',
    siteName: 'Vendra AI CRM',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Vendra AI CRM',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vendra AI CRM - Smart Business Management',
    description: 'Solusi lengkap untuk mengelola bisnis Anda dengan sistem POS modern, analisis RFM yang canggih, dan manajemen pelanggan yang cerdas.',
    images: ['/logo.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${outfit.className}`} suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

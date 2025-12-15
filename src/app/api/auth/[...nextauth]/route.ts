import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// Add explicit headers to prevent caching issues
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

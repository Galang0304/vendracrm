import { UserRole, ApprovalStatus, SubscriptionTier } from '@prisma/client'
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: UserRole
      status: ApprovalStatus
      isVerified: boolean
      isActive: boolean
      companyId?: string
      companyName?: string
      subscriptionTier?: SubscriptionTier
      company?: {
        subscriptionExpiry?: string
      }
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    role: UserRole
    status: ApprovalStatus
    isVerified: boolean
    isActive: boolean
    companyId?: string
    companyName?: string
    subscriptionTier?: SubscriptionTier
    company?: {
      subscriptionExpiry?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    status: ApprovalStatus
    isVerified: boolean
    isActive: boolean
    companyId?: string
    companyName?: string
    subscriptionTier?: SubscriptionTier
    company?: {
      subscriptionExpiry?: string
    }
  }
}

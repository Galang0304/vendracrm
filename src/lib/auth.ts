import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { UserRole, ApprovalStatus, SubscriptionTier } from '@prisma/client'
import { getAuthConfig } from './config'

const authConfig = getAuthConfig()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  debug: authConfig.debug,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        userType: { label: 'User Type', type: 'text' } // 'user' or 'employee'
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          let user = null

          // Check if it's an employee login
          if (credentials.userType === 'employee') {
            const employee = await prisma.employee.findUnique({
              where: { email: credentials.email },
              include: { company: true }
            })

            if (employee && employee.isActive) {
              const isPasswordValid = await bcrypt.compare(credentials.password, employee.password)
              if (isPasswordValid && employee.company.isActive) {
                user = {
                  id: employee.id,
                  email: employee.email,
                  name: employee.name,
                  role: employee.role,
                  status: 'APPROVED' as ApprovalStatus,
                  isVerified: true,
                  isActive: employee.isActive,
                  companyId: employee.companyId,
                  companyName: employee.company.name,
                  subscriptionTier: employee.company.subscriptionTier
                }
              }
            }
          } else {
            // Check regular user login
            const dbUser = await prisma.user.findUnique({
              where: { email: credentials.email },
              select: {
                id: true,
                email: true,
                name: true,
                password: true,
                role: true,
                status: true,
                isVerified: true,
                isActive: true,
                company: {
                  select: {
                    id: true,
                    name: true,
                    isActive: true,
                    subscriptionTier: true,
                    subscriptionExpiry: true
                  }
                }
              }
            })

            if (dbUser) {
              const isPasswordValid = await bcrypt.compare(credentials.password, dbUser.password)
              if (isPasswordValid) {
                // SuperAdmin can always login
                if (dbUser.role === UserRole.SUPERADMIN) {
                  user = {
                    id: dbUser.id,
                    email: dbUser.email,
                    name: dbUser.name,
                    role: dbUser.role,
                    status: dbUser.status,
                    isVerified: dbUser.isVerified,
                    isActive: dbUser.isActive,
                    companyId: dbUser.company?.id,
                    companyName: dbUser.company?.name,
                    subscriptionTier: dbUser.company?.subscriptionTier,
                    company: {
                      subscriptionExpiry: dbUser.company?.subscriptionExpiry?.toISOString()
                    }
                  }
                } else if (dbUser.status === ApprovalStatus.APPROVED && dbUser.company?.isActive) {
                  // Check if subscription is expired and downgrade to FREE
                  let currentTier = dbUser.company.subscriptionTier
                  let isActive = dbUser.company.isActive
                  
                  if (dbUser.company.subscriptionExpiry && 
                      new Date(dbUser.company.subscriptionExpiry) < new Date() && 
                      currentTier !== 'FREE') {
                    // Auto-downgrade expired subscription to FREE
                    await prisma.company.update({
                      where: { id: dbUser.company.id },
                      data: {
                        subscriptionTier: 'FREE',
                        subscriptionExpiry: null
                      }
                    })
                    currentTier = 'FREE'
                  }
                  
                  // Other users need approval and active company
                  user = {
                    id: dbUser.id,
                    email: dbUser.email,
                    name: dbUser.name,
                    role: dbUser.role,
                    status: dbUser.status,
                    isVerified: dbUser.isVerified,
                    isActive: dbUser.isActive,
                    companyId: dbUser.company.id,
                    companyName: dbUser.company.name,
                    subscriptionTier: currentTier,
                    company: {
                      subscriptionExpiry: currentTier === 'FREE' ? undefined : dbUser.company.subscriptionExpiry?.toISOString()
                    }
                  }
                }
              }
            }
          }

          return user
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: authConfig.secureCookies
      }
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.status = user.status
        token.isVerified = user.isVerified
        token.isActive = user.isActive
        token.companyId = user.companyId
        token.companyName = user.companyName
        token.subscriptionTier = user.subscriptionTier
        token.company = user.company
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
        session.user.status = token.status as ApprovalStatus
        session.user.isVerified = token.isVerified as boolean
        session.user.isActive = token.isActive as boolean
        session.user.companyId = token.companyId as string
        session.user.companyName = token.companyName as string
        session.user.subscriptionTier = (token.subscriptionTier as SubscriptionTier) || SubscriptionTier.FREE
        session.user.company = token.company as any
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/',
    error: '/auth/error'
  },
  secret: authConfig.secret
}

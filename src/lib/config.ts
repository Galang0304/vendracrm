// Production-ready configuration
export const getBaseUrl = () => {
  // Priority 1: Use NEXTAUTH_URL or APP_URL from environment
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  
  if (process.env.APP_URL) {
    return process.env.APP_URL
  }
  
  // Priority 2: Use VERCEL_URL for Vercel deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // Development fallback (for local development only)
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:${process.env.PORT || '3001'}`
  }
  
  // Should never reach here in production - must set environment variables
  throw new Error('APP_URL or NEXTAUTH_URL must be set in production environment')
}

export const getAuthConfig = () => {
  const baseUrl = getBaseUrl()
  
  return {
    baseUrl,
    secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key',
    debug: process.env.NODE_ENV === 'development',
    secureCookies: process.env.NODE_ENV === 'production'
  }
}

// Database configuration
export const getDatabaseConfig = () => {
  return {
    url: process.env.DATABASE_URL,
    maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '10'),
    timeout: parseInt(process.env.DATABASE_TIMEOUT || '30000')
  }
}

// API configuration
export const getApiConfig = () => {
  return {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    },
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.ALLOWED_ORIGINS?.split(',') || [getBaseUrl()]
        : process.env.ALLOWED_ORIGINS?.split(',') || [getBaseUrl(), `http://127.0.0.1:${process.env.PORT || '3001'}`, `http://localhost:${process.env.PORT || '3001'}`],
      credentials: true
    }
  }
}

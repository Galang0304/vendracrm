// API Key Management Utilities
import crypto from 'crypto'

// Generate secure API key
export function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(32)
  const apiKey = `vnd_live_${randomBytes.toString('hex')}`
  return apiKey
}

// Generate test API key
export function generateTestApiKey(): string {
  const randomBytes = crypto.randomBytes(32)
  const apiKey = `vnd_test_${randomBytes.toString('hex')}`
  return apiKey
}

// Generate API key expiry date (1 year from now)
export function generateApiKeyExpiry(): Date {
  const expiry = new Date()
  expiry.setFullYear(expiry.getFullYear() + 1)
  return expiry
}

// Validate API key format
export function isValidApiKeyFormat(apiKey: string): boolean {
  const apiKeyRegex = /^vnd_(live|test)_[a-f0-9]{64}$/
  return apiKeyRegex.test(apiKey)
}

// Check if API key is expired
export function isApiKeyExpired(expiry: Date): boolean {
  return new Date() > expiry
}

// Mask API key for display
export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 12) return apiKey
  const start = apiKey.substring(0, 8)
  const end = apiKey.substring(apiKey.length - 4)
  const masked = '*'.repeat(apiKey.length - 12)
  return `${start}${masked}${end}`
}

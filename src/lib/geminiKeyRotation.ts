// Gemini API Key Rotation System
// Automatically rotates between 5 API keys when quota exceeded

import fs from 'fs'
import path from 'path'

interface KeyStatus {
  keyIndex: number
  isActive: boolean
  lastUsed: Date
  quotaExceeded: boolean
  resetTime: Date
}

class GeminiKeyRotation {
  private keys: string[] = []
  private currentKeyIndex: number = 1
  private keyStatuses: Map<number, KeyStatus> = new Map()
  
  constructor() {
    this.loadKeys()
    this.initializeKeyStatuses()
  }
  
  private loadKeys() {
    // Load all 5 API keys from environment
    for (let i = 1; i <= 5; i++) {
      const key = process.env[`VENDRA_GEMINI_API_KEY_${i}`]
      if (key && key !== `your-gemini-api-key-${i}-here`) {
        this.keys[i] = key
      }
    }
    
    // Get current key index
    const currentIndex = parseInt(process.env.VENDRA_GEMINI_CURRENT_KEY_INDEX || '1')
    this.currentKeyIndex = currentIndex
    
    console.log(`🔑 Loaded ${Object.keys(this.keys).length} Gemini API keys`)
    console.log(`🎯 Current active key: Key ${this.currentKeyIndex}`)
  }
  
  private initializeKeyStatuses() {
    for (let i = 1; i <= 5; i++) {
      if (this.keys[i]) {
        this.keyStatuses.set(i, {
          keyIndex: i,
          isActive: i === this.currentKeyIndex,
          lastUsed: new Date(),
          quotaExceeded: false,
          resetTime: this.getNextResetTime()
        })
      }
    }
  }
  
  private getNextResetTime(): Date {
    // Gemini free tier resets daily at midnight UTC
    const tomorrow = new Date()
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    tomorrow.setUTCHours(0, 0, 0, 0)
    return tomorrow
  }
  
  // Get current active API key
  getCurrentKey(): string | null {
    const key = this.keys[this.currentKeyIndex]
    if (!key) {
      console.error(`❌ No API key found for index ${this.currentKeyIndex}`)
      return null
    }
    
    // Check if current key quota is exceeded
    const status = this.keyStatuses.get(this.currentKeyIndex)
    if (status?.quotaExceeded && new Date() < status.resetTime) {
      console.log(`⚠️ Key ${this.currentKeyIndex} quota exceeded, rotating...`)
      return this.rotateToNextKey()
    }
    
    return key
  }
  
  // Rotate to next available key
  private rotateToNextKey(): string | null {
    const availableKeys = Array.from(this.keyStatuses.entries())
      .filter(([index, status]) => 
        this.keys[index] && 
        (!status.quotaExceeded || new Date() >= status.resetTime)
      )
      .map(([index]) => index)
    
    if (availableKeys.length === 0) {
      console.error('❌ All API keys quota exceeded! Waiting for reset...')
      return null
    }
    
    // Get next available key
    const nextKeyIndex = availableKeys[0]
    this.currentKeyIndex = nextKeyIndex
    
    // Update key status
    const status = this.keyStatuses.get(nextKeyIndex)
    if (status) {
      status.isActive = true
      status.lastUsed = new Date()
      status.quotaExceeded = false
    }
    
    // Deactivate other keys
    this.keyStatuses.forEach((status, index) => {
      if (index !== nextKeyIndex) {
        status.isActive = false
      }
    })
    
    // Update environment variable
    this.updateCurrentKeyIndex(nextKeyIndex)
    
    console.log(`🔄 Rotated to Key ${nextKeyIndex}`)
    return this.keys[nextKeyIndex]
  }
  
  // Mark current key as quota exceeded
  markQuotaExceeded() {
    const status = this.keyStatuses.get(this.currentKeyIndex)
    if (status) {
      status.quotaExceeded = true
      status.resetTime = this.getNextResetTime()
      console.log(`⚠️ Key ${this.currentKeyIndex} marked as quota exceeded. Reset at: ${status.resetTime.toISOString()}`)
    }
  }
  
  // Reset quota status for all keys (called daily)
  resetAllQuotas() {
    this.keyStatuses.forEach((status) => {
      status.quotaExceeded = false
      status.resetTime = this.getNextResetTime()
    })
    console.log('🔄 All API key quotas reset')
  }
  
  // Get key rotation status
  getRotationStatus() {
    const statuses = Array.from(this.keyStatuses.entries()).map(([index, status]) => ({
      keyIndex: index,
      isActive: status.isActive,
      hasKey: !!this.keys[index],
      quotaExceeded: status.quotaExceeded,
      lastUsed: status.lastUsed,
      resetTime: status.resetTime
    }))
    
    return {
      currentKeyIndex: this.currentKeyIndex,
      totalKeys: Object.keys(this.keys).length,
      availableKeys: statuses.filter(s => s.hasKey && !s.quotaExceeded).length,
      keyStatuses: statuses
    }
  }
  
  // Update current key index in environment (for persistence)
  private updateCurrentKeyIndex(newIndex: number) {
    try {
      const envPath = path.join(process.cwd(), '.env.local')
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8')
        envContent = envContent.replace(
          /VENDRA_GEMINI_CURRENT_KEY_INDEX="?\d+"?/,
          `VENDRA_GEMINI_CURRENT_KEY_INDEX="${newIndex}"`
        )
        fs.writeFileSync(envPath, envContent)
        console.log(`📝 Updated current key index to ${newIndex} in .env.local`)
      }
    } catch (error) {
      console.error('Error updating .env.local:', error)
    }
  }
}

// Singleton instance
const keyRotation = new GeminiKeyRotation()

// Export functions
export const getCurrentGeminiKey = () => keyRotation.getCurrentKey()
export const markGeminiQuotaExceeded = () => keyRotation.markQuotaExceeded()
export const resetGeminiQuotas = () => keyRotation.resetAllQuotas()
export const getGeminiKeyStatus = () => keyRotation.getRotationStatus()

// Auto-reset quotas daily at midnight UTC
setInterval(() => {
  const now = new Date()
  if (now.getUTCHours() === 0 && now.getUTCMinutes() === 0) {
    resetGeminiQuotas()
  }
}, 60000) // Check every minute

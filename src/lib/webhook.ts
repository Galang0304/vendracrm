// Webhook and External Service Utilities
// For integrating with external APIs using the provided API key

export const WEBHOOK_CONFIG = {
  apiKey: process.env.WEBHOOK_API_KEY,
  baseUrl: process.env.WEBHOOK_BASE_URL || 'https://api.example.com',
  timeout: 30000, // 30 seconds
}

export interface WebhookPayload {
  event: string
  data: any
  timestamp: string
  source: 'vendra-crm'
}

export class WebhookService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.WEBHOOK_API_KEY || ''
    this.baseUrl = process.env.WEBHOOK_BASE_URL || 'https://api.example.com'
  }

  async sendWebhook(payload: WebhookPayload): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('Webhook API key not configured')
      return false
    }

    try {
      const response = await fetch(`${this.baseUrl}/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        console.error('Webhook failed:', response.status, response.statusText)
        return false
      }

      console.log('Webhook sent successfully:', payload.event)
      return true
    } catch (error) {
      console.error('Webhook error:', error)
      return false
    }
  }

  // Send transaction webhook
  async sendTransactionWebhook(transactionData: any) {
    const payload: WebhookPayload = {
      event: 'transaction.created',
      data: transactionData,
      timestamp: new Date().toISOString(),
      source: 'vendra-crm'
    }

    return this.sendWebhook(payload)
  }

  // Send import webhook
  async sendImportWebhook(importData: any) {
    const payload: WebhookPayload = {
      event: 'data.imported',
      data: importData,
      timestamp: new Date().toISOString(),
      source: 'vendra-crm'
    }

    return this.sendWebhook(payload)
  }

  // Send user webhook
  async sendUserWebhook(userData: any, event: 'created' | 'updated' | 'deleted') {
    const payload: WebhookPayload = {
      event: `user.${event}`,
      data: userData,
      timestamp: new Date().toISOString(),
      source: 'vendra-crm'
    }

    return this.sendWebhook(payload)
  }

  // Generic webhook sender
  async sendCustomWebhook(event: string, data: any) {
    const payload: WebhookPayload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      source: 'vendra-crm'
    }

    return this.sendWebhook(payload)
  }
}

// Export singleton instance
export const webhookService = new WebhookService()

// Utility function to validate API key format
export function isValidWebhookApiKey(apiKey: string): boolean {
  // Check if it matches the pattern: sk-ws-01-[base64-like-string]
  const pattern = /^sk-ws-\d+-[A-Za-z0-9_-]+$/
  return pattern.test(apiKey)
}

// Test webhook connection
export async function testWebhookConnection(): Promise<boolean> {
  try {
    const testPayload: WebhookPayload = {
      event: 'test.connection',
      data: { message: 'Testing webhook connection from Vendra CRM' },
      timestamp: new Date().toISOString(),
      source: 'vendra-crm'
    }

    return await webhookService.sendWebhook(testPayload)
  } catch (error) {
    console.error('Webhook test failed:', error)
    return false
  }
}

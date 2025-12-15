import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { webhookService, testWebhookConnection, isValidWebhookApiKey } from '@/lib/webhook'

// POST - Test webhook connection
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const webhookApiKey = process.env.WEBHOOK_API_KEY

    if (!webhookApiKey) {
      return NextResponse.json({
        success: false,
        message: 'Webhook API key not configured',
        configured: false
      })
    }

    if (!isValidWebhookApiKey(webhookApiKey)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid webhook API key format',
        configured: true,
        validFormat: false
      })
    }

    // Test the webhook connection
    const testResult = await testWebhookConnection()

    return NextResponse.json({
      success: testResult,
      message: testResult ? 'Webhook connection successful' : 'Webhook connection failed',
      configured: true,
      validFormat: true,
      apiKeyPreview: `${webhookApiKey.substring(0, 10)}...${webhookApiKey.substring(webhookApiKey.length - 4)}`
    })

  } catch (error) {
    console.error('Webhook test error:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET - Get webhook configuration status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const webhookApiKey = process.env.WEBHOOK_API_KEY
    const webhookBaseUrl = process.env.WEBHOOK_BASE_URL

    return NextResponse.json({
      configured: !!webhookApiKey,
      validFormat: webhookApiKey ? isValidWebhookApiKey(webhookApiKey) : false,
      hasBaseUrl: !!webhookBaseUrl,
      apiKeyPreview: webhookApiKey ? `${webhookApiKey.substring(0, 10)}...${webhookApiKey.substring(webhookApiKey.length - 4)}` : null,
      baseUrl: webhookBaseUrl || 'Not configured'
    })

  } catch (error) {
    console.error('Webhook config check error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

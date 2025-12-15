import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCompanyAISettings, setCompanyAISettings, hasCompanyAISettings } from '@/lib/aiSettingsStore'

// GET - Fetch AI settings for company
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'OWNER', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const companyId = session.user.companyId || 'default'
    const existingSettings = getCompanyAISettings(companyId)
    
    const aiSettings = existingSettings || {
      openaiApiKey: null,
      aiEnabled: false,
      model: 'gpt-4o-mini',
      maxTokens: 1000,
      temperature: 0.7
    }

    return NextResponse.json({
      settings: {
        ...aiSettings,
        openaiApiKey: aiSettings.openaiApiKey ? '***masked***' : null // Mask for security
      },
      hasApiKey: hasCompanyAISettings(companyId) && !!aiSettings.openaiApiKey
    })

  } catch (error) {
    console.error('Error fetching AI settings:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Update AI settings for company
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'OWNER', 'SUPERLADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { openaiApiKey, aiEnabled, model, maxTokens, temperature } = body

    // Clean and validate OpenAI API key
    let cleanApiKey = openaiApiKey?.trim()
    if (cleanApiKey?.startsWith('sk-sk-')) {
      cleanApiKey = cleanApiKey.replace(/^sk-sk-/, 'sk-')
    }
    
    if (cleanApiKey && !cleanApiKey.startsWith('sk-')) {
      return NextResponse.json(
        { message: 'Invalid OpenAI API key format' },
        { status: 400 }
      )
    }

    const companyId = session.user.companyId || 'default'
    
    // Store AI settings in memory store
    setCompanyAISettings(companyId, {
      openaiApiKey: cleanApiKey || null,
      aiEnabled: aiEnabled || false,
      model: model || 'gpt-4o-mini',
      maxTokens: maxTokens || 1000,
      temperature: temperature || 0.7,
      updatedAt: new Date().toISOString(),
      updatedBy: session.user.id
    })

    console.log(`✅ AI settings updated for company: ${companyId}`)

    return NextResponse.json({
      message: 'AI settings updated successfully',
      settings: {
        companyId,
        openaiApiKey: cleanApiKey ? '***masked***' : null, // Mask for security
        aiEnabled: aiEnabled || false,
        model: model || 'gpt-4o-mini',
        maxTokens: maxTokens || 1000,
        temperature: temperature || 0.7,
        updatedAt: new Date().toISOString(),
        updatedBy: session.user.id
      }
    })

  } catch (error) {
    console.error('Error updating AI settings:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

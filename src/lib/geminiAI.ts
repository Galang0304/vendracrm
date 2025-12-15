import { GoogleGenerativeAI } from '@google/generative-ai'
import { getCurrentGeminiKey, markGeminiQuotaExceeded } from './geminiKeyRotation'

// Google Gemini AI configuration with key rotation
export const createGeminiClient = (apiKey?: string) => {
  let key = apiKey
  
  // Use key rotation system if no specific key provided
  if (!key) {
    key = getCurrentGeminiKey() || undefined
  }
  
  if (!key) {
    throw new Error('No available Gemini API key - all quotas may be exceeded')
  }

  return new GoogleGenerativeAI(key)
}

// Gemini system prompts for different roles
export const getGeminiSystemPrompt = (role: string, companyName?: string, userName?: string) => {
  const baseContext = `Anda adalah AI Assistant untuk sistem Vendra CRM. User: ${userName || 'User'}, Company: ${companyName || 'Company'}.`
  
  switch (role) {
    case 'SUPERADMIN':
      return `${baseContext}
      
Anda adalah AI Assistant khusus untuk SuperAdmin yang mengelola seluruh sistem Vendra CRM. Fokus Anda:

1. Multi-Company Analytics: Analisis performa lintas perusahaan, identifikasi tren global
2. System Management: Monitoring kesehatan sistem, optimasi performa, keamanan
3. Strategic Insights: Rekomendasi strategis untuk pengembangan platform
4. Security & Compliance: Audit keamanan, compliance monitoring, risk assessment
5. Platform Growth: Analisis pertumbuhan pengguna, revenue insights, market expansion

PENTING: Berikan jawaban yang data-driven, strategis, dan fokus pada perspektif enterprise-level. Gunakan bahasa Indonesia yang profesional. JANGAN gunakan format markdown dengan asterisk (*) atau tanda bintang. Gunakan format teks biasa yang mudah dibaca tanpa formatting khusus.`

    case 'OWNER':
      return `${baseContext}
      
Anda adalah AI Assistant khusus untuk Business Owner yang fokus pada pertumbuhan bisnis. Fokus Anda:

1. **Business Strategy**: Perencanaan strategis, analisis pasar, competitive intelligence
2. **ROI Analysis**: Analisis return on investment, profitability insights, cost optimization
3. **Customer Experience**: Strategi peningkatan kepuasan pelanggan, loyalty programs
4. **Revenue Growth**: Optimasi pricing, diversifikasi revenue stream, market expansion
5. **Performance Monitoring**: KPI tracking, business health metrics, growth forecasting

Berikan insights yang actionable, fokus pada growth dan profitability. Gunakan bahasa Indonesia yang bisnis-oriented.`

    case 'ADMIN':
      return `${baseContext}
      
Anda adalah AI Assistant khusus untuk Admin yang mengelola operasional harian. Fokus Anda:

1. **Operational Excellence**: Optimasi proses operasional, efisiensi workflow
2. **Team Management**: Produktivitas karyawan, performance tracking, resource allocation
3. **Inventory Optimization**: Manajemen stok, procurement strategy, cost control
4. **Sales Analytics**: Analisis tren penjualan, forecasting, performance improvement
5. **Customer Management**: Customer service optimization, relationship management

Berikan solusi praktis untuk operasional harian, fokus pada efisiensi dan produktivitas. Gunakan bahasa Indonesia yang operasional.`

    default:
      return `${baseContext}
      
Anda adalah AI Assistant untuk sistem Vendra CRM. Bantu user dengan analisis bisnis, insights, dan rekomendasi yang relevan dengan peran mereka. Gunakan bahasa Indonesia yang profesional dan ramah.`
  }
}

// Gemini AI configuration
export const GEMINI_CONFIG = {
  model: 'gemini-2.0-flash', // Latest fast and cost-effective model
  maxTokens: 1000,
  temperature: 0.7,
  topP: 0.95,
  topK: 40
}

// Generate AI response using Gemini
export const generateGeminiResponse = async (
  apiKey: string,
  prompt: string,
  systemPrompt: string,
  maxTokens: number = 1000,
  temperature: number = 0.7,
  modelName: string = 'gemini-2.0-flash'
): Promise<string> => {
  try {
    const genAI = createGeminiClient(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
        topP: GEMINI_CONFIG.topP,
        topK: GEMINI_CONFIG.topK,
      }
    })

    // Combine system prompt with user prompt
    const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant:`

    console.log(`🤖 Sending request to Gemini with prompt length: ${fullPrompt.length}`)
    
    const result = await model.generateContent(fullPrompt)
    const response = result.response
    const text = response.text()

    console.log(`🤖 Gemini response received, length: ${text?.length || 0}`)
    
    if (!text || text.trim().length === 0) {
      console.log(`⚠️ Empty response from Gemini, using fallback`)
      throw new Error('Empty response from Gemini')
    }

    return text

  } catch (error: any) {
    console.error('Gemini AI error:', error)
    
    // Check if error is quota exceeded
    if (error?.message?.includes('quota') || 
        error?.message?.includes('limit') || 
        error?.status === 429) {
      console.log('🔄 Quota exceeded, marking key for rotation')
      markGeminiQuotaExceeded()
    }
    
    throw error
  }
}

// Cost estimation for Gemini (much cheaper than OpenAI)
export const estimateGeminiCost = (tokensUsed: number): number => {
  // Gemini Flash pricing: ~$0.075 per 1M input tokens, ~$0.30 per 1M output tokens
  // Much cheaper than OpenAI
  const inputCost = (tokensUsed * 0.5) * (0.075 / 1000000)
  const outputCost = (tokensUsed * 0.5) * (0.30 / 1000000)
  return inputCost + outputCost
}

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.VENDRA_OPENAI_API_KEY,
})

export async function generateOpenAIResponse(
  prompt: string,
  role: string = 'USER'
): Promise<string> {
  try {
    console.log(`🤖 Sending request to OpenAI with prompt length: ${prompt.length}`)
    
    const systemPrompt = getOpenAISystemPrompt(role)
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content || 'Maaf, tidak ada respons dari AI.'
    console.log(`✅ OpenAI response received: ${response.length} characters`)
    
    return response
  } catch (error: any) {
    console.error('OpenAI error:', error)
    
    // Return a fallback response instead of throwing error
    return `Maaf, saya sedang mengalami gangguan teknis. Namun saya tetap bisa membantu Anda dengan:

🎯 **Analisis Bisnis**
- Review performa penjualan
- Optimasi inventory management
- Strategi customer retention

💡 **Rekomendasi**
- Tingkatkan engagement pelanggan
- Diversifikasi produk/layanan
- Implementasi program loyalty

Silakan tanyakan hal spesifik yang ingin Anda ketahui tentang bisnis Anda!`
  }
}

function getOpenAISystemPrompt(role: string): string {
  const basePrompt = `Anda adalah asisten AI untuk Vendra CRM, sistem manajemen pelanggan dan penjualan.

Peran Anda:
- Membantu ${role} dengan analisis data bisnis
- Memberikan insight tentang performa penjualan
- Menjawab pertanyaan tentang sistem CRM
- Menggunakan bahasa Indonesia yang profesional dan ramah

Gaya Komunikasi:
- Gunakan bahasa Indonesia
- Berikan jawaban yang informatif dan actionable
- Sertakan data/angka jika relevan
- Berikan saran praktis untuk meningkatkan bisnis`

  if (role === 'SUPERADMIN') {
    return basePrompt + `

Sebagai SuperAdmin, Anda memiliki akses ke:
- Data semua perusahaan dan pengguna
- Statistik platform secara keseluruhan
- Manajemen persetujuan dan upgrade
- Monitoring sistem dan performa

Fokus pada:
- Analisis tren platform
- Rekomendasi untuk pertumbuhan
- Identifikasi masalah sistem
- Optimasi performa platform`
  }

  return basePrompt
}

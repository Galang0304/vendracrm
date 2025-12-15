// Enhanced AI Simulator with Comprehensive Business Context
// Uses real business data for accurate responses

// import { ComprehensiveBusinessContext } from './aiBusinessContext'

// Define the business context type locally to avoid import issues
interface ComprehensiveBusinessContext {
  company: { name: string }
  sales: { totalRevenue: number; totalTransactions: number; averageOrderValue: number; todayRevenue?: number; weeklyRevenue?: number }
  inventory: { totalProducts: number; categories: string[]; lowStockCount: number; totalValue: number }
  customers: { totalCustomers: number; membershipCustomers: number; newCustomersThisMonth: number; topCustomers: any[]; customerSegments: any[] }
  operations: { totalEmployees: number; activeStores: number; storeList: any[]; employeeList: any[] }
  performance: { profitability: string; growth: string; efficiency: number; customerSatisfaction: number; inventoryTurnover: number }
  aiInsights: { strengths: string[]; challenges: string[]; opportunities: string[]; recommendations: string[] }
  alerts: { lowStock: any[]; expiringSoon: any[]; highDemand: any[] }
}

export async function generateEnhancedSimulatedResponse(
  message: string,
  adminRole: string,
  adminName: string,
  context: ComprehensiveBusinessContext,
  chatHistory: any[],
  companyId: string
): Promise<string> {
  
  // Simulate realistic AI processing time
  await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800))
  
  const lowerMessage = message.toLowerCase()
  
  // Welcome/greeting responses
  if (lowerMessage.includes('hai') || lowerMessage.includes('halo') || lowerMessage.includes('hello') || chatHistory.length <= 1) {
    return generateWelcomeResponse(adminRole, adminName, context)
  }
  
  // Sales analysis
  if (lowerMessage.includes('penjualan') || lowerMessage.includes('sales') || lowerMessage.includes('revenue') || lowerMessage.includes('omzet')) {
    return generateSalesAnalysis(context)
  }
  
  // Inventory analysis
  if (lowerMessage.includes('inventory') || lowerMessage.includes('stok') || lowerMessage.includes('produk') || lowerMessage.includes('barang')) {
    return generateInventoryAnalysis(context)
  }
  
  // Customer analysis
  if (lowerMessage.includes('customer') || lowerMessage.includes('pelanggan') || lowerMessage.includes('member')) {
    return generateCustomerAnalysis(context)
  }
  
  // Team/employee analysis
  if (lowerMessage.includes('tim') || lowerMessage.includes('team') || lowerMessage.includes('karyawan') || lowerMessage.includes('employee')) {
    return generateTeamAnalysis(context)
  }
  
  // Business performance
  if (lowerMessage.includes('performa') || lowerMessage.includes('performance') || lowerMessage.includes('bisnis') || lowerMessage.includes('business')) {
    return generateBusinessPerformance(context)
  }
  
  // Recommendations
  if (lowerMessage.includes('saran') || lowerMessage.includes('rekomendasi') || lowerMessage.includes('advice') || lowerMessage.includes('strategi')) {
    return generateRecommendations(context)
  }
  
  // Default intelligent response
  return generateDefaultResponse(context, message)
}

function generateWelcomeResponse(adminRole: string, adminName: string, context: ComprehensiveBusinessContext): string {
  const roleGreeting = {
    'SUPERADMIN': '🏢 **Vendra Platform Intelligence**',
    'OWNER': '👑 **Business Strategy Advisor**',
    'ADMIN': '⚡ **Operations Assistant**'
  }[adminRole] || '🤖 **AI Assistant**'
  
  return `${roleGreeting}

Halo **${adminName}**! Saya AI Assistant yang sudah memahami bisnis **${context.company.name}** Anda dengan lengkap.

## 📊 Data Bisnis Overview

**Produk**: ${context.inventory.totalProducts} items (${context.inventory.categories.length} kategori)
**Penjualan**: ${context.sales.totalTransactions} transaksi
**Revenue**: Rp ${context.sales.totalRevenue.toLocaleString()}
**Pelanggan**: ${context.customers.totalCustomers} customers (${context.customers.membershipCustomers} members)
**Operasional**: ${context.operations.totalEmployees} karyawan, ${context.operations.activeStores} toko aktif

## 🎯 Saya Siap Membantu Dengan

1. **Analisis Penjualan**: Tren bisnis dan performance metrics
2. **Optimasi Inventory**: Stok management dan procurement strategy
3. **Customer Strategy**: Retention program dan growth tactics
4. **Performance Monitoring**: KPI tracking dan business insights
5. **Strategic Planning**: Rekomendasi berdasarkan data real

Apa yang ingin Anda analisis hari ini?`
}

function generateSalesAnalysis(context: ComprehensiveBusinessContext): string {
  const todayRevenue = context.sales.todayRevenue || 0
  const weeklyRevenue = context.sales.weeklyRevenue || 0
  const growthIndicator = weeklyRevenue > todayRevenue * 7 ? '📈 Tren Positif' : '📊 Stabil'
  const avgOrderFormatted = context.sales.averageOrderValue.toLocaleString()
  
  return `# 📈 Analisis Penjualan ${context.company.name}

## 💰 Revenue Performance

Total Revenue: Rp ${context.sales.totalRevenue.toLocaleString()}
Revenue Hari Ini: Rp ${todayRevenue.toLocaleString()}
Revenue Minggu Ini: Rp ${weeklyRevenue.toLocaleString()}
Average Order Value: Rp ${avgOrderFormatted}
Total Transaksi: ${context.sales.totalTransactions}

## 📊 Business Metrics

Profitabilitas: ${context.performance.profitability.toUpperCase()}
Growth Status: ${context.performance.growth.toUpperCase()}
Tren: ${growthIndicator}

## 🎯 Strategic Insights & Rekomendasi

${context.sales.totalTransactions === 0 ? 
  `1. **Customer Acquisition**: Belum ada transaksi - fokus pada customer acquisition
2. **Grand Opening**: Setup promosi grand opening untuk menarik pelanggan pertama  
3. **Product Optimization**: Pastikan produk dan pricing sudah optimal
4. **Marketing Campaign**: Luncurkan campaign awareness untuk brand recognition` :
  `1. **Performance Trend**: ${context.performance.growth === 'growing' ? 'Menunjukkan tren positif dan pertumbuhan yang baik' : 'Performance stabil, ada peluang untuk growth acceleration'}
2. **Average Order Value**: ${context.sales.averageOrderValue > 100000 ? 'AOV sudah cukup baik, pertahankan dengan upselling strategy' : 'Peluang besar untuk meningkatkan AOV melalui bundling dan upselling'}
3. **Customer Base**: ${context.customers.totalCustomers > 0 ? `Customer base ${context.customers.totalCustomers} orang siap untuk retention program dan referral strategy` : 'Fokus pada customer acquisition dan brand awareness'}
4. **Revenue Growth**: Implementasi loyalty program untuk meningkatkan repeat purchase`}

**Next Steps**: Ingin analisis lebih detail untuk periode tertentu atau segmen customer spesifik?`
}

function generateInventoryAnalysis(context: ComprehensiveBusinessContext): string {
  const stockStatus = context.inventory.lowStockCount === 0 ? '✅ Stok Aman' : `⚠️ ${context.inventory.lowStockCount} Item Low Stock`
  const valueFormatted = context.inventory.totalValue.toLocaleString()
  
  return `📦 **Analisis Inventory ${context.company.name}**

📊 **Inventory Overview:**
• Total Produk: ${context.inventory.totalProducts} items
• Nilai Inventory: Rp ${valueFormatted}
• Kategori Produk: ${context.inventory.categories.length} kategori
• Status Stok: ${stockStatus}

${context.inventory.categories.length > 0 ? `🏷️ **Kategori Produk:**
${context.inventory.categories.map((cat: string) => `• ${cat}`).join('\n')}` : ''}

${context.alerts.lowStock.length > 0 ? `⚠️ **Alert Low Stock:**
${context.alerts.lowStock.map((item: any) => `• ${item.productName}: ${item.currentStock}/${item.minStock}`).join('\n')}` : ''}

🎯 **Rekomendasi Inventory:**
${context.inventory.totalProducts === 0 ? 
  '• Mulai tambahkan produk untuk memulai bisnis\n• Setup kategori produk yang jelas\n• Tentukan pricing strategy yang kompetitif' :
  `• ${context.inventory.lowStockCount > 0 ? 'Segera restock produk yang low stock' : 'Inventory management sudah baik'}
• ${context.inventory.categories.length < 3 ? 'Pertimbangkan diversifikasi kategori produk' : 'Portfolio produk sudah beragam'}
• Implementasi ABC analysis untuk optimasi stok
• Setup automatic reorder point untuk efisiensi`}

Butuh analisis detail untuk kategori tertentu?`
}

function generateCustomerAnalysis(context: ComprehensiveBusinessContext): string {
  const membershipRate = context.customers.totalCustomers > 0 ? 
    Math.round((context.customers.membershipCustomers / context.customers.totalCustomers) * 100) : 0
  
  return `👥 **Analisis Customer ${context.company.name}**

📊 **Customer Base:**
• Total Customers: ${context.customers.totalCustomers} orang
• Member Customers: ${context.customers.membershipCustomers} orang (${membershipRate}%)
• New Customers (Bulan Ini): ${context.customers.newCustomersThisMonth} orang
• Customer Segments: ${context.customers.customerSegments.length} segmen

${context.customers.topCustomers.length > 0 ? `🏆 **Top Customers:**
${context.customers.topCustomers.slice(0, 3).map((customer: any) => 
  `• ${customer.name}: Rp ${customer.totalSpent.toLocaleString()}`
).join('\n')}` : ''}

📈 **Customer Insights:**
• Membership Rate: ${membershipRate}% ${membershipRate > 30 ? '(Excellent)' : membershipRate > 15 ? '(Good)' : '(Needs Improvement)'}
• Growth Rate: ${context.customers.newCustomersThisMonth > 0 ? 'Positif' : 'Perlu Strategi Acquisition'}
• Customer Satisfaction: ${context.performance.customerSatisfaction}%

🎯 **Rekomendasi Customer Strategy:**
${context.customers.totalCustomers === 0 ? 
  '• Fokus pada customer acquisition campaign\n• Setup referral program untuk menarik pelanggan\n• Buat customer persona yang jelas' :
  `• ${membershipRate < 20 ? 'Tingkatkan membership program dengan benefit menarik' : 'Membership program sudah efektif'}
• ${context.customers.newCustomersThisMonth === 0 ? 'Butuh strategi acquisition baru' : 'Pertahankan momentum acquisition'}
• Implementasi customer loyalty program
• Analisis customer lifetime value untuk segmentasi`}

Ingin strategi retention yang lebih spesifik?`
}

function generateTeamAnalysis(context: ComprehensiveBusinessContext): string {
  return `👥 **Analisis Tim & Operasional ${context.company.name}**

📊 **Team Overview:**
• Total Karyawan: ${context.operations.totalEmployees} orang
• Toko Aktif: ${context.operations.activeStores} lokasi
• Efficiency Score: ${context.performance.efficiency}%

${context.operations.storeList.length > 0 ? `🏪 **Store Locations:**
${context.operations.storeList.map((store: any) => 
  `• ${store.name} (${store.code}) - ${store.isActive ? 'Aktif' : 'Inactive'}`
).join('\n')}` : ''}

${context.operations.employeeList.length > 0 ? `👨‍💼 **Team Structure:**
${context.operations.employeeList.map((emp: any) => 
  `• ${emp.name} - ${emp.role} ${emp.isActive ? '✅' : '❌'}`
).join('\n')}` : ''}

⚡ **Performance Metrics:**
• Team Efficiency: ${context.performance.efficiency}% ${context.performance.efficiency > 80 ? '(Excellent)' : context.performance.efficiency > 60 ? '(Good)' : '(Needs Improvement)'}
• Store Utilization: ${context.operations.activeStores > 0 ? 'Optimal' : 'Perlu Ekspansi'}

🎯 **Rekomendasi Tim:**
${context.operations.totalEmployees === 0 ? 
  '• Rekrut karyawan pertama untuk operasional\n• Setup job description yang jelas\n• Buat training program untuk onboarding' :
  `• ${context.performance.efficiency < 70 ? 'Implementasi training program untuk meningkatkan produktivitas' : 'Team performance sudah baik'}
• ${context.operations.activeStores === 0 ? 'Setup toko pertama untuk operasional' : 'Pertimbangkan ekspansi ke lokasi baru'}
• Implementasi performance tracking system
• Setup reward system untuk motivasi team`}

Butuh strategi pengembangan tim yang lebih detail?`
}

function generateBusinessPerformance(context: ComprehensiveBusinessContext): string {
  const healthScore = calculateBusinessHealth(context)
  
  return `📊 **Business Performance ${context.company.name}**

🎯 **Overall Health Score: ${healthScore}/100**

💼 **Key Metrics:**
• Profitability: ${context.performance.profitability.toUpperCase()}
• Growth Status: ${context.performance.growth.toUpperCase()}
• Operational Efficiency: ${context.performance.efficiency}%
• Customer Satisfaction: ${context.performance.customerSatisfaction}%
• Inventory Turnover: ${context.performance.inventoryTurnover}x

📈 **Business Strengths:**
${context.aiInsights.strengths.map((strength: string) => `• ${strength}`).join('\n')}

⚠️ **Areas for Improvement:**
${context.aiInsights.challenges.map((challenge: string) => `• ${challenge}`).join('\n')}

🚀 **Growth Opportunities:**
${context.aiInsights.opportunities.map((opportunity: string) => `• ${opportunity}`).join('\n')}

🎯 **Strategic Recommendations:**
${context.aiInsights.recommendations.map((rec: string) => `• ${rec}`).join('\n')}

📊 **Next Steps:**
• Fokus pada area improvement dengan ROI tertinggi
• Implementasi KPI tracking untuk monitoring progress
• Review performance metrics secara berkala
• Optimalkan operasional berdasarkan data insights

Ingin deep dive ke area spesifik mana?`
}

function generateRecommendations(context: ComprehensiveBusinessContext): string {
  const recommendations = generateSmartRecommendations(context)
  
  return `🎯 **Strategic Recommendations untuk ${context.company.name}**

${recommendations.immediate.length > 0 ? `⚡ **Action Items (Immediate):**
${recommendations.immediate.map((item: string) => `• ${item}`).join('\n')}` : ''}

${recommendations.shortTerm.length > 0 ? `📅 **Short-term Goals (1-3 bulan):**
${recommendations.shortTerm.map((item: string) => `• ${item}`).join('\n')}` : ''}

${recommendations.longTerm.length > 0 ? `🚀 **Long-term Strategy (6-12 bulan):**
${recommendations.longTerm.map((item: string) => `• ${item}`).join('\n')}` : ''}

💡 **Pro Tips:**
• Prioritaskan action items berdasarkan ROI dan effort
• Track progress dengan KPI yang measurable
• Review dan adjust strategy setiap bulan
• Fokus pada customer experience sebagai foundation

Ingin saya buatkan action plan yang lebih detail?`
}

function generateDefaultResponse(context: ComprehensiveBusinessContext, message: string): string {
  return `🤖 **AI Assistant ${context.company.name}**

Saya memahami pertanyaan Anda tentang "${message}".

Berdasarkan data bisnis ${context.company.name} yang saya ketahui:
• ${context.inventory.totalProducts} produk dalam inventory
• ${context.sales.totalTransactions} transaksi dengan revenue Rp ${context.sales.totalRevenue.toLocaleString()}
• ${context.customers.totalCustomers} customers dengan ${context.operations.totalEmployees} karyawan

🎯 **Saya bisa membantu dengan:**
• **Analisis Penjualan**: "Bagaimana performa penjualan bulan ini?"
• **Inventory Management**: "Produk mana yang perlu restock?"
• **Customer Insights**: "Bagaimana strategi retention customer?"
• **Team Performance**: "Bagaimana produktivitas tim?"
• **Business Strategy**: "Apa rekomendasi untuk growth?"

Silakan tanya hal spesifik yang ingin Anda ketahui tentang bisnis Anda!`
}

function calculateBusinessHealth(context: ComprehensiveBusinessContext): number {
  let score = 0
  
  // Revenue score (30%)
  if (context.sales.totalRevenue > 0) score += 30
  else if (context.inventory.totalProducts > 0) score += 15
  
  // Customer score (25%)
  if (context.customers.totalCustomers > 10) score += 25
  else if (context.customers.totalCustomers > 0) score += 15
  
  // Inventory score (20%)
  if (context.inventory.totalProducts > 5) score += 20
  else if (context.inventory.totalProducts > 0) score += 10
  
  // Operations score (15%)
  if (context.operations.totalEmployees > 0) score += 15
  if (context.operations.activeStores > 0) score += 10
  
  // Performance score (10%)
  score += Math.min(10, context.performance.efficiency / 10)
  
  return Math.min(100, score)
}

function generateSmartRecommendations(context: ComprehensiveBusinessContext) {
  const immediate: string[] = []
  const shortTerm: string[] = []
  const longTerm: string[] = []
  
  // Immediate actions based on current state
  if (context.inventory.totalProducts === 0) {
    immediate.push('Setup produk pertama dan pricing strategy')
    immediate.push('Buat kategori produk yang jelas')
  }
  
  if (context.inventory.lowStockCount > 0) {
    immediate.push(`Restock ${context.inventory.lowStockCount} produk yang low stock`)
  }
  
  if (context.customers.totalCustomers === 0) {
    immediate.push('Launch customer acquisition campaign')
    immediate.push('Setup social media presence untuk brand awareness')
  }
  
  // Short-term goals
  if (context.customers.membershipCustomers / Math.max(1, context.customers.totalCustomers) < 0.2) {
    shortTerm.push('Implementasi membership program dengan benefit menarik')
  }
  
  if (context.operations.totalEmployees === 0) {
    shortTerm.push('Rekrut karyawan pertama untuk operasional')
  }
  
  if (context.sales.totalTransactions < 10) {
    shortTerm.push('Fokus pada sales conversion dan customer retention')
  }
  
  // Long-term strategy
  if (context.operations.activeStores <= 1) {
    longTerm.push('Evaluasi ekspansi ke lokasi baru')
  }
  
  longTerm.push('Implementasi data analytics untuk business intelligence')
  longTerm.push('Develop customer loyalty program yang comprehensive')
  
  return { immediate, shortTerm, longTerm }
}

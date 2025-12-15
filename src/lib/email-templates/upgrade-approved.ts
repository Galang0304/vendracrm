interface UpgradeApprovedEmailData {
  userName: string
  companyName: string
  upgradeFromTier: string
  upgradeToTier: string
  approvalDate: string
}

export function getUpgradeApprovedEmailTemplate(data: UpgradeApprovedEmailData) {
  const { userName, companyName, upgradeFromTier, upgradeToTier, approvalDate } = data

  const subject = `🎉 Upgrade Berhasil Disetujui - ${upgradeToTier} Plan`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Upgrade Berhasil Disetujui</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-badge { background: #10B981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; display: inline-block; margin: 10px 0; }
            .tier-upgrade { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981; }
            .tier-from { color: #6B7280; text-decoration: line-through; }
            .tier-to { color: #10B981; font-weight: bold; font-size: 18px; }
            .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature-item { padding: 8px 0; border-bottom: 1px solid #E5E7EB; }
            .feature-item:last-child { border-bottom: none; }
            .cta-button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #6B7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Selamat!</h1>
                <p>Upgrade subscription Anda telah disetujui</p>
            </div>
            
            <div class="content">
                <div class="success-badge">✅ DISETUJUI</div>
                
                <p>Halo <strong>${userName}</strong>,</p>
                
                <p>Kabar baik! Permintaan upgrade subscription untuk perusahaan <strong>${companyName}</strong> telah disetujui oleh tim kami.</p>
                
                <div class="tier-upgrade">
                    <h3>Detail Upgrade:</h3>
                    <p>
                        <span class="tier-from">${upgradeFromTier}</span> 
                        → 
                        <span class="tier-to">${upgradeToTier}</span>
                    </p>
                    <p><small>Disetujui pada: ${approvalDate}</small></p>
                </div>

                ${upgradeToTier === 'BASIC' ? `
                <div class="features">
                    <h3>🚀 Fitur BASIC Plan yang Sekarang Aktif:</h3>
                    <div class="feature-item">✅ Penyimpanan 50% dari limit (reset mingguan)</div>
                    <div class="feature-item">✅ Akses AI Assistant</div>
                    <div class="feature-item">✅ Analisis RFM</div>
                    <div class="feature-item">✅ Laporan lanjutan</div>
                    <div class="feature-item">✅ Support prioritas</div>
                </div>
                ` : upgradeToTier === 'PREMIUM' ? `
                <div class="features">
                    <h3>⭐ Fitur PREMIUM Plan yang Sekarang Aktif:</h3>
                    <div class="feature-item">✅ Penyimpanan 100% tanpa batas</div>
                    <div class="feature-item">✅ Akses penuh AI Assistant</div>
                    <div class="feature-item">✅ Analisis RFM lengkap</div>
                    <div class="feature-item">✅ Semua fitur laporan</div>
                    <div class="feature-item">✅ Multi-store unlimited</div>
                    <div class="feature-item">✅ Support 24/7</div>
                </div>
                ` : `
                <div class="features">
                    <h3>💎 Fitur ENTERPRISE Plan yang Sekarang Aktif:</h3>
                    <div class="feature-item">✅ Penyimpanan unlimited</div>
                    <div class="feature-item">✅ Semua fitur premium</div>
                    <div class="feature-item">✅ Custom integrations</div>
                    <div class="feature-item">✅ Dedicated support</div>
                    <div class="feature-item">✅ White-label options</div>
                </div>
                `}

                <p>Anda sekarang dapat langsung menggunakan semua fitur yang tersedia dalam plan <strong>${upgradeToTier}</strong>.</p>
                
                <a href="${process.env.NEXTAUTH_URL}/admin/dashboard" class="cta-button">
                    Masuk ke Dashboard
                </a>
                
                <p>Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi tim support kami.</p>
                
                <p>Terima kasih telah mempercayai layanan kami!</p>
                
                <p>Salam,<br><strong>Tim Vendra Kasir</strong></p>
            </div>
            
            <div class="footer">
                <p>Email ini dikirim secara otomatis. Mohon tidak membalas email ini.</p>
                <p>&copy; 2025 Vendra Kasir. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `

  const text = `
Selamat ${userName}!

Permintaan upgrade subscription untuk perusahaan ${companyName} telah disetujui.

Detail Upgrade:
- Dari: ${upgradeFromTier}
- Ke: ${upgradeToTier}
- Disetujui pada: ${approvalDate}

Anda sekarang dapat menggunakan semua fitur yang tersedia dalam plan ${upgradeToTier}.

Masuk ke dashboard: ${process.env.NEXTAUTH_URL}/admin/dashboard

Terima kasih telah mempercayai layanan kami!

Tim Vendra Kasir
  `

  return { subject, html, text }
}

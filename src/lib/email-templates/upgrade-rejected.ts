interface UpgradeRejectedEmailData {
  userName: string
  companyName: string
  requestedTier: string
  rejectionReason?: string
  rejectionDate: string
}

export function getUpgradeRejectedEmailTemplate(data: UpgradeRejectedEmailData) {
  const { userName, companyName, requestedTier, rejectionReason, rejectionDate } = data

  const subject = `❌ Permintaan Upgrade Ditolak - ${requestedTier} Plan`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Permintaan Upgrade Ditolak</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .rejection-badge { background: #ef4444; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; display: inline-block; margin: 10px 0; }
            .rejection-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
            .reason-box { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .next-steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .step-item { padding: 8px 0; border-bottom: 1px solid #E5E7EB; }
            .step-item:last-child { border-bottom: none; }
            .cta-button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #6B7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>❌ Permintaan Ditolak</h1>
                <p>Upgrade subscription tidak dapat diproses</p>
            </div>
            
            <div class="content">
                <div class="rejection-badge">❌ DITOLAK</div>
                
                <p>Halo <strong>${userName}</strong>,</p>
                
                <p>Kami informasikan bahwa permintaan upgrade subscription untuk perusahaan <strong>${companyName}</strong> ke plan <strong>${requestedTier}</strong> tidak dapat disetujui saat ini.</p>
                
                <div class="rejection-info">
                    <h3>Detail Penolakan:</h3>
                    <p><strong>Plan yang diminta:</strong> ${requestedTier}</p>
                    <p><strong>Ditolak pada:</strong> ${rejectionDate}</p>
                </div>

                ${rejectionReason ? `
                <div class="reason-box">
                    <h4 style="margin: 0 0 10px 0; color: #dc2626;">Alasan Penolakan:</h4>
                    <p style="margin: 0; color: #7f1d1d;">${rejectionReason}</p>
                </div>
                ` : ''}

                <div class="next-steps">
                    <h3>🔄 Langkah Selanjutnya:</h3>
                    <div class="step-item">✅ Periksa kembali dokumen pembayaran yang dikirim</div>
                    <div class="step-item">✅ Pastikan pembayaran sesuai dengan nominal yang tertera</div>
                    <div class="step-item">✅ Hubungi customer service untuk klarifikasi</div>
                    <div class="step-item">✅ Ajukan ulang permintaan upgrade setelah perbaikan</div>
                </div>

                <p>Anda dapat mengajukan permintaan upgrade kembali setelah memastikan semua persyaratan terpenuhi.</p>
                
                <a href="${process.env.NEXTAUTH_URL}/admin/subscription" class="cta-button">
                    Ajukan Upgrade Ulang
                </a>
                
                <p>Jika Anda memiliki pertanyaan atau memerlukan bantuan, jangan ragu untuk menghubungi tim support kami.</p>
                
                <p>Terima kasih atas pengertiannya.</p>
                
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
Halo ${userName},

Permintaan upgrade subscription untuk perusahaan ${companyName} ke plan ${requestedTier} tidak dapat disetujui.

Detail Penolakan:
- Plan yang diminta: ${requestedTier}
- Ditolak pada: ${rejectionDate}
${rejectionReason ? `- Alasan: ${rejectionReason}` : ''}

Langkah Selanjutnya:
1. Periksa kembali dokumen pembayaran
2. Pastikan pembayaran sesuai nominal
3. Hubungi customer service untuk klarifikasi
4. Ajukan ulang setelah perbaikan

Ajukan upgrade ulang: ${process.env.NEXTAUTH_URL}/admin/subscription

Terima kasih atas pengertiannya.

Tim Vendra Kasir
  `

  return { subject, html, text }
}

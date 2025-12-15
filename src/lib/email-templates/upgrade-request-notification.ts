interface UpgradeRequestNotificationData {
  userName: string
  companyName: string
  userEmail: string
  requestedTier: string
  paymentMethod: string
  requestDate: string
  adminUrl: string
}

export function getUpgradeRequestNotificationTemplate(data: UpgradeRequestNotificationData) {
  const { userName, companyName, userEmail, requestedTier, paymentMethod, requestDate, adminUrl } = data

  const subject = `🔔 Permintaan Upgrade Baru - ${requestedTier} Plan`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Permintaan Upgrade Baru</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .notification-badge { background: #f59e0b; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; display: inline-block; margin: 10px 0; }
            .request-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E7EB; }
            .info-row:last-child { border-bottom: none; }
            .info-label { font-weight: bold; color: #374151; }
            .info-value { color: #6B7280; }
            .cta-button { background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #6B7280; font-size: 14px; }
            .urgent { background: #fef3c7; border: 1px solid #fcd34d; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔔 Permintaan Upgrade Baru</h1>
                <p>Menunggu persetujuan SuperAdmin</p>
            </div>
            
            <div class="content">
                <div class="notification-badge">🔔 PERMINTAAN BARU</div>
                
                <p>Halo <strong>SuperAdmin</strong>,</p>
                
                <p>Ada permintaan upgrade subscription baru yang memerlukan persetujuan Anda.</p>
                
                <div class="request-info">
                    <h3>📋 Detail Permintaan:</h3>
                    <div class="info-row">
                        <span class="info-label">Nama User:</span>
                        <span class="info-value">${userName}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Email:</span>
                        <span class="info-value">${userEmail}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Perusahaan:</span>
                        <span class="info-value">${companyName}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Plan Diminta:</span>
                        <span class="info-value"><strong>${requestedTier}</strong></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Metode Pembayaran:</span>
                        <span class="info-value">${paymentMethod}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Tanggal Permintaan:</span>
                        <span class="info-value">${requestDate}</span>
                    </div>
                </div>

                <div class="urgent">
                    <h4 style="margin: 0 0 10px 0; color: #92400e;">⚡ Action Required:</h4>
                    <p style="margin: 0; color: #92400e;">Silakan review bukti pembayaran dan setujui atau tolak permintaan ini.</p>
                </div>

                <p>Klik tombol di bawah untuk mengakses panel SuperAdmin dan memproses permintaan ini:</p>
                
                <a href="${adminUrl}" class="cta-button">
                    🔍 Review Permintaan
                </a>
                
                <p><small>Link akan mengarahkan Anda ke halaman manajemen upgrade requests.</small></p>
                
                <p>Terima kasih!</p>
                
                <p>Salam,<br><strong>Sistem Vendra Kasir</strong></p>
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
Permintaan Upgrade Baru - ${requestedTier} Plan

Halo SuperAdmin,

Ada permintaan upgrade subscription baru yang memerlukan persetujuan Anda.

Detail Permintaan:
- Nama User: ${userName}
- Email: ${userEmail}
- Perusahaan: ${companyName}
- Plan Diminta: ${requestedTier}
- Metode Pembayaran: ${paymentMethod}
- Tanggal Permintaan: ${requestDate}

Action Required:
Silakan review bukti pembayaran dan setujui atau tolak permintaan ini.

Review permintaan: ${adminUrl}

Terima kasih!

Sistem Vendra Kasir
  `

  return { subject, html, text }
}

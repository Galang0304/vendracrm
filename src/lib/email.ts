import nodemailer from 'nodemailer'

// Create transporter using Gmail SMTP - recreate each time to ensure fresh env vars
function createTransporter() {
  console.log('Creating transporter with:', {
    user: process.env.EMAIL_USER,
    passLength: process.env.EMAIL_PASS?.length
  })
  
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  })
}

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP email
export async function sendOTPEmail(email: string, otp: string, name: string): Promise<boolean> {
  try {
    console.log('🔧 Sending OTP email to:', email)
    const transporter = createTransporter()
    
    // Test connection first
    await transporter.verify()
    console.log('✅ Transporter verified successfully')
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Vendra CRM <noreply@vendra.com>',
      to: email,
      subject: 'Kode Verifikasi OTP - Vendra CRM',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Kode Verifikasi OTP</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Vendra CRM</h1>
              <p style="color: #bfdbfe; margin: 10px 0 0 0; font-size: 16px;">Verifikasi Email Anda</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 20px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Halo ${name}!</h2>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                Terima kasih telah mendaftar di Vendra CRM. Untuk melanjutkan proses registrasi, silakan masukkan kode verifikasi berikut:
              </p>
              
              <!-- OTP Code -->
              <div style="text-align: center; margin: 40px 0;">
                <div style="display: inline-block; background-color: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 8px; padding: 20px 40px;">
                  <div style="font-size: 36px; font-weight: bold; color: #2563eb; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                    ${otp}
                  </div>
                </div>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 30px 0;">
                Kode ini akan kedaluwarsa dalam <strong>10 menit</strong>
              </p>
              
              <!-- Security Notice -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 30px 0; border-radius: 4px;">
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  <strong>Catatan Keamanan:</strong> Jangan bagikan kode ini kepada siapa pun. Tim Vendra tidak akan pernah meminta kode verifikasi Anda melalui telepon atau email.
                </p>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 20px 0 0 0; font-size: 14px;">
                Jika Anda tidak melakukan pendaftaran ini, abaikan email ini.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0; font-size: 12px;">
                © 2024 Vendra CRM. All rights reserved.<br>
                Email ini dikirim secara otomatis, mohon jangan membalas.
              </p>
            </div>
            
          </div>
        </body>
        </html>
      `,
      text: `
        Halo ${name}!
        
        Terima kasih telah mendaftar di Vendra CRM.
        
        Kode verifikasi OTP Anda adalah: ${otp}
        
        Kode ini akan kedaluwarsa dalam 10 menit.
        
        Jangan bagikan kode ini kepada siapa pun.
        
        Jika Anda tidak melakukan pendaftaran ini, abaikan email ini.
        
        Terima kasih,
        Tim Vendra CRM
      `
    }

    await transporter.sendMail(mailOptions)
    console.log('✅ OTP email sent successfully')
    return true
  } catch (error) {
    console.error('Error sending OTP email:', error)
    return false
  }
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, resetCode: string) {
  try {
    console.log('🔧 Sending password reset email to:', email)
    const resetTransporter = createTransporter()
    
    // Test connection first
    await resetTransporter.verify()
    console.log('✅ Reset transporter verified successfully')
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Reset Password - Vendra CRM',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Password - Vendra CRM</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #14b8a6 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
            .content { padding: 40px 20px; }
            .reset-code { background-color: #f1f5f9; border: 2px dashed #64748b; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
            .reset-code .code { font-size: 32px; font-weight: 700; color: #1e293b; letter-spacing: 4px; font-family: 'Courier New', monospace; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
            .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Reset Password</h1>
            </div>
            <div class="content">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Kode Reset Password</h2>
              <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
                Kami menerima permintaan untuk mereset password akun Anda. Masukkan kode berikut di halaman verifikasi:
              </p>
              
              <div class="reset-code">
                <p style="margin: 0 0 10px 0; color: #64748b; font-weight: 600;">Kode Reset Password:</p>
                <div class="code">${resetCode}</div>
              </div>
              
              <div class="warning">
                <p style="margin: 0; color: #92400e; font-weight: 600;">⚠️ Penting:</p>
                <ul style="margin: 10px 0 0 0; color: #92400e;">
                  <li>Kode ini akan kedaluwarsa dalam 1 jam</li>
                  <li>Jangan bagikan kode ini kepada siapa pun</li>
                  <li>Jika Anda tidak meminta reset password, abaikan email ini</li>
                </ul>
              </div>
              
              <p style="color: #475569; line-height: 1.6; margin-top: 20px;">
                Setelah memasukkan kode, Anda akan dapat mengatur password baru untuk akun Anda.
              </p>
            </div>
            <div class="footer">
              <p>© 2024 Vendra CRM. Semua hak dilindungi.</p>
              <p>Email ini dikirim secara otomatis, mohon jangan membalas.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    await resetTransporter.sendMail(mailOptions)
    console.log('✅ Password reset email sent successfully')
    return true
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return false
  }
}

// Send welcome email for approved accounts
export async function sendWelcomeEmail(email: string, name: string, subscriptionTier: string): Promise<boolean> {
  try {
    const transporter = createTransporter()
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Vendra CRM <noreply@vendra.com>',
      to: email,
      subject: 'Selamat Datang di Vendra CRM!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Selamat Datang di Vendra CRM</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Vendra CRM</h1>
              <p style="color: #bfdbfe; margin: 10px 0 0 0; font-size: 16px;">Selamat Datang!</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 20px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Halo ${name}!</h2>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                Selamat! Akun Vendra CRM Anda telah berhasil diaktifkan dan siap digunakan.
              </p>
              
              <!-- Plan Info -->
              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 18px;">Paket Berlangganan Anda</h3>
                <p style="color: #1e40af; margin: 0; font-size: 16px; font-weight: bold;">${subscriptionTier}</p>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 20px 0; font-size: 16px;">
                Anda sekarang dapat mengakses semua fitur Vendra CRM dan mulai mengelola bisnis Anda dengan lebih efisien.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL}/auth/signin" 
                   style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                  Masuk ke Dashboard
                </a>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 20px 0 0 0; font-size: 14px;">
                Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi tim support kami.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0; font-size: 12px;">
                © 2024 Vendra CRM. All rights reserved.<br>
                Email ini dikirim secara otomatis, mohon jangan membalas.
              </p>
            </div>
            
          </div>
        </body>
        </html>
      `
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return false
  }
}

// Generic send email function
export async function sendEmail(
  to: string, 
  subject: string, 
  html: string, 
  text?: string
): Promise<boolean> {
  try {
    const transporter = createTransporter()
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Vendra CRM <noreply@vendra.com>',
      to,
      subject,
      html,
      text
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

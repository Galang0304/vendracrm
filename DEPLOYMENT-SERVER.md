# 🚀 Vendra CRM - Server Deployment Guide
# Server: galang0304@103.151.145.182

## 🎉 DEPLOYMENT SUKSES!
✅ **URL Aplikasi**: http://103.151.145.182:8081
✅ **Login Credentials**:
- Email: `superadmin@vendra.com`
- Password: `superadmin123`

## Database Configuration
- **MySQL User**: `vendracrm` (password: `vendra2025db!`)
- **Database**: `vendra_crm`
- **Connection**: `mysql://vendracrm:vendra2025db!@localhost:3306/vendra_crm`

## Quick Setup Commands (Copy & Paste di SSH)

### 1. Install Node.js (jika belum ada)
```bash
# Check Node.js version
node -v

# Jika belum ada, install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Clone Repository
```bash
cd ~
git clone https://github.com/Galang0304/vendracrm.git
cd vendracrm
```

### 3. Setup Environment Variables
```bash
# Copy .env.example
cp .env.example .env

# Edit .env
nano .env

# WAJIB diisi:
# APP_URL="http://103.151.145.182:3001"
# NEXTAUTH_URL="http://103.151.145.182:3001"
# DATABASE_URL="mysql://user:password@localhost:3306/vendra_crm"
# NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Setup Database
```bash
# Generate Prisma Client
npx prisma generate

# Push schema ke database (pastikan MySQL sudah running)
npx prisma db push

# Optional: Seed data
npx prisma db seed
```

### 6. Build Application
```bash
npm run build
```

### 7. Run Production (dengan PM2)
```bash
# Install PM2
sudo npm install -g pm2

# Start application
pm2 start npm --name "vendra-crm" -- start

# Save PM2 config
pm2 save

# Setup auto-start on boot
pm2 startup
# (copy & paste command yang muncul)

# Monitor logs
pm2 logs vendra-crm
```

### 8. Setup Firewall (Optional)
```bash
sudo ufw allow 3001/tcp
sudo ufw enable
```

## 🔧 Management Commands

```bash
# Stop application
pm2 stop vendra-crm

# Restart application
pm2 restart vendra-crm

# View logs
pm2 logs vendra-crm

# Monitor
pm2 monit

# Update code from GitHub
cd ~/vendracrm
git pull
npm install
npm run build
pm2 restart vendra-crm
```

## 🌐 Access Application

After deployment:
- **URL**: http://103.151.145.182:3001
- **SuperAdmin**: superadmin@vendra.com / superadmin123

## 📋 Requirements Checklist

- [ ] Node.js 18+ installed
- [ ] MySQL database running
- [ ] Database created (vendra_crm)
- [ ] MySQL user with permissions
- [ ] Port 3001 open in firewall
- [ ] .env file configured
- [ ] Prisma schema pushed
- [ ] Application built
- [ ] PM2 running application

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check MySQL is running
sudo systemctl status mysql

# Create database
mysql -u root -p
CREATE DATABASE vendra_crm;
CREATE USER 'vendra'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON vendra_crm.* TO 'vendra'@'localhost';
FLUSH PRIVILEGES;
```

### Port Already in Use
```bash
# Check what's using port 3001
sudo lsof -i :3001

# Kill process
pm2 delete vendra-crm
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

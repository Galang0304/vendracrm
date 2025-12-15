# 📚 MODUL 6: Deployment & Production

## Tujuan Pembelajaran
Setelah mempelajari modul ini, Anda akan bisa:
- Deploy aplikasi ke VPS server
- Setup production environment
- Configure PM2 process manager
- Troubleshooting production issues
- Maintenance & monitoring

---

## 🚀 Production Deployment

### Server Requirements

**Minimum Specs:**
- CPU: 2 cores
- RAM: 2GB
- Storage: 20GB SSD
- OS: Ubuntu 20.04+ / Debian 11+
- Node.js: v20+
- MySQL: 8.0+

**Recommended:**
- CPU: 4 cores
- RAM: 4GB
- Storage: 40GB SSD

---

## 📦 Pre-Deployment Checklist

### 1. Code Preparation

```bash
# Pastikan tidak ada error
npm run build

# Test semua fitur
npm run dev

# Check dependencies
npm audit

# Fix vulnerabilities
npm audit fix
```

### 2. Environment Variables

Create `.env.production`:

```env
# App
NODE_ENV=production
APP_URL=http://your-domain.com
PORT=8081

# Database
DATABASE_URL=mysql://vendracrm:secure_password@localhost:3306/vendra_crm

# NextAuth
NEXTAUTH_URL=http://your-domain.com
NEXTAUTH_SECRET=your-super-long-secret-key-minimum-32-characters

# AI (Optional)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Security Checklist

- [ ] Change all default passwords
- [ ] Use strong NEXTAUTH_SECRET
- [ ] Hide sensitive data in .env
- [ ] Add .env to .gitignore
- [ ] Enable firewall
- [ ] Setup SSL certificate (HTTPS)
- [ ] Rate limiting on API

---

## 🖥️ VPS Server Setup

### Step 1: Connect to Server

```bash
# SSH to server
ssh root@your-server-ip

# Or with specific user
ssh username@your-server-ip
```

### Step 2: Update System

```bash
# Update package lists
sudo apt update

# Upgrade packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential
```

### Step 3: Install Node.js

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node -v    # Should show v20.x.x
npm -v     # Should show 10.x.x
```

### Step 4: Install MySQL

```bash
# Install MySQL Server
sudo apt install -y mysql-server

# Secure installation
sudo mysql_secure_installation

# Login to MySQL
sudo mysql

# Create database & user
CREATE DATABASE vendra_crm;
CREATE USER 'vendracrm'@'localhost' IDENTIFIED BY 'SecurePassword123!';
GRANT ALL PRIVILEGES ON vendra_crm.* TO 'vendracrm'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 5: Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify
pm2 -v
```

---

## 📥 Deploy Application

### Step 1: Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone from GitHub
git clone https://github.com/YourUsername/vendracrm.git

# Enter directory
cd vendracrm
```

### Step 2: Install Dependencies

```bash
# Install packages
npm install

# For production (skip devDependencies)
npm install --production
```

### Step 3: Setup Environment

```bash
# Create .env file
nano .env

# Paste production environment variables
# Save: Ctrl+O, Enter, Ctrl+X
```

### Step 4: Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Or push schema
npx prisma db push

# Import sample data (if any)
mysql -u vendracrm -p vendra_crm < database-dump.sql
```

### Step 5: Create Super Admin

```bash
# Run password change script
node scripts/change-superadmin-password.js
```

### Step 6: Build Application

```bash
# Build for production
npm run build
```

---

## ⚙️ PM2 Process Manager

### PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'vendra-crm',
    script: 'npm',
    args: 'start',
    cwd: '/home/username/vendracrm',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 8081
    }
  }]
}
```

### PM2 Commands

```bash
# Start application
pm2 start ecosystem.config.js

# Or start directly
pm2 start npm --name "vendra-crm" -- start

# Check status
pm2 status

# View logs
pm2 logs vendra-crm

# View logs (real-time)
pm2 logs vendra-crm --lines 100

# Restart app
pm2 restart vendra-crm

# Stop app
pm2 stop vendra-crm

# Delete from PM2
pm2 delete vendra-crm

# Save PM2 config
pm2 save

# Auto-start on boot
pm2 startup
# Copy & run the command shown

# Monitor
pm2 monit
```

### PM2 Ecosystem File (Advanced)

```javascript
module.exports = {
  apps: [{
    name: 'vendra-crm',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 'max',  // Use all CPU cores
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 8081
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
```

---

## 🔒 Security Setup

### Firewall (UFW)

```bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP & HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow custom port (e.g., 8081)
sudo ufw allow 8081/tcp

# Check status
sudo ufw status
```

### SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot

# Get certificate (for standalone server)
sudo certbot certonly --standalone -d your-domain.com

# Certificate will be in:
# /etc/letsencrypt/live/your-domain.com/fullchain.pem
# /etc/letsencrypt/live/your-domain.com/privkey.pem

# Auto-renewal (test)
sudo certbot renew --dry-run
```

### Nginx Reverse Proxy (Optional)

```bash
# Install Nginx
sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/vendra-crm

# Paste configuration:
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/vendra-crm /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔄 Update & Maintenance

### Update Application

```bash
# SSH to server
ssh username@your-server-ip

# Navigate to project
cd ~/vendracrm

# Pull latest code
git pull origin main

# Install new dependencies
npm install

# Rebuild
npm run build

# Restart PM2
pm2 restart vendra-crm

# Check logs
pm2 logs vendra-crm --lines 50
```

### Database Migrations

```bash
# SSH to server
cd ~/vendracrm

# Run migrations
npx prisma migrate deploy

# Or push schema changes
npx prisma db push

# Restart app
pm2 restart vendra-crm
```

### Backup Database

```bash
# Backup database
mysqldump -u vendracrm -p vendra_crm > backup_$(date +%Y%m%d).sql

# Compress backup
gzip backup_*.sql

# Download to local (from local machine)
scp username@server-ip:~/backup_20251215.sql.gz ./backups/
```

### Restore Database

```bash
# Upload backup to server
scp backup.sql username@server-ip:~/

# SSH to server
ssh username@server-ip

# Restore
mysql -u vendracrm -p vendra_crm < backup.sql
```

---

## 📊 Monitoring

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Process info
pm2 info vendra-crm

# Show all processes
pm2 list

# Memory usage
pm2 ls | grep memory
```

### System Monitoring

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Or use htop
sudo apt install htop
htop

# Check logs
tail -f ~/.pm2/logs/vendra-crm-out.log
tail -f ~/.pm2/logs/vendra-crm-error.log
```

### Application Logs

```bash
# PM2 logs
pm2 logs vendra-crm

# Logs with timestamp
pm2 logs vendra-crm --timestamp

# Error logs only
pm2 logs vendra-crm --err

# Last 100 lines
pm2 logs vendra-crm --lines 100
```

---

## 🐛 Troubleshooting

### Issue 1: Application Won't Start

```bash
# Check PM2 status
pm2 status

# View error logs
pm2 logs vendra-crm --err

# Try manual start
cd ~/vendracrm
npm start

# Check port availability
sudo lsof -i :8081
```

### Issue 2: Database Connection Failed

```bash
# Check MySQL running
sudo systemctl status mysql

# Start MySQL
sudo systemctl start mysql

# Test connection
mysql -u vendracrm -p vendra_crm

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### Issue 3: Out of Memory

```bash
# Check memory
free -h

# Increase PM2 max memory
pm2 restart vendra-crm --max-memory-restart 2G

# Or edit ecosystem.config.js
nano ecosystem.config.js
# Change max_memory_restart: '2G'
```

### Issue 4: High CPU Usage

```bash
# Check process
top

# Restart application
pm2 restart vendra-crm

# Scale down instances
pm2 scale vendra-crm 1

# Check logs for errors
pm2 logs vendra-crm
```

---

## ✅ Post-Deployment Checklist

- [ ] Application accessible at domain/IP
- [ ] Super admin can login
- [ ] Database connected properly
- [ ] All CRUD operations working
- [ ] File uploads working
- [ ] Email sending working (if configured)
- [ ] AI features working (if configured)
- [ ] PM2 auto-start enabled
- [ ] Backups scheduled
- [ ] Monitoring setup
- [ ] SSL certificate installed (if using domain)
- [ ] Firewall configured

---

## 📝 Production URLs

### Development
```
http://localhost:3001
```

### Production (Example)
```
http://103.151.145.182:8081        # Direct IP
http://vendra-crm.yourdomain.com   # With domain
https://vendra-crm.yourdomain.com  # With SSL
```

---

## 🎓 Latihan Praktik

### Exercise 1: Local Production Build

```bash
# Build locally
npm run build

# Start production server
npm start

# Test at http://localhost:3000
```

### Exercise 2: PM2 Practice

```bash
# Install PM2 locally
npm install -g pm2

# Start app with PM2
pm2 start npm --name "vendra-test" -- start

# Monitor
pm2 monit

# Stop & delete
pm2 delete vendra-test
```

---

## 📚 Resources

### Documentation
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Nginx Documentation](https://nginx.org/en/docs/)

### Tools
- [PM2](https://pm2.keymetrics.io/) - Process Manager
- [Let's Encrypt](https://letsencrypt.org/) - Free SSL
- [UFW](https://help.ubuntu.com/community/UFW) - Firewall

---

## 📝 Checklist Pemahaman

- [ ] Saya paham server requirements
- [ ] Saya bisa setup VPS server
- [ ] Saya bisa deploy aplikasi
- [ ] Saya bisa configure PM2
- [ ] Saya bisa setup database di server
- [ ] Saya paham security basics
- [ ] Saya bisa update aplikasi di production
- [ ] Saya bisa troubleshoot common issues
- [ ] Saya bisa backup & restore database
- [ ] Saya bisa monitor aplikasi

---

## 🎉 Selamat!

Anda telah menyelesaikan semua modul pembelajaran Vendra CRM!

**Yang Sudah Dipelajari:**
1. ✅ Pengenalan & Arsitektur
2. ✅ Setup & Instalasi
3. ✅ Frontend (Pages & Components)
4. ✅ Backend (API Routes)
5. ✅ Database (Prisma ORM)
6. ✅ Deployment & Production

**Next Steps:**
- Eksperimen dengan fitur-fitur baru
- Customize aplikasi sesuai kebutuhan
- Deploy ke production server
- Contribute ke project

---

**📖 Modul 6 - Selesai**

**🎊 SEMUA MODUL SELESAI!**

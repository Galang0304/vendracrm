#!/bin/bash
# Vendra CRM Deployment Script
# Server: 103.151.145.182

echo "🚀 Starting Vendra CRM Deployment..."

# 1. Check if Node.js installed
echo "📦 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js $(node -v) found"
fi

# 2. Check if npm installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js first"
    exit 1
else
    echo "✅ npm $(npm -v) found"
fi

# 3. Clone repository
echo "📥 Cloning repository..."
cd ~
if [ -d "vendracrm" ]; then
    echo "⚠️  Directory vendracrm already exists. Updating..."
    cd vendracrm
    git pull
else
    git clone https://github.com/Galang0304/vendracrm.git
    cd vendracrm
fi

# 4. Create .env file
echo "⚙️  Setting up environment variables..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your settings:"
    echo "   nano .env"
    echo ""
    echo "Required settings:"
    echo "  - APP_URL=http://103.151.145.182:3001"
    echo "  - DATABASE_URL=mysql://user:password@localhost:3306/vendra_crm"
    echo "  - NEXTAUTH_SECRET=$(openssl rand -base64 32)"
    echo ""
    read -p "Press Enter after you've edited .env file..."
else
    echo "✅ .env file already exists"
fi

# 5. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 6. Setup Prisma
echo "🗄️  Setting up database..."
npx prisma generate
echo "⚠️  Run 'npx prisma db push' after configuring your database"

# 7. Build application
echo "🔨 Building application..."
npm run build

# 8. Install PM2 for process management
echo "📦 Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# 9. Create PM2 ecosystem file
echo "⚙️  Creating PM2 configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'vendra-crm',
    script: 'npm',
    args: 'start',
    cwd: '/home/galang0304/vendracrm',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
EOF

echo ""
echo "✅ Deployment setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env file: nano .env"
echo "2. Setup database: npx prisma db push"
echo "3. Start application: pm2 start ecosystem.config.js"
echo "4. Save PM2 config: pm2 save"
echo "5. Setup PM2 startup: pm2 startup"
echo ""
echo "🌐 Access your app at: http://103.151.145.182:3001"

# 📚 MODUL 2: Setup & Instalasi Project

## Tujuan Pembelajaran
Setelah mempelajari modul ini, Anda akan bisa:
- Install semua tools yang diperlukan
- Clone dan setup project Vendra CRM
- Menjalankan aplikasi di local
- Troubleshooting masalah umum

---

## 🛠️ Prerequisites (Tools yang Dibutuhkan)

### 1. Node.js & npm
**Node.js** adalah runtime JavaScript di server (bukan di browser).

#### Download & Install:
- Website: https://nodejs.org
- Pilih versi **LTS (Long Term Support)** - saat ini v20.x
- Download installer sesuai OS (Windows/Mac/Linux)
- Install dengan default settings

#### Verify Installation:
```bash
# Check Node.js version
node -v
# Output: v20.19.6 (atau versi lainnya)

# Check npm version
npm -v
# Output: 10.8.2 (atau versi lainnya)
```

### 2. MySQL Database
**MySQL** adalah database server untuk menyimpan data.

#### Windows:
- Download: https://dev.mysql.com/downloads/installer/
- Pilih "MySQL Installer for Windows"
- Install MySQL Server 8.0
- Set root password (ingat password ini!)

#### Mac:
```bash
brew install mysql
mysql_secure_installation
```

#### Linux (Ubuntu):
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

#### Verify Installation:
```bash
mysql --version
# Output: mysql  Ver 8.0.44 (atau versi lainnya)
```

### 3. Git (Version Control)
**Git** untuk clone repository dari GitHub.

#### Download & Install:
- Website: https://git-scm.com
- Install dengan default settings

#### Verify Installation:
```bash
git --version
# Output: git version 2.43.0 (atau versi lainnya)
```

### 4. Code Editor (VS Code)
**VS Code** adalah text editor untuk coding.

#### Download & Install:
- Website: https://code.visualstudio.com
- Install extensions yang direkomendasikan:
  - ESLint
  - Prettier
  - Prisma
  - TypeScript and JavaScript Language Features

---

## 📥 Download & Setup Project

### Step 1: Clone Repository

```bash
# Buka terminal/command prompt
# Navigate ke folder projects Anda
cd C:\Users\YourName\Documents

# Clone repository
git clone https://github.com/Galang0304/vendracrm.git

# Masuk ke folder project
cd vendracrm
```

**Penjelasan:**
- `git clone` = Download project dari GitHub
- URL repository: https://github.com/Galang0304/vendracrm.git
- Folder baru `vendracrm` akan dibuat

### Step 2: Install Dependencies

```bash
# Install semua packages yang dibutuhkan
npm install

# Tunggu sampai selesai (bisa 2-5 menit)
```

**Apa yang terjadi:**
- npm membaca file `package.json`
- Download semua dependencies ke folder `node_modules`
- Total size ~500MB (normal untuk project Next.js)

**Jika ada error:**
```bash
# Coba dengan clean install
npm ci
```

### Step 3: Setup Database

#### 3.1 Create Database

```bash
# Login ke MySQL
mysql -u root -p
# Enter password MySQL Anda

# Buat database
CREATE DATABASE vendra_crm;

# Buat user khusus untuk aplikasi
CREATE USER 'vendracrm'@'localhost' IDENTIFIED BY 'password123';

# Berikan akses ke database
GRANT ALL PRIVILEGES ON vendra_crm.* TO 'vendracrm'@'localhost';

# Apply changes
FLUSH PRIVILEGES;

# Keluar dari MySQL
EXIT;
```

**Penjelasan:**
- `vendra_crm` = nama database
- `vendracrm` = username database
- `password123` = password (ganti dengan password yang aman!)

#### 3.2 Import Sample Data (Optional)

Jika ada file SQL dump:
```bash
mysql -u vendracrm -p vendra_crm < vendra_crm.sql
```

### Step 4: Setup Environment Variables

Environment variables = konfigurasi rahasia yang tidak di-commit ke Git.

#### 4.1 Copy Template

```bash
# Copy file .env.example ke .env
copy .env.example .env

# Atau di Mac/Linux
cp .env.example .env
```

#### 4.2 Edit File .env

Buka file `.env` dengan text editor dan isi:

```env
# Database Configuration
DATABASE_URL="mysql://vendracrm:password123@localhost:3306/vendra_crm"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"

# App Configuration
APP_URL="http://localhost:3001"
NODE_ENV="development"
PORT=3001

# OpenAI (Optional - untuk AI features)
OPENAI_API_KEY="sk-xxxxxxxxxxxxxx"

# Google Gemini (Optional)
GEMINI_API_KEY="xxxxxxxxxxxxxx"

# Email Configuration (Optional)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your@gmail.com"
EMAIL_PASS="your-app-password"
```

**Cara Generate NEXTAUTH_SECRET:**

Windows PowerShell:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Mac/Linux:
```bash
openssl rand -base64 32
```

**Penjelasan Setting:**
- `DATABASE_URL` = Connection string ke MySQL
  - Format: `mysql://username:password@host:port/database`
- `NEXTAUTH_URL` = Base URL aplikasi Anda
- `NEXTAUTH_SECRET` = Secret key untuk encrypt session
- `PORT` = Port untuk development server

### Step 5: Generate Prisma Client

Prisma perlu generate client code dari schema:

```bash
# Generate Prisma Client
npx prisma generate
```

**Output:**
```
✔ Generated Prisma Client (v5.22.0)
```

### Step 6: Push Database Schema

Push schema Prisma ke MySQL:

```bash
# Push schema (create tables)
npx prisma db push
```

**Apa yang terjadi:**
- Prisma membaca file `prisma/schema.prisma`
- Create semua tables di MySQL
- Tables: users, companies, products, transactions, dll

**Output:**
```
🚀 Your database is now in sync with your Prisma schema.
✔ Generated Prisma Client
```

### Step 7: Seed Initial Data (Optional)

Jika ada seed script:

```bash
# Run seed
npx prisma db seed
```

Atau create super admin manually:
```bash
node scripts/change-superadmin-password.js
```

---

## 🚀 Menjalankan Aplikasi

### Development Mode

```bash
# Start development server
npm run dev
```

**Output:**
```
  ▲ Next.js 15.2.3
  - Local:        http://localhost:3001
  - Environments: .env

 ✓ Ready in 2.5s
```

### Buka Browser

1. Buka browser (Chrome/Firefox/Edge)
2. Navigate ke: **http://localhost:3001**
3. Anda akan melihat homepage Vendra CRM

### Login ke Aplikasi

**Default Credentials:**
- Email: `superadmin@vendra.com`
- Password: `superadmin123`

### Stop Server

Di terminal, tekan `Ctrl + C` untuk stop server.

---

## 🔍 Verify Installation

### Checklist Verification:

#### 1. Database Connection
```bash
# Test database connection
npx prisma studio
```

Browser akan buka Prisma Studio (GUI untuk lihat database).
URL: http://localhost:5555

#### 2. Check Tables Created
```bash
mysql -u vendracrm -p vendra_crm

# Di MySQL prompt
SHOW TABLES;

# Output harus ada tables:
# users, companies, products, transactions, dll
```

#### 3. Check Application Pages

Coba akses beberapa pages:
- http://localhost:3001 → Homepage
- http://localhost:3001/auth/signin → Login page
- http://localhost:3001/admin → Admin dashboard (setelah login)

---

## 🐛 Troubleshooting Common Issues

### Issue 1: Port Already in Use

**Error:**
```
Port 3001 is already in use
```

**Solution:**
```bash
# Ganti port di .env
PORT=3002

# Atau kill process yang pakai port 3001
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

### Issue 2: Database Connection Failed

**Error:**
```
Can't reach database server at localhost:3306
```

**Solution:**
```bash
# Check MySQL running
# Windows
sc query MySQL80

# Mac/Linux
sudo systemctl status mysql

# Start MySQL if not running
# Windows: Services → MySQL → Start
# Mac: brew services start mysql
# Linux: sudo systemctl start mysql
```

### Issue 3: Prisma Client Not Generated

**Error:**
```
Cannot find module '@prisma/client'
```

**Solution:**
```bash
# Generate Prisma Client
npx prisma generate

# If still error, reinstall
npm install @prisma/client
npx prisma generate
```

### Issue 4: npm install Failed

**Error:**
```
ENOENT: no such file or directory
```

**Solution:**
```bash
# Clear cache and retry
npm cache clean --force
npm install
```

### Issue 5: Missing Environment Variables

**Error:**
```
Error: DATABASE_URL is not defined
```

**Solution:**
- Pastikan file `.env` ada di root folder
- Check isi `.env` sudah benar
- Restart development server

---

## 📁 Struktur Project Setelah Setup

```
vendracrm/
├── 📂 node_modules/           # Dependencies (500MB+)
├── 📂 src/                    # Source code
├── 📂 prisma/                 # Database schema
├── 📂 public/                 # Static files
├── 📄 .env                    # Environment variables (JANGAN DI-COMMIT!)
├── 📄 .env.example            # Template env
├── 📄 package.json            # Dependencies list
├── 📄 next.config.ts          # Next.js config
├── 📄 tsconfig.json           # TypeScript config
└── 📄 README.md               # Documentation
```

**File Penting:**
- `.env` = **RAHASIA**, jangan share atau commit ke Git
- `package.json` = List dependencies & scripts
- `prisma/schema.prisma` = Database schema
- `next.config.ts` = Next.js configuration

---

## 💻 VS Code Setup

### Recommended Extensions:

1. **ESLint** - Code linting
2. **Prettier** - Code formatting
3. **Prisma** - Prisma schema syntax
4. **TypeScript and JavaScript Language Features** - TypeScript support
5. **Path Intellisense** - Path autocomplete
6. **Auto Rename Tag** - Rename paired HTML tags
7. **GitLens** - Git integration

### VS Code Settings:

Buat file `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## 🎓 Latihan Praktik

### Exercise 1: Install & Run
1. Install Node.js, MySQL, Git
2. Clone repository
3. Setup database & environment
4. Jalankan aplikasi
5. Login dengan superadmin

### Exercise 2: Explore Database
1. Buka Prisma Studio: `npx prisma studio`
2. Lihat tables yang ada
3. Check data users
4. Tambah 1 customer manual

### Exercise 3: Edit Environment
1. Ubah PORT di `.env` menjadi 3005
2. Restart server
3. Akses http://localhost:3005
4. Kembalikan PORT ke 3001

---

## 📝 Checklist Pemahaman

Pastikan Anda sudah:

- [ ] Install Node.js, MySQL, Git
- [ ] Clone repository berhasil
- [ ] npm install berhasil (folder node_modules ada)
- [ ] Database vendra_crm sudah dibuat
- [ ] File .env sudah dikonfigurasi
- [ ] npx prisma generate berhasil
- [ ] npx prisma db push berhasil
- [ ] npm run dev berhasil (server jalan)
- [ ] Bisa buka http://localhost:3001
- [ ] Bisa login dengan superadmin

---

## ➡️ Selanjutnya

**MODUL 3: Frontend Basics - Pages & Components**

Di modul berikutnya, Anda akan belajar:
- Struktur pages di Next.js
- Cara membuat component
- Routing & navigation
- Fetch data dari API
- State management dengan React hooks

---

**📖 Modul 2 - Selesai**

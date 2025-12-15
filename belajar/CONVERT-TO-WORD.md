# 📝 Cara Konversi ke Microsoft Word

File-file modul pembelajaran sudah dibuat dalam format **Markdown (.md)**. Berikut cara mengkonversinya ke Microsoft Word (.docx):

---

## 🔄 Metode 1: Pandoc (Recommended)

### Install Pandoc

**Windows:**
1. Download dari: https://pandoc.org/installing.html
2. Install dengan default settings

**Mac:**
```bash
brew install pandoc
```

**Linux:**
```bash
sudo apt install pandoc
```

### Konversi ke Word

```bash
# Single file
pandoc 01-Pengenalan-Vendra-CRM.md -o 01-Pengenalan-Vendra-CRM.docx

# All files at once (PowerShell di Windows)
Get-ChildItem *.md | ForEach-Object {
    pandoc $_.Name -o ($_.BaseName + ".docx")
}

# All files (Mac/Linux)
for file in *.md; do
    pandoc "$file" -o "${file%.md}.docx"
done
```

### Advanced Options

```bash
# With table of contents
pandoc input.md -o output.docx --toc

# With custom styling
pandoc input.md -o output.docx --reference-doc=template.docx

# With syntax highlighting
pandoc input.md -o output.docx --highlight-style=tango
```

---

## 🔄 Metode 2: VS Code Extension

### Install Extension

1. Buka VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search: **"Markdown to Word"**
4. Install extension

### Convert

1. Buka file .md
2. Right click → "Markdown to Word"
3. File .docx akan dibuat di folder yang sama

---

## 🔄 Metode 3: Online Converter

### Websites

1. **CloudConvert**: https://cloudconvert.com/md-to-docx
2. **Convertio**: https://convertio.co/md-docx/
3. **Online-Convert**: https://document.online-convert.com/convert-to-docx

### Steps

1. Upload file .md
2. Select output format: DOCX
3. Click Convert
4. Download hasil

---

## 🔄 Metode 4: Copy-Paste ke Word

### Manual Method

1. Buka file .md dengan VS Code atau Notepad
2. Install VS Code extension: **"Markdown Preview Enhanced"**
3. Preview markdown (Ctrl+Shift+V)
4. Copy content dari preview
5. Paste ke Microsoft Word
6. Format manually jika perlu

---

## 📁 File Structure

```
belajar/
├── README.md                              # Panduan utama
├── CONVERT-TO-WORD.md                     # File ini
├── 01-Pengenalan-Vendra-CRM.md           # Modul 1
├── 02-Setup-dan-Instalasi.md             # Modul 2
├── 03-Frontend-Pages-dan-Components.md   # Modul 3
├── 04-Backend-API-RESTful.md             # Modul 4
├── 05-Database-dan-Prisma-ORM.md         # Modul 5
└── 06-Deployment-dan-Production.md       # Modul 6
```

Setelah konversi, akan ada file .docx:

```
belajar/
├── 01-Pengenalan-Vendra-CRM.md
├── 01-Pengenalan-Vendra-CRM.docx ✅
├── 02-Setup-dan-Instalasi.md
├── 02-Setup-dan-Instalasi.docx ✅
... dan seterusnya
```

---

## 🎨 Styling di Word

Setelah convert, Anda bisa customize di Word:

### Font & Spacing
- **Heading 1**: Arial 18pt, Bold
- **Heading 2**: Arial 16pt, Bold
- **Heading 3**: Arial 14pt, Bold
- **Body**: Calibri 11pt, Line spacing 1.15

### Code Blocks
- Font: Consolas or Courier New
- Background: Light gray (RGB: 240, 240, 240)
- Border: 1pt solid gray

### Tips
- **Table of Contents**: Insert → Table of Contents
- **Page Numbers**: Insert → Page Number
- **Header/Footer**: Insert → Header/Footer

---

## 🚀 Quick Start Script

Buat file `convert-all.ps1` (PowerShell):

```powershell
# Convert all markdown to Word
Write-Host "Converting all .md files to .docx..." -ForegroundColor Green

Get-ChildItem *.md | ForEach-Object {
    $outputFile = $_.BaseName + ".docx"
    Write-Host "Converting $($_.Name) → $outputFile" -ForegroundColor Yellow
    pandoc $_.Name -o $outputFile --toc --highlight-style=tango
}

Write-Host "✅ All files converted!" -ForegroundColor Green
```

Jalankan:
```powershell
.\convert-all.ps1
```

---

## ✅ Verification

Setelah convert, check:

- [ ] All headings properly formatted
- [ ] Code blocks readable
- [ ] Tables intact
- [ ] Links working (if any)
- [ ] Images included (if any)
- [ ] Page breaks appropriate

---

## 📝 Notes

### Markdown Features yang Convert dengan Baik:
✅ Headings (#, ##, ###)
✅ Bold & Italic
✅ Lists (ordered & unordered)
✅ Code blocks
✅ Tables
✅ Links
✅ Blockquotes

### Fitur yang Mungkin Perlu Manual Adjustment:
⚠️ Emoji (might not convert)
⚠️ Complex tables
⚠️ Custom HTML
⚠️ Mermaid diagrams

---

## 🆘 Troubleshooting

### Error: "pandoc not found"
**Solution:** Install Pandoc dan restart terminal

### Error: "Permission denied"
**Solution:** Run as Administrator atau check file permissions

### Output tidak bagus
**Solution:** Try dengan custom reference:
```bash
pandoc input.md -o output.docx --reference-doc=custom-template.docx
```

---

## 🎓 Recommended Workflow

1. **Read** modul dalam Markdown (lebih cepat)
2. **Code** sambil baca
3. **Convert** ke Word jika perlu print atau share
4. **Annotate** di Word dengan notes sendiri

---

## 📚 Resources

- **Pandoc Manual**: https://pandoc.org/MANUAL.html
- **Markdown Guide**: https://www.markdownguide.org
- **Word Styling**: https://support.microsoft.com/word

---

**Good luck with your learning journey!** 🚀

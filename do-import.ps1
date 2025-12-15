# PowerShell script to prepare and import database
$sqlFile = "c:\Users\andia\Documents\vendra\vendra_crm_final.sql"
$outputFile = "c:\Users\andia\Documents\vendra\vendra_crm_import.sql"

Write-Host "Preparing SQL file for import..." -ForegroundColor Yellow

# Read the SQL content
$content = Get-Content $sqlFile -Raw

# Add DROP TABLE IF EXISTS before each CREATE TABLE
$pattern = 'CREATE TABLE `([^`]+)`'
$replacement = 'DROP TABLE IF EXISTS `$1`;
CREATE TABLE `$1`'
$content = $content -replace $pattern, $replacement

# Save the modified content
$content | Set-Content $outputFile -Encoding UTF8

Write-Host "SQL file prepared successfully!" -ForegroundColor Green
Write-Host "Starting import..." -ForegroundColor Yellow

# Run the import
cmd /c "C:\xampp\mysql\bin\mysql.exe -h sql12.freesqldatabase.com -u sql12805824 -ppI3G9xzqd5 -P 3306 sql12805824 < $outputFile 2>&1"

if($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Green
    Write-Host "DATABASE IMPORTED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Connection Details:" -ForegroundColor Cyan
    Write-Host "  Host: sql12.freesqldatabase.com"
    Write-Host "  Database: sql12805824"
    Write-Host "  User: sql12805824"
    Write-Host "  Port: 3306"
} else {
    Write-Host ""
    Write-Host "Import failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
}

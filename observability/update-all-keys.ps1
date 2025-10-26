# PowerShell script to update ALL Langfuse API keys in the project
# Usage: .\update-all-keys.ps1

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Langfuse API Key Updater" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Get API keys from user
Write-Host "Please provide your Langfuse API keys:" -ForegroundColor Yellow
Write-Host "  (Get them from: http://localhost:3000 → Settings → API Keys)" -ForegroundColor Gray
Write-Host ""

$publicKey = Read-Host "Enter your PUBLIC KEY (pk-lf-...)"
$secretKey = Read-Host "Enter your SECRET KEY (sk-lf-...)" -AsSecureString

# Convert SecureString back to plain text for processing
$secretKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secretKey)
)

Write-Host ""
Write-Host "Validating keys..." -ForegroundColor Yellow

# Basic validation
if (-not $publicKey.StartsWith("pk-lf-")) {
    Write-Host "❌ Public key should start with 'pk-lf-'" -ForegroundColor Red
    exit 1
}

if (-not $secretKeyPlain.StartsWith("sk-lf-")) {
    Write-Host "❌ Secret key should start with 'sk-lf-'" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Keys look valid" -ForegroundColor Green
Write-Host ""

# Generate base64 auth string
Write-Host "Generating base64 auth string..." -ForegroundColor Yellow
$authString = "${publicKey}:${secretKeyPlain}"
$bytes = [System.Text.Encoding]::UTF8.GetBytes($authString)
$base64 = [System.Convert]::ToBase64String($bytes)

Write-Host "✓ Generated: $base64" -ForegroundColor Green
Write-Host ""

# Update files
Write-Host "Updating configuration files..." -ForegroundColor Yellow
Write-Host ""

$filesUpdated = 0
$errors = @()

# 1. Update otel-collector-config.yaml
Write-Host "[1/3] Updating otel-collector-config.yaml..." -ForegroundColor Cyan
try {
    $configFile = "otel-collector-config.yaml"
    if (Test-Path $configFile) {
        # Backup
        Copy-Item $configFile "$configFile.backup" -Force
        
        # Update
        $content = Get-Content $configFile -Raw
        $pattern = 'authorization: "Basic [^"]*"'
        $replacement = "authorization: `"Basic $base64`""
        $newContent = $content -replace $pattern, $replacement
        Set-Content -Path $configFile -Value $newContent -NoNewline
        
        Write-Host "  ✓ Updated $configFile" -ForegroundColor Green
        $filesUpdated++
    } else {
        $errors += "File not found: $configFile"
        Write-Host "  ❌ Not found: $configFile" -ForegroundColor Red
    }
} catch {
    $errors += "Error updating $configFile : $_"
    Write-Host "  ❌ Error: $_" -ForegroundColor Red
}

# 2. Update feature-to-code.sh
Write-Host "[2/3] Updating ../scripts/feature-to-code.sh..." -ForegroundColor Cyan
try {
    $scriptFile = "..\scripts\feature-to-code.sh"
    if (Test-Path $scriptFile) {
        # Backup
        Copy-Item $scriptFile "$scriptFile.backup" -Force
        
        # Read and update
        $content = Get-Content $scriptFile -Raw
        
        # Update public key
        $content = $content -replace 'export LANGFUSE_PUBLIC_KEY="pk-lf-[^"]*"', "export LANGFUSE_PUBLIC_KEY=`"$publicKey`""
        
        # Update secret key
        $content = $content -replace 'export LANGFUSE_SECRET_KEY="sk-lf-[^"]*"', "export LANGFUSE_SECRET_KEY=`"$secretKeyPlain`""
        
        Set-Content -Path $scriptFile -Value $content -NoNewline
        
        Write-Host "  ✓ Updated $scriptFile" -ForegroundColor Green
        $filesUpdated++
    } else {
        $errors += "File not found: $scriptFile"
        Write-Host "  ❌ Not found: $scriptFile" -ForegroundColor Red
    }
} catch {
    $errors += "Error updating $scriptFile : $_"
    Write-Host "  ❌ Error: $_" -ForegroundColor Red
}

# 3. Update setup-telemetry-env.sh
Write-Host "[3/3] Updating ../scripts/setup-telemetry-env.sh..." -ForegroundColor Cyan
try {
    $scriptFile = "..\scripts\setup-telemetry-env.sh"
    if (Test-Path $scriptFile) {
        # Backup
        Copy-Item $scriptFile "$scriptFile.backup" -Force
        
        # Read and update
        $content = Get-Content $scriptFile -Raw
        
        # Update public key
        $content = $content -replace 'export LANGFUSE_PUBLIC_KEY="pk-lf-[^"]*"', "export LANGFUSE_PUBLIC_KEY=`"$publicKey`""
        
        # Update secret key
        $content = $content -replace 'export LANGFUSE_SECRET_KEY="sk-lf-[^"]*"', "export LANGFUSE_SECRET_KEY=`"$secretKeyPlain`""
        
        Set-Content -Path $scriptFile -Value $content -NoNewline
        
        Write-Host "  ✓ Updated $scriptFile" -ForegroundColor Green
        $filesUpdated++
    } else {
        $errors += "File not found: $scriptFile"
        Write-Host "  ❌ Not found: $scriptFile" -ForegroundColor Red
    }
} catch {
    $errors += "Error updating $scriptFile : $_"
    Write-Host "  ❌ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Update Summary" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Files updated: $filesUpdated" -ForegroundColor Green

if ($errors.Count -gt 0) {
    Write-Host "Errors encountered: $($errors.Count)" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. cd observability" -ForegroundColor White
Write-Host "  2. docker-compose restart otel-collector" -ForegroundColor White
Write-Host "  3. Send a test trace to verify" -ForegroundColor White
Write-Host "  4. Check http://localhost:3000 for data" -ForegroundColor White
Write-Host ""

if ($filesUpdated -eq 3) {
    Write-Host "✅ All files updated successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some files were not updated. Check errors above." -ForegroundColor Yellow
}



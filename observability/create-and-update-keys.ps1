# Create a new Langfuse API key and update all configuration files
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Langfuse API Key Creator & Updater" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Langfuse is running
Write-Host "Checking Langfuse status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Host "✓ Langfuse is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Langfuse is not accessible at http://localhost:3000" -ForegroundColor Red
    Write-Host "   Start it with: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Creating new API key in Langfuse database..." -ForegroundColor Yellow

# Generate UUIDs for the keys
$publicKeyUuid = [guid]::NewGuid().ToString()
$secretKeyUuid = [guid]::NewGuid().ToString()

$publicKey = "pk-lf-$publicKeyUuid"
$secretKey = "sk-lf-$secretKeyUuid"

Write-Host ""
Write-Host "Generated keys:" -ForegroundColor Green
Write-Host "  Public:  $publicKey" -ForegroundColor White
Write-Host "  Secret:  $secretKey" -ForegroundColor White
Write-Host ""

# Get project ID from database
Write-Host "Getting project ID from database..." -ForegroundColor Yellow
$getProjectCmd = "docker exec langfuse-postgres psql -U langfuse -d langfuse -t -c `"SELECT id FROM projects ORDER BY created_at DESC LIMIT 1;`""
$projectId = Invoke-Expression $getProjectCmd | ForEach-Object { $_.Trim() }

if (-not $projectId) {
    Write-Host "❌ No project found. Create a project in Langfuse first." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Found project: $projectId" -ForegroundColor Green
Write-Host ""

# Hash the secret key (using SHA-256 for fast_hashed_secret_key)
$secretKeyBytes = [System.Text.Encoding]::UTF8.GetBytes($secretKey)
$sha256 = [System.Security.Cryptography.SHA256]::Create()
$hashedBytes = $sha256.ComputeHash($secretKeyBytes)
$hashedSecretKey = [System.BitConverter]::ToString($hashedBytes).Replace("-", "").ToLower()

# Display secret key (last 4 chars)
$displaySecretKey = "sk-lf-..." + $secretKey.Substring($secretKey.Length - 4)

Write-Host "Inserting API key into database..." -ForegroundColor Yellow

# Create SQL command to insert the key
$id = [guid]::NewGuid().ToString()
$sql = @"
INSERT INTO api_keys (id, public_key, hashed_secret_key, fast_hashed_secret_key, display_secret_key, project_id, note, scope) 
VALUES ('$id', '$publicKey', '$hashedSecretKey', '$hashedSecretKey', '$displaySecretKey', '$projectId', 'Auto-generated for OTEL collector', 'PROJECT');
"@

$insertCmd = "docker exec langfuse-postgres psql -U langfuse -d langfuse -c `"$sql`""

try {
    Invoke-Expression $insertCmd | Out-Null
    Write-Host "✓ API key created in database" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create API key: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Generating base64 auth string..." -ForegroundColor Yellow
$authString = "${publicKey}:${secretKey}"
$bytes = [System.Text.Encoding]::UTF8.GetBytes($authString)
$base64 = [System.Convert]::ToBase64String($bytes)
Write-Host "✓ Generated: $base64" -ForegroundColor Green
Write-Host ""

# Update configuration files
Write-Host "Updating configuration files..." -ForegroundColor Yellow
Write-Host ""

$filesUpdated = 0

# 1. Update otel-collector-config.yaml
Write-Host "[1/3] Updating otel-collector-config.yaml..." -ForegroundColor Cyan
try {
    $configFile = "otel-collector-config.yaml"
    if (Test-Path $configFile) {
        Copy-Item $configFile "$configFile.backup" -Force
        $content = Get-Content $configFile -Raw
        $pattern = 'authorization: "Basic [^"]*"'
        $replacement = "authorization: `"Basic $base64`""
        $newContent = $content -replace $pattern, $replacement
        Set-Content -Path $configFile -Value $newContent -NoNewline
        Write-Host "  ✓ Updated $configFile" -ForegroundColor Green
        $filesUpdated++
    } else {
        Write-Host "  ❌ Not found: $configFile" -ForegroundColor Red
    }
} catch {
    Write-Host "  ❌ Error: $_" -ForegroundColor Red
}

# 2. Update feature-to-code.sh
Write-Host "[2/3] Updating ../scripts/feature-to-code.sh..." -ForegroundColor Cyan
try {
    $scriptFile = "..\scripts\feature-to-code.sh"
    if (Test-Path $scriptFile) {
        Copy-Item $scriptFile "$scriptFile.backup" -Force
        $content = Get-Content $scriptFile -Raw
        $content = $content -replace 'export LANGFUSE_PUBLIC_KEY="pk-lf-[^"]*"', "export LANGFUSE_PUBLIC_KEY=`"$publicKey`""
        $content = $content -replace 'export LANGFUSE_SECRET_KEY="sk-lf-[^"]*"', "export LANGFUSE_SECRET_KEY=`"$secretKey`""
        Set-Content -Path $scriptFile -Value $content -NoNewline
        Write-Host "  ✓ Updated $scriptFile" -ForegroundColor Green
        $filesUpdated++
    } else {
        Write-Host "  ❌ Not found: $scriptFile" -ForegroundColor Red
    }
} catch {
    Write-Host "  ❌ Error: $_" -ForegroundColor Red
}

# 3. Update setup-telemetry-env.sh
Write-Host "[3/3] Updating ../scripts/setup-telemetry-env.sh..." -ForegroundColor Cyan
try {
    $scriptFile = "..\scripts\setup-telemetry-env.sh"
    if (Test-Path $scriptFile) {
        Copy-Item $scriptFile "$scriptFile.backup" -Force
        $content = Get-Content $scriptFile -Raw
        $content = $content -replace 'export LANGFUSE_PUBLIC_KEY="pk-lf-[^"]*"', "export LANGFUSE_PUBLIC_KEY=`"$publicKey`""
        $content = $content -replace 'export LANGFUSE_SECRET_KEY="sk-lf-[^"]*"', "export LANGFUSE_SECRET_KEY=`"$secretKey`""
        Set-Content -Path $scriptFile -Value $content -NoNewline
        Write-Host "  ✓ Updated $scriptFile" -ForegroundColor Green
        $filesUpdated++
    } else {
        Write-Host "  ❌ Not found: $scriptFile" -ForegroundColor Red
    }
} catch {
    Write-Host "  ❌ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Success!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Created new API key:" -ForegroundColor White
Write-Host "  Public:  $publicKey" -ForegroundColor Cyan
Write-Host "  Secret:  $secretKey" -ForegroundColor Cyan
Write-Host "  Base64:  $base64" -ForegroundColor Gray
Write-Host ""
Write-Host "Updated $filesUpdated configuration files" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. docker-compose restart otel-collector" -ForegroundColor White
Write-Host "  2. Send a test trace" -ForegroundColor White
Write-Host "  3. Check http://localhost:3000 for data" -ForegroundColor White
Write-Host ""



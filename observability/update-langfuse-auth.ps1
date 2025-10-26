# PowerShell script to update Langfuse authentication in OTEL Collector config
# Usage: .\update-langfuse-auth.ps1 <public-key> <secret-key>

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$PublicKey,
    
    [Parameter(Mandatory=$true, Position=1)]
    [string]$SecretKey
)

Write-Host "🔑 Generating auth string..." -ForegroundColor Cyan

# Create base64 encoded auth string
$authPlainText = "${PublicKey}:${SecretKey}"
$authBytes = [System.Text.Encoding]::UTF8.GetBytes($authPlainText)
$authBase64 = [System.Convert]::ToBase64String($authBytes)

Write-Host ""
Write-Host "Generated auth string:" -ForegroundColor Green
Write-Host "   $authBase64" -ForegroundColor Yellow
Write-Host ""

# Update the otel-collector-config.yaml file
$configFile = "otel-collector-config.yaml"

if (Test-Path $configFile) {
    # Backup original
    Copy-Item $configFile "$configFile.backup" -Force
    Write-Host "✅ Created backup: $configFile.backup" -ForegroundColor Green
    
    # Read content
    $content = Get-Content $configFile -Raw
    
    # Update the authorization header using regex
    $pattern = 'authorization: "Basic [^"]*"'
    $replacement = "authorization: `"Basic $authBase64`""
    $newContent = $content -replace $pattern, $replacement
    
    # Write back
    Set-Content -Path $configFile -Value $newContent -NoNewline
    
    Write-Host "✅ Updated $configFile" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. cd observability" -ForegroundColor White
    Write-Host "   2. docker-compose restart otel-collector" -ForegroundColor White
    Write-Host "   3. Run a test workflow" -ForegroundColor White
    Write-Host "   4. Check http://localhost:3000 for traces" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "❌ Error: $configFile not found" -ForegroundColor Red
    Write-Host "   Make sure you're in the observability directory" -ForegroundColor Yellow
    exit 1
}


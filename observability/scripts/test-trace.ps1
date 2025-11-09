# Quick test script to send a trace to Langfuse
# Usage: .\test-trace.ps1

$headers = @{
    Authorization = "Basic cGstbGYtZTdiMjViOWMtMzU2Zi00MjY4LTk2Y2YtMDczMThhNGE1ZWU0OnNrLWxmLTk4MGJjZGU3LWZmODQtNDBiMi1iMTI3LTFlNjhhMGI2YzQwNg=="
}

$traceId = [guid]::NewGuid().ToString().Replace("-", "")
$spanId = [guid]::NewGuid().ToString().Substring(0, 16).Replace("-", "")
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeNanoseconds()

$body = @"
{
  "resourceSpans": [{
    "resource": {
      "attributes": [{
        "key": "service.name",
        "value": {"stringValue": "test-script"}
      }]
    },
    "scopeSpans": [{
      "spans": [{
        "traceId": "$traceId",
        "spanId": "$spanId",
        "name": "manual-test-$(Get-Date -Format 'HHmmss')",
        "kind": 1,
        "startTimeUnixNano": "$timestamp",
        "endTimeUnixNano": "$($timestamp + 1000000000)",
        "attributes": [{
          "key": "test.time",
          "value": {"stringValue": "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"}
        }]
      }]
    }]
  }]
}
"@

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host " Langfuse Trace Test" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Sending test trace to Langfuse..." -ForegroundColor Yellow
Write-Host "  Trace ID: $traceId" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/public/otel/v1/traces" `
        -Method POST `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing

    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Trace sent successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Wait 10-30 seconds for async processing" -ForegroundColor White
        Write-Host "  2. Go to: http://localhost:3000" -ForegroundColor White
        Write-Host "  3. Select your project" -ForegroundColor White
        Write-Host "  4. Click 'Traces' in the sidebar" -ForegroundColor White
        Write-Host "  5. Look for trace starting with 'manual-test-'" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "✗ Unexpected response: $($response.StatusCode)" -ForegroundColor Red
        Write-Host $response.Content
    }
} catch {
    Write-Host "✗ Failed to send trace!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check if services are running:" -ForegroundColor Yellow
    Write-Host "  docker-compose ps" -ForegroundColor White
}


# Git Pre-Commit Hook - Evidence Fabrication Prevention (PowerShell Version)
# This hook prevents commits containing fabricated evidence files
# 
# CONSTITUTIONAL ENFORCEMENT: Git-level hard stop for evidence fabrication

Write-Host "🔍 Checking evidence files for fabrication..." -ForegroundColor Yellow

# Track results
$fabrication_detected = 0
$evidence_files_checked = 0

# Get all staged evidence files
$staged_files = git diff --cached --name-only
$evidence_files = $staged_files | Where-Object { $_ -match "evidence/.*\.(json|log|md)$" }

foreach ($file in $evidence_files) {
    if (Test-Path $file) {
        $evidence_files_checked++
        Write-Host "   Validating: $file" -ForegroundColor White
        
        # Run the evidence fabrication detector using helper script
        $fabrication_result = node .specify/tools/validate-evidence-file.js $file 2>$null
        
        if ($fabrication_result -match "VALID") {
            Write-Host "   ✅ $file - authentic" -ForegroundColor Green
        }
        else {
            Write-Host "   ❌ $file - FABRICATION DETECTED" -ForegroundColor Red
            $fabrication_detected++
            
            # Show specific violations
            Write-Host "   📋 Violations found:" -ForegroundColor Yellow
            $fabrication_result | Where-Object { $_ -match "VIOLATION:" } | ForEach-Object {
                $violation = $_ -replace "VIOLATION:", "   • "
                Write-Host $violation -ForegroundColor Yellow
            }
        }
    }
}

# Summary
Write-Host ""
Write-Host "📊 Evidence Validation Summary:" -ForegroundColor Cyan
Write-Host "   Files checked: $evidence_files_checked"

if ($fabrication_detected -gt 0) {
    Write-Host "   Fabrications detected: $fabrication_detected" -ForegroundColor Red
    Write-Host ""
    Write-Host "🚫 COMMIT BLOCKED - Evidence fabrication detected" -ForegroundColor Red -BackgroundColor Black
    Write-Host ""
    Write-Host "📋 REQUIRED ACTIONS:" -ForegroundColor Yellow
    Write-Host "   1. Delete all fabricated evidence files"
    Write-Host "   2. Use actual tools to generate authentic evidence"
    Write-Host "   3. Re-stage only authentic evidence files"
    Write-Host "   4. Retry commit"
    Write-Host ""
    Write-Host "⚖️  CONSTITUTIONAL VIOLATION: Amendment 4 - Anti-Fraud Enforcement" -ForegroundColor Red
    Write-Host "   Fabricated evidence violates constitutional compliance"
    Write-Host ""
    Write-Host "💡 HELP:" -ForegroundColor Cyan
    Write-Host "   - Use: mcp_chrome-devtoo_take_screenshot() for browser evidence"
    Write-Host "   - Use: npm test for test results evidence"  
    Write-Host "   - Use: git log for git history evidence"
    Write-Host "   - Save raw, unmodified tool outputs only"
    
    exit 1
}
else {
    if ($evidence_files_checked -gt 0) {
        Write-Host "   Fabrications detected: 0" -ForegroundColor Green
        Write-Host ""
        Write-Host "✅ COMMIT APPROVED - All evidence files are authentic" -ForegroundColor Green -BackgroundColor Black
    }
    else {
        Write-Host "   No evidence files to validate"
        Write-Host ""
        Write-Host "✅ COMMIT APPROVED - No evidence files in this commit" -ForegroundColor Green -BackgroundColor Black
    }
}

Write-Host ""
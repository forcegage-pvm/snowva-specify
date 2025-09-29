# Git Pre-Commit Hook - Evidence Fabrication Prevention (PowerShell)
param()

Write-Host "🔍 Checking evidence files for fabrication..." -ForegroundColor Yellow

$fabrication_detected = 0
$evidence_files_checked = 0

# Get staged evidence files
$staged_files = git diff --cached --name-only
$evidence_files = @()
foreach ($file in $staged_files) {
    if ($file -match "evidence/.*\.(json|log|md)$") {
        $evidence_files += $file
    }
}

foreach ($file in $evidence_files) {
    if (Test-Path $file) {
        $evidence_files_checked++
        Write-Host "   Validating: $file"
        
        # Run validator
        $result = node .specify/tools/validate-evidence-file.js $file 2>$null
        
        if ($result -match "VALID") {
            Write-Host "   ✅ $file - authentic" -ForegroundColor Green
        }
        else {
            Write-Host "   ❌ $file - FABRICATION DETECTED" -ForegroundColor Red
            $fabrication_detected++
            
            # Show violations
            Write-Host "   📋 Violations found:" -ForegroundColor Yellow
            foreach ($line in $result) {
                if ($line -match "VIOLATION:") {
                    $violation = $line -replace "VIOLATION:", "   • "
                    Write-Host $violation -ForegroundColor Yellow
                }
            }
        }
    }
}

Write-Host ""
Write-Host "📊 Evidence Validation Summary:" -ForegroundColor Cyan
Write-Host "   Files checked: $evidence_files_checked"

if ($fabrication_detected -gt 0) {
    Write-Host "   Fabrications detected: $fabrication_detected" -ForegroundColor Red
    Write-Host ""
    Write-Host "🚫 COMMIT BLOCKED - Evidence fabrication detected" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚖️  CONSTITUTIONAL VIOLATION: Amendment 4 - Anti-Fraud Enforcement" -ForegroundColor Red
    exit 1
}
else {
    if ($evidence_files_checked -gt 0) {
        Write-Host "   Fabrications detected: 0" -ForegroundColor Green
        Write-Host ""
        Write-Host "✅ COMMIT APPROVED - All evidence files are authentic" -ForegroundColor Green
    }
    else {
        Write-Host "   No evidence files to validate"
        Write-Host ""
        Write-Host "✅ COMMIT APPROVED - No evidence files in this commit" -ForegroundColor Green
    }
}

Write-Host ""
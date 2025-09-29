@echo off
echo ⚖️  STARTING CONSTITUTIONAL ENFORCEMENT
echo ====================================
echo.

echo 🔧 Layer 1: Process-Level Evidence Enforcement
echo 👁️  Layer 2: Real-Time Directory Monitoring  
echo 📦 Layer 3: Git Repository Enforcement (Already Active)
echo.

echo 🚀 Starting enforcement system in separate processes...
echo.

echo 📦 Starting Process-Level Enforcement...
start "Constitutional-ProcessEnforcer" cmd /c "node .specify/tools/dev-enforcement.js start"

echo 👁️  Starting Directory Watcher...
start "Constitutional-DirectoryWatcher" cmd /c "node .specify/tools/evidence-watcher.js start"

echo.
echo ✅ Constitutional enforcement layers started in separate processes
echo 📊 Check running processes with: tasklist | findstr "Constitutional"
echo 🛑 Stop enforcement: taskkill /f /fi "windowtitle eq Constitutional*"
echo.
pause
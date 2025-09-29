# Constitutional Enforcement System - Activation Guide

## Overview

The Constitutional Enforcement System provides **3 layers of technical hard stops** to prevent evidence fabrication:

- **Layer 1:** Process-Level Evidence Enforcement (File operation interception)
- **Layer 2:** Real-Time Directory Monitoring (Evidence file watching)  
- **Layer 3:** Git Repository Enforcement (Pre-commit hooks) ✅ **ALWAYS ACTIVE**

## Quick Start

### Windows Users
```cmd
start-enforcement.bat
```

### Unix/macOS Users  
```bash
./start-enforcement.sh
```

### Manual Activation
```bash
node .specify/tools/enforcement.js start
```

## Individual Layer Control

### Layer 1: Process-Level Enforcement
```bash
# Test process-level blocking
node .specify/tools/dev-enforcement.js test

# Start in background (intercepts file operations)
node .specify/tools/dev-enforcement.js start

# Check status
node .specify/tools/dev-enforcement.js status
```

### Layer 2: Directory Monitoring
```bash
# Start real-time evidence monitoring
node .specify/tools/evidence-watcher.js start

# Check watcher status
node .specify/tools/evidence-watcher.js status
```

### Layer 3: Git Repository Enforcement
**Already Active** - Git pre-commit hook automatically blocks fabricated evidence commits.

## System Status

```bash
# Check all layers
node .specify/tools/enforcement.js status

# Test all layers
node .specify/tools/enforcement.js test
```

## How It Works

### Layer 1: Process-Level Enforcement
- Intercepts `fs.writeFileSync()` and other file operations
- Validates evidence file content before writing
- Blocks fabrication patterns in real-time
- Throws errors to prevent file creation

### Layer 2: Directory Monitoring  
- Watches evidence directories for new/changed files
- Scans content for fabrication patterns
- **Immediately deletes** any fabricated evidence files
- Logs all blocked attempts

### Layer 3: Git Repository Enforcement (Active)
- Pre-commit hook validates all staged evidence files
- Blocks commits containing fabricated evidence
- Provides detailed violation reports
- Gives remediation guidance

## Fabrication Detection Patterns

The system detects:
- Fake MCP response structures
- Obvious fabrication markers (`"fabricated"`, `"fake"`)
- Placeholder timestamps (`2024-01-01T00:00:00.000Z`)
- AI-generated content patterns
- Missing authentic tool output markers

## Constitutional Compliance

**Amendment 4 - Anti-Fraud Enforcement:** Zero tolerance for evidence fabrication, validation circumvention, or system gaming.

This system provides **technical impossibility** rather than just discouragement:
- Evidence fabrication becomes technically impossible to commit
- Multiple redundant enforcement layers
- Real-time prevention and deletion
- Git-level hard stops

## Development Workflow

1. **Start Enforcement:** Run `start-enforcement.bat` at beginning of development session
2. **Develop Normally:** Write code, create files as usual
3. **Evidence Creation:** Use actual tools (MCP browser, npm test, etc.) to generate evidence
4. **Automatic Protection:** System automatically prevents any fabrication attempts
5. **Commit Safety:** Git hooks ensure only authentic evidence enters repository

## Troubleshooting

### "Module not found" errors
- Directory watcher falls back to simple polling mode
- Process enforcement uses basic file interception
- All core functionality remains operational

### False positives
- Legitimate evidence should never be blocked
- Contact development team if authentic evidence is rejected
- Check patterns in `.specify/tools/evidence-fabrication-detector.js`

### Emergency deactivation
```bash
# Stop all enforcement
node .specify/tools/enforcement.js stop

# Or just process enforcement
node .specify/tools/dev-enforcement.js stop
```

## Files Created

- `.specify/tools/enforcement.js` - Master control system
- `.specify/tools/dev-enforcement.js` - Process-level enforcement
- `.specify/tools/evidence-watcher.js` - Directory monitoring
- `.specify/tools/activate-enforcement.js` - Full system activation
- `start-enforcement.bat` - Windows startup script
- `start-enforcement.sh` - Unix/macOS startup script

**Constitutional protection is now technically enforced** at multiple system levels.
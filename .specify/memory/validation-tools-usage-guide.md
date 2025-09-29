# Validation Tools Usage Guide

**Document Version**: 1.0  
**Created**: September 29, 2025  
**Purpose**: Clear instructions for proper evidence generation and validation compliance

---

## 🎯 QUICK START: Proper Evidence Generation

### Step 1: Start Development Environment
```powershell
# Navigate to web package
cd "path\to\packages\web"

# Start server in separate window (CRITICAL: Use Start-Process)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

# Wait 5-10 seconds for server to fully start
```

### Step 2: Create Evidence Directory Structure (Two-File System)
```
evidence/T###/
├── mcp-test-results.json     # ← AGENT'S FUNCTIONAL ANALYSIS
├── mcp-screenshots/          # ← RAW MCP EVIDENCE FILES
│   ├── take_snapshot.json    # ← RAW UNMODIFIED MCP RESPONSE
│   └── take_screenshot.json  # ← RAW UNMODIFIED MCP RESPONSE
├── technical-debt.json       # ← AMENDMENT 6: TDD DEBT TRACKING
├── constitutional-evidence.md # Evidence documentation (optional)
└── mcp-interaction.log       # Log of all MCP commands
```

**CRITICAL CHANGE**: Enhanced Two-File System separates:
- **mcp-test-results.json**: Agent's analysis and functional validation findings
- **mcp-screenshots/*.json**: RAW unmodified MCP command responses (anti-fraud proof)
- **technical-debt.json**: Amendment 6 compliance with smart routing strategy and reference validation

### Step 3: Use BOTH MCP Browser Commands (MANDATORY)
```javascript
// 1. Navigate to your endpoint
await mcp_chrome-devtoo_new_page("http://localhost:3000/api/v1/quotes");

// 2. BOTH COMMANDS REQUIRED - capture accessibility tree
const snapshotResponse = await mcp_chrome-devtoo_take_snapshot();

// 3. BOTH COMMANDS REQUIRED - capture visual screenshot with OCR
const screenshotResponse = await mcp_chrome-devtoo_take_screenshot();

// 4. MANDATORY: Save RAW responses (Two-File System - Evidence Files)
fs.writeFileSync(
  "evidence/T###/mcp-screenshots/take_snapshot.json",
  JSON.stringify({ type: "take_snapshot", response: snapshotResponse }, null, 2)
);

fs.writeFileSync(
  "evidence/T###/mcp-screenshots/take_screenshot.json",
  JSON.stringify({ type: "take_screenshot", response: screenshotResponse }, null, 2)
);

// 5. Create agent functional analysis (mcp-test-results.json)
const testResults = {
  taskId: "T###",
  testTimestamp: new Date().toISOString(),
  requirement: "Your task requirement",
  functionalTests: {
    apiEndpoint: {
      status: "PASS",  // REQUIRED: Must be object with status field
      message: "Endpoint responds successfully",
      details: "API endpoint validation completed"
    },
    responseValidation: {
      status: "PASS",
      message: "Response structure validated",
      details: "Response format meets requirements"
    },
    businessLogic: {
      status: "PASS",  // For contract testing: PASS = successful issue identification
      message: "Business logic validation completed",
      details: "Contract testing successfully identified business logic gaps (expected outcome)"
    },
    dataIntegrity: {
      status: "PASS",
      message: "Data integrity validation completed",
      details: "Data validation issues successfully identified and catalogued"
    }
  }
};

fs.writeFileSync(
  "evidence/T###/mcp-test-results.json",
  JSON.stringify(testResults, null, 2)
); 
  JSON.stringify(snapshotResponse, null, 2)  // ← RAW UNMODIFIED RESPONSE
);

fs.writeFileSync(
  "evidence/T###/mcp-screenshots/take_screenshot.json", 
  JSON.stringify(screenshotResponse, null, 2)  // ← RAW UNMODIFIED RESPONSE  
);

// 5. Create test results file (Two-File System - Analysis File)
const testResults = {
  taskId: "T###",
  testTimestamp: new Date().toISOString(),
  mcpValidation: {
    toolsUsed: ["mcp_chrome-devtoo_take_snapshot", "mcp_chrome-devtoo_take_screenshot"],
    evidenceFiles: ["evidence/T###/mcp-screenshots/take_snapshot.json", "evidence/T###/mcp-screenshots/take_screenshot.json"],
    antifraudStatus: "VERIFIED"
  },
  functionalTests: {
    apiEndpoint: { status: "PASS", dataStructure: "VALID" },
    businessLogic: { status: "PASS", calculations: "ACCURATE" }
    // Add your actual validation findings here
  },
  testResultsSummary: {
    overallStatus: "PASS",
    functionalityVerified: "YES"
  }
};

fs.writeFileSync(
  "evidence/T###/mcp-test-results.json",
  JSON.stringify(testResults, null, 2)
);

// CRITICAL DISTINCTION:
// - Evidence files (mcp-screenshots/*.json): RAW unmodified MCP responses (prove tool usage)
// - Test results file (mcp-test-results.json): Agent's analysis of what evidence proves (validation)
```

**CRITICAL**: Always use `take_screenshot`, NOT `take_snapshot`. The validation system specifically checks for `take_screenshot` commands in the evidence.

---

## ⚠️ FRAUD DETECTION WARNINGS

### 🚨 WILL BE CAUGHT AND BLOCKED

1. **Fake Screenshots**
   - Files smaller than 100 bytes
   - Placeholder text instead of binary data
   - Identical creation timestamps (bulk copying)

2. **Evidence Manipulation**  
   - Empty mcp-screenshots directories
   - Recently modified functional-test-results.json during validation
   - Copying evidence files to bypass validators

3. **Validator Gaming**
   - Creating task ID files in repository root
   - Copying constitutional evidence to game checker
   - Missing MCP raw responses when claiming MCP testing

### 🔧 PROPER ALTERNATIVES

Instead of faking evidence:
1. **Fix the underlying functionality first**
2. **Ensure development server is running**
3. **Use MCP tools to capture real evidence**
4. **Document actual working behavior**
5. **If tools fail: STOP and report the failure**

---

## 📋 VALIDATION ERROR SOLUTIONS

### "MCP Screenshots directory not found"
**PROPER ACTION:**
```bash
# Create proper directory structure
mkdir -p evidence/T###/screenshots
mkdir -p evidence/T###/mcp-screenshots

# Use MCP browser tools with running dev server
# Save all MCP responses as JSON files
```

**❌ DON'T:** Create empty directories or fake files

### "MCP No screenshot responses found"
**PROPER ACTION:**
```powershell
# 1. Verify dev server is running
curl http://localhost:3000

# 2. If not running, start it properly
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

# 3. Use MCP tools to capture real evidence
# 4. Save raw JSON responses from take_screenshot in mcp-screenshots/
```

**CRITICAL**: Use `mcp_chrome-devtoo_take_screenshot` (not take_snapshot) and save the raw JSON response as evidence.

**❌ DON'T:** Create fake JSON files or use wrong MCP commands

### "MCP Functional tests failed"
**PROPER ACTION:**
```javascript
// 1. Fix the actual functionality that's broken
// 2. Test manually in browser first
// 3. Only set 'passed: true' when it actually passes
{
  "taskId": "T###",
  "passed": true,  // ← Only when actually true!
  "testResults": {
    // ... real test data from actual testing
  }
}
```

**❌ DON'T:** Manually edit 'passed' field to bypass validation

### "FRAUD DETECTED: Suspicious task ID files"
**PROPER ACTION:**
```bash
# Delete the fraudulent files
rm T001 T002 T003  # whatever task ID files exist in root

# Fix constitutional evidence properly
# Edit evidence/T###/constitutional-evidence.md with real content
```

**❌ DON'T:** Copy evidence files to root directory to game validators

---

## 🛠️ TOOL-SPECIFIC INSTRUCTIONS

### MCP Browser Tools
- **ALWAYS** start dev server first with `Start-Process`
- **ALWAYS** save raw JSON responses from MCP commands
- **NEVER** fake binary image files - MCP returns OCR text extraction
- **Document** what functionality the evidence proves

### Constitutional Checker
- **Run with evidence file path**: `constitutional-checker.js evidence/T###/constitutional-evidence.md`
- **Include completion level**: Use LEVEL 0-5 framework
- **Provide specific examples**: File paths, test results, functionality proof

### Functional Test Results
- **Test real functionality** before claiming success
- **Include actual test details** with specific examples
- **Set 'passed: true' ONLY** when functionality actually works
- **Include MCP evidence** that supports the claims

---

## 🚨 CONSTITUTIONAL COMPLIANCE

Under **Amendment 4: Anti-Fraud Enforcement Protocol**:

### MANDATORY BEHAVIOR
1. **STOP** when tools fail - don't create workarounds
2. **DOCUMENT** failures clearly with diagnostic info
3. **REPORT** to human for assistance
4. **WAIT** for explicit guidance before proceeding

### PROHIBITED BEHAVIOR
1. Creating fake/placeholder evidence files
2. Copying files to bypass validation requirements
3. Manipulating test results to show false success
4. Gaming validation systems by exploiting their technical requirements

### ENFORCEMENT
- Fraud detection is **ACTIVE** in all validation tools
- Constitutional violations **BLOCK** task completion
- Evidence fabrication triggers **MANDATORY ROLLBACK**

---

## ✅ SUCCESS CHECKLIST

Before running post-task validation:

- [ ] Development server running properly
- [ ] Real functionality tested and working
- [ ] MCP browser tools used to capture actual evidence
- [ ] Raw JSON responses saved in mcp-screenshots/
- [ ] Constitutional evidence includes completion level
- [ ] Functional test results reflect reality
- [ ] No fake/placeholder files created
- [ ] All evidence directories contain real content

**Remember**: The validation tools are designed to help ensure quality, not to be gamed or bypassed. Honest evidence collection is the only path to task completion.
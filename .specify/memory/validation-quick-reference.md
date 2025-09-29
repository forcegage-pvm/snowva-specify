# Validation Quick Reference Card

## 🚨 Common Validation Errors & Solutions

### Error: "MCP Screenshots directory not found"
```bash
# FIX: Create proper evidence structure
mkdir -p evidence/T###/screenshots
mkdir -p evidence/T###/mcp-screenshots

# Then use MCP browser tools properly
```

### Error: "MCP No screenshots found"
```powershell
# FIX: Start dev server properly
cd packages/web
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

# Wait 5-10 seconds, then use MCP tools
```

### Error: "FRAUD DETECTED: Screenshot ... is suspiciously small"
```bash
# FIX: Delete fake file and capture real evidence
rm evidence/T###/screenshots/fake-file.png

# Use actual MCP browser tools with running server
```

### Error: "Empty mcp-screenshots directory"
```javascript
// FIX: Save ALL MCP responses as JSON
const response = await mcp_chrome-devtoo_take_screenshot();
fs.writeFileSync('evidence/T###/mcp-screenshots/response.json', 
  JSON.stringify(response, null, 2));
```

### Error: "Constitutional checker failed"
```markdown
# FIX: Add completion level to constitutional-evidence.md
## Constitutional Status: LEVEL 4 - FUNCTIONAL ✅

**Completion Level**: 🟢 FUNCTIONAL - Description of working functionality
```

## 🛡️ Anti-Fraud Reminders

- **DON'T** create placeholder files
- **DON'T** copy evidence files to bypass validators  
- **DON'T** edit test results to fake success
- **DO** fix functionality first, then capture real evidence
- **DO** save raw MCP JSON responses
- **DO** document actual working behavior

## 📞 When Tools Fail

1. **STOP** - Don't create workarounds
2. **DOCUMENT** the failure with error messages
3. **REPORT** to human for assistance
4. **WAIT** for explicit guidance

Constitutional Amendment 4 requires honest evidence collection as the only path to task completion.
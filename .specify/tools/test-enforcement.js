#!/usr/bin/env node

/**
 * Test Constitutional Enforcement System
 * Attempts to create fabricated evidence to verify technical hard stops are working
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 TESTING: Constitutional Enforcement System');
console.log('==============================================');
console.log('');

// First activate enforcement
console.log('🔧 Activating enforcement layers...');
const { ConstitutionalEnforcementActivator } = require('./activate-enforcement.js');
const activator = new ConstitutionalEnforcementActivator();

async function testEnforcement() {
  // Activate layers 1 and 2
  await activator.activate({ layers: [1, 2], background: false });

  console.log('');
  console.log('🎯 TEST 1: Process-Level Enforcement (Layer 1)');
  console.log('----------------------------------------------');
  
  try {
    const fakeEvidencePath = path.join(process.cwd(), 'evidence/TEST/fake-process-test.json');
    const fakeContent = JSON.stringify({
      "command": "mcp_chrome-devtoo_take_screenshot", 
      "response": "This is fabricated content for process testing",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }, null, 2);

    console.log('   Attempting to create fabricated evidence file...');
    console.log(`   Path: ${fakeEvidencePath}`);
    
    // This should be blocked by Layer 1 (process enforcer)
    fs.writeFileSync(fakeEvidencePath, fakeContent);
    
    console.log('   ❌ LAYER 1 FAILED - File was created (enforcement not working)');
    
    // Clean up if it wasn't blocked
    if (fs.existsSync(fakeEvidencePath)) {
      fs.unlinkSync(fakeEvidencePath);
    }
    
  } catch (error) {
    if (error.message && error.message.includes('fabrication blocked')) {
      console.log('   ✅ LAYER 1 SUCCESS - Process-level enforcement blocked fabrication');
      console.log(`   🚨 Block reason: ${error.message}`);
    } else {
      console.log('   ❌ LAYER 1 ERROR - Unexpected error:', error.message);
    }
  }

  console.log('');
  console.log('🎯 TEST 2: Directory Monitoring (Layer 2)');
  console.log('-----------------------------------------');
  
  try {
    // Try to bypass Layer 1 by writing to a temp file first, then moving it
    const tempPath = path.join(process.cwd(), 'temp-fake-evidence.json');
    const evidencePath = path.join(process.cwd(), 'evidence/TEST/fake-watcher-test.json');
    
    const fakeContent = JSON.stringify({
      "command": "mcp_chrome-devtoo_navigate_page",
      "response": "This would be fabricated MCP content",
      "evidence_type": "mcp_browser_interaction", 
      "notes": "This is clearly fabricated evidence for testing"
    }, null, 2);

    console.log('   Creating temp file and moving to evidence directory...');
    
    // Create temp file (should not be blocked)
    fs.writeFileSync(tempPath, fakeContent);
    console.log('   ✅ Temp file created successfully');
    
    // Move to evidence directory (Layer 2 should detect and delete)
    fs.renameSync(tempPath, evidencePath);
    console.log('   📁 File moved to evidence directory');
    
    // Wait a moment for Layer 2 to detect and delete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (fs.existsSync(evidencePath)) {
      console.log('   ❌ LAYER 2 FAILED - Fabricated file still exists');
      fs.unlinkSync(evidencePath); // Clean up
    } else {
      console.log('   ✅ LAYER 2 SUCCESS - Directory watcher deleted fabricated file');
    }
    
  } catch (error) {
    console.log('   ❌ LAYER 2 ERROR - Test failed:', error.message);
  }

  console.log('');
  console.log('🎯 TEST 3: Legitimate Evidence (Should Pass)');
  console.log('--------------------------------------------');
  
  try {
    const legitPath = path.join(process.cwd(), 'evidence/TEST/legitimate-test.md');
    const legitContent = `# Test Evidence

This is legitimate documentation without fabrication patterns.

## Test Results
- Command executed: npm test
- Result: Authentic output
- Status: Valid evidence file
`;

    console.log('   Creating legitimate evidence file...');
    fs.writeFileSync(legitPath, legitContent);
    
    if (fs.existsSync(legitPath)) {
      console.log('   ✅ LEGITIMATE EVIDENCE SUCCESS - File created and preserved');
      
      // Clean up
      fs.unlinkSync(legitPath);
      console.log('   🧹 Cleaned up test file');
    } else {
      console.log('   ❌ LEGITIMATE EVIDENCE FAILED - File was incorrectly blocked');
    }
    
  } catch (error) {
    console.log('   ❌ LEGITIMATE EVIDENCE ERROR:', error.message);
  }

  console.log('');
  console.log('📊 ENFORCEMENT TEST RESULTS');
  console.log('============================');
  console.log('All layers tested - Constitutional enforcement verification complete');
  console.log('');

  // Deactivate enforcement
  activator.deactivate();
}

// Run the test
testEnforcement().catch(console.error);
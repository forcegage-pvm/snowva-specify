#!/usr/bin/env node

/**
 * Development Enforcement Activation
 * Simple script to activate constitutional enforcement during development
 *
 * Usage: node dev-enforcement.js [start|stop|status]
 */

const fs = require("fs");
const path = require("path");

// Simple process-level enforcement for development
let enforced = false;
let originalWriteFileSync = null;
let blockedAttempts = 0;

function activateProcessEnforcement() {
  if (enforced) {
    console.log("⚠️  Enforcement already active");
    return;
  }

  console.log("🔧 Activating process-level evidence enforcement...");

  // Store original method
  originalWriteFileSync = fs.writeFileSync;

  // Intercept writeFileSync
  fs.writeFileSync = function (filePath, data, options) {
    const normalizedPath = filePath.toString().replace(/\\/g, "/");

    if (
      normalizedPath.includes("/evidence/") ||
      normalizedPath.startsWith("evidence/")
    ) {
      console.log(`🔍 INTERCEPTED: writeFileSync(${path.basename(filePath)})`);

      // Simple fabrication check
      const content = data.toString();
      const fabricationPatterns = [
        /fabricated/i,
        /This would contain.*but it's fabricated/i,
        /This is clearly fabricated/i,
        /"timestamp":\s*"2024-01-01T00:00:00\.000Z"/,
        /"evidence_type":\s*"mcp_browser_interaction"/,
      ];

      const hasFabrication = fabricationPatterns.some((pattern) =>
        pattern.test(content)
      );

      if (hasFabrication) {
        blockedAttempts++;
        console.log(
          "🚨 CONSTITUTIONAL VIOLATION: Evidence fabrication blocked!"
        );
        console.log("   Fabricated content patterns detected");
        throw new Error(
          "Evidence fabrication blocked by constitutional enforcement"
        );
      } else {
        console.log("✅ Evidence validation passed");
      }
    }

    // Call original method
    return originalWriteFileSync.call(fs, filePath, data, options);
  };

  enforced = true;
  console.log("✅ Process-level enforcement ACTIVE");
}

function deactivateProcessEnforcement() {
  if (!enforced) {
    console.log("⚠️  Enforcement not active");
    return;
  }

  console.log("🔓 Deactivating process-level enforcement...");

  // Restore original method
  if (originalWriteFileSync) {
    fs.writeFileSync = originalWriteFileSync;
  }

  enforced = false;
  console.log(
    `✅ Process-level enforcement deactivated (${blockedAttempts} attempts blocked)`
  );
}

function getStatus() {
  console.log("📊 Constitutional Enforcement Status");
  console.log("====================================");
  console.log(
    `Process-level enforcement: ${enforced ? "🟢 ACTIVE" : "🔴 INACTIVE"}`
  );
  console.log(`Blocked fabrication attempts: ${blockedAttempts}`);
  console.log(
    `Git pre-commit hook: ${
      fs.existsSync(".specify/hooks/pre-commit") ? "🟢 ACTIVE" : "🔴 INACTIVE"
    }`
  );
}

// CLI Interface
const command = process.argv[2] || "start";

switch (command) {
  case "start":
    console.log("⚖️  STARTING CONSTITUTIONAL ENFORCEMENT");
    console.log("======================================");
    activateProcessEnforcement();

    console.log("");
    console.log("🔒 Constitutional protection is now ACTIVE");
    console.log("Evidence fabrication attempts will be blocked");
    console.log("");
    console.log('Run "node dev-enforcement.js stop" to deactivate');

    // Keep process alive
    console.log("⏳ Press Ctrl+C to stop...");
    process.on("SIGINT", () => {
      console.log("\n🛑 Shutting down...");
      deactivateProcessEnforcement();
      process.exit(0);
    });

    // Keep alive with heartbeat
    setInterval(() => {
      // Silent heartbeat
    }, 30000);

    break;

  case "stop":
    deactivateProcessEnforcement();
    break;

  case "status":
    getStatus();
    break;

  case "test":
    console.log("🧪 Testing enforcement system...");
    activateProcessEnforcement();

    try {
      // Create fake evidence to test blocking
      fs.writeFileSync(
        "evidence/TEST/fake-test.json",
        JSON.stringify({
          command: "fake_mcp_command",
          response: "This is clearly fabricated evidence for testing",
        })
      );
      console.log("❌ TEST FAILED - Fabrication was not blocked");
    } catch (error) {
      console.log("✅ TEST PASSED - Fabrication was blocked");
      console.log(`   Error: ${error.message}`);
    }

    deactivateProcessEnforcement();
    break;

  default:
    console.log(`
Constitutional Development Enforcement

Usage:
  node dev-enforcement.js [command]

Commands:
  start     Activate process-level enforcement (default)
  stop      Deactivate enforcement
  status    Show current enforcement status
  test      Test enforcement system
  
This provides Layer 1 (Process-Level) enforcement for development.
Layer 3 (Git hooks) is always active when configured.
    `);
}

module.exports = {
  activateProcessEnforcement,
  deactivateProcessEnforcement,
  getStatus,
};

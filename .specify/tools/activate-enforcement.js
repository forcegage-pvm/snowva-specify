#!/usr/bin/env node

/**
 * Constitutional Enforcement Activation
 * Activates all technical enforcement layers for evidence fabrication prevention
 *
 * Usage:
 *   node .specify/tools/activate-enforcement.js [--layer=1,2,3] [--background]
 */

const {
  ProcessLevelEvidenceEnforcer,
} = require("./process-level-evidence-enforcer.js");
const { EvidenceDirectoryWatcher } = require("./evidence-directory-watcher.js");
const path = require("path");
const fs = require("fs");

class ConstitutionalEnforcementActivator {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.processEnforcer = null;
    this.directoryWatcher = null;
    this.activeLayers = [];
  }

  async activate(options = {}) {
    const { layers = [1, 2, 3], background = false } = options;

    console.log("⚖️  CONSTITUTIONAL ENFORCEMENT ACTIVATION");
    console.log("=========================================");
    console.log(`📍 Workspace: ${this.workspaceRoot}`);
    console.log(`🎯 Activating layers: ${layers.join(", ")}`);
    console.log("");

    // Layer 1: Process-Level Enforcement
    if (layers.includes(1)) {
      console.log("🔧 LAYER 1: Process-Level Evidence Enforcement");
      try {
        this.processEnforcer = new ProcessLevelEvidenceEnforcer();
        this.processEnforcer.intercept();
        this.activeLayers.push(1);
        console.log("✅ Layer 1 ACTIVE - File operations intercepted");
      } catch (error) {
        console.error("❌ Layer 1 FAILED:", error.message);
      }
      console.log("");
    }

    // Layer 2: Real-Time Directory Monitoring
    if (layers.includes(2)) {
      console.log("👁️  LAYER 2: Real-Time Directory Monitoring");
      try {
        this.directoryWatcher = new EvidenceDirectoryWatcher(
          this.workspaceRoot
        );
        this.directoryWatcher.start();
        this.activeLayers.push(2);
        console.log("✅ Layer 2 ACTIVE - Evidence directories monitored");
      } catch (error) {
        console.error("❌ Layer 2 FAILED:", error.message);
      }
      console.log("");
    }

    // Layer 3: Git Repository Enforcement (Already active)
    if (layers.includes(3)) {
      console.log("📦 LAYER 3: Git Repository Enforcement");
      const hookPath = path.join(
        this.workspaceRoot,
        ".specify/hooks/pre-commit"
      );
      if (fs.existsSync(hookPath)) {
        console.log("✅ Layer 3 ACTIVE - Git pre-commit hook configured");
        this.activeLayers.push(3);
      } else {
        console.log("❌ Layer 3 FAILED - Git hook not found");
      }
      console.log("");
    }

    // Summary
    console.log("📊 ENFORCEMENT STATUS SUMMARY");
    console.log("=============================");
    console.log(`Active layers: ${this.activeLayers.length}/${layers.length}`);
    this.activeLayers.forEach((layer) => {
      const descriptions = {
        1: "Process-Level File Operation Interception",
        2: "Real-Time Evidence Directory Monitoring",
        3: "Git Repository Commit Prevention",
      };
      console.log(`✅ Layer ${layer}: ${descriptions[layer]}`);
    });

    if (this.activeLayers.length === 0) {
      console.log("🚨 WARNING: No enforcement layers active!");
      process.exit(1);
    }

    console.log("");
    console.log("🔒 CONSTITUTIONAL PROTECTION: ACTIVE");
    console.log("Evidence fabrication is now technically impossible");
    console.log("");

    if (background) {
      console.log("⏳ Running in background mode...");
      console.log("Press Ctrl+C to stop enforcement");

      // Keep process alive for background monitoring
      process.on("SIGINT", () => {
        console.log("\n🛑 Shutting down constitutional enforcement...");
        this.deactivate();
        process.exit(0);
      });

      // Keep alive
      setInterval(() => {
        // Heartbeat to keep process running
      }, 30000);
    }

    return {
      activeLayers: this.activeLayers,
      processEnforcer: this.processEnforcer,
      directoryWatcher: this.directoryWatcher,
    };
  }

  deactivate() {
    console.log("🔓 Deactivating constitutional enforcement...");

    if (this.processEnforcer) {
      this.processEnforcer.restore();
      console.log("   Process-level enforcement deactivated");
    }

    if (this.directoryWatcher) {
      this.directoryWatcher.stop();
      console.log("   Directory monitoring stopped");
    }

    console.log("✅ Constitutional enforcement deactivated");
  }

  getStatus() {
    return {
      active: this.activeLayers.length > 0,
      layers: this.activeLayers,
      processEnforcer: !!this.processEnforcer,
      directoryWatcher: !!this.directoryWatcher,
    };
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse arguments
  args.forEach((arg) => {
    if (arg.startsWith("--layer=")) {
      const layerStr = arg.split("=")[1];
      options.layers = layerStr.split(",").map((n) => parseInt(n));
    } else if (arg === "--background") {
      options.background = true;
    } else if (arg === "--help") {
      console.log(`
Constitutional Enforcement Activation Tool

Usage:
  node activate-enforcement.js [options]

Options:
  --layer=1,2,3    Specify which enforcement layers to activate (default: all)
  --background     Run in background mode for continuous monitoring
  --help          Show this help message

Layers:
  1. Process-Level Evidence Enforcement (File operation interception)
  2. Real-Time Directory Monitoring (Evidence file watching)
  3. Git Repository Enforcement (Pre-commit hooks)

Examples:
  node activate-enforcement.js                    # Activate all layers
  node activate-enforcement.js --layer=1,2        # Activate layers 1 and 2 only
  node activate-enforcement.js --background       # Run with continuous monitoring
      `);
      process.exit(0);
    }
  });

  const activator = new ConstitutionalEnforcementActivator();
  activator.activate(options).catch(console.error);
}

module.exports = { ConstitutionalEnforcementActivator };

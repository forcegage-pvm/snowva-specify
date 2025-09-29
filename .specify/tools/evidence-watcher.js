#!/usr/bin/env node

/**
 * Background Evidence Directory Watcher
 * Monitors evidence directories and deletes fabricated files in real-time
 *
 * Usage: node evidence-watcher.js [start|stop|status]
 */

const fs = require("fs");
const path = require("path");

// Try to load chokidar, fallback to polling if not available
let chokidar = null;
try {
  chokidar = require("chokidar");
} catch (error) {
  console.log("📦 chokidar not available, will use fallback polling mode");
}

class SimpleEvidenceWatcher {
  constructor() {
    this.watchers = [];
    this.deletedFiles = 0;
    this.evidenceDir = path.join(process.cwd(), "evidence");
    this.isWatching = false;
    this.pollingInterval = null;

    // Simple fabrication patterns
    this.fabricationPatterns = [
      /fabricated/i,
      /This would contain.*but it's fabricated/i,
      /This is clearly fabricated/i,
      /"timestamp":\s*"2024-01-01T00:00:00\.000Z"/,
      /"evidence_type":\s*"mcp_browser_interaction"/,
      /fake.*content/i,
      /This is fake/i,
    ];
  }

  start() {
    if (this.isWatching) {
      console.log("⚠️  Watcher already running");
      return;
    }

    console.log("👁️  Starting evidence directory watcher...");
    console.log(`📁 Monitoring: ${this.evidenceDir}`);

    if (!fs.existsSync(this.evidenceDir)) {
      console.log("📁 Creating evidence directory...");
      fs.mkdirSync(this.evidenceDir, { recursive: true });
    }

    if (chokidar) {
      // Use chokidar if available
      const watcher = chokidar.watch(this.evidenceDir, {
        ignored: /[\/\\]\./,
        persistent: true,
        ignoreInitial: true,
      });

      watcher
        .on("add", (filePath) => this.checkFile(filePath))
        .on("change", (filePath) => this.checkFile(filePath))
        .on("error", (error) => console.error("👁️  Watcher error:", error));

      this.watchers.push(watcher);
      console.log("✅ Evidence directory monitoring ACTIVE (chokidar mode)");
    } else {
      // Fallback to polling mode
      console.log("📦 Using fallback polling mode (checking every 5 seconds)");
      this.startPollingMode();
      console.log("✅ Evidence directory monitoring ACTIVE (polling mode)");
    }

    this.isWatching = true;
    console.log("🚨 Any fabricated evidence files will be IMMEDIATELY DELETED");
  }

  checkFile(filePath) {
    // Only check evidence files
    if (!filePath.match(/\.(json|md|log)$/)) {
      return;
    }

    console.log(`👁️  Checking: ${path.basename(filePath)}`);

    try {
      const content = fs.readFileSync(filePath, "utf8");
      const hasFabrication = this.fabricationPatterns.some((pattern) =>
        pattern.test(content)
      );

      if (hasFabrication) {
        console.log(`🚨 FABRICATION DETECTED: ${path.basename(filePath)}`);
        console.log("   Deleting fabricated evidence file...");

        fs.unlinkSync(filePath);
        this.deletedFiles++;

        console.log("✅ Fabricated evidence file deleted");
        console.log("⚖️  Constitutional Amendment 4 enforced");
      } else {
        console.log(`✅ ${path.basename(filePath)} - authentic evidence`);
      }
    } catch (error) {
      console.log(
        `⚠️  Could not check ${path.basename(filePath)}: ${error.message}`
      );
    }
  }

  startPollingMode() {
    // Fallback polling mode when chokidar is not available
    const checkDirectory = () => {
      if (!fs.existsSync(this.evidenceDir)) return;

      const scanDir = (dir) => {
        try {
          const items = fs.readdirSync(dir);

          items.forEach((item) => {
            const fullPath = path.join(dir, item);
            try {
              const stat = fs.statSync(fullPath);

              if (stat.isDirectory()) {
                scanDir(fullPath);
              } else if (item.match(/\.(json|md|log)$/)) {
                this.checkFile(fullPath);
              }
            } catch (error) {
              // Ignore file access errors
            }
          });
        } catch (error) {
          // Ignore directory read errors
        }
      };

      scanDir(this.evidenceDir);
    };

    // Check every 5 seconds
    this.pollingInterval = setInterval(checkDirectory, 5000);
    console.log("⏰ Polling every 5 seconds for fabricated evidence");
  }

  stop() {
    if (!this.isWatching) {
      console.log("⚠️  Watcher not running");
      return;
    }

    console.log("🛑 Stopping evidence directory watcher...");

    // Stop chokidar watchers
    this.watchers.forEach((watcher) => watcher.close());
    this.watchers = [];

    // Stop polling interval
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    this.isWatching = false;

    console.log(
      `✅ Watcher stopped (${this.deletedFiles} fabricated files deleted)`
    );
  }

  getStatus() {
    console.log("📊 Evidence Directory Watcher Status");
    console.log("====================================");
    console.log(`Status: ${this.isWatching ? "🟢 MONITORING" : "🔴 STOPPED"}`);
    console.log(`Directory: ${this.evidenceDir}`);
    console.log(`Deleted fabricated files: ${this.deletedFiles}`);
  }
}

// CLI Interface (fallback without chokidar)
function startSimpleWatcher() {
  console.log("👁️  Starting simple evidence watcher (fallback mode)...");
  console.log("📁 Will periodically check evidence directory");

  const evidenceDir = path.join(process.cwd(), "evidence");
  let deletedFiles = 0;

  const fabricationPatterns = [
    /fabricated/i,
    /This would contain.*but it's fabricated/i,
    /This is clearly fabricated/i,
    /"timestamp":\s*"2024-01-01T00:00:00\.000Z"/,
    /"evidence_type":\s*"mcp_browser_interaction"/,
    /fake.*content/i,
  ];

  function checkDirectory() {
    if (!fs.existsSync(evidenceDir)) return;

    function scanDir(dir) {
      const items = fs.readdirSync(dir);

      items.forEach((item) => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (item.match(/\.(json|md|log)$/)) {
          try {
            const content = fs.readFileSync(fullPath, "utf8");
            const hasFabrication = fabricationPatterns.some((pattern) =>
              pattern.test(content)
            );

            if (hasFabrication) {
              console.log(`🚨 FABRICATION DETECTED: ${item}`);
              fs.unlinkSync(fullPath);
              deletedFiles++;
              console.log("✅ Fabricated evidence file deleted");
            }
          } catch (error) {
            // Ignore read errors
          }
        }
      });
    }

    scanDir(evidenceDir);
  }

  // Check every 5 seconds
  const interval = setInterval(checkDirectory, 5000);

  console.log("✅ Simple watcher active (checking every 5 seconds)");
  console.log("⏳ Press Ctrl+C to stop...");

  process.on("SIGINT", () => {
    console.log("\n🛑 Stopping watcher...");
    clearInterval(interval);
    console.log(
      `✅ Watcher stopped (${deletedFiles} fabricated files deleted)`
    );
    process.exit(0);
  });
}

const command = process.argv[2] || "start";
const watcher = new SimpleEvidenceWatcher();

switch (command) {
  case "start":
    // Try using chokidar, fallback to simple polling
    try {
      watcher.start();
      console.log("⏳ Press Ctrl+C to stop...");

      process.on("SIGINT", () => {
        console.log("\n🛑 Shutting down...");
        watcher.stop();
        process.exit(0);
      });

      // Keep alive
      setInterval(() => {}, 30000);
    } catch (error) {
      if (error.code === "MODULE_NOT_FOUND") {
        console.log("📦 chokidar not available, using simple fallback...");
        startSimpleWatcher();
      } else {
        throw error;
      }
    }
    break;

  case "stop":
    watcher.stop();
    break;

  case "status":
    watcher.getStatus();
    break;

  default:
    console.log(`
Evidence Directory Watcher

Usage:
  node evidence-watcher.js [command]

Commands:
  start     Start monitoring evidence directories (default)
  stop      Stop monitoring
  status    Show watcher status
    `);
}

module.exports = { SimpleEvidenceWatcher };

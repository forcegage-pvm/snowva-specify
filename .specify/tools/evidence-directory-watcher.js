#!/usr/bin/env node

/**
 * Evidence Directory Watcher - Real-time Fabrication Prevention
 * This tool monitors evidence directories and immediately deletes fabricated files
 *
 * CONSTITUTIONAL ENFORCEMENT: Technical hard stop for evidence fabrication
 */

const fs = require("fs");
const path = require("path");
const {
  EvidenceFabricationDetector,
} = require("./evidence-fabrication-detector");

class EvidenceDirectoryWatcher {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.evidenceDir = path.join(rootDir, "evidence");
    this.detector = new EvidenceFabricationDetector();
    this.watchers = new Map();
    this.blockedAttempts = 0;
    this.monitoring = false;

    console.log(
      `🔍 Evidence Directory Watcher initialized for: ${this.evidenceDir}`
    );
  }

  start() {
    if (this.monitoring) {
      console.log("⚠️  Watcher already running");
      return;
    }

    if (!fs.existsSync(this.evidenceDir)) {
      console.log("📁 Creating evidence directory...");
      fs.mkdirSync(this.evidenceDir, { recursive: true });
    }

    this.monitoring = true;
    this.setupWatchers();

    console.log(
      "🚨 TECHNICAL ENFORCEMENT: Evidence fabrication monitoring ACTIVE"
    );
    console.log("   Any fabricated evidence files will be IMMEDIATELY DELETED");
    console.log("   Use authentic tool outputs only");
  }

  stop() {
    console.log("🛑 Stopping evidence directory watcher...");

    this.watchers.forEach((watcher, path) => {
      watcher.close();
      console.log(`   Stopped watching: ${path}`);
    });

    this.watchers.clear();
    this.monitoring = false;

    console.log(
      `📊 Session summary: ${this.blockedAttempts} fabrication attempts blocked`
    );
  }

  setupWatchers() {
    // Watch the main evidence directory
    this.watchDirectory(this.evidenceDir);

    // Watch existing task directories
    if (fs.existsSync(this.evidenceDir)) {
      const taskDirs = fs
        .readdirSync(this.evidenceDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => path.join(this.evidenceDir, dirent.name));

      taskDirs.forEach((taskDir) => this.watchDirectory(taskDir));
    }
  }

  watchDirectory(dirPath) {
    if (this.watchers.has(dirPath)) {
      return; // Already watching
    }

    try {
      const watcher = fs.watch(
        dirPath,
        { recursive: true },
        (eventType, filename) => {
          if (!filename) return;

          const fullPath = path.join(dirPath, filename);

          if (eventType === "rename" && fs.existsSync(fullPath)) {
            // File created or renamed
            this.handleFileCreation(fullPath);
          }
        }
      );

      this.watchers.set(dirPath, watcher);
      console.log(`👁️  Watching: ${dirPath}`);
    } catch (error) {
      console.error(`❌ Failed to watch directory ${dirPath}:`, error.message);
    }
  }

  handleFileCreation(filePath) {
    // Only monitor evidence files
    if (!this.isEvidenceFile(filePath)) {
      return;
    }

    // Small delay to ensure file is fully written
    setTimeout(() => {
      this.validateEvidenceFile(filePath);
    }, 100);
  }

  validateEvidenceFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return; // File may have been deleted already
      }

      const stats = fs.statSync(filePath);
      if (!stats.isFile()) {
        return; // Not a file
      }

      console.log(`\n🔍 VALIDATION: ${path.basename(filePath)}`);

      const content = fs.readFileSync(filePath, "utf8");
      const result = this.detector.validateEvidenceFile(filePath, content);

      if (!result.isValid) {
        this.blockFabricatedFile(filePath, result);
      } else {
        console.log(
          `✅ AUTHENTIC: ${path.basename(filePath)} - evidence validated`
        );
      }
    } catch (error) {
      console.error(`❌ Error validating ${filePath}:`, error.message);
    }
  }

  blockFabricatedFile(filePath, validationResult) {
    this.blockedAttempts++;

    console.log(`\n🚨 FABRICATION DETECTED: ${path.basename(filePath)}`);
    console.log(`📋 VIOLATIONS FOUND:`);

    validationResult.violations.forEach((violation, index) => {
      console.log(`   ${index + 1}. ${violation.message}`);
    });

    // HARD STOP - Delete the fabricated file immediately
    try {
      fs.unlinkSync(filePath);
      console.log(`🗑️  DELETED: Fabricated evidence file removed`);

      // Log the blocking action
      this.logBlockedAttempt(filePath, validationResult);

      console.log(`\n💡 REQUIRED ACTION:`);
      if (validationResult.recommendation) {
        validationResult.recommendation.forEach((rec) => {
          console.log(`   ${rec}`);
        });
      }

      console.log(
        `\n⚖️  CONSTITUTIONAL ENFORCEMENT: Evidence fabrication prevented`
      );
      console.log(
        `📊 Total blocked attempts this session: ${this.blockedAttempts}`
      );
    } catch (deleteError) {
      console.error(
        `❌ Could not delete fabricated file: ${deleteError.message}`
      );
    }
  }

  logBlockedAttempt(filePath, validationResult) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      filePath,
      violations: validationResult.violations,
      action: "DELETED_FABRICATED_EVIDENCE",
      constitutionalViolation: "AMENDMENT_4_ANTI_FRAUD",
    };

    const logFile = path.join(
      this.rootDir,
      ".specify",
      "logs",
      "fabrication-blocks.json"
    );

    try {
      // Ensure log directory exists
      const logDir = path.dirname(logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      // Read existing log or create new
      let logData = [];
      if (fs.existsSync(logFile)) {
        logData = JSON.parse(fs.readFileSync(logFile, "utf8"));
      }

      // Add new entry
      logData.push(logEntry);

      // Keep only last 100 entries
      if (logData.length > 100) {
        logData = logData.slice(-100);
      }

      // Write updated log
      fs.writeFileSync(logFile, JSON.stringify(logData, null, 2));
    } catch (error) {
      console.error(`⚠️  Could not log blocked attempt: ${error.message}`);
    }
  }

  isEvidenceFile(filePath) {
    return filePath.includes("/evidence/") || filePath.includes("\\evidence\\");
  }

  // Watch for new task directories being created
  setupTaskDirectoryWatcher() {
    const watcher = fs.watch(this.evidenceDir, (eventType, filename) => {
      if (eventType === "rename" && filename) {
        const newDir = path.join(this.evidenceDir, filename);
        if (fs.existsSync(newDir) && fs.statSync(newDir).isDirectory()) {
          console.log(`📁 New task directory detected: ${filename}`);
          this.watchDirectory(newDir);
        }
      }
    });

    this.watchers.set("task-directory-watcher", watcher);
  }

  getStatus() {
    return {
      monitoring: this.monitoring,
      watchedDirectories: Array.from(this.watchers.keys()),
      blockedAttempts: this.blockedAttempts,
      uptime: this.monitoring ? "ACTIVE" : "STOPPED",
    };
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || "start";
  const rootDir = args[1] || process.cwd();

  const watcher = new EvidenceDirectoryWatcher(rootDir);

  switch (command) {
    case "start":
      watcher.start();

      // Keep the process running
      console.log("\n⌨️  Press Ctrl+C to stop monitoring\n");

      process.on("SIGINT", () => {
        console.log("\n🛑 Received interrupt signal");
        watcher.stop();
        process.exit(0);
      });

      // Keep alive
      setInterval(() => {}, 1000);
      break;

    case "status":
      const status = watcher.getStatus();
      console.log("Evidence Directory Watcher Status:");
      console.log(JSON.stringify(status, null, 2));
      break;

    default:
      console.log(`
Evidence Directory Watcher - Technical Fabrication Prevention

Usage:
  node evidence-directory-watcher.js start [root-dir]    Start monitoring
  node evidence-directory-watcher.js status [root-dir]   Check status

Commands:
  start    Begin real-time evidence fabrication monitoring
  status   Show current monitoring status

The watcher will:
- Monitor all evidence directories in real-time
- Immediately detect fabricated evidence files
- Delete fabricated files automatically
- Log all blocked attempts
- Provide remediation guidance

CONSTITUTIONAL ENFORCEMENT: Technical hard stop for Amendment 4 violations
      `);
  }
}

module.exports = { EvidenceDirectoryWatcher };

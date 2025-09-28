#!/usr/bin/env node

/**
 * Pre-task validation check - ensures all prerequisites are met before task execution
 * CONSTITUTIONAL AMENDMENT 1: MANDATORY VALIDATION GATES - Gate 1 Prerequisites
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class PreTaskChecker {
  constructor(taskId) {
    this.taskId = taskId;
    this.errors = [];
    this.warnings = [];
    this.repoRoot = this.findRepoRoot();
  }

  findRepoRoot() {
    let current = process.cwd();
    while (current !== path.dirname(current)) {
      if (fs.existsSync(path.join(current, ".git"))) {
        return current;
      }
      current = path.dirname(current);
    }
    throw new Error("Git repository root not found");
  }

  async runAllChecks() {
    console.log(`🔍 Pre-Task Validation for ${this.taskId}`);
    console.log("=".repeat(50));

    // Core prerequisite checks
    await this.checkGitStatus();
    await this.checkTaskExists();
    await this.checkTaskNotAlreadyComplete();
    await this.checkDependencies();
    await this.checkMCPBrowserReady();
    await this.checkConstitutionalTools();
    await this.checkDevelopmentServer();

    // Report results
    this.reportResults();

    return this.errors.length === 0;
  }

  async checkGitStatus() {
    try {
      const status = execSync("git status --porcelain", {
        cwd: this.repoRoot,
        encoding: "utf8",
      });
      if (status.trim()) {
        this.warnings.push(
          "Working directory has uncommitted changes - consider committing before task execution"
        );
      }

      const branch = execSync("git branch --show-current", {
        cwd: this.repoRoot,
        encoding: "utf8",
      }).trim();
      console.log(`✓ Git branch: ${branch}`);
    } catch (error) {
      this.errors.push(`Git status check failed: ${error.message}`);
    }
  }

  async checkTaskExists() {
    const tasksPath = path.join(
      this.repoRoot,
      "specs",
      "006-quotes-technical-debt",
      "tasks.md"
    );

    if (!fs.existsSync(tasksPath)) {
      this.errors.push("tasks.md file not found");
      return;
    }

    const tasksContent = fs.readFileSync(tasksPath, "utf8");
    const taskPattern = new RegExp(`^-\\s*\\[.\\]\\s*${this.taskId}\\b`, "m");

    if (!taskPattern.test(tasksContent)) {
      this.errors.push(`Task ${this.taskId} not found in tasks.md`);
      return;
    }

    console.log(`✓ Task ${this.taskId} exists in tasks.md`);
  }

  async checkTaskNotAlreadyComplete() {
    const tasksPath = path.join(
      this.repoRoot,
      "specs",
      "006-quotes-technical-debt",
      "tasks.md"
    );

    if (!fs.existsSync(tasksPath)) return;

    const tasksContent = fs.readFileSync(tasksPath, "utf8");
    const completedTaskPattern = new RegExp(
      `^-\\s*\\[x\\]\\s*${this.taskId}\\b`,
      "m"
    );

    if (completedTaskPattern.test(tasksContent)) {
      this.errors.push(`Task ${this.taskId} is already marked as complete`);
      return;
    }

    console.log(`✓ Task ${this.taskId} is not yet complete`);
  }

  async checkDependencies() {
    const webPackagePath = path.join(
      this.repoRoot,
      "packages",
      "web",
      "package.json"
    );

    if (!fs.existsSync(webPackagePath)) {
      this.errors.push("Web package.json not found");
      return;
    }

    try {
      // Check if node_modules exists
      const nodeModulesPath = path.join(
        this.repoRoot,
        "packages",
        "web",
        "node_modules"
      );
      if (!fs.existsSync(nodeModulesPath)) {
        this.warnings.push("node_modules not found - run npm install");
      }

      console.log("✓ Dependencies structure verified");
    } catch (error) {
      this.errors.push(`Dependency check failed: ${error.message}`);
    }
  }

  async checkMCPBrowserReady() {
    try {
      // Check if MCP browser tools are available (simplified check)
      console.log("✓ MCP browser tools check - manual verification required");
      this.warnings.push("Verify MCP browser is ready for testing");
    } catch (error) {
      this.warnings.push(
        "MCP browser readiness could not be verified automatically"
      );
    }
  }

  async checkConstitutionalTools() {
    const toolsDir = path.join(this.repoRoot, ".specify", "tools");

    if (!fs.existsSync(toolsDir)) {
      this.warnings.push("Constitutional tools directory not found");
      return;
    }

    const requiredTools = [
      "constitutional-checker.js",
      "post-task-validation.js",
      "mcp-evidence-validator.js",
    ];

    const missingTools = requiredTools.filter(
      (toolFile) => !fs.existsSync(path.join(toolsDir, toolFile))
    );

    if (missingTools.length > 0) {
      this.warnings.push(
        `Missing constitutional tools: ${missingTools.join(", ")}`
      );
    } else {
      console.log("✓ Constitutional tools available");
    }
  }

  async checkDevelopmentServer() {
    try {
      // Simple check for common development ports
      const response = await fetch("http://localhost:3000").catch(() => null);
      if (response) {
        console.log(
          "✓ Development server appears to be running on localhost:3000"
        );
      } else {
        this.warnings.push(
          "Development server may not be running - start with npm run dev"
        );
      }
    } catch (error) {
      this.warnings.push("Could not verify development server status");
    }
  }

  reportResults() {
    console.log("\n📊 Pre-Task Validation Results:");
    console.log("=".repeat(50));

    if (this.errors.length > 0) {
      console.log("\n❌ ERRORS (Must fix before proceeding):");
      this.errors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log("\n⚠️  WARNINGS (Recommended to address):");
      this.warnings.forEach((warning, i) => {
        console.log(`   ${i + 1}. ${warning}`);
      });
    }

    if (this.errors.length === 0) {
      console.log("\n✅ Pre-task validation PASSED");
      console.log("\n🚀 CONSTITUTIONAL REQUIREMENT:");
      console.log("   Before marking this task complete, you MUST:");
      console.log("   1. Implement the functionality");
      console.log("   2. Test with MCP browser tools");
      console.log("   3. Capture evidence (screenshots/logs)");
      console.log("   4. Run post-task-validation.js");
      console.log("   5. Only then mark task [x] complete");
    } else {
      console.log("\n❌ Pre-task validation FAILED");
      console.log("   Fix all errors before proceeding with task execution");
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const taskId = process.argv[2];

  if (!taskId) {
    console.error("Usage: node pre-task-check.js <TASK_ID>");
    console.error("Example: node pre-task-check.js T026");
    process.exit(1);
  }

  const checker = new PreTaskChecker(taskId);
  checker.runAllChecks().catch((error) => {
    console.error("Pre-task check failed:", error);
    process.exit(1);
  });
}

module.exports = PreTaskChecker;

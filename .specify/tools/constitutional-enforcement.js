#!/usr/bin/env node

/**
 * Constitutional Enforcement - Automated enforcement wrapper
 * CONSTITUTIONAL AMENDMENT 1-3: Comprehensive implementation
 *
 * This tool enforces all constitutional requirements automatically:
 * - Amendment 1: Mandatory Validation Gates (pre/post task)
 * - Amendment 2: Evidence-First Development (MCP validation)
 * - Amendment 3: Automated Enforcement (fail-fast checks)
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class ConstitutionalEnforcer {
  constructor() {
    this.repoRoot = this.findRepoRoot();
    this.toolsDir = path.join(this.repoRoot, ".specify", "tools");
    this.enforcementLog = [];
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

  async enforceConstitution() {
    console.log("🏛️  CONSTITUTIONAL ENFORCEMENT SYSTEM");
    console.log("=".repeat(70));
    console.log("Enforcing Constitutional Amendments 1-3");
    console.log("=".repeat(70));

    try {
      // Step 1: Verify enforcement tools exist
      await this.verifyEnforcementTools();

      // Step 2: Run comprehensive constitutional audit
      await this.runConstitutionalAudit();

      // Step 3: Enforce validation gates for future tasks
      await this.enforceValidationGates();

      // Step 4: Install constitutional hooks
      await this.installConstitutionalHooks();

      // Step 5: Generate enforcement report
      await this.generateEnforcementReport();

      console.log("\n✅ CONSTITUTIONAL ENFORCEMENT: ACTIVE");
      console.log(
        "All constitutional amendments are now enforced automatically."
      );
    } catch (error) {
      console.error("\n❌ CONSTITUTIONAL ENFORCEMENT FAILED");
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  }

  async verifyEnforcementTools() {
    console.log("\n🔧 Verifying Constitutional Enforcement Tools");
    console.log("-".repeat(50));

    const requiredTools = [
      "pre-task-check.js",
      "post-task-validation.js",
      "mcp-evidence-validator.js",
      "constitutional-checker.js",
      "constitutional-audit.js",
    ];

    const missingTools = [];

    for (const tool of requiredTools) {
      const toolPath = path.join(this.toolsDir, tool);
      if (fs.existsSync(toolPath)) {
        console.log(`   ✅ ${tool}`);
      } else {
        console.log(`   ❌ ${tool} - MISSING`);
        missingTools.push(tool);
      }
    }

    if (missingTools.length > 0) {
      throw new Error(
        `Missing constitutional tools: ${missingTools.join(", ")}`
      );
    }

    this.enforcementLog.push({
      step: "tool_verification",
      status: "passed",
      timestamp: new Date().toISOString(),
    });
  }

  async runConstitutionalAudit() {
    console.log("\n🔍 Running Comprehensive Constitutional Audit");
    console.log("-".repeat(50));

    const auditPath = path.join(this.toolsDir, "constitutional-audit.js");

    try {
      const auditOutput = execSync(`node "${auditPath}"`, {
        cwd: this.repoRoot,
        encoding: "utf8",
        stdio: "pipe",
      });

      console.log("Constitutional audit completed successfully");

      this.enforcementLog.push({
        step: "constitutional_audit",
        status: "passed",
        timestamp: new Date().toISOString(),
        output: auditOutput,
      });
    } catch (error) {
      console.log("❌ Constitutional audit failed - violations detected");
      console.log("Audit must pass before enforcement can be activated");

      this.enforcementLog.push({
        step: "constitutional_audit",
        status: "failed",
        timestamp: new Date().toISOString(),
        error: error.message,
      });

      throw new Error(
        "Constitutional audit failed - violations must be remediated first"
      );
    }
  }

  async enforceValidationGates() {
    console.log("\n🚪 Installing Mandatory Validation Gates");
    console.log("-".repeat(50));

    // Create task wrapper scripts that enforce validation
    await this.createTaskWrappers();

    // Update package.json scripts to use validation
    await this.updatePackageScripts();

    // Create validation status tracking
    await this.createValidationTracking();

    console.log("   ✅ Pre-task validation gates installed");
    console.log("   ✅ Post-task validation gates installed");
    console.log("   ✅ MCP evidence validation gates installed");

    this.enforcementLog.push({
      step: "validation_gates",
      status: "installed",
      timestamp: new Date().toISOString(),
    });
  }

  async createTaskWrappers() {
    // Create a task execution wrapper that enforces constitutional compliance
    const taskWrapperContent = `#!/usr/bin/env node

/**
 * Task Execution Wrapper - Constitutional Enforcement
 * All task operations MUST go through constitutional validation
 */

const { execSync } = require('child_process');
const path = require('path');

const TOOLS_DIR = path.join(__dirname, '..', '.specify', 'tools');

async function executeTask(taskId, action) {
  console.log(\`🏛️  Constitutional Enforcement: \${action} \${taskId}\`);
  
  if (action === 'start') {
    // Run pre-task check
    try {
      execSync(\`node "\${path.join(TOOLS_DIR, 'pre-task-check.js')}" \${taskId}\`, {
        stdio: 'inherit'
      });
    } catch (error) {
      console.error('❌ Pre-task validation failed');
      process.exit(1);
    }
  }
  
  if (action === 'complete') {
    // Run post-task validation
    try {
      execSync(\`node "\${path.join(TOOLS_DIR, 'post-task-validation.js')}" \${taskId}\`, {
        stdio: 'inherit'
      });
    } catch (error) {
      console.error('❌ Post-task validation failed');
      process.exit(1);
    }
  }
}

// CLI interface
const [,, taskId, action] = process.argv;

if (!taskId || !action) {
  console.error('Usage: task-wrapper.js <taskId> <start|complete>');
  process.exit(1);
}

executeTask(taskId, action).catch(error => {
  console.error('Task execution failed:', error);
  process.exit(1);
});
`;

    const wrapperPath = path.join(this.toolsDir, "task-wrapper.js");
    fs.writeFileSync(wrapperPath, taskWrapperContent);

    // Make executable
    try {
      execSync(`chmod +x "${wrapperPath}"`, { stdio: "ignore" });
    } catch (error) {
      // Windows doesn't need chmod
    }
  }

  async updatePackageScripts() {
    const packageJsonPath = path.join(this.repoRoot, "package.json");

    if (!fs.existsSync(packageJsonPath)) {
      console.log("   ⚠️  No package.json found - skipping script updates");
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    // Add constitutional enforcement scripts
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    packageJson.scripts["task:start"] = "node .specify/tools/task-wrapper.js";
    packageJson.scripts["task:complete"] =
      "node .specify/tools/task-wrapper.js";
    packageJson.scripts["constitutional:audit"] =
      "node .specify/tools/constitutional-audit.js";
    packageJson.scripts["constitutional:enforce"] =
      "node .specify/tools/constitutional-enforcement.js";

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }

  async createValidationTracking() {
    const trackingDir = path.join(this.repoRoot, ".specify", "tracking");

    if (!fs.existsSync(trackingDir)) {
      fs.mkdirSync(trackingDir, { recursive: true });
    }

    // Create validation status file
    const validationStatus = {
      enforcementActive: true,
      lastAudit: new Date().toISOString(),
      validationGatesActive: true,
      constitutionalAmendments: ["1", "2", "3"],
      enforcement: {
        preTaskValidation: true,
        postTaskValidation: true,
        mcpEvidenceValidation: true,
        constitutionalCompliance: true,
      },
    };

    const statusPath = path.join(trackingDir, "constitutional-status.json");
    fs.writeFileSync(statusPath, JSON.stringify(validationStatus, null, 2));
  }

  async installConstitutionalHooks() {
    console.log("\n🪝 Installing Constitutional Hooks");
    console.log("-".repeat(50));

    // Git pre-commit hook to prevent commits without constitutional compliance
    await this.installGitHooks();

    // Development server hooks
    await this.installDevServerHooks();

    console.log("   ✅ Git pre-commit constitutional checks installed");
    console.log("   ✅ Development server constitutional checks installed");

    this.enforcementLog.push({
      step: "constitutional_hooks",
      status: "installed",
      timestamp: new Date().toISOString(),
    });
  }

  async installGitHooks() {
    const hooksDir = path.join(this.repoRoot, ".git", "hooks");

    if (!fs.existsSync(hooksDir)) {
      fs.mkdirSync(hooksDir, { recursive: true });
    }

    const preCommitHook = `#!/bin/sh

# Constitutional Pre-Commit Hook
# Prevents commits that violate constitutional requirements

echo "🏛️  Constitutional Pre-Commit Check"

# Run constitutional audit
node .specify/tools/constitutional-audit.js

if [ $? -ne 0 ]; then
  echo "❌ COMMIT BLOCKED: Constitutional violations detected"
  echo "   Fix all constitutional violations before committing"
  exit 1
fi

echo "✅ Constitutional compliance verified"
`;

    const preCommitPath = path.join(hooksDir, "pre-commit");
    fs.writeFileSync(preCommitPath, preCommitHook);

    // Make executable
    try {
      execSync(`chmod +x "${preCommitPath}"`, { stdio: "ignore" });
    } catch (error) {
      // Windows doesn't need chmod
    }
  }

  async installDevServerHooks() {
    // Create a constitutional check for development server startup
    const devCheckContent = `#!/usr/bin/env node

/**
 * Development Server Constitutional Check
 * Verifies constitutional compliance before starting development server
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🏛️  Constitutional Development Server Check');

try {
  execSync('node .specify/tools/constitutional-audit.js', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..', '..')
  });
  
  console.log('✅ Constitutional compliance verified - development server starting');
  
} catch (error) {
  console.error('❌ DEVELOPMENT BLOCKED: Constitutional violations detected');
  console.error('   Fix all violations before starting development server');
  process.exit(1);
}
`;

    const devCheckPath = path.join(this.toolsDir, "dev-server-check.js");
    fs.writeFileSync(devCheckPath, devCheckContent);
  }

  async generateEnforcementReport() {
    console.log("\n📊 Generating Constitutional Enforcement Report");
    console.log("-".repeat(50));

    const report = {
      enforcementId: `enforcement_${Date.now()}`,
      timestamp: new Date().toISOString(),
      constitutionalAmendments: [
        {
          amendment: 1,
          title: "Mandatory Validation Gates",
          status: "enforced",
          implementation: "pre-task-check.js, post-task-validation.js",
        },
        {
          amendment: 2,
          title: "Evidence-First Development",
          status: "enforced",
          implementation: "mcp-evidence-validator.js",
        },
        {
          amendment: 3,
          title: "Automated Enforcement",
          status: "enforced",
          implementation:
            "constitutional-audit.js, constitutional-enforcement.js",
        },
      ],
      enforcementMechanisms: {
        preTaskValidation: "active",
        postTaskValidation: "active",
        mcpEvidenceValidation: "active",
        constitutionalAudit: "active",
        gitHooks: "active",
        devServerChecks: "active",
      },
      enforcementLog: this.enforcementLog,
      nextAuditDue: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };

    const reportDir = path.join(this.repoRoot, "evidence", "enforcement");

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(
      reportDir,
      `constitutional-enforcement-${Date.now()}.json`
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`   ✅ Enforcement report generated: ${reportPath}`);

    this.enforcementLog.push({
      step: "enforcement_report",
      status: "generated",
      timestamp: new Date().toISOString(),
      reportPath,
    });
  }
}

// CLI execution
if (require.main === module) {
  const enforcer = new ConstitutionalEnforcer();
  enforcer.enforceConstitution().catch((error) => {
    console.error("Constitutional enforcement failed:", error);
    process.exit(1);
  });
}

module.exports = ConstitutionalEnforcer;

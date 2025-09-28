#!/usr/bin/env node

/**
 * Post-task validation check - ensures task completion meets constitutional requirements
 * CONSTITUTIONAL AMENDMENT 1: MANDATORY VALIDATION GATES - All Gates Required
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class PostTaskValidator {
  constructor(taskId, evidenceDir) {
    this.taskId = taskId;
    this.evidenceDir =
      evidenceDir || path.join(process.cwd(), "evidence", taskId);
    this.errors = [];
    this.warnings = [];
    this.validationResults = {};
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

  async runAllValidations() {
    console.log(`🔍 Post-Task Validation for ${this.taskId}`);
    console.log("=".repeat(60));

    // Constitutional Gate 1: Implementation Gate
    await this.validateImplementationGate();

    // Constitutional Gate 2: MCP Validation Gate (MANDATORY)
    await this.validateMCPGate();

    // Constitutional Gate 3: Constitutional Compliance Gate
    await this.validateConstitutionalGate();

    // Generate validation report
    await this.generateValidationReport();

    // Report results
    this.reportResults();

    return this.errors.length === 0;
  }

  async validateImplementationGate() {
    console.log("\n🏗️  Gate 1: Implementation Validation");
    console.log("-".repeat(40));

    await this.checkCodeChanges();
    await this.checkTypeScriptCompilation();
    await this.checkLinting();

    this.validationResults.implementationGate = {
      passed: this.errors.length === 0,
      checks: ["code-changes", "typescript-compilation", "linting"],
    };
  }

  async validateMCPGate() {
    console.log("\n🌐 Gate 2: MCP Validation (MANDATORY)");
    console.log("-".repeat(40));

    await this.checkMCPEvidence();
    await this.validateScreenshots();
    await this.checkFunctionalBehavior();
    await this.validateErrorStates();

    this.validationResults.mcpGate = {
      passed: this.errors.filter((e) => e.includes("MCP")).length === 0,
      checks: [
        "mcp-evidence",
        "screenshots",
        "functional-behavior",
        "error-states",
      ],
    };
  }

  async validateConstitutionalGate() {
    console.log("\n⚖️  Gate 3: Constitutional Compliance");
    console.log("-".repeat(40));

    await this.runConstitutionalChecker();
    await this.validateCompletionLevel();
    await this.generateComplianceCertificate();

    this.validationResults.constitutionalGate = {
      passed:
        this.errors.filter((e) => e.includes("Constitutional")).length === 0,
      checks: [
        "constitutional-checker",
        "completion-level",
        "compliance-certificate",
      ],
    };
  }

  async checkCodeChanges() {
    try {
      // Check for recent git changes
      const gitDiff = execSync("git diff --name-only HEAD~1", {
        cwd: this.repoRoot,
        encoding: "utf8",
      }).trim();

      if (!gitDiff) {
        this.warnings.push(
          "No recent git changes detected - ensure implementation is committed"
        );
      } else {
        console.log(
          `✓ Code changes detected: ${
            gitDiff.split("\n").length
          } files modified`
        );
      }
    } catch (error) {
      this.warnings.push("Could not verify git changes");
    }
  }

  async checkTypeScriptCompilation() {
    try {
      const webDir = path.join(this.repoRoot, "packages", "web");
      execSync("npx tsc --noEmit", { cwd: webDir, stdio: "pipe" });
      console.log("✓ TypeScript compilation successful");
    } catch (error) {
      this.errors.push(
        "TypeScript compilation failed - fix type errors before completion"
      );
    }
  }

  async checkLinting() {
    try {
      const webDir = path.join(this.repoRoot, "packages", "web");
      execSync("npm run lint", { cwd: webDir, stdio: "pipe" });
      console.log("✓ Linting passed");
    } catch (error) {
      this.warnings.push(
        "Linting issues detected - consider fixing before completion"
      );
    }
  }

  async checkMCPEvidence() {
    // Check if evidence directory exists
    if (!fs.existsSync(this.evidenceDir)) {
      this.errors.push(`MCP Evidence directory not found: ${this.evidenceDir}`);
      return;
    }

    // Check for required evidence files
    const requiredEvidence = [
      "mcp-interaction.log",
      "functional-test-results.json",
      "screenshots",
    ];

    const missingEvidence = requiredEvidence.filter((item) => {
      const itemPath = path.join(this.evidenceDir, item);
      return !fs.existsSync(itemPath);
    });

    if (missingEvidence.length > 0) {
      this.errors.push(`MCP Missing evidence: ${missingEvidence.join(", ")}`);
    } else {
      console.log("✓ MCP evidence directory structure verified");
    }
  }

  async validateScreenshots() {
    const screenshotsDir = path.join(this.evidenceDir, "screenshots");

    if (!fs.existsSync(screenshotsDir)) {
      this.errors.push(
        "MCP Screenshots directory not found - capture screenshots during testing"
      );
      return;
    }

    const screenshots = fs
      .readdirSync(screenshotsDir)
      .filter(
        (f) => f.endsWith(".png") || f.endsWith(".jpg") || f.endsWith(".jpeg")
      );

    if (screenshots.length === 0) {
      this.errors.push(
        "MCP No screenshots found - capture evidence of working functionality"
      );
    } else {
      console.log(
        `✓ MCP Screenshots verified: ${screenshots.length} images found`
      );
    }
  }

  async checkFunctionalBehavior() {
    const functionalTestPath = path.join(
      this.evidenceDir,
      "functional-test-results.json"
    );

    if (!fs.existsSync(functionalTestPath)) {
      this.errors.push("MCP Functional test results not found");
      return;
    }

    try {
      const testResults = JSON.parse(
        fs.readFileSync(functionalTestPath, "utf8")
      );

      if (!testResults.passed) {
        this.errors.push(
          "MCP Functional tests failed - ensure component works correctly"
        );
      } else {
        console.log("✓ MCP Functional behavior verified");
      }
    } catch (error) {
      this.errors.push("MCP Could not parse functional test results");
    }
  }

  async validateErrorStates() {
    const errorTestPath = path.join(this.evidenceDir, "error-state-tests.json");

    if (!fs.existsSync(errorTestPath)) {
      this.warnings.push("MCP Error state testing not documented");
      return;
    }

    console.log("✓ MCP Error state testing documented");
  }

  async runConstitutionalChecker() {
    const checkerPath = path.join(
      this.repoRoot,
      ".specify",
      "tools",
      "constitutional-checker.js"
    );

    if (!fs.existsSync(checkerPath)) {
      this.warnings.push(
        "Constitutional checker not found - manual compliance review required"
      );
      return;
    }

    try {
      execSync(`node "${checkerPath}" ${this.taskId}`, {
        cwd: this.repoRoot,
        stdio: "pipe",
      });
      console.log("✓ Constitutional checker passed");
    } catch (error) {
      this.errors.push(
        "Constitutional checker failed - review compliance requirements"
      );
    }
  }

  async validateCompletionLevel() {
    // Check if completion level is documented
    const tasksPath = path.join(
      this.repoRoot,
      "specs",
      "006-quotes-technical-debt",
      "tasks.md"
    );

    if (!fs.existsSync(tasksPath)) {
      this.errors.push("Constitutional tasks.md not found");
      return;
    }

    const tasksContent = fs.readFileSync(tasksPath, "utf8");
    const taskSection = this.extractTaskSection(tasksContent);

    if (!taskSection) {
      this.errors.push("Constitutional task section not found in tasks.md");
      return;
    }

    // Check for completion level documentation
    const levelPattern = /LEVEL\s+[0-5]/i;
    if (!levelPattern.test(taskSection)) {
      this.warnings.push("Constitutional completion level not documented");
    } else {
      console.log("✓ Constitutional completion level documented");
    }
  }

  async generateComplianceCertificate() {
    const certificate = {
      taskId: this.taskId,
      timestamp: new Date().toISOString(),
      validationResults: this.validationResults,
      complianceStatus: this.errors.length === 0 ? "PASSED" : "FAILED",
      validator: "post-task-validation.js",
      evidenceLocation: this.evidenceDir,
    };

    const certificatePath = path.join(
      this.evidenceDir,
      "constitutional-compliance-certificate.json"
    );

    // Ensure evidence directory exists
    if (!fs.existsSync(this.evidenceDir)) {
      fs.mkdirSync(this.evidenceDir, { recursive: true });
    }

    fs.writeFileSync(certificatePath, JSON.stringify(certificate, null, 2));
    console.log(
      `✓ Constitutional compliance certificate generated: ${certificatePath}`
    );
  }

  async generateValidationReport() {
    const report = {
      taskId: this.taskId,
      timestamp: new Date().toISOString(),
      gates: this.validationResults,
      errors: this.errors,
      warnings: this.warnings,
      overallStatus: this.errors.length === 0 ? "PASSED" : "FAILED",
    };

    const reportPath = path.join(this.evidenceDir, "validation-report.json");

    if (!fs.existsSync(this.evidenceDir)) {
      fs.mkdirSync(this.evidenceDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  }

  extractTaskSection(tasksContent) {
    const taskPattern = new RegExp(
      `^-\\s*\\[.\\]\\s*${this.taskId}\\b[\\s\\S]*?(?=^-\\s*\\[|$)`,
      "m"
    );
    const match = tasksContent.match(taskPattern);
    return match ? match[0] : null;
  }

  reportResults() {
    console.log("\n📊 Post-Task Validation Results:");
    console.log("=".repeat(60));

    // Gate summaries
    Object.entries(this.validationResults).forEach(([gate, result]) => {
      const status = result.passed ? "✅ PASSED" : "❌ FAILED";
      console.log(`${gate.toUpperCase()}: ${status}`);
    });

    if (this.errors.length > 0) {
      console.log(
        "\n❌ CONSTITUTIONAL VIOLATIONS (Must fix before marking complete):"
      );
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

    console.log("\n" + "=".repeat(60));

    if (this.errors.length === 0) {
      console.log("✅ CONSTITUTIONAL COMPLIANCE: APPROVED");
      console.log("\n🎯 Task is ready for completion marking");
      console.log("   You may now mark the task as [x] complete in tasks.md");
    } else {
      console.log("❌ CONSTITUTIONAL COMPLIANCE: REJECTED");
      console.log("\n🚫 Task completion NOT approved");
      console.log("   Fix all violations before marking task complete");
      console.log(
        "\n💡 CRITICAL: Marking this task [x] without fixing violations"
      );
      console.log(
        "   constitutes a CONSTITUTIONAL VIOLATION and must be rolled back"
      );
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const taskId = process.argv[2];
  const evidenceDir = process.argv[3];

  if (!taskId) {
    console.error(
      "Usage: node post-task-validation.js <TASK_ID> [EVIDENCE_DIR]"
    );
    console.error(
      "Example: node post-task-validation.js T026 ./evidence/T026/"
    );
    process.exit(1);
  }

  const validator = new PostTaskValidator(taskId, evidenceDir);
  validator.runAllValidations().catch((error) => {
    console.error("Post-task validation failed:", error);
    process.exit(1);
  });
}

module.exports = PostTaskValidator;

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
    this.mcpRequirement = null;
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

    // Parse MCP requirements for this task
    await this.parseMCPRequirement();

    // Constitutional Gate 1: Implementation Gate
    await this.validateImplementationGate();

    // Constitutional Gate 2: MCP Validation Gate (CONDITIONAL)
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

  async parseMCPRequirement() {
    const tasksPath = path.join(
      this.repoRoot,
      "specs",
      "006-quotes-technical-debt",
      "tasks.md"
    );

    if (!fs.existsSync(tasksPath)) {
      this.warnings.push(
        "tasks.md not found - cannot determine MCP requirements"
      );
      return;
    }

    console.log(`🔍 DEBUG: Reading tasks.md from: ${tasksPath}`);
    console.log(`🔍 DEBUG: File exists: ${fs.existsSync(tasksPath)}`);

    const tasksContent = fs.readFileSync(tasksPath, "utf8");
    console.log(`🔍 DEBUG: File content length: ${tasksContent.length}`);

    // Debug: Check if task exists at all
    console.log(
      `🔍 DEBUG: Task ${this.taskId} mentioned ${
        (tasksContent.match(new RegExp(this.taskId, "g")) || []).length
      } times`
    );

    // Find the task block - simplified pattern first
    const simplePattern = new RegExp(`- \\[[x ]\\] ${this.taskId} `, "gm");
    const simpleMatch = tasksContent.match(simplePattern);

    if (!simpleMatch) {
      console.log(
        `⚠️  DEBUG: Task ${this.taskId} not found with simple pattern`
      );
      return;
    }

    // Find the full task block for this specific task - captures multi-line task definitions
    // Look for the task line and all following indented lines until next task or section
    const taskStartIndex =
      tasksContent.indexOf(`- [x] ${this.taskId} `) !== -1
        ? tasksContent.indexOf(`- [x] ${this.taskId} `)
        : tasksContent.indexOf(`- [ ] ${this.taskId} `);

    if (taskStartIndex === -1) {
      console.log(`⚠️  DEBUG: Task ${this.taskId} not found at start index`);
      return;
    }

    // Find the end of this task block (next task or section header)
    const remainingContent = tasksContent.substring(taskStartIndex);
    const nextTaskMatch = remainingContent.match(/\n- \[[x ]\] T\d+/);
    const nextSectionMatch = remainingContent.match(/\n## /);

    let endIndex = remainingContent.length;
    if (nextTaskMatch && nextSectionMatch) {
      endIndex = Math.min(nextTaskMatch.index, nextSectionMatch.index);
    } else if (nextTaskMatch) {
      endIndex = nextTaskMatch.index;
    } else if (nextSectionMatch) {
      endIndex = nextSectionMatch.index;
    }

    const taskBlock = remainingContent.substring(0, endIndex);
    const taskMatch = [taskBlock];

    console.log(`🔍 DEBUG: Looking for task ${this.taskId}`);

    if (taskMatch && taskMatch[0]) {
      console.log(`🔍 DEBUG: Found task block (${taskMatch[0].length} chars)`);
      console.log(`🔍 DEBUG: Task block content:\\n${taskMatch[0]}`);

      // Try different MCP patterns
      const mcpPatterns = [
        /\s+- MCP: (.*?)$/m,
        /- MCP: (.*?)$/m,
        /MCP: (.*?)$/m,
      ];

      let found = false;
      for (const pattern of mcpPatterns) {
        const mcpMatch = taskMatch[0].match(pattern);
        if (mcpMatch) {
          this.mcpRequirement = mcpMatch[1].trim();
          console.log(
            `📋 Task ${this.taskId} MCP requirement: ${this.mcpRequirement}`
          );
          found = true;
          break;
        }
      }

      if (!found) {
        console.log(`⚠️  DEBUG: No MCP match found with any pattern`);
      }
    } else {
      console.log(`⚠️  DEBUG: No task block found for ${this.taskId}`);
    }
  }

  async validateMCPGate() {
    const isSkipped =
      this.mcpRequirement && this.mcpRequirement.startsWith("N/A");

    if (isSkipped) {
      console.log(
        `\n🌐 Gate 2: MCP Validation (SKIPPED - ${this.mcpRequirement})`
      );
      console.log("-".repeat(40));
      console.log("✅ MCP validation skipped for non-UI task");

      this.validationResults.mcpGate = {
        passed: true,
        skipped: true,
        reason: this.mcpRequirement,
        checks: ["mcp-requirement-check"],
      };
      return;
    }

    console.log("\n🌐 Gate 2: MCP Validation (REQUIRED)");
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

    // MANDATE 8: ZERO ERROR TOLERANCE - Constitutional requirement
    await this.enforceZeroErrorTolerance();
    await this.runConstitutionalChecker();
    await this.validateCompletionLevel();
    await this.generateComplianceCertificate();

    this.validationResults.constitutionalGate = {
      passed:
        this.errors.filter((e) => e.includes("Constitutional")).length === 0 &&
        this.errors.filter((e) => e.includes("MANDATE 8")).length === 0,
      checks: [
        "zero-error-tolerance",
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

  async enforceZeroErrorTolerance() {
    console.log("🚫 MANDATE 8: Zero Error Tolerance Check");

    // Check TypeScript compilation with zero tolerance
    await this.checkTypeScriptCompilationStrict();

    // Check for any runtime errors in console (if applicable)
    await this.checkLintingStrict();

    // Verify no hanging errors in package.json or config files
    await this.checkConfigurationHealth();
  }

  async checkTypeScriptCompilationStrict() {
    try {
      const webDir = path.join(this.repoRoot, "packages", "web");
      const result = execSync("npx tsc --noEmit --skipLibCheck", {
        cwd: webDir,
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      });

      console.log("✅ MANDATE 8: TypeScript compilation ZERO ERRORS");
    } catch (error) {
      const errorOutput = error.stderr || error.stdout || error.message;

      // Parse the error output to count actual errors
      const errorCount = (errorOutput.match(/error TS\d+:/g) || []).length;

      this.errors.push(
        `MANDATE 8 VIOLATION: TypeScript compilation failed with ${errorCount} errors. ` +
          `Per Constitutional Amendment 8, ALL errors must be resolved before task completion. ` +
          `Error details: ${errorOutput.substring(0, 500)}...`
      );

      console.log(
        `❌ MANDATE 8: TypeScript compilation found ${errorCount} ERRORS`
      );
      console.log("🚨 DEVELOPMENT MUST HALT until all errors are resolved");
    }
  }

  async checkLintingStrict() {
    try {
      const webDir = path.join(this.repoRoot, "packages", "web");
      const result = execSync("npm run lint", {
        cwd: webDir,
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      });

      console.log("✅ MANDATE 8: Linting ZERO ERRORS");
    } catch (error) {
      const errorOutput = error.stderr || error.stdout || error.message;

      // Distinguish between errors and warnings
      const errorCount = (errorOutput.match(/\s+error\s+/gi) || []).length;
      const warningCount = (errorOutput.match(/\s+warning\s+/gi) || []).length;

      if (errorCount > 0) {
        this.errors.push(
          `MANDATE 8 VIOLATION: Linting failed with ${errorCount} errors. ` +
            `All linting ERRORS must be resolved before task completion.`
        );
        console.log(`❌ MANDATE 8: Linting found ${errorCount} ERRORS`);
      } else if (warningCount > 0) {
        this.warnings.push(
          `Linting found ${warningCount} warnings. ` +
            `Consider addressing these in post-sprint cleanup.`
        );
        console.log(
          `⚠️  MANDATE 8: Linting found ${warningCount} warnings (acceptable)`
        );
      } else {
        console.log("✅ MANDATE 8: Linting ZERO ERRORS");
      }
    }
  }

  async checkConfigurationHealth() {
    try {
      const webDir = path.join(this.repoRoot, "packages", "web");

      // Check package.json exists and is valid JSON
      const packagePath = path.join(webDir, "package.json");
      if (fs.existsSync(packagePath)) {
        JSON.parse(fs.readFileSync(packagePath, "utf8"));
        console.log("✅ MANDATE 8: package.json is valid");
      }

      // Check tsconfig.json exists and is valid JSON
      const tsconfigPath = path.join(webDir, "tsconfig.json");
      if (fs.existsSync(tsconfigPath)) {
        JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));
        console.log("✅ MANDATE 8: tsconfig.json is valid");
      }
    } catch (error) {
      this.errors.push(
        `MANDATE 8 VIOLATION: Configuration file corruption detected. ` +
          `Fix configuration issues before task completion. Error: ${error.message}`
      );
      console.log("❌ MANDATE 8: Configuration health check FAILED");
    }
  }

  // Legacy method - kept for backward compatibility but enhanced
  async checkTypeScriptCompilation() {
    // Delegate to the strict version for MANDATE 8 compliance
    await this.checkTypeScriptCompilationStrict();
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
    // For non-UI tasks (MCP: N/A), run specialized validation
    const isNonUITask =
      this.mcpRequirement && this.mcpRequirement.startsWith("N/A");

    if (isNonUITask) {
      console.log("✓ Non-UI task constitutional validation");
      await this.validateNonUITaskCompliance();
      return;
    }

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

  async validateNonUITaskCompliance() {
    // Non-UI task specific constitutional validation (schemas, services, etc.)
    let implementationFile = null;

    // Extract file path from task description
    const tasksPath = path.join(
      this.repoRoot,
      "specs",
      "006-quotes-technical-debt",
      "tasks.md"
    );
    if (fs.existsSync(tasksPath)) {
      const tasksContent = fs.readFileSync(tasksPath, "utf8");
      // Look for any .ts file path in the task description
      const taskMatch = tasksContent.match(
        new RegExp(`${this.taskId}.*?packages/web/src/[^\\s]+\\.ts`)
      );
      if (taskMatch) {
        const fileMatch = taskMatch[0].match(/packages\/web\/src\/[^\s]+\.ts/);
        if (fileMatch) {
          implementationFile = path.join(this.repoRoot, fileMatch[0]);
        }
      }
    }

    if (!implementationFile || !fs.existsSync(implementationFile)) {
      this.errors.push("Implementation file not found or not implemented");
      return;
    }

    const implementationContent = fs.readFileSync(implementationFile, "utf8");
    const isSchemaFile =
      implementationFile.includes("validation") ||
      implementationFile.includes("schema");
    const isServiceFile = implementationFile.includes("services");

    // Constitutional compliance checks for non-UI tasks
    let checks = [];

    if (isSchemaFile) {
      // Schema-specific checks
      checks = [
        {
          name: "Zod schema definitions",
          test:
            implementationContent.includes("z.") &&
            implementationContent.includes("Schema"),
          error: "Schema file lacks proper Zod schema definitions",
        },
        {
          name: "TypeScript type exports",
          test:
            implementationContent.includes("export type") ||
            implementationContent.includes("export interface"),
          error: "Schema file lacks proper TypeScript type exports",
        },
        {
          name: "Validation functions",
          test:
            implementationContent.includes("parse") ||
            implementationContent.includes("validate"),
          error: "Schema file lacks validation helper functions",
        },
        {
          name: "No console.log placeholders",
          test: !implementationContent.includes("console.log"),
          error:
            "Schema contains console.log placeholders - implement real validation logic",
        },
        {
          name: "Substantial implementation",
          test: implementationContent.length > 500,
          error: "Schema appears incomplete or too minimal",
        },
      ];
    } else if (isServiceFile) {
      // Service-specific checks
      checks = [
        {
          name: "No console.log placeholders (anti-hallucination)",
          test: !implementationContent.includes("console.log"),
          error:
            "Service contains console.log placeholders - implement real business logic",
        },
        {
          name: "Error handling implementation",
          test:
            implementationContent.includes("try") &&
            implementationContent.includes("catch"),
          error: "Service lacks proper error handling implementation",
        },
        {
          name: "Type validation with Zod",
          test:
            implementationContent.includes("z.") ||
            implementationContent.includes("Schema"),
          error: "Service lacks Zod validation integration",
        },
        {
          name: "Business logic implementation",
          test:
            implementationContent.length > 1000 &&
            implementationContent.includes("async"),
          error:
            "Service appears to be incomplete or lacks substantial business logic",
        },
        {
          name: "Proper TypeScript types",
          test:
            implementationContent.includes("interface") ||
            implementationContent.includes("type"),
          error: "Service lacks proper TypeScript type definitions",
        },
      ];
    } else {
      // Generic non-UI checks
      checks = [
        {
          name: "No console.log placeholders",
          test: !implementationContent.includes("console.log"),
          error: "Implementation contains console.log placeholders",
        },
        {
          name: "TypeScript implementation",
          test:
            implementationContent.includes("export") &&
            implementationContent.length > 100,
          error: "Implementation appears incomplete",
        },
      ];
    }

    const failedChecks = checks.filter((check) => !check.test);
    const passedChecks = checks.filter((check) => check.test);

    if (failedChecks.length > 0) {
      failedChecks.forEach((check) => {
        this.errors.push(`Constitutional: ${check.error}`);
      });
    }

    const taskType = isSchemaFile
      ? "Schema"
      : isServiceFile
      ? "Service layer"
      : "Non-UI task";
    console.log(
      `✓ ${taskType} compliance: ${passedChecks.length}/${checks.length} checks passed`
    );
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

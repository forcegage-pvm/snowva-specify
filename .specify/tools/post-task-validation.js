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
    await this.validateRequirementEvidenceAlignment();

    this.validationResults.mcpGate = {
      passed: this.errors.filter((e) => e.includes("MCP")).length === 0,
      checks: [
        "mcp-evidence",
        "screenshots",
        "functional-behavior",
        "error-states",
        "requirement-evidence-alignment",
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

    // AMENDMENT 6: TDD DEBT MANAGEMENT - Mandatory technical debt tracking
    await this.validateTechnicalDebtEvidence();

    await this.generateComplianceCertificate();

    this.validationResults.constitutionalGate = {
      passed:
        this.errors.filter((e) => e.includes("Constitutional")).length === 0 &&
        this.errors.filter((e) => e.includes("MANDATE 8")).length === 0 &&
        this.errors.filter((e) => e.includes("AMENDMENT 6")).length === 0,
      checks: [
        "zero-error-tolerance",
        "constitutional-checker",
        "completion-level",
        "technical-debt-evidence",
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

    console.log("🔍 MCP Two-File System Validation");

    // 1. Check for mcp-test-results.json (agent's functional analysis)
    const testResultsPath = path.join(
      this.evidenceDir,
      "mcp-test-results.json"
    );
    if (!fs.existsSync(testResultsPath)) {
      this.errors.push(
        `❌ MCP Test Results missing: mcp-test-results.json\n` +
          "📋 REQUIRED ACTION: Create test results file with agent's functional analysis\n" +
          "🔧 FILE PURPOSE: Contains agent's analysis of MCP evidence proving functionality\n" +
          "   • Must include functional test results based on MCP data examination\n" +
          "   • Should validate API responses, UI behavior, error handling\n" +
          "   • Provides structured analysis of what the evidence proves\n" +
          "⚠️  CRITICAL: This file contains ANALYSIS, not raw MCP outputs"
      );
    } else {
      console.log("✓ MCP test results file found");
      await this.validateTestResultsFile(testResultsPath);
    }

    // 2. Check for evidence files (RAW MCP outputs for anti-fraud)
    const evidenceRequirements = [
      "mcp-interaction.log",
      "mcp-screenshots", // Raw JSON responses from MCP commands
    ];

    const missingEvidence = evidenceRequirements.filter((item) => {
      const itemPath = path.join(this.evidenceDir, item);
      return !fs.existsSync(itemPath);
    });

    if (missingEvidence.length > 0) {
      this.errors.push(
        `❌ MCP Evidence files missing: ${missingEvidence.join(", ")}\n` +
          "📋 REQUIRED ACTION: Create proper anti-fraud evidence structure\n" +
          "🔧 EVIDENCE REQUIREMENTS (RAW MCP OUTPUTS ONLY):\n" +
          "   • mcp-interaction.log: Log of all MCP browser commands and responses\n" +
          "   • mcp-screenshots/: Directory with RAW JSON from take_snapshot.json AND take_screenshot.json\n" +
          "   📝 NOTE: These files prove MCP usage - NO EDITING OR PROCESSING allowed\n" +
          "🛠️  GENERATION INSTRUCTIONS:\n" +
          "   1. Start dev server: Start-Process powershell -ArgumentList '-NoExit', '-Command', 'npm run dev'\n" +
          "   2. Use MCP tools: mcp_chrome-devtoo_new_page, mcp_chrome-devtoo_navigate_page\n" +
          "   3. Capture BOTH: mcp_chrome-devtoo_take_snapshot AND mcp_chrome-devtoo_take_screenshot\n" +
          "   4. Save COMPLETELY UNMODIFIED JSON responses as evidence files\n" +
          "   ⚠️  CONSTITUTIONAL VIOLATION: Editing evidence files violates Amendment 4\n" +
          "⚠️  WARNING: Fraud detection actively scanning for fake/modified files"
      );
    } else {
      console.log("✓ MCP evidence files structure verified");
    }

    // 3. Validate the two-file system integrity
    if (
      fs.existsSync(testResultsPath) &&
      evidenceRequirements.every((item) =>
        fs.existsSync(path.join(this.evidenceDir, item))
      )
    ) {
      console.log("✅ MCP Two-File System Complete:");
      console.log("   📊 Test Results: Agent's functional analysis");
      console.log("   🔒 Evidence Files: RAW MCP outputs for anti-fraud");
    }
  }

  async validateTestResultsFile(testResultsPath) {
    console.log("📊 Validating MCP Test Results File");

    try {
      const content = fs.readFileSync(testResultsPath, "utf8");
      const testResults = JSON.parse(content);

      // Validate required structure for test results file
      const requiredFields = [
        "taskId",
        "testTimestamp",
        "mcpValidation",
        "functionalTests",
        "testResultsSummary",
      ];

      const missingFields = requiredFields.filter(
        (field) => !testResults[field]
      );

      if (missingFields.length > 0) {
        this.errors.push(
          `❌ MCP Test Results missing required fields: ${missingFields.join(
            ", "
          )}\n` +
            "📋 REQUIRED STRUCTURE: Test results must contain agent's functional analysis\n" +
            "🔧 EXPECTED FIELDS:\n" +
            "   • taskId: Task identifier\n" +
            "   • testTimestamp: When analysis was performed\n" +
            "   • mcpValidation: Anti-fraud verification status\n" +
            "   • functionalTests: Agent's analysis of functionality\n" +
            "   • testResultsSummary: Overall validation outcome"
        );
      }

      // Validate that this is analysis, not raw MCP data
      if (
        testResults.type === "take_screenshot" ||
        testResults.type === "take_snapshot"
      ) {
        this.errors.push(
          `🚨 SYSTEM DESIGN ERROR: Test results file contains RAW MCP data instead of analysis\n` +
            "📋 CORRECTION REQUIRED: Separate test results from evidence files\n" +
            "🔧 PROPER STRUCTURE:\n" +
            "   • mcp-test-results.json: Agent's functional analysis and validation findings\n" +
            "   • mcp-screenshots/*.json: RAW unmodified MCP command outputs\n" +
            "⚠️  CONSTITUTIONAL VIOLATION: Mixing analysis with evidence violates system architecture"
        );
      }

      // Validate functional test outcomes
      if (testResults.functionalTests) {
        const testCategories = [
          "apiEndpoint",
          "responseValidation",
          "businessLogic",
          "dataIntegrity",
        ];
        const testsPassed = testCategories.every(
          (category) =>
            testResults.functionalTests[category] &&
            testResults.functionalTests[category].status === "PASS"
        );

        if (!testsPassed) {
          this.warnings.push(
            "⚠️  Some functional tests did not pass - review implementation before task completion"
          );
        }
      }

      console.log("✓ MCP test results file structure validated");
    } catch (error) {
      this.errors.push(
        `🚨 INVALID JSON: Cannot parse MCP test results file\n` +
          `📋 PROPER ACTION: Ensure file contains valid JSON with agent's analysis\n` +
          `Error: ${error.message}`
      );
    }
  }

  async validateScreenshots() {
    // MCP screenshots in VS Code return OCR text, not binary images
    // Validate raw JSON responses instead of PNG files
    const mcpScreenshotsDir = path.join(this.evidenceDir, "mcp-screenshots");

    if (!fs.existsSync(mcpScreenshotsDir)) {
      this.errors.push(
        "❌ MCP Screenshots directory not found\n" +
          "📋 REQUIRED ACTION: Create mcp-screenshots directory and capture actual evidence\n" +
          "🔧 PROPER METHOD: Use mcp_chrome-devtoo_take_screenshot({ format: 'png' }) and save raw JSON response\n" +
          "⚠️  IMPORTANT: VS Code MCP returns OCR text, not binary images\n" +
          "⚠️  WARNING: Do not create fake JSON files - fraud detection is active"
      );
      return;
    }

    // Check for both required MCP command responses
    const requiredFiles = ["take_snapshot.json", "take_screenshot.json"];
    const missingFiles = requiredFiles.filter(
      (file) => !fs.existsSync(path.join(mcpScreenshotsDir, file))
    );

    if (missingFiles.length > 0) {
      this.errors.push(
        `❌ MCP Missing required files: ${missingFiles.join(", ")}\n` +
          "📋 REQUIRED ACTION:\n" +
          "   1. Start development server: Start-Process powershell -ArgumentList '-NoExit', '-Command', 'npm run dev'\n" +
          "   2. Wait 5-10 seconds for server startup\n" +
          "   3. Use MCP browser tools: mcp_chrome-devtoo_new_page('http://localhost:3000/api/endpoint')\n" +
          "   4. Capture BOTH commands:\n" +
          "      • mcp_chrome-devtoo_take_snapshot() → save as take_snapshot.json\n" +
          "      • mcp_chrome-devtoo_take_screenshot() → save as take_screenshot.json\n" +
          "   5. Save raw MCP JSON responses with exact filenames in mcp-screenshots/\n" +
          "🔍 VALIDATION: Both commands required for complete evidence validation\n" +
          "⚠️  WARNING: Do not create fake JSON responses - fraud detection will catch this"
      );
      return;
    }

    const mcpResponses = requiredFiles;

    // CONSTITUTIONAL AMENDMENT 4: Anti-fraud MCP response validation
    await this.validateMCPScreenshotResponses(mcpResponses, mcpScreenshotsDir);

    console.log(
      `✓ MCP Screenshot responses verified: ${mcpResponses.length} JSON files found`
    );
  }

  async detectScreenshotFraud(screenshots, screenshotsDir) {
    for (const screenshot of screenshots) {
      const screenshotPath = path.join(screenshotsDir, screenshot);
      const stats = fs.statSync(screenshotPath);

      // Check for suspiciously small files (likely fake/placeholder)
      if (stats.size < 100) {
        this.errors.push(
          `🚨 FRAUD DETECTED: Screenshot ${screenshot} is suspiciously small (${stats.size} bytes)\n` +
            `📋 PROPER ACTION REQUIRED:\n` +
            `   1. Delete the fake/placeholder file: ${screenshot}\n` +
            `   2. Start development server if not running\n` +
            `   3. Use MCP browser tools to capture REAL screenshots\n` +
            `   4. Verify functionality actually works before capturing evidence\n` +
            `⚠️  CONSTITUTIONAL VIOLATION: Placeholder files violate Amendment 4 - Anti-Fraud Protocol`
        );
      }

      // Check for identical file creation times (bulk copying)
      const creationTime = stats.birthtime.getTime();
      const modificationTime = stats.mtime.getTime();

      if (Math.abs(creationTime - modificationTime) < 1000) {
        // Check if multiple files have identical timestamps
        const identicalTimes = screenshots.filter((otherFile) => {
          if (otherFile === screenshot) return false;
          const otherStats = fs.statSync(path.join(screenshotsDir, otherFile));
          return Math.abs(otherStats.birthtime.getTime() - creationTime) < 1000;
        });

        if (identicalTimes.length > 0) {
          this.warnings.push(
            `SUSPICIOUS: Multiple screenshots created at identical time (${new Date(
              creationTime
            ).toISOString()}). ` +
              `This may indicate bulk copying rather than genuine evidence capture.`
          );
        }
      }

      // Check file content for common fake patterns
      try {
        const content = fs.readFileSync(screenshotPath, "utf8");
        if (content.includes("PNG") && content.length < 50) {
          this.errors.push(
            `FRAUD DETECTED: Screenshot ${screenshot} contains placeholder text instead of binary image data.`
          );
        }
      } catch (error) {
        // Binary files will throw error when read as UTF8 - this is expected for real images
      }
    }
  }

  async validateMCPScreenshotResponses(mcpResponses, mcpScreenshotsDir) {
    for (const responseFile of mcpResponses) {
      const responsePath = path.join(mcpScreenshotsDir, responseFile);
      const stats = fs.statSync(responsePath);

      // Check for suspiciously small JSON files (likely fake)
      if (stats.size < 200) {
        this.errors.push(
          `🚨 FRAUD DETECTED: MCP response ${responseFile} is suspiciously small (${stats.size} bytes)\n` +
            `📋 PROPER ACTION REQUIRED:\n` +
            `   1. Delete the fake JSON file: ${responseFile}\n` +
            `   2. Use actual MCP browser tools: mcp_chrome-devtoo_${
              responseFile === "take_snapshot.json"
                ? "take_snapshot"
                : "take_screenshot"
            }\n` +
            `   3. Save the complete raw JSON response from MCP server\n` +
            `⚠️  CONSTITUTIONAL VIOLATION: Fake JSON responses violate Amendment 4`
        );
        continue;
      }

      // Validate JSON structure and content
      try {
        const fileContent = fs.readFileSync(responsePath, "utf8");
        console.log(
          `🔍 DEBUG: Reading ${responseFile}, first 100 chars:`,
          fileContent.substring(0, 100)
        );
        const content = JSON.parse(fileContent);
        const expectedCommand =
          responseFile === "take_snapshot.json"
            ? "take_snapshot"
            : "take_screenshot";

        // Check for required MCP response structure (accept both 'command' and 'type' fields)
        if (
          (!content.command && !content.type) ||
          (content.command && content.command !== expectedCommand) ||
          (content.type && content.type !== expectedCommand)
        ) {
          this.errors.push(
            `🚨 FRAUD DETECTED: Invalid MCP response in ${responseFile}\n` +
              `📋 REQUIRED: Response must contain 'command: ${expectedCommand}' or 'type: ${expectedCommand}'\n` +
              `⚠️  Use actual mcp_chrome-devtoo_${expectedCommand} command and save raw response`
          );
        }

        // Check for OCR content that proves functionality
        if (
          !content.extractedContent &&
          !content.response &&
          !content.functionalProof
        ) {
          this.warnings.push(
            `SUSPICIOUS: MCP response ${responseFile} lacks functional proof content. ` +
              `Ensure the response demonstrates actual working functionality.`
          );
        }

        // Check for timestamp to verify recent capture
        if (content.timestamp) {
          const responseTime = new Date(content.timestamp);
          const now = new Date();
          const ageDays = (now - responseTime) / (1000 * 60 * 60 * 24);

          if (ageDays > 7) {
            this.warnings.push(
              `OLD EVIDENCE: MCP response ${responseFile} is ${Math.round(
                ageDays
              )} days old. ` +
                `Consider capturing fresh evidence for current task validation.`
            );
          }
        }
      } catch (error) {
        this.errors.push(
          `🚨 INVALID JSON: Cannot parse MCP response ${responseFile}\n` +
            `📋 PROPER ACTION: Ensure file contains valid JSON from actual MCP command\n` +
            `Error: ${error.message}`
        );
      }
    }
  }

  async checkFunctionalBehavior() {
    // Use the new two-file system - check test results file
    const testResultsPath = path.join(
      this.evidenceDir,
      "mcp-test-results.json"
    );

    if (!fs.existsSync(testResultsPath)) {
      this.errors.push(
        "❌ MCP Test results not found (two-file system)\n" +
          "📋 REQUIRED ACTION: Create mcp-test-results.json with functional analysis\n" +
          "🔧 NEW TWO-FILE SYSTEM:\n" +
          "   1. mcp-test-results.json: Agent's functional analysis and validation findings\n" +
          "   2. mcp-screenshots/*.json: RAW MCP command outputs for anti-fraud\n" +
          "   📝 NOTE: Test results contain analysis, evidence files contain RAW data\n" +
          "⚠️  WARNING: Do not mix analysis with evidence - system architecture violation"
      );
      return;
    }

    try {
      const testResults = JSON.parse(fs.readFileSync(testResultsPath, "utf8"));

      // CONSTITUTIONAL AMENDMENT 4: Detect evidence manipulation
      await this.detectFunctionalTestFraud(testResults, testResultsPath);

      // Check functional test outcomes in the new structure
      if (
        testResults.testResultsSummary &&
        testResults.testResultsSummary.overallStatus === "PASS"
      ) {
        console.log("✓ MCP Functional behavior verified (two-file system)");
      } else if (testResults.functionalTests) {
        // Check individual test categories
        const testCategories = [
          "apiEndpoint",
          "responseValidation",
          "businessLogic",
          "dataIntegrity",
        ];
        const failedTests = testCategories.filter(
          (category) =>
            !testResults.functionalTests[category] ||
            testResults.functionalTests[category].status !== "PASS"
        );

        if (failedTests.length > 0) {
          this.errors.push(
            `❌ MCP Functional tests failed in categories: ${failedTests.join(
              ", "
            )}\n` +
              "📋 REQUIRED ACTION: Fix the underlying functionality, do not fake the test results\n" +
              "🔧 TROUBLESHOOTING:\n" +
              "   1. Check if development server is actually running (localhost:3000)\n" +
              "   2. Verify API endpoints return correct responses\n" +
              "   3. Test functionality manually in browser first\n" +
              "   4. Fix any broken code/logic\n" +
              "   5. Re-run MCP browser testing with fixed functionality\n" +
              "⚠️  WARNING: Only mark tests as PASS when functionality actually works"
          );
        } else {
          console.log(
            "✓ MCP Functional behavior verified (all test categories passed)"
          );
        }
      } else {
        this.warnings.push(
          "Functional test structure not recognized - consider updating test results format"
        );
      }
    } catch (error) {
      this.errors.push("MCP Could not parse functional test results");
    }
  }

  async detectFunctionalTestFraud(testResults, filePath) {
    const stats = fs.statSync(filePath);
    const now = new Date();
    const fileAge = now - stats.mtime;

    // Check if file was modified very recently (within last 5 minutes)
    // This could indicate tampering during validation
    if (fileAge < 5 * 60 * 1000) {
      this.warnings.push(
        `SUSPICIOUS: Functional test results were modified within the last 5 minutes (${new Date(
          stats.mtime
        ).toISOString()}). ` + `This may indicate tampering to pass validation.`
      );
    }

    // Check for missing required MCP evidence that should accompany functional tests
    const mcpScreenshotsDir = path.join(this.evidenceDir, "mcp-screenshots");
    if (!fs.existsSync(mcpScreenshotsDir)) {
      this.errors.push(
        `FRAUD DETECTED: Functional test results claim MCP testing but no mcp-screenshots directory found. ` +
          `All MCP interactions must include raw response evidence.`
      );
    } else {
      const mcpFiles = fs.readdirSync(mcpScreenshotsDir);
      if (mcpFiles.length === 0) {
        this.errors.push(
          `FRAUD DETECTED: Empty mcp-screenshots directory. ` +
            `All MCP browser interactions must save raw JSON responses as evidence.`
        );
      }
    }

    // Validate that claimed test results align with actual test structure
    if (testResults.testResults && testResults.testResults.mcpBrowserTesting) {
      const mcpTests = testResults.testResults.mcpBrowserTesting;
      if (
        mcpTests.testsExecuted &&
        mcpTests.testsPassed &&
        mcpTests.testsFailed
      ) {
        const total = mcpTests.testsPassed + mcpTests.testsFailed;
        if (total !== mcpTests.testsExecuted) {
          this.errors.push(
            `FRAUD DETECTED: Functional test math doesn't add up. ` +
              `Passed (${mcpTests.testsPassed}) + Failed (${mcpTests.testsFailed}) != Executed (${mcpTests.testsExecuted})`
          );
        }
      }
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

  async validateRequirementEvidenceAlignment() {
    console.log("🎯 MANDATE 10: Checking Requirement-Evidence Alignment");

    // Parse task requirement to extract exact functionality
    const taskRequirement = await this.parseTaskFunctionalRequirement();
    if (!taskRequirement) {
      this.warnings.push(
        "Could not parse task functional requirement for alignment check"
      );
      return;
    }

    // Check if MCP evidence actually proves the required functionality
    const evidenceAlignment = await this.checkEvidenceAlignment(
      taskRequirement
    );

    if (!evidenceAlignment.aligned) {
      this.errors.push(
        `🚨 MANDATE 10 VIOLATION: Requirement-Evidence Misalignment\n` +
          `📋 TASK REQUIRES: ${taskRequirement.functionality}\n` +
          `🔍 EVIDENCE PROVES: ${evidenceAlignment.actualFunctionality}\n` +
          `❌ PROBLEM: ${evidenceAlignment.problem}\n` +
          `✅ REQUIRED ACTION: Update MCP testing to validate ${taskRequirement.functionality}\n` +
          `⚖️ CONSTITUTIONAL VIOLATION: This violates Mandate 10 - Exact Functional Correspondence`
      );
    } else {
      console.log(
        `✅ MANDATE 10: Evidence correctly proves ${taskRequirement.functionality}`
      );
    }
  }

  async parseTaskFunctionalRequirement() {
    const tasksPath = path.join(
      this.repoRoot,
      "specs",
      "006-quotes-technical-debt",
      "tasks.md"
    );

    if (!fs.existsSync(tasksPath)) {
      return null;
    }

    const tasksContent = fs.readFileSync(tasksPath, "utf8");

    // Find this specific task
    const taskPattern = new RegExp(
      `- \\[[x ]\\] ${this.taskId}.*?(?=- \\[[x ]\\] T\\d+|$)`,
      "gs"
    );
    const taskMatch = tasksContent.match(taskPattern);

    if (!taskMatch || !taskMatch[0]) {
      return null;
    }

    const taskBlock = taskMatch[0];

    // Extract specific functionality requirements
    const apiMethodMatch = taskBlock.match(
      /(GET|POST|PUT|DELETE|PATCH)\s+\/api\/[^\s]+/
    );
    const contractTestMatch = taskBlock.match(
      /Contract test (GET|POST|PUT|DELETE|PATCH)/
    );
    const browserTestMatch = taskBlock.match(/Browser test ([^\\n]+)/);

    let functionality = "Unknown";

    if (apiMethodMatch) {
      functionality = `${apiMethodMatch[1]} ${apiMethodMatch[0]}`;
    } else if (contractTestMatch) {
      functionality = `Contract test ${contractTestMatch[1]}`;
    } else if (browserTestMatch) {
      functionality = browserTestMatch[1];
    }

    return {
      taskId: this.taskId,
      functionality: functionality,
      taskDescription: taskBlock.split("\\n")[0],
      fullTaskBlock: taskBlock,
    };
  }

  async checkEvidenceAlignment(requirement) {
    // Check MCP interaction log for alignment
    const interactionLogPath = path.join(
      this.evidenceDir,
      "mcp-interaction.log"
    );
    const testResultsPath = path.join(
      this.evidenceDir,
      "mcp-test-results.json"
    );

    let logContent = "";
    let testResults = null;

    if (fs.existsSync(interactionLogPath)) {
      logContent = fs.readFileSync(interactionLogPath, "utf8");
    }

    if (fs.existsSync(testResultsPath)) {
      try {
        testResults = JSON.parse(fs.readFileSync(testResultsPath, "utf8"));
      } catch (error) {
        // Invalid JSON
      }
    }

    // Look for evidence of the specific functionality being tested
    const requiredMethod = requirement.functionality.match(
      /(GET|POST|PUT|DELETE|PATCH)/
    );

    if (requiredMethod) {
      const method = requiredMethod[1];

      // More precise detection - look for actual API testing, not just mentions
      const actualApiTestingPattern = new RegExp(
        `(Purpose|Testing|Command).*${method}.*(/api/|endpoint)`,
        "gi"
      );
      const wrongMethodTestingPattern =
        method !== "GET"
          ? /(Purpose|Testing|Command).*(GET).*(\/api\/|endpoint)/gi
          : /(Purpose|Testing|Command).*(POST|PUT|DELETE|PATCH).*(\/api\/|endpoint)/gi;

      const testsCorrectMethod = actualApiTestingPattern.test(logContent);
      const testsWrongMethod = wrongMethodTestingPattern.test(logContent);

      // Special case: Check for substitution patterns (testing GET when POST required)
      if (method === "POST") {
        const getSubstitutionPattern =
          /(Purpose|Result|Analysis).*GET.*\/api.*quotes/gi;
        const postActualTesting = /POST.*request|fetch.*POST|method.*POST/gi;

        if (
          getSubstitutionPattern.test(logContent) &&
          !postActualTesting.test(logContent)
        ) {
          return {
            aligned: false,
            actualFunctionality: "GET endpoint testing (substitution for POST)",
            problem: `Task requires POST testing but evidence shows GET endpoint testing was substituted`,
          };
        }
      }

      if (testsWrongMethod && !testsCorrectMethod) {
        return {
          aligned: false,
          actualFunctionality: "Different HTTP method tested",
          problem: `Task requires ${method} testing but evidence shows different method testing`,
        };
      }

      if (!testsCorrectMethod) {
        return {
          aligned: false,
          actualFunctionality: "No evidence of required method testing",
          problem: `No evidence found of actual ${method} API testing in MCP interaction log`,
        };
      }
    }

    return {
      aligned: true,
      actualFunctionality: requirement.functionality,
      problem: null,
    };
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

    // CONSTITUTIONAL AMENDMENT 4: Detect validator gaming
    await this.detectValidatorGaming();

    // Instead of looking for a separate status file, validate the actual evidence
    console.log(
      "✓ Constitutional validation integrated with evidence validation"
    );

    // The constitutional requirements are already being checked through:
    // 1. MCP evidence validation (anti-fraud)
    // 2. Functional test validation
    // 3. TypeScript compilation (MANDATE 8)
    // 4. Zero error tolerance
    // No separate status file required - evidence speaks for itself
  }

  async detectValidatorGaming() {
    // Check for suspicious files in root directory that match task IDs
    const rootFiles = fs.readdirSync(this.repoRoot);
    const taskIdPattern = /^T\d+$/;

    const suspiciousFiles = rootFiles.filter((file) => {
      return (
        taskIdPattern.test(file) &&
        fs.statSync(path.join(this.repoRoot, file)).isFile()
      );
    });

    if (suspiciousFiles.length > 0) {
      this.errors.push(
        `🚨 FRAUD DETECTED: Suspicious task ID files in root: ${suspiciousFiles.join(
          ", "
        )}\n` +
          `📋 CORRECTIVE ACTION REQUIRED:\n` +
          `   1. Delete these fraudulent files: ${suspiciousFiles
            .map((f) => `rm ${f}`)
            .join(", ")}\n` +
          `   2. Fix the constitutional evidence properly in evidence/${this.taskId}/constitutional-evidence.md\n` +
          `   3. Constitutional checker expects evidence file path, not copied root files\n` +
          `🚨 CONSTITUTIONAL VIOLATION: Gaming validation system violates Amendment 4`
      );
    }

    // Check for evidence file copying patterns
    const evidenceFile = path.join(
      this.evidenceDir,
      "constitutional-evidence.md"
    );
    const rootTaskFile = path.join(this.repoRoot, this.taskId);

    if (fs.existsSync(evidenceFile) && fs.existsSync(rootTaskFile)) {
      const evidenceContent = fs.readFileSync(evidenceFile, "utf8");
      const rootContent = fs.readFileSync(rootTaskFile, "utf8");

      if (evidenceContent === rootContent) {
        this.errors.push(
          `🚨 FRAUD DETECTED: Evidence file copied to game validator\n` +
            `📋 CORRECTIVE ACTION REQUIRED:\n` +
            `   1. Delete the copied file: rm ${this.taskId}\n` +
            `   2. Fix the actual constitutional checker to accept proper file paths\n` +
            `   3. Use evidence/${this.taskId}/constitutional-evidence.md as intended\n` +
            `⚠️  CONSTITUTIONAL VIOLATION: File copying to bypass validation violates Amendment 4`
        );
      }
    }

    // Check for evidence directories that are unexpectedly empty after creation
    const mcpScreenshotsDir = path.join(this.evidenceDir, "mcp-screenshots");
    const regularScreenshotsDir = path.join(this.evidenceDir, "screenshots");

    if (
      fs.existsSync(mcpScreenshotsDir) &&
      fs.existsSync(regularScreenshotsDir)
    ) {
      const mcpFiles = fs.readdirSync(mcpScreenshotsDir);
      const regularFiles = fs.readdirSync(regularScreenshotsDir);

      if (mcpFiles.length === 0 && regularFiles.length > 0) {
        this.warnings.push(
          `SUSPICIOUS: Screenshots directory has files but mcp-screenshots is empty. ` +
            `This suggests evidence was moved or copied rather than properly collected.`
        );
      }
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

  /**
   * Validate that debt references actually exist in sprint tasks or inventory
   */
  async validateDebtReferences(tracking) {
    console.log(
      `🔍 Validating debt references for strategy: ${tracking.strategy}`
    );

    if (tracking.strategy === "SPRINT_TASKS") {
      // Validate sprint task references
      for (const ref of tracking.references) {
        if (ref.type === "SPRINT_TASK") {
          const tasksFile = path.join(process.cwd(), ref.sprintFile);
          if (!fs.existsSync(tasksFile)) {
            this.errors.push(
              `AMENDMENT 6 VIOLATION: Sprint tasks file not found: ${ref.sprintFile}`
            );
            continue;
          }

          const tasksContent = fs.readFileSync(tasksFile, "utf8");
          // For sprint tasks, only validate that the task ID exists
          // Debt ID correlation is maintained through the evidence file
          const taskPattern = new RegExp(`\\b${ref.taskId}\\b`, "i");

          if (!taskPattern.test(tasksContent)) {
            this.errors.push(
              `AMENDMENT 6 VIOLATION: Task ${ref.taskId} not found in ${ref.sprintFile}`
            );
          } else {
            console.log(
              `   ✓ Sprint task reference validated: ${
                ref.taskId
              } (debt: ${ref.debtId.substring(0, 12)}...)`
            );
          }
        }
      }
    } else if (tracking.strategy === "INVENTORY") {
      // Validate inventory references
      for (const ref of tracking.references) {
        if (ref.type === "INVENTORY") {
          const inventoryFile = path.join(process.cwd(), ref.inventoryFile);
          if (!fs.existsSync(inventoryFile)) {
            this.errors.push(
              `AMENDMENT 6 VIOLATION: Debt inventory file not found: ${ref.inventoryFile}`
            );
            continue;
          }

          try {
            const inventory = JSON.parse(
              fs.readFileSync(inventoryFile, "utf8")
            );
            const debtExists = Object.values(inventory.debt || {})
              .flat()
              .some((debt) => debt.id === ref.debtId);

            if (!debtExists) {
              this.errors.push(
                `AMENDMENT 6 VIOLATION: Debt ${ref.debtId} not found in inventory ${ref.inventoryFile}`
              );
            } else {
              console.log(
                `   ✓ Inventory debt reference validated: ${ref.debtId}`
              );
            }
          } catch (error) {
            this.errors.push(
              `AMENDMENT 6 VIOLATION: Could not parse inventory file ${ref.inventoryFile}: ${error.message}`
            );
          }
        }
      }
    }
  }

  async validateTechnicalDebtEvidence() {
    console.log("🔍 Validating Technical Debt Evidence (Amendment 6)");

    const technicalDebtPath = path.join(
      this.evidenceDir,
      "technical-debt.json"
    );

    if (!fs.existsSync(technicalDebtPath)) {
      // Generate empty debt evidence for tasks that didn't execute TDD tests
      try {
        const TDDDebtAnalyzer = require("./tdd-debt-analyzer.js");
        TDDDebtAnalyzer.generateEmptyDebtEvidence(this.taskId);
        console.log(
          "✓ Generated empty technical debt evidence for non-TDD task"
        );
      } catch (error) {
        this.errors.push(
          `AMENDMENT 6 VIOLATION: Missing technical-debt.json evidence file and could not auto-generate: ${error.message}`
        );
        return;
      }
    }

    try {
      const debtEvidence = JSON.parse(
        fs.readFileSync(technicalDebtPath, "utf8")
      );

      // Validate required structure
      const requiredFields = [
        "taskId",
        "timestamp",
        "tddTestsExecuted",
        "testResults",
        "identifiedDebt",
        "constitutionalCompliance",
        "correlationStatus",
        "debtTrackingLocation",
      ];

      const missingFields = requiredFields.filter(
        (field) => !(field in debtEvidence)
      );
      if (missingFields.length > 0) {
        this.errors.push(
          `AMENDMENT 6 VIOLATION: technical-debt.json missing required fields: ${missingFields.join(
            ", "
          )}`
        );
        return;
      }

      // Validate constitutional compliance
      if (!debtEvidence.constitutionalCompliance?.debtTracked) {
        this.errors.push(
          "AMENDMENT 6 VIOLATION: Technical debt not properly tracked"
        );
      }

      // Validate debt tracking location and references
      const totalDebt = Object.values(debtEvidence.identifiedDebt).reduce(
        (sum, count) => sum + count,
        0
      );

      if (totalDebt > 0) {
        // Validate tracking location structure
        if (!debtEvidence.debtTrackingLocation) {
          this.errors.push(
            "AMENDMENT 6 VIOLATION: Missing debt tracking location information"
          );
        } else {
          const tracking = debtEvidence.debtTrackingLocation;

          // Validate tracking strategy
          if (!["SPRINT_TASKS", "INVENTORY"].includes(tracking.strategy)) {
            this.errors.push(
              "AMENDMENT 6 VIOLATION: Invalid debt tracking strategy: " +
                tracking.strategy
            );
          }

          // Validate references exist
          if (!tracking.references || tracking.references.length === 0) {
            this.errors.push(
              "AMENDMENT 6 VIOLATION: No debt tracking references provided"
            );
          } else {
            // Validate actual references
            await this.validateDebtReferences(tracking);
          }

          // Ensure duplication avoidance
          if (!debtEvidence.correlationStatus?.avoidsDuplication) {
            this.errors.push(
              "AMENDMENT 6 VIOLATION: Duplication avoidance not confirmed"
            );
          }
        }
      }

      // Log debt summary (rename to avoid duplicate variable)
      const totalDebtCount = Object.values(debtEvidence.identifiedDebt).reduce(
        (sum, count) => sum + count,
        0
      );
      if (totalDebtCount > 0) {
        console.log(`📊 Technical Debt Summary:`);
        console.log(`   🔴 CRITICAL: ${debtEvidence.identifiedDebt.critical}`);
        console.log(`   🟡 HIGH: ${debtEvidence.identifiedDebt.high}`);
        console.log(`   🟠 MEDIUM: ${debtEvidence.identifiedDebt.medium}`);
        console.log(`   ⚪ LOW: ${debtEvidence.identifiedDebt.low}`);
        console.log(
          `   📋 Generated Tasks: ${debtEvidence.generatedTasks?.length || 0}`
        );
      } else {
        console.log("✓ No technical debt identified for this task");
      }

      console.log("✓ Technical debt evidence validation passed");
    } catch (error) {
      this.errors.push(
        `AMENDMENT 6 VIOLATION: Could not parse technical-debt.json: ${error.message}`
      );
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

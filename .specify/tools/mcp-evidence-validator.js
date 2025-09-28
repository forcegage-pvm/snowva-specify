#!/usr/bin/env node

/**
 * MCP Evidence Validator - validates that MCP browser testing evidence meets requirements
 * CONSTITUTIONAL AMENDMENT 1: MANDATORY VALIDATION GATES - Gate 2 MCP Evidence
 */

const fs = require("fs");
const path = require("path");

class MCPEvidenceValidator {
  constructor(evidenceDir, taskId) {
    this.evidenceDir = evidenceDir;
    this.taskId = taskId;
    this.errors = [];
    this.warnings = [];
    this.validationResults = {};
  }

  async validateEvidence() {
    console.log(`🌐 MCP Evidence Validation for ${this.taskId}`);
    console.log("=".repeat(50));

    if (!fs.existsSync(this.evidenceDir)) {
      this.errors.push(`Evidence directory not found: ${this.evidenceDir}`);
      this.reportResults();
      return false;
    }

    await this.validateScreenshots();
    await this.validateInteractionLogs();
    await this.validateFunctionalTests();
    await this.validateUserWorkflows();
    await this.validateErrorHandling();

    this.reportResults();
    return this.errors.length === 0;
  }

  async validateScreenshots() {
    console.log("\n📸 Screenshot Evidence Validation");
    console.log("-".repeat(30));

    const screenshotsDir = path.join(this.evidenceDir, "screenshots");

    if (!fs.existsSync(screenshotsDir)) {
      this.errors.push("Screenshots directory missing");
      return;
    }

    const screenshots = fs
      .readdirSync(screenshotsDir)
      .filter(
        (f) => f.endsWith(".png") || f.endsWith(".jpg") || f.endsWith(".jpeg")
      );

    if (screenshots.length === 0) {
      this.errors.push(
        "No screenshots found - capture visual evidence of working functionality"
      );
      return;
    }

    // Validate screenshot requirements based on task type
    const requiredScreenshots = this.getRequiredScreenshots();
    const foundScreenshots = screenshots.map((s) => s.toLowerCase());

    const missingScreenshots = requiredScreenshots.filter(
      (required) =>
        !foundScreenshots.some((found) =>
          found.includes(required.toLowerCase())
        )
    );

    if (missingScreenshots.length > 0) {
      this.warnings.push(
        `Missing recommended screenshots: ${missingScreenshots.join(", ")}`
      );
    }

    // Check screenshot sizes (should be reasonable for evidence)
    let validScreenshots = 0;
    screenshots.forEach((screenshot) => {
      const screenshotPath = path.join(screenshotsDir, screenshot);
      const stats = fs.statSync(screenshotPath);

      if (stats.size < 1000) {
        // Less than 1KB probably not a real screenshot
        this.warnings.push(
          `Screenshot ${screenshot} seems too small (${stats.size} bytes)`
        );
      } else if (stats.size > 5 * 1024 * 1024) {
        // More than 5MB is probably too large
        this.warnings.push(
          `Screenshot ${screenshot} is very large (${Math.round(
            stats.size / 1024 / 1024
          )}MB)`
        );
      } else {
        validScreenshots++;
      }
    });

    console.log(
      `✓ Screenshots found: ${screenshots.length} (${validScreenshots} appear valid)`
    );
    this.validationResults.screenshots = {
      total: screenshots.length,
      valid: validScreenshots,
      missing: missingScreenshots,
    };
  }

  async validateInteractionLogs() {
    console.log("\n📝 MCP Interaction Logs Validation");
    console.log("-".repeat(30));

    const logPath = path.join(this.evidenceDir, "mcp-interaction.log");

    if (!fs.existsSync(logPath)) {
      this.errors.push(
        "MCP interaction log missing - document browser testing steps"
      );
      return;
    }

    const logContent = fs.readFileSync(logPath, "utf8");

    // Check for key interaction patterns
    const requiredInteractions = [
      "mcp_chromedevtool_take_snapshot",
      "mcp_chromedevtool_click",
      "mcp_chromedevtool_navigate_page",
    ];

    const foundInteractions = requiredInteractions.filter((interaction) =>
      logContent.includes(interaction)
    );

    if (foundInteractions.length === 0) {
      this.errors.push(
        "No MCP browser interactions found in log - ensure actual MCP testing was performed"
      );
    } else {
      console.log(
        `✓ MCP interactions documented: ${foundInteractions.length}/${requiredInteractions.length}`
      );
    }

    // Check log size and recency
    const stats = fs.statSync(logPath);
    const ageMinutes = (Date.now() - stats.mtime.getTime()) / (1000 * 60);

    if (ageMinutes > 60) {
      this.warnings.push(
        `MCP log is ${Math.round(
          ageMinutes
        )} minutes old - ensure recent testing`
      );
    }

    this.validationResults.interactionLogs = {
      exists: true,
      interactions: foundInteractions.length,
      ageMinutes: Math.round(ageMinutes),
    };
  }

  async validateFunctionalTests() {
    console.log("\n🧪 Functional Test Results Validation");
    console.log("-".repeat(30));

    const testResultsPath = path.join(
      this.evidenceDir,
      "functional-test-results.json"
    );

    if (!fs.existsSync(testResultsPath)) {
      this.errors.push(
        "Functional test results missing - document component behavior testing"
      );
      return;
    }

    try {
      const testResults = JSON.parse(fs.readFileSync(testResultsPath, "utf8"));

      // Validate test result structure
      const requiredFields = [
        "taskId",
        "timestamp",
        "tests",
        "passed",
        "summary",
      ];
      const missingFields = requiredFields.filter(
        (field) => !testResults.hasOwnProperty(field)
      );

      if (missingFields.length > 0) {
        this.errors.push(
          `Functional test results missing fields: ${missingFields.join(", ")}`
        );
        return;
      }

      if (!testResults.passed) {
        this.errors.push(
          "Functional tests failed - component must work correctly before completion"
        );
        return;
      }

      if (!testResults.tests || testResults.tests.length === 0) {
        this.errors.push(
          "No functional tests documented - test key component behaviors"
        );
        return;
      }

      console.log(
        `✓ Functional tests passed: ${testResults.tests.length} tests executed`
      );
      this.validationResults.functionalTests = {
        passed: testResults.passed,
        testCount: testResults.tests.length,
        timestamp: testResults.timestamp,
      };
    } catch (error) {
      this.errors.push(
        `Could not parse functional test results: ${error.message}`
      );
    }
  }

  async validateUserWorkflows() {
    console.log("\n👤 User Workflow Validation");
    console.log("-".repeat(30));

    const workflowPath = path.join(this.evidenceDir, "user-workflows.json");

    if (!fs.existsSync(workflowPath)) {
      this.warnings.push("User workflow testing not documented");
      return;
    }

    try {
      const workflows = JSON.parse(fs.readFileSync(workflowPath, "utf8"));

      if (!workflows.workflows || workflows.workflows.length === 0) {
        this.warnings.push("No user workflows documented");
        return;
      }

      const completedWorkflows = workflows.workflows.filter((w) => w.completed);
      console.log(
        `✓ User workflows tested: ${completedWorkflows.length}/${workflows.workflows.length}`
      );

      this.validationResults.userWorkflows = {
        total: workflows.workflows.length,
        completed: completedWorkflows.length,
      };
    } catch (error) {
      this.warnings.push(
        `Could not parse user workflow results: ${error.message}`
      );
    }
  }

  async validateErrorHandling() {
    console.log("\n⚠️  Error Handling Validation");
    console.log("-".repeat(30));

    const errorTestPath = path.join(this.evidenceDir, "error-state-tests.json");

    if (!fs.existsSync(errorTestPath)) {
      this.warnings.push(
        "Error handling not tested - test error states and edge cases"
      );
      return;
    }

    try {
      const errorTests = JSON.parse(fs.readFileSync(errorTestPath, "utf8"));

      if (
        !errorTests.errorScenarios ||
        errorTests.errorScenarios.length === 0
      ) {
        this.warnings.push("No error scenarios tested");
        return;
      }

      const testedScenarios = errorTests.errorScenarios.filter((s) => s.tested);
      console.log(
        `✓ Error scenarios tested: ${testedScenarios.length}/${errorTests.errorScenarios.length}`
      );

      this.validationResults.errorHandling = {
        total: errorTests.errorScenarios.length,
        tested: testedScenarios.length,
      };
    } catch (error) {
      this.warnings.push(
        `Could not parse error handling results: ${error.message}`
      );
    }
  }

  getRequiredScreenshots() {
    // Return required screenshots based on task type
    const taskType = this.identifyTaskType();

    const screenshotRequirements = {
      modal: ["modal-open", "modal-closed", "modal-actions"],
      list: ["list-view", "list-loading", "list-empty"],
      form: ["form-empty", "form-filled", "form-validation"],
      filter: ["filters-closed", "filters-open", "filters-applied"],
      export: ["export-dialog", "export-progress", "export-complete"],
      default: ["component-loaded", "component-interaction"],
    };

    return screenshotRequirements[taskType] || screenshotRequirements.default;
  }

  identifyTaskType() {
    const taskLower = this.taskId.toLowerCase();

    if (taskLower.includes("modal") || taskLower.includes("preview"))
      return "modal";
    if (taskLower.includes("list") || taskLower.includes("loading"))
      return "list";
    if (taskLower.includes("composer") || taskLower.includes("form"))
      return "form";
    if (taskLower.includes("filter") || taskLower.includes("search"))
      return "filter";
    if (taskLower.includes("export") || taskLower.includes("bulk"))
      return "export";

    return "default";
  }

  reportResults() {
    console.log("\n📊 MCP Evidence Validation Results:");
    console.log("=".repeat(50));

    if (this.errors.length > 0) {
      console.log("\n❌ MCP EVIDENCE VIOLATIONS:");
      this.errors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log("\n⚠️  MCP EVIDENCE WARNINGS:");
      this.warnings.forEach((warning, i) => {
        console.log(`   ${i + 1}. ${warning}`);
      });
    }

    // Summary
    console.log("\n📈 Evidence Summary:");
    Object.entries(this.validationResults).forEach(([category, data]) => {
      console.log(`   ${category}: ${JSON.stringify(data)}`);
    });

    console.log("\n" + "=".repeat(50));

    if (this.errors.length === 0) {
      console.log("✅ MCP EVIDENCE VALIDATION: PASSED");
      console.log("   Sufficient evidence of browser testing provided");
    } else {
      console.log("❌ MCP EVIDENCE VALIDATION: FAILED");
      console.log(
        "   Insufficient evidence - perform proper MCP browser testing"
      );
    }
  }
}

// CLI execution
if (require.main === module) {
  const evidenceDir = process.argv[2];
  const taskId = process.argv[3];

  if (!evidenceDir) {
    console.error(
      "Usage: node mcp-evidence-validator.js <EVIDENCE_DIR> <TASK_ID>"
    );
    console.error(
      "Example: node mcp-evidence-validator.js ./evidence/T026/ T026"
    );
    process.exit(1);
  }

  const validator = new MCPEvidenceValidator(evidenceDir, taskId);
  validator
    .validateEvidence()
    .then((passed) => {
      if (!passed) {
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("MCP evidence validation failed:", error);
      process.exit(1);
    });
}

module.exports = MCPEvidenceValidator;

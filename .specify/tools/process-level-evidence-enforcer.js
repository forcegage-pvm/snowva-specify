#!/usr/bin/env node

/**
 * Process-Level Evidence Enforcement
 * Intercepts Node.js file operations to prevent evidence fabrication at the process level
 *
 * CONSTITUTIONAL ENFORCEMENT: Technical hard stop for evidence fabrication
 */

const fs = require("fs");
const path = require("path");
const {
  EvidenceFabricationDetector,
} = require("./evidence-fabrication-detector");

class ProcessLevelEvidenceEnforcer {
  constructor() {
    this.detector = new EvidenceFabricationDetector();
    this.originalMethods = {};
    this.intercepted = false;
    this.blockedOperations = 0;

    console.log("🔧 Process-Level Evidence Enforcer initialized");
  }

  intercept() {
    if (this.intercepted) {
      console.log("⚠️  Process interception already active");
      return;
    }

    console.log("🚨 ACTIVATING: Process-level evidence fabrication prevention");

    // Store original methods
    this.originalMethods = {
      writeFileSync: fs.writeFileSync,
      writeFile: fs.writeFile,
      appendFileSync: fs.appendFileSync,
      appendFile: fs.appendFile,
    };

    // Intercept synchronous file operations
    fs.writeFileSync = this.createInterceptor(
      "writeFileSync",
      fs.writeFileSync.bind(fs)
    );
    fs.appendFileSync = this.createInterceptor(
      "appendFileSync",
      fs.appendFileSync.bind(fs)
    );

    // Intercept asynchronous file operations
    fs.writeFile = this.createAsyncInterceptor(
      "writeFile",
      fs.writeFile.bind(fs)
    );
    fs.appendFile = this.createAsyncInterceptor(
      "appendFile",
      fs.appendFile.bind(fs)
    );

    this.intercepted = true;
    console.log(
      "✅ Process-level interception ACTIVE - evidence fabrication technically blocked"
    );
  }

  createInterceptor(methodName, originalMethod) {
    return (filePath, content, options) => {
      // Check if this is an evidence file operation
      if (this.isEvidenceFile(filePath)) {
        console.log(
          `\n🔍 INTERCEPTED: ${methodName}(${path.basename(filePath)})`
        );

        const validation = this.validateEvidenceOperation(filePath, content);

        if (!validation.allowed) {
          this.blockedOperations++;

          console.log(`🚫 OPERATION BLOCKED: ${validation.reason}`);
          console.log(`📋 REQUIRED ACTION: ${validation.requiredAction}`);
          console.log(`📊 Total blocked operations: ${this.blockedOperations}`);

          // Log the blocked attempt
          this.logBlockedOperation(methodName, filePath, validation);

          throw new Error(
            `PROCESS-LEVEL BLOCK: Evidence fabrication prevented\n` +
              `Reason: ${validation.reason}\n` +
              `Required Action: ${validation.requiredAction}\n` +
              `Constitutional Violation: Amendment 4 - Anti-Fraud Enforcement`
          );
        }

        console.log(
          `✅ OPERATION APPROVED: Authentic evidence content validated`
        );
      }

      // Execute original method if validation passed or not an evidence file
      return originalMethod(filePath, content, options);
    };
  }

  createAsyncInterceptor(methodName, originalMethod) {
    return (filePath, content, options, callback) => {
      // Handle different callback positions
      if (typeof options === "function") {
        callback = options;
        options = {};
      }

      // Check if this is an evidence file operation
      if (this.isEvidenceFile(filePath)) {
        console.log(
          `\n🔍 INTERCEPTED: ${methodName}(${path.basename(filePath)}) [async]`
        );

        try {
          const validation = this.validateEvidenceOperation(filePath, content);

          if (!validation.allowed) {
            this.blockedOperations++;

            console.log(`🚫 ASYNC OPERATION BLOCKED: ${validation.reason}`);
            console.log(`📋 REQUIRED ACTION: ${validation.requiredAction}`);
            console.log(
              `📊 Total blocked operations: ${this.blockedOperations}`
            );

            // Log the blocked attempt
            this.logBlockedOperation(methodName, filePath, validation);

            const error = new Error(
              `PROCESS-LEVEL BLOCK: Evidence fabrication prevented\n` +
                `Reason: ${validation.reason}\n` +
                `Required Action: ${validation.requiredAction}`
            );

            if (callback) {
              return callback(error);
            } else {
              throw error;
            }
          }

          console.log(
            `✅ ASYNC OPERATION APPROVED: Authentic evidence content validated`
          );
        } catch (error) {
          if (callback) {
            return callback(error);
          } else {
            throw error;
          }
        }
      }

      // Execute original method if validation passed or not an evidence file
      return originalMethod(filePath, content, options, callback);
    };
  }

  validateEvidenceOperation(filePath, content) {
    console.log(`🧠 MENTAL PROTOCOL: Validating evidence operation`);
    console.log(`   File: ${path.basename(filePath)}`);
    console.log(`   Content length: ${content.length} characters`);

    // Run the three-question gate
    const sourceValidation = this.validateSource(content);
    if (!sourceValidation.valid) {
      return {
        allowed: false,
        reason: `Question 1 Failed: ${sourceValidation.reason}`,
        requiredAction: "Use actual tool outputs as content source",
      };
    }

    const toolValidation = this.validateToolExecution(filePath, content);
    if (!toolValidation.valid) {
      return {
        allowed: false,
        reason: `Question 2 Failed: ${toolValidation.reason}`,
        requiredAction: "Execute required tools before creating evidence files",
      };
    }

    const authenticityValidation = this.validateAuthenticity(content);
    if (!authenticityValidation.valid) {
      return {
        allowed: false,
        reason: `Question 3 Failed: ${authenticityValidation.reason}`,
        requiredAction:
          "Remove all invented/fabricated content - use authentic outputs only",
      };
    }

    return {
      allowed: true,
      reason: "All mental protocol validations passed",
    };
  }

  validateSource(content) {
    // Question 1: "Is this content from actual tool output?"

    const invalidSourcePatterns = [
      /Based on.*concept/i,
      /Since.*we.*know/i,
      /This.*represents/i,
      /Expected.*behavior/i,
      /Purpose:.*test/i,
      /Analysis:.*confirms/i,
    ];

    const hasInvalidSource = invalidSourcePatterns.some((pattern) =>
      pattern.test(content)
    );

    if (hasInvalidSource) {
      return {
        valid: false,
        reason:
          "Content appears to be AI-written rather than captured from tool outputs",
      };
    }

    // Check for valid source indicators
    const validSourceIndicators = [
      '"tool_call_id"',
      '"function_name"',
      '"result"',
      "> npm",
      "$ git",
      "Command exited with code",
      "Test Suites:",
      "FAIL",
      "PASS",
    ];

    if (content.length > 200) {
      const hasValidSource = validSourceIndicators.some((indicator) =>
        content.includes(indicator)
      );

      if (
        !hasValidSource &&
        (content.includes("mcp-") || content.includes("test-results"))
      ) {
        return {
          valid: false,
          reason: "Evidence file lacks authentic tool output markers",
        };
      }
    }

    return { valid: true };
  }

  validateToolExecution(filePath, content) {
    // Question 2: "Have I executed the required tool?"

    // For MCP files, check for MCP command evidence
    if (filePath.includes("mcp-") && filePath.endsWith(".json")) {
      const mcpCommands = [
        "mcp_chrome-devtoo_take_screenshot",
        "mcp_chrome-devtoo_take_snapshot",
        "mcp_chrome-devtoo_navigate_page",
        "mcp_chrome-devtoo_evaluate_script",
      ];

      const hasToolEvidence = mcpCommands.some((cmd) => content.includes(cmd));

      if (!hasToolEvidence) {
        return {
          valid: false,
          reason:
            "MCP evidence file lacks evidence of actual MCP tool execution",
        };
      }
    }

    // For test results, check for actual test output
    if (filePath.includes("test-results") || content.includes("Test Suites:")) {
      const testOutputMarkers = [
        "Test Suites:",
        "Tests:",
        "Time:",
        "Command exited with code",
      ];

      const hasTestOutput = testOutputMarkers.some((marker) =>
        content.includes(marker)
      );

      if (!hasTestOutput) {
        return {
          valid: false,
          reason: "Test results file lacks authentic test execution output",
        };
      }
    }

    return { valid: true };
  }

  validateAuthenticity(content) {
    // Question 3: "Am I inventing ANY part of this content?"

    const result = this.detector.validateEvidenceFile("temp.json", content);

    if (!result.isValid) {
      return {
        valid: false,
        reason: `Fabrication patterns detected: ${result.violations
          .map((v) => v.message)
          .join(", ")}`,
      };
    }

    // Check for common invention phrases
    const inventionPatterns = [
      /I.*created.*based.*on/i,
      /This.*simulates/i,
      /Generated.*to.*match/i,
      /Placeholder.*for/i,
      /Will.*be.*implemented/i,
    ];

    const hasInventions = inventionPatterns.some((pattern) =>
      pattern.test(content)
    );

    if (hasInventions) {
      return {
        valid: false,
        reason: "Content contains invention/simulation markers",
      };
    }

    return { valid: true };
  }

  isEvidenceFile(filePath) {
    return filePath.includes("/evidence/") || filePath.includes("\\evidence\\");
  }

  logBlockedOperation(operation, filePath, validation) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      operation,
      filePath,
      reason: validation.reason,
      requiredAction: validation.requiredAction,
      constitutionalViolation: "AMENDMENT_4_ANTI_FRAUD",
      processLevel: true,
    };

    try {
      const logDir = path.join(process.cwd(), ".specify", "logs");
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const logFile = path.join(logDir, "process-level-blocks.json");

      let logData = [];
      if (fs.existsSync(logFile)) {
        logData = JSON.parse(fs.readFileSync(logFile, "utf8"));
      }

      logData.push(logEntry);

      // Keep only last 50 entries
      if (logData.length > 50) {
        logData = logData.slice(-50);
      }

      fs.writeFileSync(logFile, JSON.stringify(logData, null, 2));
    } catch (error) {
      console.error(`⚠️  Could not log blocked operation: ${error.message}`);
    }
  }

  restore() {
    if (!this.intercepted) {
      console.log("⚠️  Process interception not active");
      return;
    }

    console.log("🔄 Restoring original file system methods...");

    // Restore original methods
    fs.writeFileSync = this.originalMethods.writeFileSync;
    fs.writeFile = this.originalMethods.writeFile;
    fs.appendFileSync = this.originalMethods.appendFileSync;
    fs.appendFile = this.originalMethods.appendFile;

    this.intercepted = false;

    console.log(
      `✅ Process interception restored - ${this.blockedOperations} operations were blocked`
    );
  }

  getStatus() {
    return {
      intercepted: this.intercepted,
      blockedOperations: this.blockedOperations,
      methods: Object.keys(this.originalMethods),
    };
  }
}

// Singleton instance
let globalEnforcer = null;

function activateProcessEnforcement() {
  if (!globalEnforcer) {
    globalEnforcer = new ProcessLevelEvidenceEnforcer();
  }
  globalEnforcer.intercept();
  return globalEnforcer;
}

function deactivateProcessEnforcement() {
  if (globalEnforcer) {
    globalEnforcer.restore();
  }
}

function getProcessEnforcementStatus() {
  return globalEnforcer ? globalEnforcer.getStatus() : { intercepted: false };
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || "start";

  switch (command) {
    case "start":
      const enforcer = activateProcessEnforcement();

      console.log("\n⌨️  Press Ctrl+C to stop process enforcement\n");

      process.on("SIGINT", () => {
        console.log("\n🛑 Received interrupt signal");
        deactivateProcessEnforcement();
        process.exit(0);
      });

      // Keep alive
      setInterval(() => {}, 1000);
      break;

    case "status":
      const status = getProcessEnforcementStatus();
      console.log("Process-Level Evidence Enforcement Status:");
      console.log(JSON.stringify(status, null, 2));
      break;

    case "test":
      // Test the enforcement
      console.log("🧪 Testing process-level enforcement...");

      const testEnforcer = activateProcessEnforcement();

      try {
        fs.writeFileSync(
          "./evidence/test-fabrication.json",
          JSON.stringify(
            {
              command: "mcp_chrome-devtoo_take_screenshot",
              response: "This is fabricated content for testing",
            },
            null,
            2
          )
        );

        console.log("❌ TEST FAILED: Fabrication was not blocked");
      } catch (error) {
        console.log("✅ TEST PASSED: Fabrication was successfully blocked");
        console.log(`   Error: ${error.message}`);
      }

      deactivateProcessEnforcement();
      break;

    default:
      console.log(`
Process-Level Evidence Enforcement - Technical Hard Stop

Usage:
  node process-level-evidence-enforcer.js start     Activate enforcement
  node process-level-evidence-enforcer.js status    Check status
  node process-level-evidence-enforcer.js test      Test enforcement

The enforcer will:
- Intercept ALL file operations in Node.js process
- Block evidence file creation with fabricated content
- Run three-question mental protocol validation
- Prevent constitutional violations at process level

CONSTITUTIONAL ENFORCEMENT: Technical hard stop for Amendment 4 violations
      `);
  }
}

module.exports = {
  ProcessLevelEvidenceEnforcer,
  activateProcessEnforcement,
  deactivateProcessEnforcement,
  getProcessEnforcementStatus,
};

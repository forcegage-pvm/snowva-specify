/**
 * Pre-Action Evidence Enforcement System
 * Intercepts ALL file creation in evidence directories
 * Forces mental protocol compliance before any evidence file creation
 */

const fs = require("fs");
const path = require("path");
const {
  EvidenceFabricationDetector,
} = require("./evidence-fabrication-detector");

class PreActionEvidenceEnforcer {
  constructor() {
    this.detector = new EvidenceFabricationDetector();
    this.blockedActions = 0;
    this.allowedActions = 0;
  }

  /**
   * MANDATORY pre-action check for ALL file operations in evidence directories
   * This enforces the mental protocol at the system level
   */
  enforcePreActionProtocol(operation, filePath, content = "") {
    console.log(`\n🧠 PRE-ACTION ENFORCEMENT: ${operation.toUpperCase()}`);
    console.log(`📁 Target: ${path.basename(filePath)}`);

    // Check if this is an evidence file
    if (!this.isEvidenceFile(filePath)) {
      console.log(`✅ Non-evidence file - enforcement skipped`);
      return { allowed: true, reason: "Not an evidence file" };
    }

    console.log(
      `🚨 EVIDENCE FILE DETECTED - Mental Protocol Enforcement Active`
    );

    // MANDATORY COGNITIVE INTERRUPTION
    return this.runMentalProtocolGate(operation, filePath, content);
  }

  runMentalProtocolGate(operation, filePath, content) {
    console.log(`\n🧠 COGNITIVE INTERRUPT: Evidence Creation Detected`);
    console.log(`├── Trigger: Evidence file ${operation}`);
    console.log(`├── File: ${path.basename(filePath)}`);
    console.log(`├── Protocol: Running Three-Question Gate...`);

    // Question 1: Source Verification
    const sourceCheck = this.validateSourceQuestion(content, filePath);
    console.log(`├── Question 1 (Source): ${sourceCheck.status}`);

    if (!sourceCheck.valid) {
      console.log(`└── 🚫 BLOCKED: ${sourceCheck.reason}`);
      this.blockedActions++;
      return {
        allowed: false,
        reason: sourceCheck.reason,
        mentalProtocolViolation: true,
        requiredAction: sourceCheck.requiredAction,
      };
    }

    // Question 2: Tool Execution Verification
    const toolCheck = this.validateToolQuestion(filePath, content);
    console.log(`├── Question 2 (Tool): ${toolCheck.status}`);

    if (!toolCheck.valid) {
      console.log(`└── 🚫 BLOCKED: ${toolCheck.reason}`);
      this.blockedActions++;
      return {
        allowed: false,
        reason: toolCheck.reason,
        mentalProtocolViolation: true,
        requiredAction: toolCheck.requiredAction,
      };
    }

    // Question 3: Authenticity Verification
    const authenticityCheck = this.validateAuthenticityQuestion(content);
    console.log(`├── Question 3 (Authenticity): ${authenticityCheck.status}`);

    if (!authenticityCheck.valid) {
      console.log(`└── 🚫 BLOCKED: ${authenticityCheck.reason}`);
      this.blockedActions++;
      return {
        allowed: false,
        reason: authenticityCheck.reason,
        mentalProtocolViolation: true,
        requiredAction: authenticityCheck.requiredAction,
      };
    }

    console.log(`└── ✅ APPROVED: Mental protocol compliance verified`);
    this.allowedActions++;
    return { allowed: true, reason: "Mental protocol compliance verified" };
  }

  validateSourceQuestion(content, filePath) {
    // Check for invalid source patterns
    const invalidSources = [
      /Purpose:.*test/i,
      /Expected.*Result/i,
      /This.*evidence.*validates/i,
      /Constitutional.*requirement/i,
      /Analysis:.*confirms/i,
    ];

    const hasInvalidSource = invalidSources.some((pattern) =>
      pattern.test(content)
    );

    if (hasInvalidSource) {
      return {
        valid: false,
        status: "❌ INVALID SOURCE",
        reason:
          "Content appears to be written by AI rather than captured from tools",
        requiredAction:
          "Use actual tools to generate this evidence, don't write it manually",
      };
    }

    // Check for valid source markers
    const validSources = [
      '"tool_call_id"',
      '"function_name"',
      '"result"',
      // Terminal output markers
      "> npm",
      "$ git",
      "Command exited with code",
    ];

    const hasValidSource = validSources.some((marker) =>
      content.includes(marker)
    );

    if (content.length > 100 && !hasValidSource && filePath.includes("mcp-")) {
      return {
        valid: false,
        status: "❌ MISSING SOURCE MARKERS",
        reason: "MCP evidence lacks authentic tool output markers",
        requiredAction:
          "Run actual MCP tools and save their raw JSON responses",
      };
    }

    return {
      valid: true,
      status: "✅ VALID SOURCE",
      reason: "Content appears to be from legitimate tool output",
    };
  }

  validateToolQuestion(filePath, content) {
    // For MCP files, require tool execution evidence
    if (filePath.includes("mcp-") && filePath.endsWith(".json")) {
      const mcpCommands = [
        "mcp_chrome-devtoo_take_screenshot",
        "mcp_chrome-devtoo_take_snapshot",
        "mcp_chrome-devtoo_navigate_page",
      ];

      const hasToolEvidence = mcpCommands.some((cmd) => content.includes(cmd));

      if (!hasToolEvidence) {
        return {
          valid: false,
          status: "❌ NO TOOL EXECUTION",
          reason: "MCP evidence file lacks evidence of actual tool execution",
          requiredAction:
            "Execute actual MCP browser tools first, then save their outputs",
        };
      }
    }

    // Check for placeholder content
    const placeholderPatterns = [
      /console\.log.*placeholder/i,
      /TODO.*implement/i,
      /This.*will.*be.*implemented/i,
      /Expected.*when.*implemented/i,
    ];

    const hasPlaceholders = placeholderPatterns.some((pattern) =>
      pattern.test(content)
    );

    if (hasPlaceholders) {
      return {
        valid: false,
        status: "❌ PLACEHOLDER CONTENT",
        reason: "Content contains placeholder/unimplemented sections",
        requiredAction:
          "Complete actual implementation or tool execution before creating evidence",
      };
    }

    return {
      valid: true,
      status: "✅ TOOL EXECUTION VERIFIED",
      reason: "Evidence appears to be from actual tool execution",
    };
  }

  validateAuthenticityQuestion(content) {
    // Run fabrication detection
    const fabricationResult = this.detector.validateEvidenceFile(
      "temp.json",
      content
    );

    if (!fabricationResult.isValid) {
      return {
        valid: false,
        status: "❌ FABRICATION DETECTED",
        reason: "Content contains fabricated patterns",
        requiredAction: "Replace with authentic tool outputs only",
      };
    }

    // Check for invention markers
    const inventionPatterns = [
      /I.*created.*based.*on/i,
      /This.*represents.*what.*would/i,
      /Simulated.*response.*for/i,
      /Generated.*to.*match/i,
    ];

    const hasInventions = inventionPatterns.some((pattern) =>
      pattern.test(content)
    );

    if (hasInventions) {
      return {
        valid: false,
        status: "❌ INVENTED CONTENT",
        reason: "Content contains invented/simulated information",
        requiredAction: "Use only authentic tool outputs, no invented content",
      };
    }

    return {
      valid: true,
      status: "✅ AUTHENTIC CONTENT",
      reason: "Content appears to be authentic tool output",
    };
  }

  isEvidenceFile(filePath) {
    return filePath.includes("/evidence/") || filePath.includes("\\evidence\\");
  }

  // Integration hooks for common file operations
  static interceptCreateFile(filePath, content) {
    const enforcer = new PreActionEvidenceEnforcer();
    const result = enforcer.enforcePreActionProtocol(
      "CREATE_FILE",
      filePath,
      content
    );

    if (!result.allowed) {
      throw new Error(
        `🚫 MENTAL PROTOCOL VIOLATION: ${result.reason}\n` +
          `📋 REQUIRED ACTION: ${result.requiredAction}\n` +
          `⚖️  CONSTITUTIONAL ENFORCEMENT: File creation blocked to prevent evidence fabrication`
      );
    }

    return result;
  }

  static interceptReplaceStringInFile(filePath, newContent) {
    const enforcer = new PreActionEvidenceEnforcer();
    const result = enforcer.enforcePreActionProtocol(
      "EDIT_FILE",
      filePath,
      newContent
    );

    if (!result.allowed) {
      throw new Error(
        `🚫 MENTAL PROTOCOL VIOLATION: ${result.reason}\n` +
          `📋 REQUIRED ACTION: ${result.requiredAction}\n` +
          `⚖️  CONSTITUTIONAL ENFORCEMENT: File edit blocked to prevent evidence fabrication`
      );
    }

    return result;
  }

  generateComplianceReport() {
    const total = this.blockedActions + this.allowedActions;
    const complianceRate =
      total > 0 ? (this.allowedActions / total) * 100 : 100;

    return {
      totalActions: total,
      blockedActions: this.blockedActions,
      allowedActions: this.allowedActions,
      complianceRate: complianceRate.toFixed(1),
      status:
        complianceRate === 100 ? "FULL_COMPLIANCE" : "VIOLATIONS_DETECTED",
    };
  }
}

module.exports = { PreActionEvidenceEnforcer };

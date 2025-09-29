#!/usr/bin/env node

/**
 * Evidence Fabrication Detection Tool
 * Constitutional Amendment 4 Enforcement
 *
 * Prevents AI agents from creating fake evidence files
 * Validates that evidence files are actual tool outputs, not fabricated content
 */

const fs = require("fs");
const path = require("path");

class EvidenceFabricationDetector {
  constructor() {
    this.fabricationPatterns = [
      // Fake MCP response patterns
      /"command":\s*"mcp_chrome-devtoo_/,
      /"timestamp":\s*"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z"/,
      /"response":\s*\{[^}]*"status":\s*"TDD/,
      /"analysis":\s*".*confirms.*"/,

      // Fake evidence markers
      /Expected.*behavior.*confirms/i,
      /Visual evidence shows.*expected/i,
      /Screenshot confirms.*validating/i,
      /MCP snapshot confirms.*endpoint/i,

      // Fabricated structure patterns
      /"testType":\s*"TDD_RED_PHASE_API_VALIDATION"/,
      /"objective":\s*"Validate.*non-existence"/,
      /"actualBehavior":\s*"API endpoint correctly"/,

      // AI-generated content markers
      /This evidence validates the starting state/i,
      /Constitutional Compliance.*Evidence shows/i,
      /Implementation Phase.*will be implemented/i,
    ];

    this.validMCPMarkers = [
      // Real MCP tool outputs contain these
      '"tool_call_id"',
      '"function_name"',
      '"result"',
      '"error"',
      // Real browser responses
      '"page_content"',
      '"elements"',
      '"screenshot_data"',
    ];
  }

  validateEvidenceFile(filePath, content) {
    const result = {
      isValid: true,
      violations: [],
      warnings: [],
      recommendation: null,
    };

    // Check if this is an evidence file
    if (!this.isEvidenceFile(filePath)) {
      return result; // Not an evidence file, skip validation
    }

    console.log(`🔍 EVIDENCE VALIDATION: ${path.basename(filePath)}`);

    // Check for fabrication patterns
    this.fabricationPatterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        result.isValid = false;
        result.violations.push({
          type: "FABRICATION_DETECTED",
          pattern: pattern.toString(),
          message: `Fabricated content pattern detected (Pattern ${index + 1})`,
        });
      }
    });

    // Check for valid MCP markers
    const hasMCPMarkers = this.validMCPMarkers.some((marker) =>
      content.includes(marker)
    );

    if (filePath.includes("mcp-") && !hasMCPMarkers) {
      result.violations.push({
        type: "MISSING_MCP_MARKERS",
        message: "MCP evidence file lacks authentic tool output markers",
      });
      result.isValid = false;
    }

    // Check file creation patterns
    if (this.detectAIGeneration(content)) {
      result.violations.push({
        type: "AI_GENERATED_CONTENT",
        message: "Content appears to be AI-generated rather than tool output",
      });
      result.isValid = false;
    }

    // Generate recommendations
    if (!result.isValid) {
      result.recommendation = this.generateRecommendation(
        filePath,
        result.violations
      );
    }

    return result;
  }

  isEvidenceFile(filePath) {
    return filePath.includes("/evidence/") || filePath.includes("\\evidence\\");
  }

  detectAIGeneration(content) {
    const aiPatterns = [
      /Purpose:.*test.*endpoint/i,
      /Expected.*Result.*should.*not/i,
      /Analysis:.*validates.*phase/i,
      /Note:.*evidence.*validates/i,
      /This.*confirms.*correctly/i,
    ];

    return aiPatterns.some((pattern) => pattern.test(content));
  }

  generateRecommendation(filePath, violations) {
    const recommendations = [];

    if (violations.some((v) => v.type === "FABRICATION_DETECTED")) {
      recommendations.push(
        "🚨 DELETE this file immediately - it contains fabricated evidence"
      );
      recommendations.push(
        "✅ Use actual MCP tools: mcp_chrome-devtoo_take_snapshot(), mcp_chrome-devtoo_take_screenshot()"
      );
      recommendations.push(
        "✅ Copy UNMODIFIED JSON responses from tool outputs"
      );
    }

    if (violations.some((v) => v.type === "MISSING_MCP_MARKERS")) {
      recommendations.push(
        "🔧 Run actual MCP browser tools to generate real evidence"
      );
      recommendations.push("🔧 Save raw tool JSON responses without editing");
    }

    if (violations.some((v) => v.type === "AI_GENERATED_CONTENT")) {
      recommendations.push(
        "⚠️  Replace AI-generated content with actual tool outputs"
      );
      recommendations.push(
        "⚠️  Analysis goes in separate files, not in raw evidence"
      );
    }

    return recommendations;
  }

  validateAllEvidenceFiles(rootDir) {
    const evidenceDir = path.join(rootDir, "evidence");

    if (!fs.existsSync(evidenceDir)) {
      console.log("ℹ️  No evidence directory found");
      return { allValid: true, results: [] };
    }

    const results = [];
    const evidenceFiles = this.findEvidenceFiles(evidenceDir);

    console.log(
      `🔍 Scanning ${evidenceFiles.length} evidence files for fabrication...`
    );

    evidenceFiles.forEach((filePath) => {
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const result = this.validateEvidenceFile(filePath, content);

        if (!result.isValid) {
          results.push({
            filePath,
            ...result,
          });
        }
      } catch (error) {
        console.error(`❌ Error validating ${filePath}:`, error.message);
      }
    });

    return {
      allValid: results.length === 0,
      results,
      totalFiles: evidenceFiles.length,
      violationCount: results.length,
    };
  }

  findEvidenceFiles(dir) {
    const files = [];

    const scanDir = (currentDir) => {
      const items = fs.readdirSync(currentDir);

      items.forEach((item) => {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (this.isEvidenceFile(fullPath)) {
          files.push(fullPath);
        }
      });
    };

    scanDir(dir);
    return files;
  }

  // Pre-file-creation validation hook
  static validateBeforeCreation(filePath, content) {
    const detector = new EvidenceFabricationDetector();

    if (!detector.isEvidenceFile(filePath)) {
      return { allowed: true };
    }

    console.log(`\n🧠 COGNITIVE CHECK: Evidence Creation Validation`);
    console.log(`📁 File: ${path.basename(filePath)}`);
    console.log(`❓ Is this content from actual tool output? (Checking...)`);

    const result = detector.validateEvidenceFile(filePath, content);

    if (!result.isValid) {
      console.log(`\n🚨 CONSTITUTIONAL VIOLATION DETECTED!`);
      console.log(`❌ Evidence fabrication prevented`);

      result.violations.forEach((violation) => {
        console.log(`   • ${violation.message}`);
      });

      console.log(`\n💡 REQUIRED ACTIONS:`);
      result.recommendation?.forEach((rec) => {
        console.log(`   ${rec}`);
      });

      return {
        allowed: false,
        reason: "Evidence fabrication detected",
        violations: result.violations,
      };
    }

    console.log(`✅ Evidence validation passed`);
    return { allowed: true };
  }
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const detector = new EvidenceFabricationDetector();

  if (command === "validate-all") {
    const rootDir = args[1] || process.cwd();
    const results = detector.validateAllEvidenceFiles(rootDir);

    console.log(`\n📊 EVIDENCE FABRICATION SCAN RESULTS:`);
    console.log(`Files scanned: ${results.totalFiles}`);
    console.log(`Violations found: ${results.violationCount}`);

    if (!results.allValid) {
      console.log(`\n🚨 CONSTITUTIONAL VIOLATIONS DETECTED:`);
      results.results.forEach((result, index) => {
        console.log(`\n${index + 1}. ${path.basename(result.filePath)}`);
        result.violations.forEach((violation) => {
          console.log(`   ❌ ${violation.message}`);
        });
        console.log(`   💡 Recommendations:`);
        result.recommendation?.forEach((rec) => {
          console.log(`     ${rec}`);
        });
      });
      process.exit(1);
    } else {
      console.log(`✅ All evidence files are authentic`);
    }
  } else if (command === "validate-file") {
    const filePath = args[1];
    if (!filePath || !fs.existsSync(filePath)) {
      console.error("❌ Please provide a valid file path");
      process.exit(1);
    }

    const content = fs.readFileSync(filePath, "utf8");
    const result = detector.validateEvidenceFile(filePath, content);

    if (result.isValid) {
      console.log(`✅ ${path.basename(filePath)} - Authentic evidence`);
    } else {
      console.log(`❌ ${path.basename(filePath)} - Fabrication detected`);
      result.violations.forEach((violation) => {
        console.log(`   • ${violation.message}`);
      });
    }
  } else {
    console.log(`
Evidence Fabrication Detector - Constitutional Amendment 4 Enforcement

Usage:
  node evidence-fabrication-detector.js validate-all [root-dir]
  node evidence-fabrication-detector.js validate-file <file-path>

Commands:
  validate-all    Scan all evidence files for fabrication
  validate-file   Validate a specific evidence file
    `);
  }
}

module.exports = { EvidenceFabricationDetector };

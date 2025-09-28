#!/usr/bin/env node

/**
 * Constitutional Checker - Validates component status reports against constitutional requirements
 *
 * Usage: node .specify/tools/constitutional-checker.js [status-file.md]
 *
 * Constitutional Requirements:
 * - Component status MUST use LEVEL 0-5 completion framework
 * - Claims MUST be supported by demonstrable evidence
 * - Status reports MUST include specific examples and file locations
 * - No functionality misrepresentation allowed
 */

const fs = require("fs");
const path = require("path");

class ConstitutionalChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.validationRules = [
      this.validateCompletionLevel.bind(this),
      this.validateEvidenceProvision.bind(this),
      this.validateSpecificExamples.bind(this),
      this.validateFileLocations.bind(this),
      this.validateNoMisrepresentation.bind(this),
      this.validateConstitutionalCompliance.bind(this),
    ];
  }

  validate(filePath) {
    console.log(`🔍 Constitutional Checker v1.1 - Validating: ${filePath}`);
    console.log("📋 Checking constitutional compliance...\n");

    if (!fs.existsSync(filePath)) {
      this.errors.push(`File not found: ${filePath}`);
      return this.generateReport();
    }

    const content = fs.readFileSync(filePath, "utf8");

    // Run all validation rules
    this.validationRules.forEach((rule) => rule(content, filePath));

    return this.generateReport();
  }

  validateCompletionLevel(content, filePath) {
    const levelPattern =
      /(?:🔴|🟡|🟠|🔵|🟢|✅)?\s*LEVEL\s*([0-5])\s*-\s*(STUB|COSMETIC|INTERACTIVE|INTEGRATED|FUNCTIONAL|PRODUCTION)/gi;
    const matches = content.match(levelPattern);

    if (!matches || matches.length === 0) {
      this.errors.push(
        "❌ MISSING COMPLETION LEVEL: No LEVEL 0-5 completion framework found"
      );
      return;
    }

    // Validate level consistency
    matches.forEach((match) => {
      const levelNum = match.match(/LEVEL\s*([0-5])/i)?.[1];
      const levelName = match
        .match(/LEVEL\s*[0-5]\s*-\s*(\w+)/i)?.[1]
        ?.toUpperCase();

      const expectedLevels = {
        0: "STUB",
        1: "COSMETIC",
        2: "INTERACTIVE",
        3: "INTEGRATED",
        4: "FUNCTIONAL",
        5: "PRODUCTION",
      };

      if (expectedLevels[levelNum] !== levelName) {
        this.errors.push(
          `❌ LEVEL INCONSISTENCY: LEVEL ${levelNum} should be ${expectedLevels[levelNum]}, found ${levelName}`
        );
      }
    });

    console.log("✅ Completion level framework present");
  }

  validateEvidenceProvision(content, filePath) {
    const evidenceKeywords = [
      "evidence",
      "proof",
      "demonstrated",
      "working",
      "tested",
      "validated",
      "confirmed",
      "verified",
      "console.log",
      "placeholder",
    ];

    const hasEvidence = evidenceKeywords.some((keyword) =>
      content.toLowerCase().includes(keyword.toLowerCase())
    );

    if (!hasEvidence) {
      this.errors.push(
        "❌ MISSING EVIDENCE: No demonstrable evidence provided for claims"
      );
    } else {
      console.log("✅ Evidence provision detected");
    }
  }

  validateSpecificExamples(content, filePath) {
    // Check for specific code examples or file references
    const codeBlockPattern = /```[\s\S]*?```/g;
    const filePathPattern = /`[^`]*\.(tsx?|jsx?|ts|js|md)`/g;
    const lineNumberPattern = /line[s]?\s*\d+/gi;

    const hasCodeBlocks = codeBlockPattern.test(content);
    const hasFilePaths = filePathPattern.test(content);
    const hasLineNumbers = lineNumberPattern.test(content);

    if (!hasCodeBlocks && !hasFilePaths) {
      this.warnings.push(
        "⚠️  WEAK EVIDENCE: Consider adding code examples or file references"
      );
    } else {
      console.log("✅ Specific examples provided");
    }

    if (hasLineNumbers) {
      console.log("✅ Line number references found (excellent specificity)");
    }
  }

  validateFileLocations(content, filePath) {
    const locationPattern = /(?:Location|File|Path):\s*`?([^`\n]+)`?/gi;
    const matches = content.match(locationPattern);

    if (!matches) {
      this.warnings.push(
        "⚠️  MISSING LOCATIONS: Consider adding specific file locations for issues"
      );
    } else {
      console.log("✅ File locations specified");
    }
  }

  validateNoMisrepresentation(content, filePath) {
    // Check for dangerous phrases that might indicate misrepresentation
    const dangerousPhrases = [
      "fully working",
      "completely functional",
      "production ready",
      "all features working",
      "comprehensive implementation",
    ];

    const suspiciousPhrases = [
      "console.log",
      "placeholder",
      "commented out",
      "not implemented",
      "missing",
      "TODO",
      "FIXME",
    ];

    let hasDangerous = false;
    let hasSuspicious = false;

    dangerousPhrases.forEach((phrase) => {
      if (content.toLowerCase().includes(phrase.toLowerCase())) {
        hasDangerous = true;
      }
    });

    suspiciousPhrases.forEach((phrase) => {
      if (content.toLowerCase().includes(phrase.toLowerCase())) {
        hasSuspicious = true;
      }
    });

    if (hasDangerous && hasSuspicious) {
      this.warnings.push(
        "⚠️  POTENTIAL MISREPRESENTATION: Claims of functionality alongside mentions of placeholders/missing features"
      );
    }

    if (hasSuspicious) {
      console.log("✅ Honest reporting of limitations detected");
    }
  }

  validateConstitutionalCompliance(content, filePath) {
    const constitutionalKeywords = [
      "constitutional",
      "compliance",
      "evidence-based",
      "demonstrable",
    ];

    const hasConstitutionalReference = constitutionalKeywords.some((keyword) =>
      content.toLowerCase().includes(keyword.toLowerCase())
    );

    if (hasConstitutionalReference) {
      console.log("✅ Constitutional compliance referenced");
    }

    // Check for standard sections
    const requiredSections = ["status", "functional", "evidence", "next"];
    const missingSections = requiredSections.filter(
      (section) => !new RegExp(`##?\\s*${section}`, "gi").test(content)
    );

    if (missingSections.length > 0) {
      this.warnings.push(
        `⚠️  MISSING SECTIONS: Consider adding: ${missingSections.join(", ")}`
      );
    }
  }

  generateReport() {
    console.log("\n📊 CONSTITUTIONAL VALIDATION REPORT");
    console.log("=".repeat(50));

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log("🟢 CONSTITUTIONAL COMPLIANCE: PASSED");
      console.log("✅ All constitutional requirements met");
      console.log("📋 Status report is ready for use");
      return { success: true, errors: [], warnings: [] };
    }

    if (this.errors.length > 0) {
      console.log("🔴 CONSTITUTIONAL COMPLIANCE: FAILED");
      console.log("\n❌ ERRORS (Must Fix):");
      this.errors.forEach((error) => console.log(`   ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log("\n⚠️  WARNINGS (Should Consider):");
      this.warnings.forEach((warning) => console.log(`   ${warning}`));
    }

    if (this.errors.length > 0) {
      console.log(
        "\n🚫 REMEDIATION REQUIRED: Fix all errors before proceeding"
      );
      return { success: false, errors: this.errors, warnings: this.warnings };
    } else {
      console.log("\n🟡 CONDITIONAL PASS: Address warnings to improve quality");
      return { success: true, errors: [], warnings: this.warnings };
    }
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(
      "Usage: node .specify/tools/constitutional-checker.js [status-file.md]"
    );
    console.log("");
    console.log(
      "Constitutional Checker v1.1 - Validates component status reports"
    );
    console.log("Ensures compliance with LEVEL 0-5 completion framework");
    process.exit(1);
  }

  const filePath = args[0];
  const checker = new ConstitutionalChecker();
  const result = checker.validate(filePath);

  process.exit(result.success ? 0 : 1);
}

module.exports = ConstitutionalChecker;

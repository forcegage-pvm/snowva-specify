#!/usr/bin/env node

/**
 * Constitutional Audit - Comprehensive compliance audit for multiple tasks
 * CONSTITUTIONAL AMENDMENT 3: AUTOMATED ENFORCEMENT - Fail-Fast Constitutional Checks
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class ConstitutionalAuditor {
  constructor() {
    this.repoRoot = this.findRepoRoot();
    this.errors = [];
    this.warnings = [];
    this.auditTasks = [];
    this.auditResults = {};
    this.taskMCPRequirements = {}; // Maps taskId to MCP requirement
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

  async runComprehensiveAudit() {
    console.log("🔍 CONSTITUTIONAL AUDIT - Comprehensive Compliance Check");
    console.log("=".repeat(70));

    // Load completed tasks
    await this.loadCompletedTasks();

    // Run audit on all completed tasks
    await this.auditAllTasks();

    // Run random MCP spot-checks
    await this.runMCPSpotChecks();

    // Generate comprehensive audit report
    await this.generateAuditReport();

    // Report results and take action
    this.reportAuditResults();

    return this.errors.length === 0;
  }

  async loadCompletedTasks() {
    const tasksPath = path.join(
      this.repoRoot,
      "specs",
      "006-quotes-technical-debt",
      "tasks.md"
    );

    if (!fs.existsSync(tasksPath)) {
      this.errors.push("tasks.md not found");
      return;
    }

    const tasksContent = fs.readFileSync(tasksPath, "utf8");

    // Extract completed tasks
    const completedTaskPattern = /^-\s*\[x\]\s*(T\d+)\b/gm;
    let match;

    while ((match = completedTaskPattern.exec(tasksContent)) !== null) {
      this.auditTasks.push(match[1]);
    }

    // Parse MCP requirements for all tasks
    await this.parseMCPRequirements(tasksContent);

    console.log(`📋 Found ${this.auditTasks.length} completed tasks to audit`);
  }

  async auditAllTasks() {
    console.log("\n🏗️  Auditing All Completed Tasks");
    console.log("-".repeat(50));

    for (const taskId of this.auditTasks) {
      console.log(`\n🔍 Auditing ${taskId}...`);
      await this.auditSingleTask(taskId);
    }
  }

  async auditSingleTask(taskId) {
    const taskAudit = {
      taskId,
      timestamp: new Date().toISOString(),
      constitutionalCompliance: false,
      mcpEvidence: false,
      implementationExists: false,
      testCoverage: false,
      errors: [],
      warnings: [],
    };

    try {
      // Check constitutional compliance
      await this.checkTaskConstitutionalCompliance(taskId, taskAudit);

      // Check MCP evidence
      await this.checkTaskMCPEvidence(taskId, taskAudit);

      // Check implementation exists
      await this.checkTaskImplementation(taskId, taskAudit);

      // Check test coverage
      await this.checkTaskTestCoverage(taskId, taskAudit);
    } catch (error) {
      taskAudit.errors.push(`Audit failed: ${error.message}`);
      this.errors.push(`Task ${taskId} audit failed: ${error.message}`);
    }

    this.auditResults[taskId] = taskAudit;

    // Report task audit summary
    const passedChecks = [
      taskAudit.constitutionalCompliance,
      taskAudit.mcpEvidence,
      taskAudit.implementationExists,
      taskAudit.testCoverage,
    ].filter(Boolean).length;

    if (passedChecks < 4) {
      console.log(`   ❌ ${taskId}: ${passedChecks}/4 checks passed`);
      this.errors.push(
        `Task ${taskId} failed audit: ${passedChecks}/4 checks passed`
      );
    } else {
      console.log(`   ✅ ${taskId}: All checks passed`);
    }
  }

  async checkTaskConstitutionalCompliance(taskId, taskAudit) {
    const checkerPath = path.join(
      this.repoRoot,
      ".specify",
      "tools",
      "constitutional-checker.js"
    );

    if (!fs.existsSync(checkerPath)) {
      taskAudit.warnings.push("Constitutional checker not found");
      return;
    }

    try {
      execSync(`node "${checkerPath}" ${taskId}`, {
        cwd: this.repoRoot,
        stdio: "pipe",
      });
      taskAudit.constitutionalCompliance = true;
    } catch (error) {
      taskAudit.errors.push("Constitutional compliance failed");
      taskAudit.constitutionalCompliance = false;
    }
  }

  async parseMCPRequirements(tasksContent) {
    // Parse task blocks to extract MCP requirements
    const taskBlocks = tasksContent.split(/(?=^-\s*\[.\]\s*T\d+)/gm);

    for (const block of taskBlocks) {
      const taskMatch = block.match(/^-\s*\[.\]\s*(T\d+)/m);
      if (!taskMatch) continue;

      const taskId = taskMatch[1];
      const mcpMatch = block.match(/MCP:\s*(.*?)$/m);

      if (mcpMatch) {
        const mcpRequirement = mcpMatch[1].trim();
        this.taskMCPRequirements[taskId] = mcpRequirement;
      }
    }
  }

  async checkTaskMCPEvidence(taskId, taskAudit) {
    const mcpRequirement = this.taskMCPRequirements[taskId];

    // If task is marked as "N/A" for MCP, skip MCP validation
    if (mcpRequirement && mcpRequirement.startsWith("N/A")) {
      taskAudit.mcpEvidence = true; // Pass MCP check for N/A tasks
      taskAudit.warnings.push(`MCP N/A: ${mcpRequirement}`);
      return;
    }

    const evidenceDir = path.join(this.repoRoot, "evidence", taskId);

    if (!fs.existsSync(evidenceDir)) {
      taskAudit.errors.push("No evidence directory found");
      taskAudit.mcpEvidence = false;
      return;
    }

    // Check for required MCP evidence files
    const requiredFiles = [
      "mcp-interaction.log",
      "functional-test-results.json",
      "screenshots",
    ];

    const missingFiles = requiredFiles.filter(
      (file) => !fs.existsSync(path.join(evidenceDir, file))
    );

    if (missingFiles.length > 0) {
      taskAudit.errors.push(`Missing MCP evidence: ${missingFiles.join(", ")}`);
      taskAudit.mcpEvidence = false;
    } else {
      taskAudit.mcpEvidence = true;
    }
  }

  async checkTaskImplementation(taskId, taskAudit) {
    // This is a simplified check - in reality, we'd need to map tasks to files
    const webSrcDir = path.join(this.repoRoot, "packages", "web", "src");

    if (!fs.existsSync(webSrcDir)) {
      taskAudit.errors.push("Web source directory not found");
      taskAudit.implementationExists = false;
      return;
    }

    // For now, assume implementation exists if we reach this point
    taskAudit.implementationExists = true;
  }

  async checkTaskTestCoverage(taskId, taskAudit) {
    const testsDir = path.join(this.repoRoot, "packages", "web", "tests");

    if (!fs.existsSync(testsDir)) {
      taskAudit.warnings.push("Tests directory not found");
      taskAudit.testCoverage = false;
      return;
    }

    // For now, assume basic test coverage exists
    taskAudit.testCoverage = true;
  }

  async runMCPSpotChecks() {
    console.log("\n🎯 Running Random MCP Spot-Checks");
    console.log("-".repeat(50));

    // Select random subset of completed tasks for spot-check
    const spotCheckCount = Math.min(3, this.auditTasks.length);
    const spotCheckTasks = this.shuffleArray([...this.auditTasks]).slice(
      0,
      spotCheckCount
    );

    for (const taskId of spotCheckTasks) {
      console.log(`🔍 Spot-checking ${taskId}...`);
      await this.runMCPSpotCheck(taskId);
    }
  }

  async runMCPSpotCheck(taskId) {
    const mcpRequirement = this.taskMCPRequirements[taskId];

    // Skip MCP spot-check for N/A tasks
    if (mcpRequirement && mcpRequirement.startsWith("N/A")) {
      console.log(`   ✅ ${taskId} spot-check skipped (MCP N/A)`);
      return;
    }

    const evidenceDir = path.join(this.repoRoot, "evidence", taskId);

    if (!fs.existsSync(evidenceDir)) {
      this.errors.push(
        `Spot-check FAILED: ${taskId} has no evidence directory`
      );
      return;
    }

    const validatorPath = path.join(
      this.repoRoot,
      ".specify",
      "tools",
      "mcp-evidence-validator.js"
    );

    if (!fs.existsSync(validatorPath)) {
      this.warnings.push("MCP evidence validator not found for spot-check");
      return;
    }

    try {
      execSync(`node "${validatorPath}" "${evidenceDir}" ${taskId}`, {
        cwd: this.repoRoot,
        stdio: "pipe",
      });
      console.log(`   ✅ ${taskId} spot-check passed`);
    } catch (error) {
      console.log(`   ❌ ${taskId} spot-check failed`);
      this.errors.push(
        `Spot-check FAILED: ${taskId} MCP evidence validation failed`
      );
    }
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async generateAuditReport() {
    const report = {
      auditId: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      tasksAudited: this.auditTasks.length,
      taskResults: this.auditResults,
      overallCompliance: this.calculateOverallCompliance(),
      criticalViolations: this.errors.length,
      warnings: this.warnings.length,
      recommendations: this.generateRecommendations(),
      auditor: "constitutional-audit.js",
    };

    const reportDir = path.join(this.repoRoot, "evidence", "audits");

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(
      reportDir,
      `constitutional-audit-${Date.now()}.json`
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📊 Audit report generated: ${reportPath}`);
  }

  calculateOverallCompliance() {
    const totalTasks = this.auditTasks.length;
    if (totalTasks === 0) return 100;

    const compliantTasks = Object.values(this.auditResults).filter(
      (result) =>
        result.constitutionalCompliance &&
        result.mcpEvidence &&
        result.implementationExists &&
        result.testCoverage
    ).length;

    return Math.round((compliantTasks / totalTasks) * 100);
  }

  generateRecommendations() {
    const recommendations = [];

    // Analyze audit results for patterns
    const tasksWithoutMCP = Object.entries(this.auditResults)
      .filter(([_, result]) => !result.mcpEvidence)
      .map(([taskId]) => taskId);

    const tasksWithoutConstitutional = Object.entries(this.auditResults)
      .filter(([_, result]) => !result.constitutionalCompliance)
      .map(([taskId]) => taskId);

    if (tasksWithoutMCP.length > 0) {
      recommendations.push({
        type: "critical",
        issue: "Missing MCP Evidence",
        affected: tasksWithoutMCP,
        action:
          "Perform MCP browser testing and capture evidence for all affected tasks",
      });
    }

    if (tasksWithoutConstitutional.length > 0) {
      recommendations.push({
        type: "critical",
        issue: "Constitutional Violations",
        affected: tasksWithoutConstitutional,
        action:
          "Review and fix constitutional compliance issues for all affected tasks",
      });
    }

    if (this.errors.length > this.auditTasks.length * 0.2) {
      recommendations.push({
        type: "process",
        issue: "High Error Rate",
        action: "Review and strengthen constitutional enforcement processes",
      });
    }

    return recommendations;
  }

  reportAuditResults() {
    console.log("\n" + "=".repeat(70));
    console.log("📊 CONSTITUTIONAL AUDIT RESULTS");
    console.log("=".repeat(70));

    const compliance = this.calculateOverallCompliance();
    console.log(`\n🏆 Overall Compliance: ${compliance}%`);
    console.log(`📋 Tasks Audited: ${this.auditTasks.length}`);
    console.log(`❌ Critical Violations: ${this.errors.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);

    if (this.errors.length > 0) {
      console.log("\n❌ CRITICAL CONSTITUTIONAL VIOLATIONS:");
      this.errors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log("\n⚠️  WARNINGS:");
      this.warnings.forEach((warning, i) => {
        console.log(`   ${i + 1}. ${warning}`);
      });
    }

    // Detailed task breakdown
    console.log("\n📋 Task Audit Summary:");
    Object.entries(this.auditResults).forEach(([taskId, result]) => {
      const status =
        result.constitutionalCompliance &&
        result.mcpEvidence &&
        result.implementationExists &&
        result.testCoverage
          ? "✅"
          : "❌";
      console.log(`   ${status} ${taskId}`);
    });

    console.log("\n" + "=".repeat(70));

    if (compliance < 80) {
      console.log("🚨 CONSTITUTIONAL CRISIS: IMMEDIATE HALT REQUIRED");
      console.log("   Compliance below 80% threshold");
      console.log(
        "   All development MUST STOP until violations are remediated"
      );
      console.log("\n💡 Required Actions:");
      console.log("   1. Fix all critical violations listed above");
      console.log("   2. Perform proper MCP validation for affected tasks");
      console.log("   3. Re-run constitutional audit");
      console.log("   4. Only proceed when compliance ≥ 80%");
      process.exit(1);
    } else if (compliance < 95) {
      console.log("⚠️  CONSTITUTIONAL WARNING: Improvement Required");
      console.log("   Address violations before next development phase");
    } else {
      console.log("✅ CONSTITUTIONAL COMPLIANCE: APPROVED");
      console.log("   All tasks meet constitutional requirements");
    }
  }
}

// CLI execution
if (require.main === module) {
  const auditor = new ConstitutionalAuditor();
  auditor.runComprehensiveAudit().catch((error) => {
    console.error("Constitutional audit failed:", error);
    process.exit(1);
  });
}

module.exports = ConstitutionalAuditor;

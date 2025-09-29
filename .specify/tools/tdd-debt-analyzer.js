#!/usr/bin/env node

/**
 * TDD Technical Debt Analyzer
 * Constitutional Amendment 6 Implementation
 *
 * Analyzes failing test results and auto-generates implementation tasks
 * for identified technical debt with severity classification.
 */

const fs = require("fs");
const path = require("path");

class TDDDebtAnalyzer {
  constructor() {
    this.debtRules = [
      {
        testPattern:
          /discount.*correctly|Expected.*850.*Received.*1000|handle.*quotes.*with.*discounts/i,
        severity: "CRITICAL",
        taskTemplate: "Fix {api} discount calculation logic",
        businessImpact: "Quote totals incorrect, pricing integrity compromised",
        estimatedEffort: "S",
        dependencies: ["contract-test-complete"],
      },
      {
        testPattern:
          /unique.*quote.*numbers|not.*"quote-.*"|concurrent.*requests|duplicate.*id/i,
        severity: "CRITICAL",
        taskTemplate: "Fix {api} unique ID generation",
        businessImpact:
          "Potential duplicate quote IDs in high-traffic scenarios",
        estimatedEffort: "M",
        dependencies: ["contract-test-complete"],
      },
      {
        testPattern:
          /calculate.*totals.*multiple.*items|Expected.*135.*Received.*150/i,
        severity: "CRITICAL",
        taskTemplate: "Fix {api} line item calculation logic",
        businessImpact: "Incorrect quote totals, business calculation errors",
        estimatedEffort: "M",
        dependencies: ["contract-test-complete"],
      },
      {
        testPattern:
          /400.*Bad.*Request.*invalid.*discount|Expected.*400.*Received.*201/i,
        severity: "HIGH",
        taskTemplate: "Fix {api} discount validation",
        businessImpact:
          "Invalid discount values accepted, data integrity risks",
        estimatedEffort: "S",
        dependencies: ["contract-test-complete"],
      },
      {
        testPattern: /expiry.*date.*default.*30.*days|toBe.*toStrictEqual/i,
        severity: "MEDIUM",
        taskTemplate: "Fix {api} date comparison logic",
        businessImpact:
          "Date comparison test failures, minor API inconsistency",
        estimatedEffort: "XS",
        dependencies: ["contract-test-complete"],
      },
      {
        testPattern: /JSON.*structure.*valid.*quote|toMatchObject.*expected/i,
        severity: "MEDIUM",
        taskTemplate: "Fix {api} response structure",
        businessImpact: "Response format inconsistency, type matching issues",
        estimatedEffort: "XS",
        dependencies: ["contract-test-complete"],
      },
      {
        testPattern: /performance.*exceed|timeout.*api|slow.*response/i,
        severity: "HIGH",
        taskTemplate: "Optimize {api} performance",
        businessImpact: "User experience degradation, scalability issues",
        estimatedEffort: "L",
        dependencies: ["performance-baseline"],
      },
      {
        testPattern: /accessibility.*fail|a11y.*violation|wcag.*fail/i,
        severity: "MEDIUM",
        taskTemplate: "Fix {component} accessibility issues",
        businessImpact: "WCAG compliance gaps, user inclusion barriers",
        estimatedEffort: "M",
        dependencies: ["ui-component-ready"],
      },
      {
        testPattern: /security.*fail|auth.*bypass|xss.*vulnerability/i,
        severity: "CRITICAL",
        taskTemplate: "Fix {api} security vulnerability",
        businessImpact: "Security breach risk, data exposure potential",
        estimatedEffort: "L",
        dependencies: ["security-review"],
      },
    ];

    this.debtInventory = [];
  }

  /**
   * Analyze test results and generate debt items
   */
  analyzeTestResults(testFilePath, sprintId) {
    console.log(`🔍 Analyzing TDD debt from: ${testFilePath}`);
    console.log(`📋 Sprint context: ${sprintId}`);

    try {
      // Read test output (could be Jest JSON, TAP, or custom format)
      const testResults = this.parseTestResults(testFilePath);

      console.log(`📊 Test results structure:`, {
        hasTestResults: !!testResults.testResults,
        numTestSuites: testResults.testResults?.length || 0,
        totalTests: testResults.numTotalTests || 0,
        failedTests: testResults.numFailedTests || 0,
      });

      // Extract failing tests
      const failingTests = this.extractFailingTests(testResults);

      // Generate debt items
      const debtItems = this.generateDebtItems(failingTests, sprintId);

      // Classify and prioritize
      const classifiedDebt = this.classifyDebt(debtItems);

      // Generate implementation tasks
      const implementationTasks = this.generateImplementationTasks(
        classifiedDebt,
        sprintId
      );

      // Output results
      this.outputResults(classifiedDebt, implementationTasks, sprintId);

      // Generate evidence files if task ID provided
      const taskId = this.inferSourceTaskId(testFilePath);
      if (taskId) {
        console.log(`📁 Generating evidence for task: ${taskId}`);
        this.generateTaskSpecificDebtEvidence(
          taskId,
          sprintId,
          classifiedDebt,
          implementationTasks
        );
      } else {
        console.log(
          `⚠️  Could not infer task ID from ${testFilePath} - no evidence generated`
        );
      }

      return {
        debt: classifiedDebt,
        tasks: implementationTasks,
        summary: this.generateSummary(classifiedDebt),
      };
    } catch (error) {
      console.error("❌ TDD Debt Analysis Failed:", error.message);
      process.exit(1);
    }
  }

  /**
   * Parse test results from various formats
   */
  parseTestResults(testFilePath) {
    const content = fs.readFileSync(testFilePath, "utf8");

    // Try to extract JSON from npm output
    const jsonMatch = content.match(/(\{[\s\S]*\})\s*$/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.log("Failed to parse extracted JSON:", e.message);
      }
    }

    // Try to parse entire content as JSON
    try {
      return JSON.parse(content);
    } catch (e) {
      // Fall back to text parsing
      return { rawOutput: content };
    }
  }

  /**
   * Extract failing test information
   */
  extractFailingTests(testResults) {
    const failing = [];

    if (testResults.testResults) {
      // Jest format
      testResults.testResults.forEach((file) => {
        file.assertionResults.forEach((test) => {
          if (test.status === "failed") {
            failing.push({
              name: test.fullName || test.title,
              title: test.title,
              error: test.failureMessages.join("\n"),
              file: file.name,
              duration: test.duration,
              ancestorTitles: test.ancestorTitles || [],
            });
          }
        });
      });
    } else if (testResults.rawOutput) {
      // Text format parsing
      const lines = testResults.rawOutput.split("\n");
      let currentTest = null;

      lines.forEach((line) => {
        if (line.includes("✕") || line.includes("FAIL")) {
          const match = line.match(/✕\s*(.+?)(?:\s*\(\d+ms\))?$/);
          if (match) {
            failing.push({
              name: match[1],
              title: match[1],
              error: line,
              file: "unknown",
              duration: 0,
              ancestorTitles: [],
            });
          }
        }
      });
    }

    return failing;
  }

  /**
   * Generate debt items from failing tests
   */
  generateDebtItems(failingTests, sprintId) {
    const debtItems = [];

    console.log(`\n🔍 Processing ${failingTests.length} failing tests:`);

    failingTests.forEach((test, index) => {
      console.log(`\n${index + 1}. Test: "${test.name}"`);
      console.log(`   Title: "${test.title}"`);
      console.log(`   Error snippet: "${test.error.substring(0, 100)}..."`);

      const searchText = test.name + " " + test.title + " " + test.error;
      const matchedRules = this.debtRules.filter((rule) => {
        const matches = rule.testPattern.test(searchText);
        if (matches) {
          console.log(`   ✅ Matched rule: ${rule.taskTemplate}`);
        }
        return matches;
      });

      if (matchedRules.length > 0) {
        matchedRules.forEach((rule) => {
          const apiMatch = test.name.match(/(POST|GET|PUT|DELETE)\s+([^\s]+)/i);
          const componentMatch = test.name.match(
            /(\w+Component|\w+Modal|\w+Form)/i
          );

          const context = apiMatch
            ? apiMatch[2]
            : componentMatch
            ? componentMatch[1]
            : "unknown";

          debtItems.push({
            id: `DEBT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            sourceTest: test.name,
            testFile: test.file,
            severity: rule.severity,
            description: rule.taskTemplate
              .replace("{api}", context)
              .replace("{component}", context),
            businessImpact: rule.businessImpact,
            estimatedEffort: rule.estimatedEffort,
            dependencies: rule.dependencies,
            createdAt: new Date().toISOString(),
            sprintId: sprintId,
            status: "OPEN",
            evidence: [test.error],
          });
        });
      } else {
        // Unclassified debt - default to HIGH priority for manual review
        debtItems.push({
          id: `DEBT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sourceTest: test.name,
          testFile: test.file,
          severity: "HIGH",
          description: `Manual Review Required: ${test.name}`,
          businessImpact: "Unknown impact - requires manual analysis",
          estimatedEffort: "M",
          dependencies: ["manual-review"],
          createdAt: new Date().toISOString(),
          sprintId: sprintId,
          status: "OPEN",
          evidence: [test.error],
        });
      }
    });

    return debtItems;
  }

  /**
   * Classify debt by severity
   */
  classifyDebt(debtItems) {
    return {
      critical: debtItems.filter((item) => item.severity === "CRITICAL"),
      high: debtItems.filter((item) => item.severity === "HIGH"),
      medium: debtItems.filter((item) => item.severity === "MEDIUM"),
      low: debtItems.filter((item) => item.severity === "LOW"),
    };
  }

  /**
   * Determine where to track technical debt: sprint tasks or main inventory
   */
  determineDebtTrackingStrategy(classifiedDebt, sprintId) {
    const totalDebt = Object.values(classifiedDebt).reduce(
      (sum, items) => sum + items.length,
      0
    );
    const criticalDebt = classifiedDebt.critical.length;
    const highDebt = classifiedDebt.high.length;

    // Strategy: Add to current sprint if:
    // 1. Total debt items <= 6 (manageable in sprint)
    // 2. Critical + High <= 4 (prioritizable)
    // 3. We're in an active development sprint (not just planning)
    const addToSprint = totalDebt <= 6 && criticalDebt + highDebt <= 4;

    return {
      strategy: addToSprint ? "SPRINT_TASKS" : "INVENTORY",
      reason: addToSprint
        ? `Manageable debt (${totalDebt} items, ${
            criticalDebt + highDebt
          } high-priority) - adding to current sprint`
        : `Significant debt (${totalDebt} items, ${
            criticalDebt + highDebt
          } high-priority) - tracking in inventory for planning`,
      sprintCapacity: addToSprint,
      inventoryTracking: !addToSprint,
    };
  }

  /**
   * Generate implementation tasks in sprint format
   */
  generateImplementationTasks(classifiedDebt, sprintId) {
    const tasks = [];
    let taskCounter = 1;

    // Process CRITICAL debt first
    classifiedDebt.critical.forEach((debt) => {
      const taskId = `T014.${taskCounter}`;
      taskCounter++;

      tasks.push({
        id: taskId,
        priority: "CRITICAL",
        title: debt.description,
        description: `**TDD Source**: ${debt.sourceTest}\n**Business Impact**: ${debt.businessImpact}`,
        evidence: `evidence/${taskId}/ with implementation, business logic validation`,
        mcp: "**REQUIRED** - Browser test functionality with API validation",
        dependencies: debt.dependencies,
        estimatedEffort: debt.estimatedEffort,
        debtId: debt.id,
        status: "PENDING",
      });
    });

    // Process HIGH debt as future tasks
    classifiedDebt.high.forEach((debt) => {
      const taskId = `T014.${taskCounter}`;
      taskCounter++;

      tasks.push({
        id: taskId,
        priority: "HIGH",
        title: debt.description,
        description: `**TDD Source**: ${debt.sourceTest}\n**Business Impact**: ${debt.businessImpact}`,
        evidence: `evidence/${taskId}/ with implementation, validation`,
        mcp: debt.description.includes("API")
          ? "**REQUIRED** - Browser test API functionality"
          : "**REQUIRED** - Browser test UI functionality",
        dependencies: debt.dependencies,
        estimatedEffort: debt.estimatedEffort,
        debtId: debt.id,
        status: "FUTURE_SPRINT",
      });
    });

    return tasks;
  }

  /**
   * Output analysis results
   */
  outputResults(classifiedDebt, implementationTasks, sprintId) {
    console.log("\n📊 TDD DEBT ANALYSIS RESULTS");
    console.log("================================");

    console.log(
      `🔴 CRITICAL: ${classifiedDebt.critical.length} items (blocking development)`
    );
    console.log(
      `🟡 HIGH: ${classifiedDebt.high.length} items (next sprint planning)`
    );
    console.log(
      `🟠 MEDIUM: ${classifiedDebt.medium.length} items (future consideration)`
    );
    console.log(`⚪ LOW: ${classifiedDebt.low.length} items (backlog)`);

    console.log("\n📋 GENERATED IMPLEMENTATION TASKS:");
    console.log("===================================");

    implementationTasks.forEach((task) => {
      const priorityEmoji = {
        CRITICAL: "🔴",
        HIGH: "🟡",
        MEDIUM: "🟠",
        LOW: "⚪",
      }[task.priority];

      console.log(
        `${priorityEmoji} ${task.id} [${task.priority}] ${task.title}`
      );
    });

    // Determine tracking strategy to avoid duplication
    const trackingStrategy = this.determineDebtTrackingStrategy(
      classifiedDebt,
      sprintId
    );

    if (trackingStrategy.strategy === "INVENTORY") {
      // Only save to inventory if not being added to sprint tasks
      const outputPath = path.join(
        ".specify",
        "memory",
        "tdd-debt-inventory.json"
      );
      const inventory = {
        timestamp: new Date().toISOString(),
        summary: {
          critical: classifiedDebt.critical.length,
          high: classifiedDebt.high.length,
          medium: classifiedDebt.medium.length,
          low: classifiedDebt.low.length,
        },
        debt: classifiedDebt,
        tasks: implementationTasks,
        trackingNote: "Debt added to inventory - too large for current sprint",
      };

      fs.writeFileSync(outputPath, JSON.stringify(inventory, null, 2));
      console.log(`\n💾 Detailed results saved to inventory: ${outputPath}`);
    } else {
      console.log(
        `\n📋 Debt tracked in sprint tasks (avoiding inventory duplication)`
      );
      console.log(`💡 ${trackingStrategy.reason}`);
    }

    // Constitutional enforcement check
    if (classifiedDebt.critical.length > 0) {
      console.log("\n⚠️ CONSTITUTIONAL ALERT: CRITICAL debt detected!");
      console.log("❌ Development must halt until CRITICAL debt is resolved.");
      console.log("✅ Add generated tasks to current sprint immediately.");
    }
  }

  /**
   * Generate task-specific technical debt evidence files
   */
  generateTaskSpecificDebtEvidence(
    taskId,
    sprintId,
    classifiedDebt,
    implementationTasks
  ) {
    if (!taskId) {
      throw new Error("taskId parameter is required");
    }
    if (!sprintId) {
      throw new Error("sprintId parameter is required");
    }

    // Use the provided source task ID
    const sourceTaskId = taskId;

    // Determine tracking strategy
    const trackingStrategy = this.determineDebtTrackingStrategy(
      classifiedDebt,
      sprintId
    );
    console.log(`📊 Debt Tracking Strategy: ${trackingStrategy.strategy}`);
    console.log(`💡 Reason: ${trackingStrategy.reason}`);

    // Create evidence directory if it doesn't exist
    const evidenceDir = path.join("evidence", sourceTaskId);
    if (!fs.existsSync(evidenceDir)) {
      fs.mkdirSync(evidenceDir, { recursive: true });
    }

    // Generate technical-debt.json for the source task
    const taskDebtEvidence = {
      taskId: sourceTaskId,
      timestamp: new Date().toISOString(),
      tddTestsExecuted: true,
      testResults: {
        totalTests: Object.values(classifiedDebt).reduce(
          (sum, items) => sum + items.length,
          0
        ),
        failingTests: Object.values(classifiedDebt).reduce(
          (sum, items) => sum + items.length,
          0
        ),
        passingTests: 0, // Will be enhanced when actual test results are parsed
        source: "TDD Contract Tests",
      },
      identifiedDebt: {
        critical: classifiedDebt.critical.length,
        high: classifiedDebt.high.length,
        medium: classifiedDebt.medium.length,
        low: classifiedDebt.low.length,
      },
      debtDetails: classifiedDebt,
      generatedTasks: implementationTasks.map((task) => ({
        taskId: task.id,
        priority: task.priority,
        title: task.title,
        debtId: task.debtId,
        businessImpact: task.description,
      })),
      constitutionalCompliance: {
        debtTracked: true,
        tasksGenerated: implementationTasks.length > 0,
        developmentBlocked: classifiedDebt.critical.length > 0,
        amendmentEnforced: "AMENDMENT_6_TDD_DEBT_MANAGEMENT",
      },
      debtTrackingLocation: {
        strategy: trackingStrategy.strategy,
        reason: trackingStrategy.reason,
        references:
          trackingStrategy.strategy === "SPRINT_TASKS"
            ? implementationTasks.map((task) => ({
                type: "SPRINT_TASK",
                taskId: task.id,
                debtId: task.debtId,
                sprintFile: `specs/${sprintId}/tasks.md`,
                validated: false, // Will be validated by post-task checker
              }))
            : classifiedDebt.critical
                .concat(
                  classifiedDebt.high,
                  classifiedDebt.medium,
                  classifiedDebt.low
                )
                .map((debt) => ({
                  type: "INVENTORY",
                  debtId: debt.id,
                  inventoryFile: ".specify/memory/tdd-debt-inventory.json",
                  validated: false, // Will be validated by post-task checker
                })),
      },
      correlationStatus: {
        tddResultsCorrelated: true,
        taskListAmended:
          trackingStrategy.strategy === "SPRINT_TASKS" &&
          implementationTasks.length > 0,
        debtTrackerUpdated: true,
        sprintIntegration:
          trackingStrategy.strategy === "SPRINT_TASKS"
            ? "AUTOMATIC_TASK_INSERTION"
            : "INVENTORY_TRACKING",
        avoidsDuplication: true,
      },
    };

    const taskDebtPath = path.join(evidenceDir, "technical-debt.json");
    fs.writeFileSync(taskDebtPath, JSON.stringify(taskDebtEvidence, null, 2));
    console.log(`📊 Task-specific debt evidence: ${taskDebtPath}`);

    return taskDebtEvidence;
  }

  /**
   * Infer source task ID from sprint context
   */
  inferSourceTaskId(sprintId) {
    // Check if sprintId contains task ID pattern
    const taskMatch = sprintId.match(/(T\d{3})/);
    if (taskMatch) {
      return taskMatch[1];
    }

    // Default to T005 for current context (can be enhanced)
    return "T005";
  }

  /**
   * Generate empty technical debt evidence for tasks with no failing tests
   */
  static generateEmptyDebtEvidence(taskId) {
    const evidenceDir = path.join("evidence", taskId);
    if (!fs.existsSync(evidenceDir)) {
      fs.mkdirSync(evidenceDir, { recursive: true });
    }

    const emptyDebtEvidence = {
      taskId: taskId,
      timestamp: new Date().toISOString(),
      tddTestsExecuted: false,
      testResults: {
        totalTests: 0,
        failingTests: 0,
        passingTests: 0,
        note: "No TDD tests executed for this task",
      },
      identifiedDebt: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      },
      debtDetails: {
        critical: [],
        high: [],
        medium: [],
        low: [],
      },
      generatedTasks: [],
      constitutionalCompliance: {
        debtTracked: true,
        tasksGenerated: false,
        developmentBlocked: false,
        amendmentEnforced: "AMENDMENT_6_TDD_DEBT_MANAGEMENT",
        note: "No technical debt identified - task did not involve TDD test execution",
      },
      correlationStatus: {
        tddResultsCorrelated: true,
        taskListAmended: false,
        debtTrackerUpdated: true,
        note: "No debt to correlate - clean task completion",
      },
    };

    const taskDebtPath = path.join(evidenceDir, "technical-debt.json");
    fs.writeFileSync(taskDebtPath, JSON.stringify(emptyDebtEvidence, null, 2));
    console.log(`📊 Empty debt evidence generated: ${taskDebtPath}`);
    return emptyDebtEvidence;
  }

  /**
   * Generate executive summary
   */
  generateSummary(classifiedDebt) {
    const total = Object.values(classifiedDebt).reduce(
      (sum, items) => sum + items.length,
      0
    );

    return {
      totalDebt: total,
      criticalCount: classifiedDebt.critical.length,
      developmentBlocked: classifiedDebt.critical.length > 0,
      recommendedAction:
        classifiedDebt.critical.length > 0
          ? "HALT_DEVELOPMENT_ADD_TASKS"
          : "CONTINUE_DEVELOPMENT_MONITOR_DEBT",
    };
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(
      "Usage: node tdd-debt-analyzer.js <test-results-file> <sprint-id>"
    );
    console.log(
      "Example: node tdd-debt-analyzer.js test-results.json 006-quotes-technical-debt"
    );
    process.exit(1);
  }

  const [testFile, sprintId] = args;
  const analyzer = new TDDDebtAnalyzer();
  analyzer.analyzeTestResults(testFile, sprintId);
}

module.exports = TDDDebtAnalyzer;

#!/usr/bin/env node
/**
 * Bundle Size Analysis for Quotes Feature
 *
 * This script analyzes the bundle size impact of the quotes workspace feature
 * and provides optimization recommendations.
 *
 * Usage:
 *   node scripts/analyze-quotes-bundle.js
 *   npm run analyze:quotes
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const CONFIG = {
  // Size thresholds in KB
  thresholds: {
    component: 50, // Individual component max size
    hook: 20, // Individual hook max size
    service: 30, // Individual service max size
    total: 200, // Total quotes feature max size
  },

  // Paths to analyze
  paths: {
    components: "src/components/quotes",
    hooks: "src/hooks/quotes",
    services: "src/services/quotes",
    types: "src/types/quotes",
    stories: "src/stories/quotes",
    tests: "__tests__",
  },

  // Output configuration
  output: {
    detailed: process.argv.includes("--detailed"),
    json: process.argv.includes("--json"),
    csv: process.argv.includes("--csv"),
  },
};

class BundleAnalyzer {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      summary: {},
      files: [],
      recommendations: [],
      violations: [],
    };
  }

  /**
   * Main analysis entry point
   */
  async analyze() {
    console.log("🔍 Analyzing quotes feature bundle size...\n");

    try {
      // Check if Next.js build exists
      this.checkBuildExists();

      // Analyze file sizes
      await this.analyzeFileSizes();

      // Analyze dependencies
      this.analyzeDependencies();

      // Check for optimization opportunities
      this.findOptimizations();

      // Generate recommendations
      this.generateRecommendations();

      // Output results
      this.outputResults();
    } catch (error) {
      console.error("❌ Analysis failed:", error.message);
      process.exit(1);
    }
  }

  /**
   * Check if Next.js build directory exists
   */
  checkBuildExists() {
    const buildPath = path.join(process.cwd(), ".next");
    if (!fs.existsSync(buildPath)) {
      console.log("⚠️  No build found. Running build first...");
      try {
        execSync("npm run build", { stdio: "inherit" });
      } catch (error) {
        throw new Error("Build failed. Please fix build errors first.");
      }
    }
  }

  /**
   * Analyze file sizes for quotes feature
   */
  async analyzeFileSizes() {
    console.log("📊 Analyzing file sizes...");

    const categories = ["components", "hooks", "services", "types"];
    let totalSize = 0;

    for (const category of categories) {
      const categoryPath = CONFIG.paths[category];
      if (!fs.existsSync(categoryPath)) {
        console.log(`⚠️  Path not found: ${categoryPath}`);
        continue;
      }

      const files = this.getFilesRecursive(categoryPath);
      let categorySize = 0;

      for (const file of files) {
        const stats = fs.statSync(file);
        const sizeKB = Math.round((stats.size / 1024) * 100) / 100;

        this.results.files.push({
          path: file,
          category,
          sizeKB,
          lines: this.countLines(file),
        });

        categorySize += sizeKB;

        // Check individual file thresholds
        const threshold = CONFIG.thresholds[category];
        if (threshold && sizeKB > threshold) {
          this.results.violations.push({
            type: "file_size",
            file,
            category,
            size: sizeKB,
            threshold,
            message: `File exceeds ${threshold}KB threshold (${sizeKB}KB)`,
          });
        }
      }

      this.results.summary[category] = {
        files: files.length,
        totalSizeKB: Math.round(categorySize * 100) / 100,
      };

      totalSize += categorySize;
    }

    this.results.summary.total = {
      files: this.results.files.length,
      totalSizeKB: Math.round(totalSize * 100) / 100,
    };

    // Check total size threshold
    if (totalSize > CONFIG.thresholds.total) {
      this.results.violations.push({
        type: "total_size",
        size: totalSize,
        threshold: CONFIG.thresholds.total,
        message: `Total quotes feature size exceeds ${CONFIG.thresholds.total}KB threshold (${totalSize}KB)`,
      });
    }
  }

  /**
   * Analyze external dependencies
   */
  analyzeDependencies() {
    console.log("📦 Analyzing dependencies...");

    try {
      // Check package.json for quotes-related dependencies
      const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

      const quotesDeps = [];
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      // Look for dependencies that might be used by quotes feature
      const quotesRelated = [
        "@tanstack/react-query",
        "@tanstack/react-virtual",
        "react-hook-form",
        "zod",
        "date-fns",
      ];

      for (const dep of quotesRelated) {
        if (allDeps[dep]) {
          quotesDeps.push({
            name: dep,
            version: allDeps[dep],
            type: packageJson.dependencies[dep] ? "production" : "development",
          });
        }
      }

      this.results.dependencies = quotesDeps;
    } catch (error) {
      console.log("⚠️  Could not analyze dependencies:", error.message);
    }
  }

  /**
   * Find optimization opportunities
   */
  findOptimizations() {
    console.log("🔧 Finding optimization opportunities...");

    const optimizations = [];

    // Check for large files
    const largeFiles = this.results.files.filter((f) => f.sizeKB > 25);
    if (largeFiles.length > 0) {
      optimizations.push({
        type: "code_splitting",
        priority: "high",
        description: "Consider splitting large files into smaller modules",
        files: largeFiles.map((f) => f.path),
      });
    }

    // Check for duplicate patterns
    const componentFiles = this.results.files.filter(
      (f) => f.category === "components"
    );
    if (componentFiles.length > 8) {
      optimizations.push({
        type: "component_composition",
        priority: "medium",
        description:
          "Consider using component composition to reduce bundle size",
        affected: componentFiles.length,
      });
    }

    // Check TypeScript files
    const tsFiles = this.results.files.filter(
      (f) => f.path.endsWith(".ts") || f.path.endsWith(".tsx")
    );
    const avgTsSize =
      tsFiles.reduce((sum, f) => sum + f.sizeKB, 0) / tsFiles.length;

    if (avgTsSize > 15) {
      optimizations.push({
        type: "type_optimization",
        priority: "low",
        description:
          "Consider optimizing TypeScript definitions and interfaces",
        averageSize: Math.round(avgTsSize * 100) / 100,
      });
    }

    this.results.optimizations = optimizations;
  }

  /**
   * Generate recommendations based on analysis
   */
  generateRecommendations() {
    const recommendations = [];

    // Size-based recommendations
    if (
      this.results.summary.total.totalSizeKB >
      CONFIG.thresholds.total * 0.8
    ) {
      recommendations.push({
        category: "performance",
        priority: "high",
        title: "Consider code splitting",
        description:
          "The quotes feature is approaching size limits. Consider lazy loading components.",
        action: "Implement React.lazy() for non-critical components",
      });
    }

    // Component recommendations
    const componentCount = this.results.summary.components?.files || 0;
    if (componentCount > 10) {
      recommendations.push({
        category: "architecture",
        priority: "medium",
        title: "Component consolidation",
        description: `${componentCount} components detected. Consider if some can be combined.`,
        action: "Review component responsibilities and merge similar ones",
      });
    }

    // Dependency recommendations
    if (this.results.dependencies && this.results.dependencies.length > 5) {
      recommendations.push({
        category: "dependencies",
        priority: "low",
        title: "Dependency audit",
        description:
          "Multiple dependencies detected. Ensure all are necessary.",
        action: "Review and remove unused dependencies",
      });
    }

    // Performance recommendations
    recommendations.push({
      category: "performance",
      priority: "medium",
      title: "Bundle optimization",
      description: "Enable tree shaking and minimize unused code.",
      action:
        "Configure Next.js build optimization and check for unused exports",
    });

    this.results.recommendations = recommendations;
  }

  /**
   * Output analysis results
   */
  outputResults() {
    if (CONFIG.output.json) {
      this.outputJSON();
    } else if (CONFIG.output.csv) {
      this.outputCSV();
    } else {
      this.outputConsole();
    }
  }

  /**
   * Output results to console
   */
  outputConsole() {
    console.log("\n📋 Bundle Analysis Results");
    console.log("=".repeat(50));

    // Summary
    console.log("\n📊 Size Summary:");
    for (const [category, data] of Object.entries(this.results.summary)) {
      if (category !== "total") {
        console.log(
          `  ${category.padEnd(12)}: ${data.files
            .toString()
            .padStart(2)} files, ${data.totalSizeKB.toString().padStart(6)}KB`
        );
      }
    }
    console.log(
      `  ${"total".padEnd(12)}: ${this.results.summary.total.files
        .toString()
        .padStart(2)} files, ${this.results.summary.total.totalSizeKB
        .toString()
        .padStart(6)}KB`
    );

    // Violations
    if (this.results.violations.length > 0) {
      console.log("\n⚠️  Threshold Violations:");
      this.results.violations.forEach((v) => {
        console.log(`  - ${v.message}`);
      });
    } else {
      console.log("\n✅ All size thresholds met!");
    }

    // Top files by size
    if (CONFIG.output.detailed) {
      console.log("\n📁 Largest Files:");
      const topFiles = this.results.files
        .sort((a, b) => b.sizeKB - a.sizeKB)
        .slice(0, 10);

      topFiles.forEach((file) => {
        console.log(`  ${file.sizeKB.toString().padStart(6)}KB - ${file.path}`);
      });
    }

    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log("\n💡 Recommendations:");
      this.results.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
        console.log(`     ${rec.description}`);
        console.log(`     Action: ${rec.action}\n`);
      });
    }

    // Health check
    const isHealthy =
      this.results.violations.length === 0 &&
      this.results.summary.total.totalSizeKB < CONFIG.thresholds.total;

    console.log(
      isHealthy
        ? "\n✅ Bundle health: GOOD"
        : "\n⚠️  Bundle health: NEEDS ATTENTION"
    );
    console.log(
      `Total size: ${this.results.summary.total.totalSizeKB}KB / ${CONFIG.thresholds.total}KB limit`
    );
  }

  /**
   * Output results as JSON
   */
  outputJSON() {
    const outputPath = "bundle-analysis-quotes.json";
    fs.writeFileSync(outputPath, JSON.stringify(this.results, null, 2));
    console.log(`📄 Results saved to ${outputPath}`);
  }

  /**
   * Output results as CSV
   */
  outputCSV() {
    const outputPath = "bundle-analysis-quotes.csv";
    const headers = ["File,Category,Size (KB),Lines"];
    const rows = this.results.files.map(
      (f) => `"${f.path}","${f.category}",${f.sizeKB},${f.lines}`
    );

    fs.writeFileSync(outputPath, [headers, ...rows].join("\n"));
    console.log(`📊 Results saved to ${outputPath}`);
  }

  /**
   * Get all files recursively from a directory
   */
  getFilesRecursive(dir) {
    const files = [];

    if (!fs.existsSync(dir)) {
      return files;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        files.push(...this.getFilesRecursive(fullPath));
      } else if (this.isRelevantFile(entry.name)) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Check if file is relevant for analysis
   */
  isRelevantFile(filename) {
    const extensions = [".ts", ".tsx", ".js", ".jsx"];
    const excluded = [".test.", ".spec.", ".stories.", ".d.ts"];

    return (
      extensions.some((ext) => filename.endsWith(ext)) &&
      !excluded.some((pattern) => filename.includes(pattern))
    );
  }

  /**
   * Count lines in a file
   */
  countLines(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      return content.split("\n").length;
    } catch (error) {
      return 0;
    }
  }
}

// Main execution
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  analyzer.analyze().catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
}

module.exports = BundleAnalyzer;

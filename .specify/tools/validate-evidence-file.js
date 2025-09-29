#!/usr/bin/env node

// Evidence fabrication validator for git pre-commit hook
// Usage: node validate-evidence-file.js <file-path>

const {
  EvidenceFabricationDetector,
} = require("./evidence-fabrication-detector.js");
const fs = require("fs");

const filePath = process.argv[2];
if (!filePath) {
  console.log("ERROR: No file path provided");
  process.exit(1);
}

try {
  const detector = new EvidenceFabricationDetector();
  const content = fs.readFileSync(filePath, "utf8");
  const result = detector.validateEvidenceFile(filePath, content);

  if (result.isValid) {
    console.log("VALID");
  } else {
    console.log("INVALID");
    result.violations.forEach((v) => {
      console.log("VIOLATION:" + v.message);
    });
  }
} catch (error) {
  console.log("ERROR:" + error.message);
}

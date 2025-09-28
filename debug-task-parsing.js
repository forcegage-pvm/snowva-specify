const fs = require("fs");

const tasksContent = fs.readFileSync(
  "specs/006-quotes-technical-debt/tasks.md",
  "utf8"
);
const taskId = "T001";

console.log("Full tasks.md content length:", tasksContent.length);

// Try the current pattern
const taskPattern = new RegExp(
  `^- \\[[x ]\\] ${taskId} .*?(?=^- \\[[x ]\\]|^## |$)`,
  "gms"
);
const taskMatch = tasksContent.match(taskPattern);

if (taskMatch) {
  console.log("\n=== TASK MATCH FOUND ===");
  console.log("Match length:", taskMatch[0].length);
  console.log("Match content:");
  console.log(taskMatch[0]);

  // Try to find MCP line in the match
  const mcpMatch = taskMatch[0].match(/- MCP: (.*?)$/m);
  if (mcpMatch) {
    console.log("\n=== MCP MATCH FOUND ===");
    console.log("MCP requirement:", mcpMatch[1]);
  } else {
    console.log("\n=== NO MCP MATCH ===");
    console.log("Looking for lines with MCP...");
    const lines = taskMatch[0].split("\n");
    lines.forEach((line, i) => {
      if (line.includes("MCP")) {
        console.log(`Line ${i}: ${line}`);
      }
    });
  }
} else {
  console.log("NO TASK MATCH FOUND");
}

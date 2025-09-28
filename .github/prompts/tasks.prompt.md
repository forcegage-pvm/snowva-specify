---
description: Generate an actionable, dependency-ordered tasks.md for the feature based on available design artifacts.
---

The user input to you can be provided directly by the agent or as a command argument - you **MUST** consider it before proceeding with the prompt (if not empty).

User input:

$ARGUMENTS

1. Run `.specify/scripts/powershell/check-prerequisites.ps1 -Json` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute.
2. Load and analyze available design documents:

   - Always read plan.md for tech stack and libraries
   - IF EXISTS: Read data-model.md for entities
   - IF EXISTS: Read contracts/ for API endpoints
   - IF EXISTS: Read research.md for technical decisions
   - IF EXISTS: Read quickstart.md for test scenarios

   Note: Not all projects have all documents. For example:

   - CLI tools might not have contracts/
   - Simple libraries might not need data-model.md
   - Generate tasks based on what's available

3. Generate tasks following the template:

   - Use `.specify/templates/tasks-template.md` as the base
   - Replace example tasks with actual tasks based on:
     - **Setup tasks**: Project init, dependencies, linting
     - **Test tasks [P]**: One per contract, one per integration scenario
     - **Core tasks**: One per entity, service, CLI command, endpoint
     - **Integration tasks**: DB connections, middleware, logging
     - **Polish tasks [P]**: Unit tests, performance, docs

4. Task generation rules:

   - Each contract file → contract test task marked [P]
   - Each entity in data-model → model creation task marked [P]
   - Each endpoint → implementation task (not parallel if shared files)
   - Each user story → integration test marked [P]
   - Different files = can be parallel [P]
   - Same file = sequential (no [P])

   **CONSTITUTIONAL REQUIREMENTS** (MANDATORY):

   - ALL UI functionality tasks MUST include MCP browser testing validation
   - ALL tasks MUST specify evidence generation requirements
   - ALL tasks MUST pass constitutional validation before completion
   - Task completion BLOCKED without evidence directory: `evidence/[taskId]/`
   - Required evidence: screenshots/, mcp-interaction.log, functional-test-results.json

5. Order tasks by dependencies:

   - Setup before everything
   - Tests before implementation (TDD)
   - Models before services
   - Services before endpoints
   - Core before integration
   - Everything before polish

   **CONSTITUTIONAL ENFORCEMENT**:

   - Pre-task validation gate: `node .specify/tools/pre-task-check.js [taskId]`
   - Post-task validation gate: `node .specify/tools/post-task-validation.js [taskId]`
   - NO task completion without constitutional compliance
   - ALL tasks require evidence-first development approach

6. Include parallel execution examples:

   - Group [P] tasks that can run together
   - Show actual Task agent commands

7. Create FEATURE_DIR/tasks.md with:
   - Correct feature name from implementation plan
   - Numbered tasks (T001, T002, etc.)
   - Clear file paths for each task
   - Dependency notes
   - Parallel execution guidance
   - **CONSTITUTIONAL COMPLIANCE REQUIREMENTS**:
     - Evidence directory specification for each task
     - MCP validation requirements for UI tasks
     - Constitutional validation checkpoints
     - Anti-hallucination protection protocols

Context for task generation: $ARGUMENTS

**CONSTITUTIONAL MANDATE**: The tasks.md should be immediately executable AND constitutionally compliant - each task must be specific enough that an LLM can complete it without additional context WHILE ensuring evidence-first development and proper validation before completion marking.

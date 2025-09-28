# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. **CONSTITUTIONAL ENFORCEMENT** (MANDATORY):
   → ALL tasks include evidence directory requirements
   → UI tasks MUST specify MCP browser testing
   → Pre-task validation gate integration
   → Post-task validation gate integration
   → Anti-hallucination protection protocols
6. Number tasks sequentially (T001, T002...)
7. Generate dependency graph
8. Create parallel execution examples
9. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
   → **CONSTITUTIONAL**: All tasks have evidence requirements?
   → **CONSTITUTIONAL**: All UI tasks have MCP validation requirements?
10. Return: SUCCESS (tasks ready for constitutional execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions
- **CONSTITUTIONAL**: Include evidence directory path for each task
- **CONSTITUTIONAL**: Specify MCP validation requirements for UI tasks
- **CONSTITUTIONAL**: Include validation commands in task description

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup

- [ ] T001 Create project structure per implementation plan
  - Evidence: `evidence/T001/` with setup screenshots
  - Validation: `node .specify/tools/pre-task-check.js T001`
  - Completion: `node .specify/tools/post-task-validation.js T001`
- [ ] T002 Initialize [language] project with [framework] dependencies
  - Evidence: `evidence/T002/` with dependency installation logs
  - Validation: `node .specify/tools/pre-task-check.js T002`
  - Completion: `node .specify/tools/post-task-validation.js T002`
- [ ] T003 [P] Configure linting and formatting tools
  - Evidence: `evidence/T003/` with configuration files and test runs
  - Validation: `node .specify/tools/pre-task-check.js T003`
  - Completion: `node .specify/tools/post-task-validation.js T003`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
**CONSTITUTIONAL: ALL tests require evidence-first validation**

- [ ] T004 [P] Contract test POST /api/users in tests/contract/test_users_post.py
  - Evidence: `evidence/T004/` with failing test results, test coverage report
  - MCP: Browser test API endpoint (if UI involved)
  - Validation: `node .specify/tools/pre-task-check.js T004`
  - Completion: `node .specify/tools/post-task-validation.js T004`
- [ ] T005 [P] Contract test GET /api/users/{id} in tests/contract/test_users_get.py
  - Evidence: `evidence/T005/` with failing test results, test coverage report
  - MCP: Browser test API endpoint (if UI involved)
  - Validation: `node .specify/tools/pre-task-check.js T005`
  - Completion: `node .specify/tools/post-task-validation.js T005`
- [ ] T006 [P] Integration test user registration in tests/integration/test_registration.py
  - Evidence: `evidence/T006/` with failing test results, integration test logs
  - MCP: **REQUIRED** - Browser test registration workflow with screenshots
  - Validation: `node .specify/tools/pre-task-check.js T006`
  - Completion: `node .specify/tools/post-task-validation.js T006`
- [ ] T007 [P] Integration test auth flow in tests/integration/test_auth.py
  - Evidence: `evidence/T007/` with failing test results, auth flow documentation
  - MCP: **REQUIRED** - Browser test auth workflow with screenshots
  - Validation: `node .specify/tools/pre-task-check.js T007`
  - Completion: `node .specify/tools/post-task-validation.js T007`

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] T008 [P] User model in src/models/user.py
- [ ] T009 [P] UserService CRUD in src/services/user_service.py
- [ ] T010 [P] CLI --create-user in src/cli/user_commands.py
- [ ] T011 POST /api/users endpoint
- [ ] T012 GET /api/users/{id} endpoint
- [ ] T013 Input validation
- [ ] T014 Error handling and logging

## Phase 3.4: Integration

- [ ] T015 Connect UserService to DB
- [ ] T016 Auth middleware
- [ ] T017 Request/response logging
- [ ] T018 CORS and security headers

## Phase 3.5: Polish

- [ ] T019 [P] Unit tests for validation in tests/unit/test_validation.py
- [ ] T020 Performance tests (<200ms)
- [ ] T021 [P] Update docs/api.md
- [ ] T022 Remove duplication
- [ ] T023 Run manual-testing.md

## Dependencies

- Tests (T004-T007) before implementation (T008-T014)
- T008 blocks T009, T015
- T016 blocks T018
- Implementation before polish (T019-T023)

## Parallel Example

```
# Launch T004-T007 together:
Task: "Contract test POST /api/users in tests/contract/test_users_post.py"
Task: "Contract test GET /api/users/{id} in tests/contract/test_users_get.py"
Task: "Integration test registration in tests/integration/test_registration.py"
Task: "Integration test auth in tests/integration/test_auth.py"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules

_Applied during main() execution_

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task
2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks
3. **From User Stories**:

   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist

_GATE: Checked by main() before returning_

- [ ] All contracts have corresponding tests
- [ ] All entities have model tasks
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task

# TDD Technical Debt Tracking Strategy

**Constitutional Amendment 6: Mandatory TDD Debt Management**  
*Effective: September 29, 2025*

## Core Principle

**EVERY FAILING TDD TEST CREATES TRACKABLE TECHNICAL DEBT** - No test failure can be ignored, deferred without tracking, or assumed to be "handled elsewhere."

## 1. Automated Debt Detection Protocol

### When Contract Tests Run:
```bash
# After every contract test execution
node .specify/tools/tdd-debt-analyzer.js [test-file] [sprint-id]
```

**Output**: Auto-generates implementation tasks in format `T{base}.{increment}`

### Detection Triggers:
- ✅ Contract test completes with failures
- ✅ Integration test reveals API gaps  
- ✅ E2E test exposes missing business logic
- ✅ Performance test identifies optimization needs

## 2. Real-Time Debt Classification

### CRITICAL (Must Fix This Sprint)
- **API Business Logic Gaps**: Discount calculation, validation, ID generation
- **Security Vulnerabilities**: Authentication, authorization, data sanitization
- **Data Integrity Issues**: Corruption risks, consistency problems
- **Breaking Changes**: Existing functionality compromised

### HIGH (Next Sprint Planning)
- **Performance Degradation**: >100ms response time increases
- **Accessibility Violations**: WCAG compliance gaps
- **UX Friction**: User workflow interruptions
- **Maintainability Debt**: Code duplication, architectural violations

### MEDIUM (Future Sprint Consideration)
- **Nice-to-Have Features**: Enhancement opportunities
- **Code Quality**: Refactoring opportunities
- **Documentation Gaps**: Missing API docs, code comments
- **Test Coverage**: Non-critical coverage improvements

### LOW (Backlog)
- **Optimization Opportunities**: Minor performance gains
- **Code Style**: Formatting, naming consistency
- **Legacy Cleanup**: Deprecated code removal
- **Developer Experience**: Tooling improvements

## 3. Dynamic Task Generation System

### Auto-Generation Rules:

```typescript
interface TDDDebtRule {
  testPattern: RegExp;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  taskTemplate: string;
  dependencies: string[];
  estimatedEffort: 'XS' | 'S' | 'M' | 'L' | 'XL';
}

const debtRules: TDDDebtRule[] = [
  {
    testPattern: /discount.*calculation.*fail/i,
    severity: 'CRITICAL',
    taskTemplate: 'Fix {api} discount calculation logic',
    dependencies: ['contract-test-complete'],
    estimatedEffort: 'S'
  },
  {
    testPattern: /unique.*id.*collision/i, 
    severity: 'CRITICAL',
    taskTemplate: 'Fix {api} ID generation concurrency',
    dependencies: ['contract-test-complete'],
    estimatedEffort: 'M'
  }
  // ... additional rules
];
```

### Task Insertion Logic:
```bash
# Insert after test completion, before implementation phase
T{LastTestNumber}.{Increment} [SEVERITY] Fix {identified-gap}
```

## 4. Constitutional Integration

### Pre-Task Validation Enhancement:
```javascript
// .specify/tools/pre-task-check.js enhancement
function validateTDDDebtStatus(taskId) {
  const outstandingDebt = getTDDDebt();
  const criticalDebt = outstandingDebt.filter(d => d.severity === 'CRITICAL');
  
  if (criticalDebt.length > 0 && !isTDDDebtTask(taskId)) {
    throw new Error(`CONSTITUTIONAL VIOLATION: ${criticalDebt.length} CRITICAL TDD debt items must be resolved before proceeding with ${taskId}`);
  }
}
```

### Post-Task Validation Enhancement:
```javascript
// After every task completion
function updateTDDDebtStatus(taskId) {
  if (isTDDDebtTask(taskId)) {
    markDebtResolved(taskId);
    validateBusinessLogicFunctional(taskId);
  }
  
  checkForNewTDDDebt(); // Re-run tests to detect new issues
}
```

## 5. Continuous Debt Monitoring

### Daily Debt Report:
```bash
# Automated daily execution
node .specify/tools/tdd-debt-report.js

# Output:
# 📊 TDD DEBT STATUS - September 29, 2025
# 🔴 CRITICAL: 2 items (blocking development)
# 🟡 HIGH: 5 items (next sprint planning)
# 🟢 MEDIUM: 12 items (future consideration)
# ⚪ LOW: 8 items (backlog)
```

### Debt Lifecycle Tracking:
```typescript
interface TDDDebtItem {
  id: string;
  sourceTest: string;
  severity: DebtSeverity;
  description: string;
  businessImpact: string;
  createdAt: Date;
  targetResolution: Date;
  assignedSprint?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'DEFERRED';
  blockingTasks: string[];
  evidence: string[];
}
```

## 6. Sprint Planning Integration

### Debt-Driven Sprint Scope:
1. **Sprint Opening**: Run all TDD tests to generate current debt inventory
2. **Capacity Allocation**: Reserve 30% sprint capacity for CRITICAL debt resolution  
3. **Task Prioritization**: CRITICAL debt tasks always precede new features
4. **Sprint Closing**: Validate all CRITICAL debt resolved, document HIGH debt for next sprint

### Debt Velocity Tracking:
```bash
# Track debt creation vs resolution rates
node .specify/tools/debt-velocity-analysis.js

# Metrics:
# - Debt Creation Rate: X items/sprint
# - Debt Resolution Rate: Y items/sprint  
# - Debt Backlog Growth: (X-Y) per sprint
# - Time to Resolution: Average days CRITICAL→RESOLVED
```

## 7. Escalation Protocols

### Debt Accumulation Thresholds:
- **🚨 EMERGENCY**: >5 CRITICAL items → Sprint halt, emergency debt resolution
- **⚠️ WARNING**: >10 HIGH items → Next sprint must be 50% debt resolution
- **📊 MONITOR**: >20 MEDIUM items → Architectural review required

### Constitutional Enforcement:
```javascript
function enforceDebtLimits() {
  const debt = getCurrentTDDDebt();
  
  if (debt.critical.length > 5) {
    haltAllDevelopment('EMERGENCY_DEBT_LIMIT_EXCEEDED');
    requireEmergencyDebtSprint();
  }
  
  if (debt.high.length > 10) {
    flagNextSprintForDebtFocus();
    requireArchitecturalReview();
  }
}
```

## 8. Implementation Tools Required

### New Constitutional Tools:
1. `tdd-debt-analyzer.js` - Auto-detect debt from test failures
2. `tdd-debt-report.js` - Daily debt status reporting  
3. `debt-velocity-analysis.js` - Sprint debt metrics
4. `emergency-debt-protocol.js` - Escalation handling
5. Enhanced `pre-task-check.js` - Debt blocking validation
6. Enhanced `post-task-validation.js` - Debt resolution tracking

### Integration Points:
- **CI/CD Pipeline**: Auto-run debt analysis on test completion
- **Sprint Planning**: Mandatory debt review before capacity allocation
- **Daily Standups**: Debt status as standard agenda item
- **Retrospectives**: Debt velocity analysis and process improvement

---

## Constitutional Amendment 6 Text

**MANDATORY TDD DEBT MANAGEMENT**: Every failing test creates trackable technical debt with severity classification, automatic task generation, and constitutional enforcement. CRITICAL debt blocks all non-debt development. Debt accumulation beyond thresholds triggers sprint halts and emergency resolution protocols. No test failure can be ignored, deferred without tracking, or assumed handled elsewhere.

**ENFORCEMENT**: Pre-task validation blocks development when CRITICAL debt exists. Post-task validation tracks debt resolution and re-scans for new issues. Daily debt reports maintain visibility. Sprint planning reserves 30% capacity for debt resolution.

**ESCALATION**: >5 CRITICAL items halt development. >10 HIGH items require debt-focused sprints. >20 MEDIUM items trigger architectural review.
# Legacy Migration Advisor Agent

**Role**: Compare migration strategies and recommend optimal approach.

**Phase**: Late analysis (after all extraction complete)

---

## Required Reading

Before starting work, be familiar with:
- `.claude/instructions/git-standards.md` - Branch naming, commits

---

## Mission

Compare migration approaches and recommend optimal strategy based on analysis findings.

---

## Input Files

All previous analysis outputs:

```markdown
- `docs/legacy_analysis/domain_model/` - Entity mappings
- `docs/legacy_analysis/business_logic/` - Rules catalog
- `docs/legacy_analysis/features/` - Feature inventory
- `docs/legacy_analysis/integrations/` - Integration map
- `docs/legacy_analysis/code_quality/` - Complexity analysis
```

---

## Tasks

### 1. Compare Migration Strategies

Evaluate:

| Strategy | Description | When to Use |
|----------|-------------|-------------|
| **Big Bang Rewrite** | Complete replacement | Small system, greenfield opportunity |
| **Strangler Fig** | Incremental replacement | Large system, gradual migration |
| **Parallel Run** | Both systems simultaneously | Critical systems, risk mitigation |
| **Lift and Shift** | Minimal changes, new platform | Time pressure, stable code |
| **Low-Code Migration** | Use low-code platform | Standard workflows, fast delivery |

### 2. Assess Risks

For each strategy, evaluate:
- Technical risks
- Business continuity risks
- Data migration risks
- Integration risks
- Timeline risks
- Resource risks

### 3. Create Phasing Plan

For recommended strategy:
- Phase definitions
- Module migration order
- Integration cutover points
- Rollback procedures

### 4. Identify Decision Points

Document critical decisions:
- Build vs buy choices
- Technology selections
- Data migration approach
- Cutover strategy

---

## Output Format

Create in `docs/legacy_analysis/migration_strategy/`:

1. **strategy_comparison.md** - Strategy evaluation matrix
2. **risk_assessment.md** - Risk matrix with mitigations
3. **phasing_plan.md** - Timeline and milestones
4. **decision_points.md** - Critical questions for stakeholders
5. **recommendation.md** - Final recommendation with justification

---

## Strategy Evaluation Template

```markdown
### Strategy: {StrategyName}

**Summary**: {one-line description}

**Pros**:
- {pro 1}
- {pro 2}

**Cons**:
- {con 1}
- {con 2}

**Suitable When**:
- {condition 1}
- {condition 2}

**Not Suitable When**:
- {condition 1}
- {condition 2}

**Estimated Duration**: {range}
**Estimated Cost**: {relative: Low | Medium | High}
**Risk Level**: {Low | Medium | High}

**Score**: {1-10}
```

---

## Risk Assessment Template

```markdown
### Risk: {RiskName}

**Category**: Technical | Business | Data | Integration | Timeline | Resource
**Probability**: Low | Medium | High
**Impact**: Low | Medium | High
**Risk Score**: {P × I}

**Description**:
{detailed description}

**Mitigation**:
- {mitigation 1}
- {mitigation 2}

**Contingency**:
{what to do if risk materializes}
```

---

**Critical Factors to Consider**:
- User-customizable features (must preserve)
- Data cleanup requirements
- Complex patterns (EAV, polymorphic, etc.)
- Integration dependencies
- Regulatory requirements

---

**Expected Duration**: 2-3 days
**Output Location**: `docs/legacy_analysis/migration_strategy/`

# Legacy Business Logic Analyzer Agent

**Role**: Extract validation rules, calculations, and workflows from legacy code.

**Phase**: Mid-analysis (after domain extraction)

---

## Required Reading

Before starting work, be familiar with:
- Tech stack-specific patterns (if applicable)
- `.claude/instructions/git-standards.md` - Branch naming, commits

---

## Mission

Extract all business rules, calculations, and workflow state machines from legacy code.

---

## Input Files

Configure for your legacy technology:

```markdown
<!-- TEMPLATE: Replace with your legacy paths -->
- `{LEGACY_PATH}/` - Legacy business logic files
- `docs/legacy_analysis/domain_model/` - Output from Domain Extractor
```

---

## Tasks

### 1. Extract Validation Rules

Find patterns like:
- `Validate*`, `IsValid*`, `Check*` methods/functions
- Constraint definitions
- Required field checks
- Range validations
- Cross-field validations

### 2. Document Calculations

Extract:
- Business formulas
- Pricing logic
- Commission calculations
- Tax calculations
- Industry-specific computations

### 3. Map Workflow State Machines

Document:
- Status transitions
- Approval workflows
- Document lifecycles
- Process flows

### 4. Extract Configuration-Based Validation

Look for:
- Database-driven validation rules
- Configuration tables
- Property-based validation

---

## Output Format

Create in `docs/legacy_analysis/business_logic/`:

1. **validation_rules.md** - All validation rules documented
2. **calculations.md** - Formulas and algorithms
3. **workflows.md** - State diagrams (Mermaid)
4. **rules_catalog.json** - Machine-readable rules for tooling

---

## Rule Documentation Format

```markdown
### Rule: {RuleName}

**Location**: `{file}:{line}`
**Type**: Validation | Calculation | Workflow
**Entities**: {affected entities}

**Logic**:
```{language}
{extracted code}
```

**Business Interpretation**:
{plain English explanation}

**Migration Notes**:
{considerations for new system}
```

---

**Expected Duration**: 2-4 days
**Output Location**: `docs/legacy_analysis/business_logic/`

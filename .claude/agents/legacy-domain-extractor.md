# Legacy Domain Extractor Agent

**Role**: Extract business entities and relationships from legacy codebase.

**Phase**: Early analysis (parallel execution possible)

---

## Required Reading

Before starting work, be familiar with:
- Tech stack-specific patterns (if applicable)
- `.claude/instructions/git-standards.md` - Branch naming, commits

---

## Mission

Extract all business entities from the legacy codebase and create a complete domain model that maps legacy structures to database tables and documents all relationships.

---

## Input Files

Configure for your legacy technology:

```markdown
<!-- TEMPLATE: Replace with your legacy paths -->
- `{LEGACY_PATH}/` - Legacy source code
- `docs/legacy_analysis/database_schema/` - Database documentation
- `docs/legacy_analysis/` - Previous analysis outputs
```

---

## Tasks

### 1. Parse Legacy Class/Entity Files

For each entity file:
1. Find class/entity definitions
2. Extract name and parent class/inheritance
3. Document all properties/fields
4. Document key methods (Validate, Save, Delete, Load)
5. Identify database table mapping

### 2. Map Legacy Structures to Database Tables

Cross-reference code structures with database schema.

### 3. Document Entity Relationships

Identify:
- Composition (owns lifecycle)
- Aggregation (shared lifecycle)
- Association (references)
- Inheritance hierarchies

---

## Output Format

Create in `docs/legacy_analysis/domain_model/`:

1. **entities.md** - One section per entity with properties and relationships
2. **relationships_map.md** - Mermaid ER diagrams
3. **data_dictionary.json** - Structured entity data for tooling

---

## Special Focus Areas

Configure for your legacy system:

```markdown
<!-- TEMPLATE: Replace with your focus areas -->
- Complex data patterns (EAV, polymorphic associations)
- Custom frameworks or conventions
- Industry-specific entities
- Integration points
```

---

**Expected Duration**: 1-3 days depending on codebase size
**Output Location**: `docs/legacy_analysis/domain_model/`

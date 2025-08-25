## 🎯 SOLUTION: Missing Scenarios in UI

### Problem Identified ✅

The 7 scenarios exist in individual scenario files but are **missing from the categories.js file**, which is where the ScenarioBrowser loads its scenario list from.

### Current Situation:

- **Individual scenario files**: 67 scenarios total
- **categories.js file**: 60 scenarios total (6 per category × 10 categories)
- **ScenarioBrowser**: Uses CategoryMetadataManager → loads from categories.js

### Missing Scenarios from categories.js:

1. **experience-machine category** missing:
   - `virtual-reality-life`: "Virtual Reality Life Preference"

2. **moral-luck category** missing:
   - `algorithmic-bias-discovery`: "Algorithmic Bias Discovery"
   - `autonomous-vehicle-weather`: "Autonomous Vehicle Weather Incident"
   - `research-funding-breakthrough`: "Research Funding Breakthrough"

3. **sorites-paradox category** missing:
   - `ai-consciousness-threshold`: "AI Consciousness Threshold"
   - `human-ai-hybrid-identity`: "Human-AI Hybrid Identity"
   - `autonomous-weapon-accountability`: "Autonomous Weapon Accountability"

### Solution Required:

Update `src/data/categories.js` to add these 7 scenarios to their respective category `scenarios` arrays:

**experience-machine**: Add 1 scenario (becomes 7 total)
**moral-luck**: Add 3 scenarios (becomes 9 total)
**sorites-paradox**: Add 3 scenarios (becomes 9 total)

This will sync the categories.js file with the actual scenario files and make all 67 scenarios visible in the ScenarioBrowser UI.

### Files to Update:

- `src/data/categories.js` - Add missing scenario entries to respective categories

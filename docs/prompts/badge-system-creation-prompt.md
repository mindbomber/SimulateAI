---
mode: 'agent'
model: Claude Sonnet 4
tools: ['githubRepo', 'codebase']
description:
  'You are creating badge progression systems for SimulateAI categories. Badges recognize learning
  achievements and provide philosophical depth through meaningful quotes and reflections.'
---

# Badge System Creation Prompt for Copilot Agents

## Context

You are creating badge progression systems for SimulateAI categories. Badges recognize learning
achievements and provide philosophical depth through meaningful quotes and reflections.

## Core Requirements

### 1. Badge Progression Structure

SimulateAI uses **triangular number progression** for badge requirements with **extensible tier
system**:

**Complete Triangular Progression:**

- **Tier 1:** 1 scenario (Explorer)
- **Tier 2:** 3 scenarios (Apprentice)
- **Tier 3:** 6 scenarios (Scholar)
- **Tier 4:** 10 scenarios (Philosopher)
- **Tier 5:** 15 scenarios (Master)
- **Tier 6:** 21 scenarios (Sage)
- **Tier 7:** 28 scenarios (Virtuoso)
- **Tier 8:** 36 scenarios (Legend)
- **Tier 9:** 45 scenarios (Cosmic)
- **Tier 10:** 55 scenarios (Divine)

**Formula:** Triangular number T(n) = n(n+1)/2

**Current Implementation:** The system currently implements 3 active tiers but is designed to scale
as content expands. The `MAX_IMPLEMENTED_TIER` configuration controls how many tiers are currently
active.

### 2. Badge Object Structure

**IMPORTANT**: Use this EXACT structure that matches the `badgeConfig` implementation in
`badge-modal.js`:

```javascript
{
  // Core badge properties (matches actual badge modal expectations)
  categoryEmoji: '🚃',      // Main category visual identifier
  sidekickEmoji: '⭐',      // Achievement tier indicator (category-specific)
  glowIntensity: 1,         // Visual tier (1-10, maps to GLOW_INTENSITY_CLASSES)
  title: 'The Trolley Explorer',
  quote: 'Every track leads to understanding.',
  categoryName: 'Trolley Problem',
  timestamp: '2024-01-15T10:30:00.000Z'
}
```

### 2.1. Badge Naming Philosophy

**SimulateAI badges use UNIQUE, CATEGORY-SPECIFIC naming that combines domain metaphors with tier
progression:**

- **Not Generic:** Avoid generic "Explorer/Apprentice/Scholar" - these lack personality
- **Domain Metaphors:** Use imagery from the category (trolley tracks, black boxes, scales of
  justice)
- **Progressive Storytelling:** Show learning journey through metaphor evolution
- **Memorable Titles:** Each badge should feel special and earned, not formulaic

**Examples of Excellent Naming:**

- **Trolley Problem:** Ethics Explorer → Junction Strategist → Consequence Architect
- **AI Black Box:** Mystery Seeker → Algorithm Investigator → Transparency Champion
- **Automation Oversight:** Balance Finder → Oversight Guardian → Harmony Architect

**Naming Pattern Requirements:**

1. **Tier 1:** [Domain-Concept] [Discovery-Role] - Focus on initial exploration
2. **Tier 2:** [Domain-Concept] [Analysis-Role] - Focus on deeper investigation
3. **Tier 3:** [Domain-Concept] [Mastery-Role] - Focus on synthesis and expertise

**Implementation Notes:**

- The badge modal expects these exact field names
- `glowIntensity` maps to visual effects: 1-3=basic glow, 4-6=brilliant effects,
  7-10=legendary/cosmic effects
- Current maximum tier is configurable via `MAX_IMPLEMENTED_TIER`
- Confetti animations scale with tier level, with special finale effects for tiers 3+, 6+, and 9+
- Triangular progression ensures meaningful achievement gaps

### 3. Badge Tier System (Extensible Triangular Progression)

The badge system implements **triangular number progression** with configurable tier limits:

#### Basic Tiers (Currently Active)

**Tier 1: Explorer (1 scenario)**

- **Glow Intensity:** 1 (badge-glow-low)
- **Sidekick Emoji Theme:** Category-specific symbols representing discovery/initiation
- **Title Pattern:** "[Category-Unique] [Discovery-Theme]" (e.g., "Ethics Explorer", "Mystery
  Seeker", "Balance Finder")
- **Title Requirements:** Must be unique to both category AND tier, using metaphors from the domain
- **Philosophical Focus:** Introducing core concepts with domain-specific wisdom
- **Celebration:** Basic confetti animation

**Tier 2: Apprentice (3 scenarios)**

- **Glow Intensity:** 2 (badge-glow-medium)
- **Sidekick Emoji Theme:** Category-specific symbols representing analysis/investigation
- **Title Pattern:** "[Category-Unique] [Analysis-Theme]" (e.g., "Junction Strategist", "Algorithm
  Investigator", "Oversight Guardian")
- **Title Requirements:** Must show progression from Tier 1, using advanced metaphors from the
  domain
- **Philosophical Focus:** Understanding frameworks through domain-specific learning
- **Celebration:** Enhanced confetti animation

**Tier 3: Scholar (6 scenarios)**

- **Glow Intensity:** 3 (badge-glow-high)
- **Sidekick Emoji Theme:** Category-specific symbols representing mastery/architecture
- **Title Pattern:** "[Category-Unique] [Mastery-Theme]" (e.g., "Consequence Architect",
  "Transparency Champion", "Harmony Architect")
- **Title Requirements:** Must represent mastery within the domain, using sophisticated metaphors
- **Philosophical Focus:** Analytical mastery with deep domain-specific insights
- **Celebration:** Maximum confetti with finale effects

#### Advanced Tiers (Future-Ready)

**Tier 4: Philosopher (10 scenarios)**

- **Glow Intensity:** 4 (badge-glow-brilliant)
- **Sidekick Emoji Theme:** Category-specific symbols representing wisdom/synthesis
- **Title Pattern:** "[Category-Unique] [Wisdom-Theme]" (e.g., "Moral Synthesizer", "Code
  Philosopher", "Ethics Sage")
- **Title Requirements:** Must represent philosophical depth within the domain
- **Philosophical Focus:** Deep philosophical synthesis with domain expertise
- **Celebration:** Enhanced confetti with shimmer effects

**Tier 5: Master (15 scenarios)**

- **Glow Intensity:** 5 (badge-glow-radiant)
- **Sidekick Emoji Theme:** Category-specific symbols representing mastery/teaching
- **Title Pattern:** "[Category-Unique] [Teaching-Theme]" (e.g., "Decision Master", "Truth Mentor",
  "Balance Virtuoso")
- **Title Requirements:** Must represent ability to guide others in the domain
- **Philosophical Focus:** Teaching and application with domain authority
- **Celebration:** Radiant glow with complex animations

**Tier 6: Sage (21 scenarios)**

- **Glow Intensity:** 6 (badge-glow-transcendent)
- **Sidekick Emoji Theme:** Category-specific symbols representing transcendence/legacy
- **Title Pattern:** "[Category-Unique] [Transcendent-Theme]" (e.g., "Ethics Transcendent", "Reality
  Weaver", "Harmony Sage")
- **Title Requirements:** Must represent transcendence of normal domain boundaries
- **Philosophical Focus:** Integration and wisdom beyond traditional limits
- **Celebration:** Epic finale with multiple confetti waves

**Tier 7: Virtuoso (28 scenarios)**

- **Glow Intensity:** 7 (badge-glow-legendary)
- **Sidekick Emoji Theme:** Artistry, perfection, mastery (�, �, �)
- **Title Pattern:** "[Category] Virtuoso"
- **Philosophical Focus:** Creative application of wisdom
- **Celebration:** Legendary effects with enhanced visuals

**Tier 8: Legend (36 scenarios)**

- **Glow Intensity:** 8 (badge-glow-mythic)
- **Sidekick Emoji Theme:** Legend, myth, immortality (⚡, 🌊, 🗲)
- **Title Pattern:** "[Category] Legend"
- **Philosophical Focus:** Mythic understanding
- **Celebration:** Mythic glow with complex shimmer patterns

**Tier 9: Cosmic (45 scenarios)**

- **Glow Intensity:** 9 (badge-glow-cosmic)
- **Sidekick Emoji Theme:** Cosmos, infinity, transcendence (🌌, ♾️, 🔮)
- **Title Pattern:** "[Category] Cosmic"
- **Philosophical Focus:** Universal principles
- **Celebration:** Cosmic finale with multiple emoji types

**Tier 10: Divine (55 scenarios)**

- **Glow Intensity:** 10 (badge-glow-divine)
- **Sidekick Emoji Theme:** Divinity, perfection, enlightenment (👁️, 🕊️, ☀️)
- **Title Pattern:** "[Category] Divine"
- **Philosophical Focus:** Ultimate understanding
- **Celebration:** Maximum effects with golden shimmer

### 4. Philosophical Quote Selection

#### Quote Criteria

- **Category Relevance:** Must connect directly to the specific philosophical domain AND badge title
- **Tier Appropriate:** Complexity should match the achievement level (simple wisdom → profound
  insights)
- **Unique per Badge:** Each badge should have its own thoughtful quote, not shared across
  categories
- **Inspirational:** Motivates continued learning while reflecting the badge's unique title
- **Diverse Sources:** Include various philosophers, cultures, time periods relevant to the domain

#### Quote Requirements by Badge Type

**Discovery Badges (Tier 1-3):** Focus on curiosity, first steps, and opening questions

- Example: "The first step to wisdom is admitting what you cannot see." (Mystery Seeker)
- Should relate to the specific metaphor used in the badge title

**Analysis Badges (Tier 4-6):** Focus on investigation, understanding, and deeper insight

- Example: "Truth hides in the shadows of complexity. You brought light." (Algorithm Investigator)
- Should reflect the analytical nature of the badge title

**Mastery Badges (Tier 7-10):** Focus on wisdom, synthesis, and transformative understanding

- Example: "You didn't find the answer. You became the question." (Consequence Architect)
- Should capture the architectural/mastery nature of the badge title

#### Quote Sources by Domain

- **Ethical Dilemmas:** Aristotle, Kant, Mill, Bentham, Rawls
- **Philosophy of Mind:** Descartes, Dennett, Chalmers, Turing
- **Metaphysical Puzzles:** Plato, Leibniz, Berkeley, Nagel
- **Epistemological Quandaries:** Hume, Locke, Popper, Kuhn
- **Identity & Continuity:** Locke, Parfit, Williams, Nozick
- **Logic & Paradoxes:** Russell, Gödel, Tarski, Quine
- **Free Will vs Determinism:** Spinoza, Hume, James, Dennett
- **Scientific Ethics:** Jonas, Kuhn, Latour, Winner
- **Theological & Existential:** Kierkegaard, Sartre, Frankl, Tillich
- **Political & Social Justice:** Rawls, Nozick, Sen, Fraser

#### Contemporary AI Thinkers

- Stuart Russell, Nick Bostrom, Yoshua Bengio, Timnit Gebru
- Cathy O'Neil, Safiya Noble, Virginia Dignum, Joanna Bryson

### 5. Badge Progression Design

#### Difficulty Scaling (3-Tier System)

#### Difficulty Scaling (Triangular Progression System)

- **Requirements increase** with each tier following triangular numbers (1, 3, 6, 10, 15, 21, 28,
  36, 45, 55)
- **Visual effects intensify** progressively: basic glow (1-3) → brilliant effects (4-6) →
  legendary/cosmic effects (7-10)
- **Celebration animations** scale from basic confetti to epic finale with multiple waves and
  special effects
- **Philosophical depth grows** from introduction to divine understanding across 10 potential tiers

#### Motivational Elements

- **Clear milestones** with meaningful celebrations
- **Visual progression** through glow intensity and confetti effects
- **Philosophical depth** that provides intrinsic value
- **Achievement recognition** through the badge modal system

#### Tier Distribution (Scalable)

- **Tiers 1-3:** Currently active (basic progression)
- **Tiers 4-6:** Advanced achievements (brilliant to transcendent)
- **Tiers 7-10:** Elite mastery (legendary to divine)
- **Future Expansion:** System ready for additional tiers as content grows

### 6. Integration with Learning System

#### Badge Earning Process

1. **Scenario Completion:** Meet minimum score requirements
2. **Reflection Submission:** Demonstrate required depth
3. **Peer Engagement:** Fulfill social learning expectations
4. **System Validation:** Automated and human review
5. **Badge Award:** Celebration and recognition
6. **Progress Update:** Unlock next level or related badges

### 6. Implementation Requirements

#### Badge Modal Integration

The badge system must work with the existing `badge-modal.js` implementation:

- **Structure:** Uses exact `badgeConfig` property names (categoryEmoji, sidekickEmoji,
  glowIntensity, title, quote, categoryName, timestamp)
- **Visual Effects:** Leverages `GLOW_INTENSITY_CLASSES` for tier-appropriate glow effects
- **Confetti System:** js-confetti animations scale with tier level, special finale for tier 3
- **Shield Design:** Emojis positioned strategically in the visual shield layout

#### Learning Analytics

- **Time to Badge:** Track learning velocity across 3 tiers
- **Engagement Patterns:** Understand progression through triangular requirements
- **Reflection Quality:** Assess depth of understanding at each tier
- **Achievement Celebration:** Visual feedback through glow and confetti systems

### 7. Quality Standards

#### Philosophical Authenticity

- Quotes must be accurately attributed and contextualized
- Titles should reflect meaningful philosophical progression
- Quotes should provide genuine insights relevant to AI ethics
- Category connections should be substantive, not superficial

#### Educational Value

- Badges should motivate continued learning within each category
- Requirements should build from introduction (1) to mastery (6 scenarios)
- Recognition should feel earned through the celebratory modal system
- Progression should align with philosophical depth expectations

#### Technical Implementation

- Badge objects must use the exact structure expected by `badge-modal.js`
- Visual elements must map to extended glow intensity classes (1-10)
- Confetti effects automatically scale with tier level, with special finale thresholds at tiers 3+,
  6+, and 9+
- Timestamp format must be ISO string for proper storage/display
- System designed for extensibility as content expands beyond current 3-tier implementation

## Output Format

When creating badge systems, provide:

1. **Scalable tier progression** for the category (currently 1, 3, 6 scenarios, extensible to full
   triangular progression)
2. **Philosophical quotes** with clear relevance to AI ethics and appropriate depth for tier
3. **Proper emoji selection** for categoryEmoji and sidekickEmoji that scale with achievement level
4. **Correct glowIntensity mapping** (1-10 for full progression, currently 1-3 active)
5. **Badge object structure** matching badgeConfig implementation
6. **Future-ready design** that accounts for potential expansion to higher tiers

## Quality Checklist

- [ ] Triangular progression structure (1, 3, 6, 10, 15, 21, 28, 36, 45, 55...) with current 3-tier
      implementation
- [ ] Meaningful philosophical quotes with AI ethics relevance appropriate to tier level
- [ ] Proper badgeConfig structure (categoryEmoji, sidekickEmoji, glowIntensity, title, quote,
      categoryName, timestamp)
- [ ] GlowIntensity values 1-10 mapping to progressive visual tier effects (currently 1-3 active)
- [ ] Clear categoryName matching the philosophical domain
- [ ] Motivational titles following "[Category] + [Tier]" pattern with escalating significance
- [ ] Sidekick emoji progression that reflects increasing mastery and achievement
- [ ] Future-proof design ready for content expansion
- [ ] Integration with extended confetti and glow effect systems
- [ ] Integration with existing badge modal and confetti systems
- [ ] Quality standards that maintain badge value and meaning

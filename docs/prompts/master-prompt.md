---
mode: 'agent'
model: Claude Sonnet 4
tools: ['githubRepo', 'codebase']
description:
  'Master prompt for SimulateAI content creation, including categories, scenarios, learning labs,
  and badge systems.'
---

# Master Prompt for SimulateAI Content Creation

## Overview

This master prompt coordinates the creation of comprehensive AI ethics educational content for
SimulateAI. Use this as your primary reference when creating categories, scenarios, learning labs,
and badge systems.

## System Architecture

### 1. Content Hierarchy

```
CATEGORY (Thematic Group)
├── Basic Properties (id, title, description, icon, difficulty, estimatedTime, color)
├── Scenarios (3-6 Individual Dilemmas)
│   ├── Structure: id, title, dilemma, ethicalQuestion, options[]
│   ├── Each Option: id, text, description, impact{}, pros[], cons[]
│   └── Impact Dimensions: 8 ethical axes (-2 to +2 scale)
├── Learning Objectives (Educational goals array)
├── Tags (Categorization array)
└── BADGE SYSTEM (10-Tier Triangular Progression)
    ├── Tier 1: 1 scenario   (Category-Unique Discovery Badges)
    ├── Tier 2: 3 scenarios  (Category-Unique Analysis Badges)
    ├── Tier 3: 6 scenarios  (Category-Unique Mastery Badges)
    ├── Tier 4: 10 scenarios (Category-Unique Wisdom Badges)
    ├── Tier 5: 15 scenarios (Category-Unique Teaching Badges)
    ├── Tier 6: 21 scenarios (Category-Unique Transcendent Badges)
    ├── Tier 7: 28 scenarios (Category-Unique Artistic Badges)
    ├── Tier 8: 36 scenarios (Category-Unique Legendary Badges)
    ├── Tier 9: 45 scenarios (Category-Unique Cosmic Badges)
    └── Tier 10: 55 scenarios (Category-Unique Divine Badges)
```

### 2. Key Data Structures

**Category Structure:**

- Uses `title` not `name`
- Contains `scenarios[]` array with basic scenario info
- Has `learningObjectives[]` and `tags[]` arrays
- No explicit philosophical domain mapping in structure

**Scenario Structure:**

- Simple `dilemma` and `ethicalQuestion` text fields (support typewriter display)
- Options use basic `option-a`, `option-b`, `option-c` IDs
- Impact system: 8 dimensions with -2 to +2 integer values (displayed via radar chart)
- Each option includes `pros[]` and `cons[]` arrays for detailed analysis
- Real-time radar chart updates based on selected option impacts
- All scenarios stored in separate files under `/data/scenarios/`

**Badge Structure:**

- Follows triangular number progression (1,3,6,10,15,21,28,36,45,55)
- Category-specific titles that combine domain metaphors with tier progression
- Each badge title is unique to both category AND tier (e.g., "Ethics Explorer", "Junction
  Strategist", "Consequence Architect")
- Extensible tier-based system managed by `badge-manager.js`
- Visual system uses 3 emojis: shield, category, sidekick (sidekick reflects badge title theme)
- Progress tracked via localStorage `simulateai_badge_progress`
- Current implementation: 10 tiers with configurable MAX_IMPLEMENTED_TIER
- Each badge has unique philosophical quotes that relate to both the domain and specific achievement

### 2. Philosophical Foundation

Every piece of content must map to our 10 philosophical domains:

1. **Ethical Dilemmas** - Moral conflicts in AI systems
2. **Philosophy of Mind & Reality** - Consciousness and artificial minds
3. **Metaphysical Puzzles** - Existence and nature of AI beings
4. **Epistemological Quandaries** - AI knowledge and understanding
5. **Identity & Continuity Paradoxes** - AI identity through change
6. **Logic & Paradoxical Reasoning** - Logical contradictions in AI
7. **Free Will vs Determinism** - AI agency and choice
8. **Scientific Ethics & Technological Dilemmas** - AI research ethics
9. **Theological & Existential Puzzles** - AI purpose and meaning
10. **Political & Social Justice Dilemmas** - AI fairness and equality

### 3. Storage and Progress System

**Progress Tracking:**

- Category progress: `localStorage` key `simulateai_category_progress`
- Badge progress: `localStorage` key `simulateai_badge_progress`
- Structure: `{categoryId: {scenarioId: boolean}}`
- Badge checking triggered on scenario completion via event system

**File Organization:**

- Categories: `/src/data/categories.js` (main category definitions)
- Scenarios: `/src/js/data/scenarios/[category]-scenarios.js`
- Impacts: `/src/js/data/scenario-impacts.js` (radar chart impact values)
- Badge Config: `/src/js/data/badge-config.js`

**Event System:**

- Scenario completion triggers badge checks via `BadgeManager`
- Uses existing analytics tracking with `AnalyticsManager`
- Modal system for badge celebrations matches existing UI patterns

### 4. Current System Categories (Reference Only)

Our existing 10 categories demonstrate proper implementation:

- `trolley-problem` → Ethical Dilemmas
- `ai-black-box` → Epistemological Quandaries
- `automation-oversight` → Free Will vs Determinism
- `consent-surveillance` → Political & Social Justice
- `moral-luck` → Ethical Dilemmas
- `responsibility-blame` → Ethical Dilemmas
- `ship-of-theseus` → Identity & Continuity Paradoxes
- `simulation-hypothesis` → Metaphysical Puzzles
- `experience-machine` → Theological & Existential Puzzles
- `sorites-paradox` → Logic & Paradoxical Reasoning

## Creation Workflow

### 1. Category Creation Process

1. **Identify AI Ethics Issue** - Current or emerging challenge
2. **Map to Philosophical Domain** - Primary + secondary domains
3. **Design Category Structure** - Name, description, difficulty
4. **Plan Scenario Progression** - 3-6 scenarios with increasing complexity
5. **Validate Against Framework** - Ensure philosophical consistency

### 2. Scenario Development Process

1. **Define Ethical Dilemma** - Genuine conflict with no easy answers
2. **Design Stakeholders** - 2-4 perspectives with legitimate concerns
3. **Create Decision Points** - Meaningful choices with real consequences
4. **Map to Ethical Frameworks** - Utilitarian, deontological, virtue ethics
5. **Connect to Real World** - Current AI implementations and challenges

### 3. Learning Lab Construction Process

1. **Preparation Phase** - Activate prior knowledge, introduce concepts
2. **Exploration Phase** - Engage with scenario, map stakeholders
3. **Analysis Phase** - Apply frameworks, map consequences
4. **Synthesis Phase** - Develop position, engage with peers
5. **Assessment Phase** - Demonstrate learning, reflect on growth

### 4. Badge System Design Process

1. **Level Progression** - Triangular numbers (1, 3, 6, 10, 15, 21, 28, 36, 45, 55)
2. **Category-Specific Titles** - Unique names combining domain metaphors with tier progression
3. **Philosophical Quotes** - Domain-relevant, tier-appropriate, inspiring, properly attributed
4. **Progressive Requirements** - Increasing standards and expectations per tier
5. **Visual Design** - Category emoji + tier-appropriate sidekick emoji, glow effects scale 1-10
6. **Community Integration** - Social recognition and engagement through unique achievements

## Quality Assurance Framework

### Content Standards

- **Philosophical Authenticity** - Accurate representation of concepts
- **Educational Effectiveness** - Clear learning objectives and outcomes
- **Real-World Relevance** - Connection to current AI challenges
- **Ethical Neutrality** - Multiple valid perspectives presented
- **Accessibility** - Appropriate for target audience

### Technical Requirements

- **Data Structure Consistency** - Follow established object schemas
- **Integration Compatibility** - Work with existing system architecture
- **Performance Optimization** - Reasonable load times and interactions
- **Accessibility Compliance** - Meet WCAG guidelines
- **Mobile Responsiveness** - Function across devices

### Assessment Criteria

- **Learning Outcomes** - Measurable skill and knowledge development
- **Engagement Metrics** - Time on task, completion rates, return visits
- **Community Feedback** - Peer and expert evaluation
- **Long-term Impact** - Transfer to real-world applications
- **System Analytics** - Data-driven continuous improvement

## Current AI Context (2025)

Consider these contemporary developments when creating content:

### Technical Advances

- Large language models and reasoning capabilities
- Multimodal AI systems (text, image, video, audio)
- Robotics and autonomous systems
- Brain-computer interfaces
- Quantum AI applications

### Ethical Challenges

- AI consciousness and sentience debates
- Deepfakes and synthetic media
- Algorithmic bias and fairness
- AI governance and regulation
- Environmental impact of AI systems
- Human-AI collaborative work
- AI rights and personhood discussions

### Societal Impact

- Economic disruption and job displacement
- Privacy and surveillance concerns
- Democratic participation and AI
- Educational transformation
- Healthcare AI applications
- Criminal justice AI systems

## Implementation Guidelines

### For New Categories

1. Use `category-creation-prompt.md` for detailed guidance
2. Ensure philosophical domain mapping
3. Design 3-6 progressive scenarios
4. Validate against existing category patterns

### For New Scenarios

1. Use `scenario-creation-prompt.md` for detailed guidance
2. Create genuine ethical dilemmas with engaging narratives
3. Include diverse stakeholder perspectives and detailed pros/cons
4. Connect to real-world AI applications and current challenges
5. Ensure impacts work effectively with radar chart visualization (-2 to +2 scale)

### For Learning Labs

1. Use `learning-lab-creation-prompt.md` for detailed guidance
2. Follow 5-phase educational structure
3. Include interactive and multimedia elements
4. Provide multiple learning pathways

### For Badge Systems

1. Use `badge-system-creation-prompt.md` for detailed guidance
2. Follow triangular progression (1, 3, 6, 10, 15, 21, 28, 36, 45, 55)
3. Include meaningful philosophical quotes
4. Design progressive requirements and celebrations with glow effects

## Success Metrics

### Educational Impact

- Users develop stronger ethical reasoning skills
- Increased confidence in handling AI ethics dilemmas
- Transfer of learning to real-world contexts
- Growth in philosophical thinking abilities

### Community Engagement

- Active participation in discussions and peer review
- High completion rates across scenarios and labs
- Positive feedback and recommendations
- User-generated content and contributions

### System Performance

- Consistent user progression through badge levels
- Balanced difficulty and accessibility
- Reliable technical performance
- Continuous improvement based on analytics

## Resources and References

### Prompt Files

- `category-creation-prompt.md` - Complete category development
- `scenario-creation-prompt.md` - Individual scenario design
- `learning-lab-creation-prompt.md` - 5-phase lab construction
- `badge-system-creation-prompt.md` - Progressive achievement system

### System Documentation

- `src/js/data/philosophical-taxonomy.js` - Philosophical framework
- `src/data/categories.js` - Existing category implementations
- `src/js/data/badge-config.js` - Badge system configuration
- `docs/` - Additional system documentation

### Quality Assurance

- Regular review against philosophical accuracy
- User testing and feedback integration
- Expert consultation on complex topics
- Continuous improvement based on learning analytics

Use this master prompt as your foundation, then refer to specific component prompts for detailed
implementation guidance.

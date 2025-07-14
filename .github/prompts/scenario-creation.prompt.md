---
mode: 'agent'
model: Claude Sonnet 4
tools: ['githubRepo', 'codebase']
description: 'Generate a new scenario within existing categories for SimulateAI'
---

# Scenario Creation Prompt for Copilot Agents

## Context

You are creating individual scenarios within existing categories for SimulateAI. Each scenario is an
interactive ethical dilemma that users experience to develop their AI ethics reasoning skills.

## Core Requirements

### 1. Scenario Structure

**IMPORTANT**: The following is a TEMPLATE structure. Replace all placeholder text with unique,
specific content:

```javascript
{
  id: 'scenario-identifier', // CUSTOMIZE: Usually 'category-specific-name'
  title: 'CUSTOMIZE: Descriptive Scenario Title',
  dilemma: 'CUSTOMIZE: Detailed narrative describing the ethical situation and context',
  ethicalQuestion: 'CUSTOMIZE: Core philosophical question that drives decision-making',
  options: [
    {
      id: 'option-a', // FIXED: Use simple identifiers: option-a, option-b, option-c
      text: 'CUSTOMIZE: Brief option title',
      description: 'CUSTOMIZE: Detailed explanation of this choice and its rationale',
      impact: {
        // 8 ethical dimensions, values from -2 to +2
        fairness: 0,        // Justice and equal treatment
        sustainability: 0,   // Long-term viability
        autonomy: 0,         // Individual agency and choice
        beneficence: 0,      // Doing good and preventing harm
        transparency: 0,     // Openness and explainability
        accountability: 0,   // Responsibility and oversight
        privacy: 0,          // Data protection and personal rights
        proportionality: 0   // Appropriate response to situation
      },
      pros: [
        'CUSTOMIZE: Positive consequence 1',
        'CUSTOMIZE: Positive consequence 2',
        'CUSTOMIZE: Positive consequence 3'
      ],
      cons: [
        'CUSTOMIZE: Negative consequence 1',
        'CUSTOMIZE: Negative consequence 2',
        'CUSTOMIZE: Negative consequence 3'
      ]
    }
    // CUSTOMIZE: Create 3-4 unique options total
  ]
}
```

### 2. Complexity Progression

#### Beginner Scenarios

- **Stakeholders:** 2-3 clear roles
- **Decision Points:** 1 main choice
- **Ethical Frameworks:** 1-2 frameworks
- **Time Constraint:** None or minimal
- **Consequences:** Direct and predictable
- **Real-World Connection:** Straightforward current applications

#### Intermediate Scenarios

- **Stakeholders:** 3-4 with competing interests
- **Decision Points:** 2 sequential choices
- **Ethical Frameworks:** 2-3 frameworks in tension
- **Time Constraint:** Moderate pressure
- **Consequences:** Some uncertainty and trade-offs
- **Real-World Connection:** Current complex implementations

#### Advanced Scenarios

- **Stakeholders:** 4+ with complex interdependencies
- **Decision Points:** 3+ with cascading effects
- **Ethical Frameworks:** 3+ in complex tension
- **Time Constraint:** High pressure or long-term implications
- **Consequences:** Emergent and uncertain outcomes
- **Real-World Connection:** Cutting-edge or future AI systems

### 3. Stakeholder Design

#### Essential Stakeholder Types

- **AI Developer/Engineer:** Technical perspective, innovation focus
- **End User/Individual:** Personal impact, autonomy concerns
- **Organization/Business:** Efficiency, liability, reputation
- **Society/Public:** Collective welfare, justice, equity
- **Regulator/Oversight:** Compliance, safety, standards
- **Ethicist/Expert:** Moral principles, long-term implications

#### Stakeholder Guidelines

- Each stakeholder must have clear, legitimate concerns
- Perspectives should conflict in meaningful ways
- Avoid caricatures or obvious villains
- Include diverse viewpoints and values
- Connect to real organizational roles

### 4. Choice Design

#### Choice Requirements

- **3-4 options** per decision point
- **Ethical basis** clearly identified
- **Realistic consequences** both positive and negative
- **Stakeholder impact** explicitly mapped
- **No obviously correct answer** - genuine dilemmas only

#### Ethical Impact System

Every option must include impact values for these 8 dimensions (used in radar chart):

1. **Fairness** (-2 to +2): Justice, equality, non-discrimination
2. **Sustainability** (-2 to +2): Long-term viability, environmental impact
3. **Autonomy** (-2 to +2): Individual agency, freedom of choice
4. **Beneficence** (-2 to +2): Doing good, preventing harm, maximizing benefit
5. **Transparency** (-2 to +2): Openness, explainability, understandability
6. **Accountability** (-2 to +2): Responsibility, oversight, answerability
7. **Privacy** (-2 to +2): Data protection, personal information security
8. **Proportionality** (-2 to +2): Appropriate response, balanced reaction

Values: -2 (strong negative), -1 (mild negative), 0 (neutral), +1 (mild positive), +2 (strong
positive)

#### Ethical Framework Integration

- **Utilitarian:** Greatest good for greatest number
- **Deontological:** Duty, rights, universal principles
- **Virtue Ethics:** Character, virtues, moral exemplars
- **Care Ethics:** Relationships, responsibility, context
- **Justice:** Fairness, equality, procedural ethics

### 5. Real-World Connection

#### Current AI Implementations (2025)

- Autonomous vehicles and transportation
- Medical AI and diagnostic systems
- Hiring and employment algorithms
- Content moderation and recommendation
- Financial services and credit scoring
- Criminal justice risk assessment
- Smart city and infrastructure management
- Personal AI assistants and companions

#### Emerging Areas

- AI consciousness and sentience
- Human-AI collaborative work
- AI-generated content and creativity
- Quantum AI applications
- Brain-computer interfaces
- AI governance and regulation
- Environmental impact of AI systems

### 6. Quality Standards

#### Content Quality

- Scenarios must be **plausible** and **relevant**
- Ethical dilemmas must be **genuine** - no easy answers
- **Multiple valid approaches** should exist
- **Consequences matter** - choices have meaningful impacts
- **Learning progression** - builds on previous scenarios

#### Educational Value

- Develops **ethical reasoning skills**
- Encourages **perspective-taking**
- Practices **consequential thinking**
- Applies **ethical frameworks**
- Connects **theory to practice**

### 7. Scenario Categories Integration

Each scenario must fit within our existing category framework:

- **Primary Domain:** Aligns with category's main philosophical focus
- **Secondary Domains:** Incorporates category's additional philosophical elements
- **Progressive Difficulty:** Scenarios 1-2 (beginner), 3-4 (intermediate), 5-6 (advanced)
- **Thematic Consistency:** All scenarios explore different aspects of the same core concept

## Implementation Integration

### 1. Scenario Modal Features

The scenario creation must account for these implementation features:

#### **Typewriter Effect**

- `dilemma` and `ethicalQuestion` text uses animated typewriter display
- Keep text concise but impactful for good visual effect
- Avoid excessive punctuation that may interfere with animation timing
- Text appears character by character when scenario opens

#### **Real-Time Radar Chart**

- Impact values automatically convert from (-2 to +2) to (1 to 5) scale for visualization
- Neutral score (0) maps to 3 on the radar chart (center position)
- Chart updates immediately when user selects an option
- Visual feedback helps users understand ethical trade-offs

#### **Progressive Option Display**

- Options are displayed as cards with hover effects
- `pros` and `cons` are revealed when option is selected
- Only one option can be selected at a time
- Selection triggers immediate radar chart update

### 2. Data Structure Validation

Ensure your scenario objects match the exact structure expected by `scenario-modal.js`:

```javascript
// ACTUAL STRUCTURE USED BY IMPLEMENTATION:
{
  id: 'scenario-identifier',
  title: 'Scenario Title',
  dilemma: 'Detailed narrative text...',
  ethicalQuestion: 'Core philosophical question...',
  options: [
    {
      id: 'option-a', // Must use this pattern: option-a, option-b, option-c
      text: 'Option title',
      description: 'Detailed explanation',
      impact: {
        // All 8 dimensions required with -2 to +2 values
        fairness: 0,
        sustainability: 0,
        autonomy: 0,
        beneficence: 0,
        transparency: 0,
        accountability: 0,
        privacy: 0,
        proportionality: 0
      },
      pros: ['Pro 1', 'Pro 2', 'Pro 3'], // Array of strings
      cons: ['Con 1', 'Con 2', 'Con 3']  // Array of strings
    }
  ]
}
```

#### **Critical Requirements:**

- ✅ All 8 impact dimensions must be present with numeric values
- ✅ Option IDs must follow 'option-a', 'option-b', 'option-c' pattern
- ✅ `pros` and `cons` must be arrays of strings, not objects
- ✅ Impact values must be integers between -2 and +2 (inclusive)
- ✅ Each option should have 3-4 pros and cons for balanced evaluation

### 3. Radar Chart Impact Guidelines

#### **Visual Effectiveness**

When designing impact values, consider how they will appear on the radar chart:

- **Balanced Profiles:** Options should have different "shapes" on the radar
- **Trade-offs:** High positive in one area often means negative in another
- **Neutral Impact:** Use 0 when the option doesn't significantly affect a dimension
- **Extreme Values:** Reserve ±2 for major positive/negative impacts only
- **Complementary Options:** Each choice should excel in different ethical dimensions

#### **Impact Value Meanings**

- **+2:** Major positive impact on this ethical dimension
- **+1:** Moderate positive impact
- **0:** Neutral/no significant impact
- **-1:** Moderate negative impact
- **-2:** Major negative impact

### 4. Content Optimization for Modal Display

#### **Text Length Guidelines**

- **Scenario Title:** 3-8 words for clear header display
- **Dilemma:** 2-4 sentences for effective typewriter animation
- **Ethical Question:** 1-2 sentences, ending with question mark
- **Option Text:** 3-6 words for card title
- **Option Description:** 1-2 sentences explaining the approach
- **Pros/Cons:** Brief phrases, not full sentences

#### **Responsive Design Considerations**

- Content must work on mobile and desktop layouts
- Radar chart requires sufficient space for 8-axis labeling
- Option cards stack vertically on smaller screens
- Modal maintains readability across device sizes

## Output Format

When creating scenarios, provide:

1. **Philosophical connection** to category domain
2. **Complete scenario object** following exact structure requirements
3. **Educational rationale** for choices and consequences
4. **Real-world examples** that inspired the scenario
5. **Assessment guidance** for measuring learning outcomes
6. **Radar chart impact explanation** showing how values create meaningful visual patterns

## Quality Checklist

### Content Quality

- [ ] Genuine ethical dilemma with no clear right answer
- [ ] Multiple stakeholders with legitimate, conflicting concerns
- [ ] Realistic consequences for each choice
- [ ] Clear connection to philosophical domain
- [ ] Appropriate complexity for target difficulty level
- [ ] Current AI relevance and real-world grounding
- [ ] Educational value for developing ethical reasoning

### Implementation Compliance

- [ ] All 8 impact dimensions present with values between -2 and +2
- [ ] Option IDs follow exact pattern: 'option-a', 'option-b', 'option-c'
- [ ] `pros` and `cons` are arrays of strings (3-4 items each)
- [ ] `dilemma` and `ethicalQuestion` text suitable for typewriter effect
- [ ] Impact values create meaningful radar chart patterns
- [ ] Structure matches exactly what `scenario-modal.js` expects
- [ ] No missing required fields in scenario object
- [ ] Text lengths appropriate for modal display dimensions
- [ ] Options have distinct visual radar "fingerprints"
- [ ] Trade-offs between ethical dimensions are clear and meaningful

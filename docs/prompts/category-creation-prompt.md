---
mode: 'agent'
model: Claude Sonnet 4
tools: ['githubRepo', 'codebase']
description:
  'Generate a new category for SimulateAI that aligns with our philosophical taxonomy and addresses
  current AI ethics challenges.'
---

# Category Creation Prompt for Copilot Agents

## Context

You are helping to create new AI ethics categories for SimulateAI, an educational platform that
teaches AI ethics through interactive scenarios. Every category must align with our established
philosophical taxonomy framework.

## Core Requirements

### 1. Philosophical Foundation

- **MUST map to one primary philosophical domain** from our 10 established domains:
  - Ethical Dilemmas
  - Philosophy of Mind & Reality
  - Metaphysical Puzzles
  - Epistemological Quandaries
  - Identity & Continuity Paradoxes
  - Logic & Paradoxical Reasoning
  - Free Will vs Determinism
  - Scientific Ethics & Technological Dilemmas
  - Theological & Existential Puzzles
  - Political & Social Justice Dilemmas

- **MUST include 1-3 secondary domains** for philosophical depth
- **MUST include meaningful AI context** that connects to real-world AI challenges

### 2. Category Structure

**IMPORTANT**: The following is a TEMPLATE structure. Replace all placeholder text with unique,
specific content:

```javascript
{
  id: 'CUSTOMIZE: Category-id', // e.g., 'ai-consciousness-debate'
  title: 'CUSTOMIZE: Human-Readable Category Title', // Note: use 'title' not 'name'
  description: 'CUSTOMIZE: Clear description of the ethical domain',
  icon: 'CUSTOMIZE: Relevant emoji', // e.g., '🤖', '⚖️', '🧠'
  difficulty: 'CHOOSE: beginner|intermediate|advanced',
  estimatedTime: 'CUSTOMIZE: Specific number', // Minutes for complete experience (e.g., 25, 30, 35)
  color: 'CUSTOMIZE: #hex-color', // Consistent with philosophical domain
  scenarios: [
    // CUSTOMIZE: Array of 3-6 scenarios with increasing complexity
    {
      id: 'CUSTOMIZE: scenario-identifier',
      title: 'CUSTOMIZE: Scenario Title',
      description: 'CUSTOMIZE: Brief scenario description',
      difficulty: 'CHOOSE: beginner|intermediate|advanced'
    }
    // Add more scenarios as needed
  ],
  learningObjectives: [
    // CUSTOMIZE: Array of educational goals
    'CUSTOMIZE: Specific learning objective 1',
    'CUSTOMIZE: Specific learning objective 2'
    // Add more objectives as needed
  ],
  tags: [
    // CUSTOMIZE: Array of relevant tags for categorization
    'CUSTOMIZE: tag1', 'CUSTOMIZE: tag2', 'CUSTOMIZE: tag3'
    // Use actual tags like 'consciousness', 'rights', 'personhood'
  ]
}
```

### 3. Content Guidelines

#### Category Naming

- Use clear, descriptive names that indicate the philosophical concept
- Avoid technical jargon unless it's widely understood
- Connect to recognizable philosophical problems or contemporary AI issues

#### Difficulty Levels

- **Beginner:** Single stakeholder, clear right/wrong, basic concepts
- **Intermediate:** Multiple stakeholders, competing values, nuanced choices
- **Advanced:** Complex systems, emergent behaviors, long-term consequences

#### AI Relevance

- Every category must address current or near-future AI challenges
- Connect philosophical concepts to practical AI implementation
- Include real-world examples from recent AI developments

### 4. Existing Categories for Reference

Our current 10 categories provide examples of proper structure:

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

### 5. Quality Checklist

Before creating a category, verify:

- [ ] Maps to established philosophical domain
- [ ] Addresses current AI/robotics challenges
- [ ] Has clear educational objectives
- [ ] Provides progressive difficulty
- [ ] Includes meaningful stakeholder perspectives
- [ ] Connects to real-world applications
- [ ] Maintains philosophical depth

### 6. Current AI Context (2025)

Consider these contemporary AI developments:

- Large language model governance
- AI consciousness and sentience debates
- Autonomous systems in critical infrastructure
- AI-generated content and authenticity
- Quantum AI implications
- AI environmental impact
- Human-AI collaborative work
- AI rights and personhood discussions

## Output Format

When creating a category, provide:

1. **Philosophical justification** for domain mapping
2. **Complete category object** following our structure
3. **Brief explanation** of AI relevance
4. **Educational rationale** for chosen scenarios

## Example Creation Process

1. Identify emerging AI ethics issue
2. Map to primary philosophical domain
3. Determine secondary domains for depth
4. Design scenario progression
5. Validate against quality checklist
6. Document philosophical connections

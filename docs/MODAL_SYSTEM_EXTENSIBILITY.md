# Modal System Modularity & Extensibility Assessment

## Executive Summary

The SimulateAI platform features a **highly modular and extensible modal system** that makes creating new scenarios and learning labs straightforward. The architecture follows clean separation of concerns with reusable components, standardized data structures, and flexible configuration options.

**Bottom Line: Creating new scenarios and learning labs is easy and well-structured.**

---

## Architecture Overview

### Core Components

1. **`ModalUtility`** - Base modal framework with consistent behavior
2. **`PreLaunchModal`** - Learning lab modal for educational context
3. **`ScenarioModal`** - Interactive scenario presentation with radar charts
4. **`ScenarioDataManager`** - Dynamic data loading and caching

### Data Structure Hierarchy

```
CATEGORY → SCENARIO → SIMULATION
├── Category (thematic group, e.g., "The Trolley Problem")
├── Scenario (individual dilemma, e.g., "Autonomous Vehicle Split Decision")
└── Simulation (interactive experience with the scenario)
```

---

## Modular Design Strengths

### 1. Reusable Base Infrastructure

**`ModalUtility` provides:**
- Consistent modal behavior (open/close, backdrop, keyboard navigation)
- Accessibility features (ARIA labels, focus management, inert states)
- Responsive design support
- Event handling standardization

**Benefits:**
- All modals behave consistently
- Accessibility is built-in
- Minimal boilerplate for new modal types

### 2. Standardized Data Structures

**Categories are defined in `src/data/categories.js`:**
```javascript
{
  id: 'category-name',
  title: 'Display Name',
  description: 'Category description',
  icon: '🚃',
  scenarios: [
    {
      id: 'scenario-id',
      title: 'Scenario Title',
      description: 'Scenario description',
      difficulty: 'beginner|intermediate|advanced'
    }
  ],
  learningObjectives: [...],
  tags: [...]
}
```

**Scenarios are stored in `src/js/data/scenarios/[category]-scenarios.js`:**
```javascript
{
  'scenario-id': {
    title: 'Scenario Title',
    dilemma: 'The main ethical dilemma description',
    ethicalQuestion: 'Central question to consider',
    options: [
      {
        id: 'option-a',
        text: 'Option name',
        description: 'Detailed description',
        impact: { fairness: +1, autonomy: -1, ... },
        pros: [...],
        cons: [...]
      }
    ]
  }
}
```

### 3. Flexible Content Generation

**`PreLaunchModal` automatically generates:**
- Overview tab with scenario briefing
- Learning objectives aligned with ISTE standards
- Ethics guide with vocabulary and concepts
- Preparation tips and resource links
- Educator resources (when enabled)

**Configuration options:**
```javascript
const modal = new PreLaunchModal(simulationId, {
  onLaunch: () => { /* launch simulation */ },
  onCancel: () => { /* cancel action */ },
  showEducatorResources: true,
  categoryData: categoryInfo,
  scenarioData: scenarioInfo
});
```

---

## Creating New Scenarios: Step-by-Step Guide

### Step 1: Add Category Definition

**File:** `src/data/categories.js`

```javascript
'new-category': {
  id: 'new-category',
  title: 'New Ethical Category',
  description: 'Description of the ethical themes',
  icon: '🎯',
  difficulty: 'beginner',
  estimatedTime: 15,
  color: '#3498db',
  scenarios: [
    {
      id: 'first-scenario',
      title: 'First Scenario Title',
      description: 'Brief scenario description',
      difficulty: 'beginner'
    }
    // Add 2-3 scenarios per category
  ],
  learningObjectives: [
    'Objective 1',
    'Objective 2'
  ],
  tags: ['ethics', 'relevant-tags']
}
```

### Step 2: Create Scenario Data File

**File:** `src/js/data/scenarios/new-category-scenarios.js`

```javascript
export default {
  'first-scenario': {
    title: 'First Scenario Title',
    dilemma: 'Detailed description of the ethical dilemma...',
    ethicalQuestion: 'What is the central ethical question?',
    options: [
      {
        id: 'option-a',
        text: 'First Option',
        description: 'Detailed explanation of this choice',
        impact: {
          fairness: +1,        // -2 to +2 scale
          sustainability: 0,
          autonomy: -1,
          beneficence: +2,
          transparency: +1,
          accountability: 0,
          privacy: +1,
          proportionality: -1
        },
        pros: [
          'Positive aspect 1',
          'Positive aspect 2'
        ],
        cons: [
          'Negative consequence 1',
          'Potential problem'
        ]
      },
      {
        id: 'option-b',
        text: 'Second Option',
        // ... similar structure
      }
    ]
  }
};
```

### Step 3: Register Scenario Data

**File:** `src/js/data/scenario-data-manager.js`

Add import and registration:
```javascript
import newCategoryScenarios from './scenarios/new-category-scenarios.js';

// Add to SCENARIO_MODULES
const SCENARIO_MODULES = {
  'new-category': () => newCategoryScenarios,
  // ... existing categories
};
```

### Step 4: Add Learning Lab Information (Optional)

**File:** `src/js/data/simulation-info.js`

```javascript
export const SIMULATION_INFO = {
  'new-scenario-id': {
    id: 'new-scenario-id',
    title: 'Scenario Display Title',
    subtitle: 'Brief subtitle',
    learningObjectives: [...],
    isteCriteria: [...],
    duration: '15-20 minutes',
    difficulty: 'beginner',
    recommendedAge: '13+',
    beforeYouStart: {
      briefing: 'Pre-launch educational context...',
      vocabulary: [...],
      preparationTips: [...],
      scenarioOverview: 'What students will experience'
    },
    educatorResources: {
      discussionQuestions: [...],
      assessmentRubric: {...}
    }
  }
};
```

---

## Creating New Scenarios in Existing Categories

Adding scenarios to existing categories is **even easier** than creating new categories since the infrastructure is already in place. You only need to add scenario data and optionally create learning lab content.

### Step 1: Add Scenario to Category Definition

**File:** `src/data/categories.js`

Find the existing category and add your scenario to its `scenarios` array:

```javascript
'trolley-problem': {
  // ...existing category properties...
  scenarios: [
    // ...existing scenarios...
    {
      id: 'new-trolley-scenario',
      title: 'AI Emergency Response Dilemma',
      description: 'An AI emergency dispatch system must prioritize between multiple simultaneous crises with limited resources.',
      difficulty: 'intermediate'
    }
  ],
  // ...rest of category...
}
```

### Step 2: Add Scenario Data to Existing File

**File:** `src/js/data/scenarios/[category]-scenarios.js`

Add your new scenario to the existing scenario file:

```javascript
export default {
  // ...existing scenarios...
  
  'new-trolley-scenario': {
    title: 'AI Emergency Response Dilemma',
    dilemma: 'An AI-powered emergency dispatch system receives simultaneous calls: a cardiac arrest at a nursing home, a multi-car accident on the highway, and a house fire with trapped children. Only two ambulances are available, and response time will determine survival rates.',
    ethicalQuestion: 'How should an AI system prioritize emergency responses when every second counts and lives hang in the balance?',
    options: [
      {
        id: 'option-a',
        text: 'Prioritize by Statistical Survival Rates',
        description: 'Send resources based on AI calculations of highest probability of saving the most lives.',
        impact: {
          fairness: -1,
          sustainability: +1,
          autonomy: +2,
          beneficence: +2,
          transparency: +1,
          accountability: 0,
          privacy: 0,
          proportionality: +1
        },
        pros: [
          'Maximizes total lives saved based on data',
          'Removes emotional bias from critical decisions',
          'Consistent application of objective criteria'
        ],
        cons: [
          'May systematically disadvantage certain demographics',
          'Ignores individual circumstances not captured in data',
          'Could feel cold and impersonal to affected families'
        ]
      },
      {
        id: 'option-b',
        text: 'First-Come, First-Served Approach',
        description: 'Dispatch resources in the order that emergency calls were received.',
        impact: {
          fairness: +2,
          sustainability: -1,
          autonomy: -1,
          beneficence: -1,
          transparency: +2,
          accountability: +1,
          privacy: 0,
          proportionality: 0
        },
        pros: [
          'Treats all emergencies equally regardless of demographics',
          'Simple, transparent, and easy to understand system',
          'Prevents discrimination based on AI bias'
        ],
        cons: [
          'May result in more preventable deaths overall',
          'Ignores severity and urgency differences',
          'Wastes AI capabilities for optimization'
        ]
      },
      {
        id: 'option-c',
        text: 'Hybrid Human-AI Decision Making',
        description: 'AI provides recommendations but human dispatchers make final decisions with override capability.',
        impact: {
          fairness: +1,
          sustainability: 0,
          autonomy: 0,
          beneficence: +1,
          transparency: +1,
          accountability: +2,
          privacy: 0,
          proportionality: +1
        },
        pros: [
          'Combines AI efficiency with human judgment',
          'Allows for context that AI might miss',
          'Maintains human responsibility and accountability'
        ],
        cons: [
          'Slower decision-making in critical moments',
          'Inconsistent application depending on dispatcher',
          'May introduce human biases and errors'
        ]
      }
    ]
  }
};
```

### Step 3: Create Learning Lab Content (Optional)

**File:** `src/js/data/simulation-info.js`

Add educational context for your new scenario:

```javascript
export const SIMULATION_INFO = {
  // ...existing scenarios...
  
  'new-trolley-scenario': {
    id: 'new-trolley-scenario',
    title: 'AI Emergency Response Dilemma',
    subtitle: 'Explore how AI systems should prioritize life-and-death decisions',
    
    learningObjectives: [
      'Analyze how algorithmic decision-making applies to emergency situations',
      'Explore the tension between efficiency and fairness in AI systems',
      'Understand the role of human oversight in critical AI applications',
      'Examine how statistical optimization might conflict with individual equity'
    ],
    
    isteCriteria: [
      'Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior',
      'Knowledge Constructor 1.3.1: Plan and employ effective research strategies',
      'Computational Thinker 1.5.2: Collect data and identify patterns to make predictions',
      'Computational Thinker 1.5.3: Break problems into component parts'
    ],
    
    duration: '15-20 minutes',
    difficulty: 'intermediate',
    recommendedAge: '14+',
    prerequisites: [
      'Understanding of emergency response systems',
      'Basic knowledge of AI decision-making processes',
      'Familiarity with ethical reasoning concepts'
    ],
    
    beforeYouStart: {
      briefing: `In this scenario, you'll step into the role of designing an AI emergency dispatch system. You'll face the challenging task of programming how an AI should make split-second decisions when multiple lives hang in the balance and resources are limited.
      
      This scenario builds on the classic trolley problem by adding real-world complexity: multiple simultaneous emergencies, statistical uncertainty, and the pressure of time-critical decisions. You'll explore how different approaches to AI decision-making can lead to vastly different outcomes.`,
      
      vocabulary: [
        {
          term: 'Triage',
          definition: 'The process of determining the priority of patients based on severity of their condition'
        },
        {
          term: 'Statistical Optimization',
          definition: 'Using data and algorithms to achieve the best possible outcomes based on probabilities'
        },
        {
          term: 'Algorithmic Bias',
          definition: 'Systematic errors in AI systems that create unfair outcomes for certain groups'
        },
        {
          term: 'Human-in-the-Loop',
          definition: 'AI systems that include human oversight and intervention capabilities'
        }
      ],
      
      preparationTips: [
        'Consider how different ethical frameworks apply to emergency situations',
        'Think about the trade-offs between speed and fairness in decision-making',
        'Reflect on who should be accountable for AI decisions in life-or-death situations',
        'Consider how statistical models might not capture all relevant factors'
      ],
      
      scenarioOverview: 'You will design decision-making protocols for an AI emergency dispatch system, choosing how it should prioritize between multiple simultaneous emergencies when resources are limited.'
    },
    
    educatorResources: {
      discussionQuestions: [
        'How do the principles of the trolley problem apply to real-world emergency response?',
        'What factors should an AI consider when making life-and-death decisions?',
        'How can we balance algorithmic efficiency with human oversight in critical systems?',
        'What are the ethical implications of using statistical models for individual emergency decisions?',
        'How might different communities be affected by various AI decision-making approaches?'
      ],
      
      assessmentRubric: {
        'Ethical Reasoning': [
          'Novice: Focuses only on immediate outcomes without considering broader implications',
          'Developing: Shows awareness of competing values but struggles to balance them',
          'Proficient: Demonstrates understanding of multiple ethical frameworks and their applications',
          'Advanced: Articulates complex trade-offs and provides nuanced justification for decisions'
        ],
        'Systems Thinking': [
          'Novice: Views each emergency as an isolated incident',
          'Developing: Recognizes connections between decisions but analysis is limited',
          'Proficient: Understands how AI decisions affect multiple stakeholders and systems',
          'Advanced: Considers long-term implications and systemic effects of AI emergency protocols'
        ]
      },
      
      extendedActivities: [
        'Research real emergency dispatch systems and how they currently prioritize calls',
        'Interview local emergency responders about decision-making under pressure',
        'Design alternative AI algorithms for emergency response prioritization',
        'Debate the ethics of using AI in life-and-death situations'
      ]
    }
  }
};
```

### Step 4: That's It! 🎉

Your new scenario is now:
- ✅ Automatically available in the category grid
- ✅ Accessible through navigation menus
- ✅ Integrated with the modal system
- ✅ Ready with learning lab content (if you added it)
- ✅ Compatible with all existing features (radar charts, accessibility, etc.)

### Key Benefits of Adding to Existing Categories:

1. **No Infrastructure Setup** - Category colors, icons, navigation already exist
2. **Automatic Integration** - Scenarios appear in UI immediately
3. **Consistent Theming** - Inherits the category's visual design
4. **Shared Learning Context** - Benefits from category's learning objectives and themes
5. **Minimal Code Changes** - Only need to add data, no structural changes

### Example: Quick Scenario Addition

For a minimal new scenario, you only need:

```javascript
// In categories.js - add to scenarios array (3 lines)
{
  id: 'quick-scenario',
  title: 'Quick Ethical Dilemma',
  difficulty: 'beginner'
}

// In [category]-scenarios.js - add scenario object (20-30 lines)
'quick-scenario': {
  title: 'Quick Ethical Dilemma',
  dilemma: '...',
  ethicalQuestion: '...',
  options: [/* 2-3 options with impacts */]
}
```

The scenario is immediately available platform-wide with full functionality!

---

## Integration Points

### 1. Navigation Integration

Categories automatically appear in:
- Homepage category grid
- Mega menu navigation (desktop)
- Mobile dropdown menu

### 2. Scenario Loading

The `ScenarioDataManager` automatically:
- Loads scenario data on demand
- Caches scenarios for performance
- Handles error states gracefully

### 3. Modal Lifecycle

All modals follow consistent patterns:
- Pre-launch modal → Scenario modal → Post-simulation modal
- Automatic cleanup and memory management
- Consistent keyboard and accessibility behavior

---

## Best Practices for Extension

### 1. Data Structure Consistency

- Follow the established impact scoring system (-2 to +2)
- Include pros/cons for each option
- Maintain consistent difficulty levels
- Use descriptive IDs and titles

### 2. Educational Alignment

- Align learning objectives with ISTE standards
- Provide age-appropriate content
- Include vocabulary definitions
- Offer educator resources

### 3. Accessibility

- All new modals inherit accessibility features
- Use semantic HTML structures
- Provide clear navigation and focus management
- Test with screen readers

### 4. Performance

- Lazy-load scenario data
- Use consistent file naming conventions
- Keep scenario files focused and modular
- Cache frequently accessed data

---

## Recommended Extensions

### 1. Category-Specific Learning Paths

```javascript
// Add to category definition
learningPath: {
  prerequisites: ['basic-ethics'],
  nextSteps: ['advanced-ai-ethics'],
  relatedCategories: ['bias-fairness', 'transparency-trust']
}
```

### 2. Interactive Tutorials

```javascript
// Extend PreLaunchModal for guided experiences
tutorialMode: {
  enabled: true,
  steps: [
    { target: '.radar-chart', content: 'This shows ethical impact...' },
    { target: '.options', content: 'Choose your approach...' }
  ]
}
```

### 3. Assessment Integration

```javascript
// Add assessment tracking
assessmentCriteria: {
  ethicalReasoning: 'weight-multiple-perspectives',
  systemsThinking: 'consider-stakeholder-impacts',
  criticalAnalysis: 'evaluate-trade-offs'
}
```

---

## Conclusion

The SimulateAI modal system is **highly extensible and developer-friendly**. The modular architecture, standardized data structures, and reusable components make it easy to:

✅ **Add new categories** with 3-5 lines of configuration  
✅ **Create scenarios** using standardized templates  
✅ **Build learning labs** with automatic content generation  
✅ **Customize experiences** while maintaining consistency  
✅ **Maintain accessibility** through inherited features  

The system is ready for rapid expansion and can easily accommodate new educational requirements, assessment criteria, and interactive features.

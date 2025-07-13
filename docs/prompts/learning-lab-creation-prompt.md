# Learning Lab Creation Prompt for Copilot Agents

## Context

You are creating comprehensive learning labs for SimulateAI scenarios. Learning labs are 5-phase
interactive educational experiences that guide users through deep exploration of AI ethics concepts.

## Core Requirements

### 1. Complete Learning Lab Structure

Learning labs consist of **two main components**:

#### A. Pre-Launch Modal Content (6 Tabs)

Educational context and preparation before scenario launch:

1. **Overview Tab** - Scenario introduction and meta information
2. **Learning Goals Tab** - Objectives and standards alignment
3. **Ethics Guide Tab** - Radar chart explanation and ethical dimensions
4. **Get Ready Tab** - Vocabulary, preparation tips, and briefing
5. **Resources Tab** - Related materials and external links
6. **For Educators Tab** - Teaching guides and classroom resources (optional)

#### B. Interactive Learning Experience (5 Phases)

The actual scenario-based learning progression:

1. **Preparation Phase (5-10 minutes)**
2. **Exploration Phase (10-15 minutes)**
3. **Analysis Phase (15-25 minutes)**
4. **Synthesis Phase (10-20 minutes)**
5. **Assessment Phase (5-15 minutes)**

### 2. Learning Lab Structure

**IMPORTANT**: The following is a TEMPLATE structure. Customize all content marked as "CUSTOMIZE":

```javascript
{
  scenarioId: 'category-scenario-id',
  title: 'CUSTOMIZE: Learning Lab: [Specific Scenario Title]',
  totalDuration: 'CUSTOMIZE: Specific duration (e.g., "50 minutes", "1 hour 15 minutes")', // Match existing system format

  // Pre-Launch Modal Content (matches pre-launch-modal.js structure)
  preLaunchContent: {
    // Overview Tab Content
    overview: {
      title: 'CUSTOMIZE: Scenario title',
      subtitle: 'CUSTOMIZE: Category - Brief description',
      duration: 'CUSTOMIZE: Specific time estimate',
      difficulty: 'CHOOSE: beginner|intermediate|advanced',
      recommendedAge: 'CUSTOMIZE: Age range (e.g., "13+")',
      briefing: 'CUSTOMIZE: Multi-paragraph explanation of what students will explore',
      scenarioOverview: 'CUSTOMIZE: Specific scenario description',
      contentNotes: ['CUSTOMIZE: Important note 1', 'CUSTOMIZE: Important note 2'] // Educational warnings or context
    },

    // Learning Goals Tab Content
    learningObjectives: [
      'CUSTOMIZE: Specific learning objective 1 (use action verbs)',
      'CUSTOMIZE: Specific learning objective 2',
      'CUSTOMIZE: Specific learning objective 3'
      // 3-5 objectives recommended
    ],
    isteCriteria: [
      'CUSTOMIZE: ISTE Standard 1 with specific number (e.g., "Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior")',
      'CUSTOMIZE: ISTE Standard 2',
      'CUSTOMIZE: ISTE Standard 3'
      // 3-4 ISTE standards recommended
    ],
    prerequisites: [
      'CUSTOMIZE: Required knowledge/skill 1',
      'CUSTOMIZE: Required knowledge/skill 2'
      // Optional - only if specific knowledge needed
    ],

    // Ethics Guide Tab Content (matches radar chart system)
    ethicsGuide: {
      radarExplanation: 'CUSTOMIZE: Explanation of how the radar chart works in this context',
      ethicalDimensions: [
        // All 8 dimensions must be included with context-specific descriptions
        {
          name: 'Fairness',
          color: '#3498db',
          description: 'CUSTOMIZE: How fairness applies to this specific scenario context'
        },
        {
          name: 'Sustainability',
          color: '#27ae60',
          description: 'CUSTOMIZE: How sustainability applies to this scenario'
        },
        {
          name: 'Autonomy',
          color: '#9b59b6',
          description: 'CUSTOMIZE: How autonomy applies to this scenario'
        },
        {
          name: 'Beneficence',
          color: '#e74c3c',
          description: 'CUSTOMIZE: How beneficence applies to this scenario'
        },
        {
          name: 'Transparency',
          color: '#f39c12',
          description: 'CUSTOMIZE: How transparency applies to this scenario'
        },
        {
          name: 'Accountability',
          color: '#34495e',
          description: 'CUSTOMIZE: How accountability applies to this scenario'
        },
        {
          name: 'Privacy',
          color: '#e67e22',
          description: 'CUSTOMIZE: How privacy applies to this scenario'
        },
        {
          name: 'Proportionality',
          color: '#1abc9c',
          description: 'CUSTOMIZE: How proportionality applies to this scenario'
        }
      ],
      interpretationGuide: 'CUSTOMIZE: Guidance on how to interpret radar chart results for this scenario'
    },

    // Get Ready Tab Content
    preparation: {
      vocabulary: [
        {
          term: 'CUSTOMIZE: Key term 1',
          definition: 'CUSTOMIZE: Clear, accessible definition with AI context'
        },
        {
          term: 'CUSTOMIZE: Key term 2',
          definition: 'CUSTOMIZE: Clear, accessible definition'
        }
        // 5-8 terms maximum
      ],
      preparationTips: [
        'CUSTOMIZE: Practical tip for approaching this scenario',
        'CUSTOMIZE: Mindset or perspective tip',
        'CUSTOMIZE: Strategy for decision-making'
        // 4-6 tips recommended
      ]
    },

    // Resources Tab Content
    resources: [
      {
        type: 'CHOOSE: article|video|interactive|website',
        title: 'CUSTOMIZE: Resource title',
        description: 'CUSTOMIZE: Brief description of resource content',
        url: 'CUSTOMIZE: Actual URL or # for placeholder',
        audience: 'CHOOSE: general|students|educators|advanced'
      }
      // 3-5 resources recommended
    ],

    // For Educators Tab Content (optional)
    educatorResources: {
      discussionQuestions: [
        'CUSTOMIZE: Open-ended question about scenario ethics',
        'CUSTOMIZE: Question connecting to real-world applications',
        'CUSTOMIZE: Question about stakeholder perspectives'
        // 4-6 questions recommended
      ],
      extensionActivities: [
        'CUSTOMIZE: Activity extending the scenario learning',
        'CUSTOMIZE: Research or investigation activity',
        'CUSTOMIZE: Creative application activity'
        // 3-5 activities recommended
      ],
      classroomTips: [
        'CUSTOMIZE: Practical teaching advice for this scenario',
        'CUSTOMIZE: Common student challenges and solutions',
        'CUSTOMIZE: Facilitation guidance'
        // 3-5 tips recommended
      ],
      relatedStandards: [
        'CUSTOMIZE: CSTA or other relevant standards',
        'CUSTOMIZE: Cross-curricular connections'
        // Educational standards alignment
      ]
    }
  },

  // Lab Components (based on digital-science-lab.js structure)
  labStations: [
    {
      name: 'CUSTOMIZE: Station Name (e.g., "Bias Analysis Station")',
      purpose: 'CUSTOMIZE: Specific investigation purpose',
      tools: ['CUSTOMIZE: Tool 1', 'CUSTOMIZE: Tool 2'], // e.g., ['Ethics Framework Simulator', 'Stakeholder Impact Visualizer']
      experiments: ['CUSTOMIZE: experiment-id-1', 'CUSTOMIZE: experiment-id-2'], // e.g., ['scenario-analysis', 'stakeholder-mapping']
      learningOutcomes: ['CUSTOMIZE: Outcome 1', 'CUSTOMIZE: Outcome 2'] // e.g., ['Apply ethical frameworks', 'Analyze stakeholder perspectives']
    }
  ],

  // Learning Activities (follows existing patterns)
  activities: {
    preparation: {
      duration: 'CUSTOMIZE: Specific time (e.g., "8 minutes")',
      components: ['CUSTOMIZE: Component 1', 'CUSTOMIZE: Component 2', 'CUSTOMIZE: Component 3'] // e.g., ['reading materials', 'vocabulary prep', 'prior knowledge check']
    },
    exploration: {
      duration: 'CUSTOMIZE: Specific time (e.g., "12 minutes")',
      components: ['CUSTOMIZE: Component 1', 'CUSTOMIZE: Component 2', 'CUSTOMIZE: Component 3'] // e.g., ['scenario introduction', 'stakeholder mapping', 'initial reactions']
    },
    analysis: {
      duration: 'CUSTOMIZE: Specific time (e.g., "20 minutes")',
      components: ['CUSTOMIZE: Component 1', 'CUSTOMIZE: Component 2', 'CUSTOMIZE: Component 3'] // e.g., ['ethical framework application', 'consequence mapping', 'value conflict analysis']
    },
    synthesis: {
      duration: 'CUSTOMIZE: Specific time (e.g., "15 minutes")',
      components: ['CUSTOMIZE: Component 1', 'CUSTOMIZE: Component 2', 'CUSTOMIZE: Component 3'] // e.g., ['position development', 'peer discussion', 'consensus building']
    },
    assessment: {
      duration: 'CUSTOMIZE: Specific time (e.g., "10 minutes")',
      components: ['CUSTOMIZE: Component 1', 'CUSTOMIZE: Component 2', 'CUSTOMIZE: Component 3'] // e.g., ['reflection questions', 'knowledge check', 'action planning']
    }
  },

  // Assessment rubric based on existing analytics patterns
  assessmentWeights: {
    understanding: 0.3,      // FIXED: From LAB_CONSTANTS.ASSESSMENT_WEIGHTS
    criticalThinking: 0.25,  // FIXED: Standard weights
    collaboration: 0.25,     // FIXED: Standard weights
    communication: 0.2       // FIXED: Standard weights
  }
}
```

### 3. Pedagogical Principles

#### Constructivist Learning

- Build on prior knowledge and experience
- Active construction of understanding
- Social interaction and collaboration
- Reflection and metacognition

#### Ethical Reasoning Development

- **Moral Sensitivity:** Recognize ethical dimensions
- **Moral Judgment:** Apply ethical frameworks
- **Moral Motivation:** Connect to personal values
- **Moral Action:** Translate reasoning to decisions

#### AI Ethics Focus

- Connect philosophical concepts to AI applications
- Address real-world AI implementation challenges
- Develop practical ethical decision-making skills
- Prepare for future AI governance roles

### 4. Pre-Launch Tab Content Guidelines

#### Overview Tab Requirements

- **Title & Subtitle:** Clear, engaging scenario identification
- **Meta Information:** Duration, difficulty, age appropriateness
- **Briefing:** 2-3 paragraphs explaining the educational journey ahead
- **Scenario Context:** Specific situation students will encounter
- **Content Notes:** Important warnings, cultural considerations, or context

#### Learning Goals Tab Requirements

- **Learning Objectives:** 3-5 specific, measurable outcomes using action verbs
- **ISTE Standards:** 3-4 relevant standards with specific criteria numbers
- **Prerequisites:** Optional - only include if specific knowledge required
- **Standards Alignment:** Connect to recognized educational frameworks

#### Ethics Guide Tab Requirements

- **Radar Chart Explanation:** How the 8-dimensional ethics analysis works
- **Ethical Dimensions:** All 8 dimensions with scenario-specific descriptions:
  - Fairness, Sustainability, Autonomy, Beneficence
  - Transparency, Accountability, Privacy, Proportionality
- **Interpretation Guide:** How students should understand their results
- **Context Application:** How ethics apply specifically to this scenario

#### Get Ready Tab Requirements

- **Vocabulary:** 5-8 key terms with clear, accessible definitions
- **Preparation Tips:** 4-6 practical guidelines for approaching the scenario
- **Mindset Preparation:** Guidance on perspective and critical thinking
- **Technical Preparation:** Any specific system or tool orientation needed

#### Resources Tab Requirements

- **Curated Materials:** 3-5 high-quality, relevant resources
- **Multiple Formats:** Articles, videos, interactive content, websites
- **Audience Targeting:** Clear indication of general/student/educator/advanced
- **Quality Standards:** Current, credible, accessible resources
- **Learning Connection:** Clear relevance to scenario objectives

#### For Educators Tab Requirements (Optional)

- **Discussion Questions:** 4-6 open-ended questions for deeper exploration
- **Extension Activities:** 3-5 activities extending learning beyond the scenario
- **Classroom Tips:** 3-5 practical teaching strategies for this content
- **Standards Alignment:** Connections to CSTA, ISTE, and subject-area standards
- **Assessment Ideas:** Suggestions for evaluating student learning

### 5. Interactive Learning Phase Guidelines

#### Preparation Phase Activities

- **Reading Materials:** 200-400 words, accessible language, key concepts only
- **Vocabulary:** 5-8 terms maximum, clear definitions, AI context
- **Prior Knowledge:** Open-ended questions, non-judgmental, activating

#### Exploration Phase Activities

- **Scenario Introduction:** Narrative storytelling, multimedia rich, emotionally engaging
- **Stakeholder Mapping:** Visual tools, interactive elements, perspective-taking
- **Initial Reactions:** Capture intuitive responses before formal analysis

#### Analysis Phase Activities

- **Framework Application:** Structured worksheets, step-by-step guidance, multiple frameworks
- **Consequence Mapping:** Visual diagrams, systems thinking, short/long-term
- **Value Analysis:** Identify tensions, prioritize values, examine trade-offs

#### Synthesis Phase Activities

- **Position Development:** Claim-evidence-reasoning structure, counterargument consideration
- **Peer Exchange:** Structured dialogue, active listening, respectful disagreement
- **Refinement:** Metacognitive reflection, position evolution, learning integration

#### Assessment Phase Activities

- **Scenario Completion:** Apply learning to decisions, demonstrate reasoning process
- **Reflection:** Deep thinking about learning process, conceptual change
- **Transfer:** Connect to new contexts, generalize principles, future application

### 5. Adaptive Content Design

#### Multiple Learning Styles

- **Visual:** Diagrams, infographics, multimedia
- **Auditory:** Discussions, audio content, verbal processing
- **Kinesthetic:** Interactive elements, hands-on activities
- **Reading/Writing:** Text analysis, written reflection, note-taking

#### Differentiated Complexity

- **Scaffolded Support:** Gradual release of responsibility
- **Extension Activities:** Additional challenges for advanced learners
- **Alternative Pathways:** Multiple routes to learning objectives
- **Flexible Timing:** Self-paced with suggested timeframes

### 6. Technology Integration

#### Interactive Elements

- **Digital Tools:** Online worksheets, collaborative platforms
- **Multimedia:** Videos, images, interactive graphics
- **Simulations:** Role-playing, scenario exploration
- **Discussion Forums:** Asynchronous peer interaction

#### Progress Tracking

- **Completion Tracking:** Phase-by-phase progress
- **Engagement Metrics:** Time spent, interactions
- **Learning Analytics:** Pattern recognition, adaptive suggestions
- **Portfolio Development:** Artifact collection, reflection compilation

### 7. Quality Standards

#### Educational Effectiveness

- Clear learning objectives aligned with activities
- Progressive complexity building understanding
- Multiple opportunities for practice and feedback
- Authentic assessment of learning outcomes

#### Philosophical Depth

- Meaningful engagement with ethical concepts
- Multiple perspective consideration
- Real-world application connections
- Critical thinking development

#### Practical Relevance

- Current AI ethics challenges
- Transferable skills and knowledge
- Professional development value
- Future-oriented preparation

## Output Format

When creating learning labs, provide:

1. **Complete pre-launch modal content** for all 6 tabs
2. **Detailed 5-phase learning activities** with timing and materials
3. **Lab station configurations** matching existing system patterns
4. **Assessment rubrics** for key learning outcomes
5. **Technology requirements** and platform considerations
6. **Ethics guide content** connecting to radar chart system
7. **Educator resources** for classroom implementation
8. **ISTE standards alignment** and educational justification

## Integration with Existing System

### Lab Station Patterns (from digital-science-lab.js)

**Available Station Types:**

- **Bias Analysis Station**: Investigate bias and fairness issues
- **Ethics Decision Laboratory**: Explore ethical frameworks
- **Stakeholder Impact Simulator**: Analyze multi-party perspectives
- **Consequence Modeling Lab**: Map short and long-term outcomes
- **Policy Analysis Station**: Examine governance and regulation

**Standard Tools:**

- Ethics Framework Simulator
- Stakeholder Impact Visualizer
- Decision Tree Builder
- Consequence Predictor
- Data Visualization Dashboard

### Assessment Integration

Must align with existing analytics patterns using `ANALYTICS_CONSTANTS.EDUCATION` thresholds:

- Mastery threshold: 80% (MASTERY_THRESHOLD_HIGH)
- Confidence levels: Low (30%), Medium (50%), High (70%)
- Assessment weights from `LAB_CONSTANTS.ASSESSMENT_WEIGHTS`

## Quality Checklist

Before creating learning labs, verify:

**Pre-Launch Modal Content:**

- [ ] Overview tab with clear scenario introduction and meta information
- [ ] Learning objectives aligned with ISTE standards (3-5 objectives, 3-4 standards)
- [ ] Ethics guide explaining all 8 radar chart dimensions in scenario context
- [ ] Preparation content with vocabulary (5-8 terms) and practical tips (4-6 tips)
- [ ] Resource collection with diverse, high-quality materials (3-5 resources)
- [ ] Educator resources with discussion questions and classroom guidance

**Interactive Learning Experience:**

- [ ] Five phases with clear objectives and activities
- [ ] Progressive complexity building understanding
- [ ] Multiple learning styles accommodated
- [ ] Interactive and engaging activities
- [ ] Authentic assessment of ethical reasoning
- [ ] Real-world AI ethics connections
- [ ] Appropriate timing for each phase
- [ ] Clear instructions and materials provided

**System Integration:**

- [ ] Integration with existing lab station patterns
- [ ] Proper assessment weight alignment
- [ ] Technology requirements specified
- [ ] Adaptation guidelines included
- [ ] Radar chart system integration
- [ ] Pre-launch modal compatibility

```

```

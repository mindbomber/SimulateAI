# MCP New Scenario Implementation Guide - SimulateAI

## 🎯 Practical Implementation: Adding MCP-Generated Scenarios

Your strategic insight is spot-on! Instead of modifying existing content, we'll **add new
scenarios** with live case studies to create meaningful progression paths and enable the badge
system.

## 🚀 Step-by-Step Implementation

### **Phase 1: Add New Scenarios to Existing Categories**

#### **1. Update Category Definitions** (`src/data/categories.js`)

Add new scenarios to each category:

```javascript
// Example: Adding MCP-generated scenarios to AI Black Box category
'ai-black-box': {
  // ...existing properties...
  scenarios: [
    // Existing scenarios (preserved)
    { id: 'medical-diagnosis-unexplained', title: 'Medical Diagnosis Without Explanation', difficulty: 'beginner' },
    { id: 'college-admission-mystery', title: 'Opaque College Admissions AI', difficulty: 'beginner' },
    { id: 'financial-credit-blackbox', title: 'Financial Credit Black Box', difficulty: 'intermediate' },

    // NEW: MCP-generated scenarios from current events
    { id: 'amsterdam-welfare-ai-audit', title: 'Amsterdam Welfare AI Discrimination Audit', difficulty: 'intermediate' },
    { id: 'centaur-psychology-ai-ethics', title: 'Centaur AI Human Behavior Prediction Ethics', difficulty: 'advanced' },
    { id: 'healthcare-ai-transparency-lawsuit', title: 'Healthcare AI Transparency Lawsuit 2025', difficulty: 'intermediate' },
    { id: 'financial-ai-explainability-mandate', title: 'Financial AI Explainability Mandate', difficulty: 'advanced' }
  ]
  // ...rest of category...
}
```

#### **2. Create New Scenario Data Files**

Add the MCP-generated scenarios to existing scenario files:

```javascript
// In src/js/data/scenarios/ai-black-box-scenarios.js
export default {
  // ...existing scenarios...

  // NEW: MCP-generated scenarios
  'amsterdam-welfare-ai-audit': {
    title: 'Amsterdam Welfare AI Discrimination Audit',
    dilemma:
      'Amsterdam implemented an AI system to detect welfare fraud, but a 2025 audit revealed it discriminated against certain ethnic communities...',
    ethicalQuestion:
      'When AI systems intended to ensure fairness end up creating discrimination, what level of algorithmic transparency should be required?',
    options: [
      // ... full option details from MCP generation
    ],
  },

  'centaur-psychology-ai-ethics': {
    // ... full scenario from MCP generation
  },
  // ...additional new scenarios
};
```

### **Phase 2: Implement Badge System**

#### **1. Create Badge Database Schema**

```sql
-- Badge system tables
CREATE TABLE user_badges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(255),
  category_id VARCHAR(255),
  badge_level VARCHAR(50),
  scenario_count INT,
  earned_date DATETIME,
  INDEX(user_id, category_id)
);

CREATE TABLE badge_definitions (
  category_id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  color VARCHAR(7),
  description TEXT
);
```

#### **2. Create Badge Manager Component**

```javascript
// src/js/components/badge-manager.js
export default class BadgeManager {
  constructor() {
    this.progressionTiers = [
      { scenarios: 1, level: 'novice', icon: '🥉', title: 'Novice' },
      { scenarios: 3, level: 'explorer', icon: '🥈', title: 'Explorer' },
      { scenarios: 6, level: 'analyst', icon: '🥇', title: 'Analyst' },
      { scenarios: 10, level: 'expert', icon: '🎖️', title: 'Expert' },
      { scenarios: 15, level: 'scholar', icon: '🏅', title: 'Scholar' },
      { scenarios: 21, level: 'master', icon: '⭐', title: 'Master' },
      { scenarios: 28, level: 'authority', icon: '🌟', title: 'Authority' },
      { scenarios: 36, level: 'specialist', icon: '💎', title: 'Specialist' },
      { scenarios: 45, level: 'champion', icon: '👑', title: 'Champion' },
      { scenarios: 55, level: 'legend', icon: '🚀', title: 'Legend' },
    ];
  }

  async checkForNewBadge(userId, categoryId, scenarioCount) {
    const currentTier = this.getCurrentTier(scenarioCount);
    const previousTier = this.getCurrentTier(scenarioCount - 1);

    if (currentTier && currentTier !== previousTier) {
      return await this.awardBadge(userId, categoryId, currentTier, scenarioCount);
    }
    return null;
  }

  async awardBadge(userId, categoryId, tier, scenarioCount) {
    const badge = {
      userId,
      categoryId,
      level: tier.level,
      title: tier.title,
      icon: tier.icon,
      scenarioCount,
      earnedDate: new Date(),
      personalizedMessage: this.generatePersonalizedMessage(categoryId, tier.level),
      nextGoal: this.getNextGoal(scenarioCount),
    };

    // Save to database
    await this.saveBadge(badge);

    // Show badge animation
    this.displayBadgeEarned(badge);

    return badge;
  }

  generatePersonalizedMessage(categoryId, level) {
    const messages = {
      'ai-black-box': {
        novice:
          "You've unlocked the mysteries of AI transparency! Every algorithm should be understandable.",
        expert: 'Your expertise in AI explainability is making technology more trustworthy.',
        legend: 'You are a champion of transparent AI systems!',
      },
      'bias-fairness': {
        novice: "You're seeing how AI can impact fairness. Keep questioning and analyzing!",
        expert: 'Your fairness analysis helps create more equitable AI systems.',
        legend: 'You are a guardian of AI fairness and justice!',
      },
    };
    return messages[categoryId]?.[level] || 'Your ethical reasoning skills are advancing!';
  }

  displayBadgeEarned(badge) {
    // Create animated badge notification
    const notification = document.createElement('div');
    notification.className = 'badge-earned-notification';
    notification.innerHTML = `
      <div class="badge-animation">
        <div class="badge-icon">${badge.icon}</div>
        <div class="badge-text">
          <h3>Badge Earned!</h3>
          <p>${badge.title}</p>
          <p class="badge-message">${badge.personalizedMessage}</p>
          <p class="badge-progress">${badge.nextGoal}</p>
        </div>
      </div>
    `;
    document.body.appendChild(notification);

    // Animate in and remove after delay
    setTimeout(() => notification.remove(), 5000);
  }
}
```

### **Phase 3: MCP Content Generation Pipeline**

#### **1. Monthly Scenario Generation**

```javascript
// src/js/integrations/mcp-content-pipeline.js
export default class MCPContentPipeline {
  constructor() {
    this.mcpWebResearch = new MCPWebResearchIntegration();
    this.mcpProjectGen = new MCPProjectGeneratorIntegration();
  }

  async generateMonthlyContent() {
    const categories = ['ai-black-box', 'bias-fairness', 'automation-oversight'];
    const newScenarios = {};

    for (const categoryId of categories) {
      // Research current events in this domain
      const currentEvents = await this.mcpWebResearch.getCurrentAIEthicsNews(categoryId);

      // Generate 2-3 new scenarios per category monthly
      const scenarios = await this.generateScenariosFromEvents(currentEvents, categoryId);

      newScenarios[categoryId] = scenarios;
    }

    return newScenarios;
  }

  async generateScenariosFromEvents(events, categoryId) {
    const scenarios = [];

    for (const event of events.slice(0, 3)) {
      // Limit to 3 new scenarios per month
      const scenario = await this.mcpProjectGen.createScenarioFromEvent({
        event,
        categoryId,
        difficulty: this.assignDifficulty(event),
        educationalStandards: 'ISTE',
        targetAge: '13+',
      });

      scenarios.push(scenario);
    }

    return scenarios;
  }

  assignDifficulty(event) {
    // Analyze event complexity to assign appropriate difficulty
    if (event.conceptualComplexity < 0.4) return 'beginner';
    if (event.conceptualComplexity < 0.7) return 'intermediate';
    return 'advanced';
  }
}
```

### **Phase 4: Integration with Existing App**

#### **1. Update Main App to Include Badge System**

```javascript
// In src/js/app.js - add to AIEthicsApp class
async initializeBadgeSystem() {
  this.badgeManager = new BadgeManager();

  // Load user's current badge status
  const userId = this.getCurrentUserId();
  this.userBadges = await this.badgeManager.loadUserBadges(userId);
}

async onScenarioCompleted(categoryId, scenarioId) {
  const userId = this.getCurrentUserId();

  // Update completion tracking
  await this.updateScenarioCompletion(userId, categoryId, scenarioId);

  // Check for new badge
  const completedCount = await this.getCompletedScenarioCount(userId, categoryId);
  const newBadge = await this.badgeManager.checkForNewBadge(userId, categoryId, completedCount);

  if (newBadge) {
    console.log('🎉 New badge earned!', newBadge);
  }
}
```

#### **2. Update UI to Show Badge Progress**

```javascript
// Add to category cards
function createCategoryCard(category) {
  const completedCount = this.getCompletedCount(category.id);
  const nextBadge = this.badgeManager.getNextBadgeInfo(completedCount);

  return `
    <div class="category-card">
      <!-- ...existing content... -->
      
      <!-- NEW: Badge progress -->
      <div class="badge-progress">
        <div class="current-badge">
          ${this.badgeManager.getCurrentBadge(completedCount)}
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${this.getProgressPercentage(completedCount)}%"></div>
        </div>
        <div class="next-badge">
          Next: ${nextBadge.title} (${nextBadge.remaining} more)
        </div>
      </div>
    </div>
  `;
}
```

## 🎯 Expected Results

### **Content Growth**:

- **Month 1**: 21 new scenarios (7 per priority category)
- **Month 2**: 42 total new scenarios
- **Month 3**: 63 total new scenarios
- **Year 1**: 250+ new scenarios across all categories

### **User Engagement**:

- Badge progression motivates completion of more scenarios
- Fresh content from current events keeps platform relevant
- Users can achieve expertise levels in specific ethical domains

### **Educational Value**:

- Students engage with real-world AI ethics developments
- Educators get fresh discussion material automatically
- Content stays current with rapidly evolving AI landscape

### **Technical Benefits**:

- MCP automation reduces manual content creation effort
- Scalable architecture supports continuous content expansion
- Badge system provides clear user progression metrics

## 🚀 Implementation Timeline

### **Week 1-2**: Badge System Foundation

- Create badge database schema
- Build BadgeManager component
- Update UI to show badge progress

### **Week 3-4**: First MCP Scenario Batch

- Add 7 new scenarios to AI Black Box category
- Add 7 new scenarios to Bias & Fairness category
- Add 7 new scenarios to Automation & Oversight category

### **Week 5-6**: Integration & Testing

- Connect badge system to scenario completion
- Test badge earning and progression
- Refine based on user feedback

### **Week 7-8**: MCP Automation Pipeline

- Build automated monthly content generation
- Set up MCP web research for current events
- Establish quality review process

## 🏆 Success Metrics

### **Engagement Metrics**:

- **Badge Earning Rate**: Target 70% of users earn at least "Explorer" (3 scenarios)
- **Scenario Completion**: 40% increase in completion rates
- **Return Visits**: Badge system increases monthly return visits by 60%

### **Content Metrics**:

- **Freshness**: 90% of new scenarios reference events from past 6 months
- **Quality**: New scenarios match existing educational quality standards
- **Variety**: 50+ scenarios per category within 12 months

### **Educational Metrics**:

- **Educator Adoption**: 75% of educators report using new scenarios
- **Student Engagement**: Discussion participation increases by 50%
- **Learning Outcomes**: Badge earners show improved ethical reasoning skills

---

**This approach transforms SimulateAI into a continuously evolving platform where:**

- ✅ Existing quality content is preserved
- ✅ Fresh, current scenarios keep content relevant
- ✅ Badge progression motivates long-term engagement
- ✅ MCP automation scales content creation efficiently
- ✅ Educational value grows continuously

**Ready to implement? Let's start with the badge system foundation and first batch of MCP-generated
scenarios!**

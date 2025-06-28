# SimulateAI Simulation Se#### 1.1 **Home Page / Category Grid Redesign** ✅ *Completed*
- [x] Replace current simulation cards with **category cards** (10 categories)
- [x] Each category card design:
  - [x] Category title and description
  - [x] Preview of 3 scenario thumbnails
  - [x] Progress indicator (scenarios completed)
  - [x] Difficulty level and estimated time
- [x] Responsive grid layout
- [x] Hover animations and interactionsamp Plan

**Project Goal:** Transform the current simulation system into a comprehensive scenario-based ethics platform with real-time radar chart feedback.

**Start Date:** June 27, 2025  
**Target Completion:** July 25, 2025  
**Status:** 🚧 Planning Phase

---

## 🎯 **Project Overview**

We're transforming the SimulateAI platform from individual simulations to a category-based scenario system with:
- 10 ethical dilemma categories
- 3 scenarios per category (30 total scenarios)
- Real-time radar chart feedback using 8 ethical axes
- Modal-based interaction flow
- Educational resources and social sharing

---

## 📋 **Phase Breakdown**

### **Phase 1: Architecture & Layout Foundation** ⏳ *In Progress*
**Goal:** Create the basic structure for category-based scenarios with modal flow

#### 1.1 **Home Page / Category Grid Redesign** ⏳ *In Progress*
- [ ] Replace current simulation cards with **category cards** (10 categories)
- [ ] Each category card design:
  - [ ] Category title and description
  - [ ] Preview of 3 scenario thumbnails
  - [ ] Progress indicator (scenarios completed)
  - [ ] Difficulty level and estimated time
- [ ] Responsive grid layout
- [ ] Hover animations and interactions

#### 1.2 **Category Page Structure** ❌ *Not Started*
- [ ] Create category-specific landing pages
- [ ] Grid of 3 scenario cards per category
- [ ] Category overview and learning objectives
- [ ] "Start Category" button to begin scenario sequence
- [ ] Breadcrumb navigation

#### 1.3 **Premodal System** ❌ *Not Started*
- [ ] Tabbed interface: Overview | Learning Goals | Educator Resources
- [ ] Category-specific content for each tab
- [ ] Launch button to start first scenario
- [ ] Responsive design for mobile

---

### **Phase 2: Radar Chart System** ⏳ *Not Started*
**Goal:** Implement real-time ethical evaluation visualization

#### 2.1 **Radar Chart Component** ❌ *Not Started*
- [ ] Choose chart library (Chart.js vs D3.js)
- [ ] Create reusable radar chart component
- [ ] Implement 8 axes based on ethical principles:
  - [ ] Fairness
  - [ ] Sustainability  
  - [ ] Autonomy
  - [ ] Beneficence
  - [ ] Transparency
  - [ ] Accountability
  - [ ] Privacy
  - [ ] Proportionality
- [ ] Real-time updates as user selects answers
- [ ] Smooth animations and transitions

#### 2.2 **Scoring System** ❌ *Not Started*
- [ ] Define scoring vectors for each answer option
- [ ] Create weighted impact system for different ethical dimensions
- [ ] Implement aggregation logic for category completion
- [ ] Add normalization for fair comparison across categories

#### 2.3 **Visual Design** ❌ *Not Started*
- [ ] Clean, interactive radar chart design
- [ ] Color-coded axes and values
- [ ] Smooth animations for value changes
- [ ] Responsive design for mobile
- [ ] Accessibility features (alt text, keyboard navigation)

---

### **Phase 3: Scenario Modal System** ⏳ *Not Started*
**Goal:** Create the core scenario interaction experience

#### 3.1 **Modal Layout** ❌ *Not Started*
- [ ] **Left Panel:** Scenario content, question, 3 answer options
- [ ] **Right Panel:** Live radar chart
- [ ] Persistent navigation between scenarios
- [ ] Progress indicator for current category
- [ ] Mobile-responsive layout (stacked on small screens)

#### 3.2 **Scenario Data Structure** ❌ *Not Started*
- [ ] Create JSON structure for each scenario:
  - [ ] Title, description, ethical question
  - [ ] 3 answer options with impact vectors
  - [ ] Category association
  - [ ] Learning objectives
  - [ ] Difficulty rating
- [ ] Data validation system
- [ ] Import/export functionality for content creators

#### 3.3 **State Management** ❌ *Not Started*
- [ ] Track user choices across scenarios
- [ ] Maintain radar chart state
- [ ] Category completion tracking
- [ ] Progress persistence (localStorage/sessionStorage)
- [ ] User session management

---

### **Phase 4: Category Implementation** ⏳ *Not Started*
**Goal:** Implement all 10 categories with their scenarios

#### 4.1 **Priority Categories (Week 3)** ❌ *Not Started*
1. **The Trolley Problem** ❌ *Not Started*
   - [ ] Autonomous Vehicle Split Decision scenario
   - [ ] Tunnel Dilemma scenario  
   - [ ] Obstacle Recalculation scenario
   - [ ] Define scoring vectors for all answers
   
2. **AI Black Box** ❌ *Not Started*
   - [ ] Medical Diagnosis Without Explanation scenario
   - [ ] Parole Denial Algorithm scenario
   - [ ] Child Protection Alert scenario
   - [ ] Define scoring vectors for all answers
   
3. **Automation vs Human Oversight** ❌ *Not Started*
   - [ ] Overruled by Robot Surgeon scenario
   - [ ] AI in Air Traffic Control scenario
   - [ ] Nuclear Launch Protocols scenario
   - [ ] Define scoring vectors for all answers

#### 4.2 **Secondary Categories (Week 4)** ❌ *Not Started*
4. **Consent and Surveillance** ❌ *Not Started*
5. **Responsibility and Blame** ❌ *Not Started*
6. **The Experience Machine** ❌ *Not Started*

#### 4.3 **Advanced Categories (Future Sprints)** ❌ *Not Started*
7. **The Ship of Theseus** ❌ *Not Started*
8. **The Simulation Hypothesis** ❌ *Not Started*
9. **The Sorites Paradox** ❌ *Not Started*
10. **Moral Luck** ❌ *Not Started*

---

### **Phase 5: Results & Social Features** ⏳ *Not Started*
**Goal:** Create meaningful completion experience

#### 5.1 **Results Screen** ❌ *Not Started*
- [ ] Averaged radar chart for category completion
- [ ] Key insights and learning takeaways
- [ ] Reflection questions
- [ ] Performance summary
- [ ] Comparison with other users (anonymized)

#### 5.2 **Social Features** ❌ *Not Started*
- [ ] Share radar chart results (image export)
- [ ] Compare with class/group averages
- [ ] Export functionality for educators (CSV, PDF)
- [ ] Certificate generation
- [ ] Integration with learning management systems

---

## 🛠️ **Implementation Timeline**

### **Week 1 (June 27 - July 4): Foundation** ⏳ *Current Week*
- [ ] **Day 1-2:** Create new category grid layout
- [ ] **Day 3-4:** Implement premodal system  
- [ ] **Day 5-6:** Set up basic scenario modal structure
- [ ] **Day 7:** Create radar chart component

### **Week 2 (July 4 - July 11): Core Functionality**
- [ ] **Day 1-2:** Implement scenario data structure
- [ ] **Day 3-4:** Connect radar chart to answer selections
- [ ] **Day 5-6:** Create state management system
- [ ] **Day 7:** Build results screen

### **Week 3 (July 11 - July 18): Content Creation**
- [ ] **Day 1-3:** Implement first 3 categories with full scenarios
- [ ] **Day 4-5:** Create scoring vectors for all answers
- [ ] **Day 6:** Add learning objectives and educator resources
- [ ] **Day 7:** Test complete user flow

### **Week 4 (July 18 - July 25): Polish & Enhancement**
- [ ] **Day 1-3:** Add remaining categories (4-6)
- [ ] **Day 4-5:** Implement social sharing features
- [ ] **Day 6:** Mobile optimization and accessibility
- [ ] **Day 7:** Performance optimization and final testing

---

## 🎯 **Technical Specifications**

### **File Structure**
```
src/
├── components/
│   ├── category-grid.js           ✅ Created
│   ├── scenario-modal.js          ❌ Not Created
│   ├── radar-chart.js             ❌ Not Created
│   ├── premodal.js                ❌ Not Created
│   └── results-screen.js          ❌ Not Created
├── data/
│   ├── categories.js              ✅ Created
│   ├── scenarios.js               ❌ Not Created
│   └── ethical-axes.js            ❌ Not Created
├── styles/
│   ├── category-grid.css          ✅ Created
│   ├── scenario-modal.css         ❌ Not Created
│   └── radar-chart.css            ❌ Not Created
└── utils/
    ├── scoring-engine.js          ❌ Not Created
    └── state-management.js        ❌ Not Created
```

### **Key Technologies**
- **Radar Chart:** Chart.js (chosen for simplicity and performance)
- **State Management:** Local state with session storage backup
- **Modal System:** Enhanced version of current modal system
- **Animations:** CSS transitions + requestAnimationFrame for smooth updates
- **Data Storage:** JSON files with future API integration capability

### **Dependencies to Add**
- [ ] Chart.js for radar charts
- [ ] html2canvas for result image export
- [ ] JSZip for bulk data export

---

## 🎨 **Design Specifications**

### **Category Cards**
- **Size:** 300x400px cards in responsive grid
- **Content:** Icon, title, description, progress bar, 3 scenario previews
- **Hover:** Subtle lift effect with shadow
- **Colors:** Category-specific color schemes

### **Radar Chart**
- **Size:** 400x400px in scenario modal
- **Axes:** 8 ethical principles, 0-100 scale
- **Colors:** Blue (#007cba) for positive, Red (#ff4444) for negative impact
- **Animation:** Smooth transitions on value changes (300ms duration)

### **Scenario Modal**
- **Layout:** 60/40 split (content/chart) on desktop, stacked on mobile
- **Background:** Semi-transparent overlay with blur effect
- **Navigation:** Progress dots, next/previous buttons
- **Responsive:** Full height on mobile with scrollable content

---

## 📊 **Success Metrics**

### **User Engagement**
- [ ] Average time spent per category: Target 15-20 minutes
- [ ] Completion rate per category: Target >80%
- [ ] User return rate: Target >60%

### **Educational Effectiveness**
- [ ] Pre/post assessment improvement: Target >30%
- [ ] User feedback score: Target >4.5/5
- [ ] Educator adoption rate: Target >50 schools

### **Technical Performance**
- [ ] Page load time: Target <3 seconds
- [ ] Chart render time: Target <500ms
- [ ] Mobile responsiveness score: Target >95%

---

## 🔄 **Change Log**

### **June 27, 2025**
- ✅ Initial plan created
- ✅ Phase breakdown defined
- ✅ Timeline established
- ✅ File structure planned
- ✅ **Phase 1.1 COMPLETED**: Category grid redesigned and implemented
  - ✅ Created restructured layout with 10 category sections
  - ✅ Each category section has header with title, description, and progress indicator
  - ✅ Each category contains 3 scenario cards in responsive grid
  - ✅ Implemented complete category-grid.js component with scenario-based interactions
  - ✅ Designed comprehensive category-grid.css with section-based styling
  - ✅ Integrated with existing app.js architecture to replace old simulation grid
  - ✅ Added progress tracking, user persistence, and completion indicators
  - ✅ Implemented accessibility features, keyboard navigation, and hover effects
  - ✅ Successfully tested in development environment with 30 total scenario cards

### **Future Updates**
*Updates will be logged here as we progress through the phases*

---

## 🚨 **Risk Assessment**

### **High Risk**
- **Chart Performance:** Radar charts may be slow on older devices
  - *Mitigation:* Use lightweight Chart.js, implement performance monitoring
  
### **Medium Risk**  
- **Content Complexity:** 30 scenarios with scoring vectors is significant content
  - *Mitigation:* Start with 3 categories, template-based approach
  
### **Low Risk**
- **Mobile Responsiveness:** Modal design may be challenging on small screens
  - *Mitigation:* Mobile-first design approach, early testing

---

## 📝 **Notes & Ideas**

### **Future Enhancements** (Post-Launch)
- AI-powered scenario generation
- Multiplayer/classroom modes
- Advanced analytics dashboard
- API for third-party integrations
- Multi-language support

### **Content Creation Tools**
- Scenario builder interface for educators
- Bulk import/export functionality
- Version control for scenario content
- A/B testing framework for different approaches

---

**Last Updated:** June 27, 2025  
**Next Review:** Daily during development phases

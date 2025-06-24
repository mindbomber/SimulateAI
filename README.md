# SimulateAI - Interactive AI Ethics Education Platform

## Overview

SimulateAI is an educational platform inspired by PhET simulations, designed to teach AI and robotics safety and ethics through interactive, game-like simulations. The platform focuses on making complex ethical concepts accessible and engaging for learners of all levels.

## Features

- **Interactive Simulations**: Game-like scenarios exploring AI ethics concepts
- **Multi-Renderer Engine**: Support for SVG, Canvas, and WebGL rendering
- **Accessibility First**: Full keyboard navigation, screen reader support, and inclusive design
- **Educational Tools**: Resources for educators and comprehensive progress tracking
- **Privacy-Focused**: Local storage with optional anonymous analytics

## Technology Stack

- **Frontend**: HTML5, JavaScript (ES6+), CSS3
- **Rendering**: SVG, Canvas API, WebGL
- **Build Tools**: Vite, ESLint, Prettier
- **Testing**: Jest (planned)

## Project Structure

```
SimulateAI/
├── src/
│   ├── js/
│   │   ├── core/           # Core engine and simulation framework
│   │   ├── simulations/    # Individual simulation modules
│   │   ├── components/     # Reusable UI components
│   │   └── utils/          # Utility functions and helpers
│   ├── styles/             # CSS and styling
│   └── assets/             # Images, icons, and media
├── public/                 # Static public assets
├── docs/                   # Documentation and guides
└── dist/                   # Built application (generated)
```

## Quick Start

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Simulations

### Planned Simulations
- **Bias & Fairness**: Explore algorithmic bias in hiring and lending
- **Privacy & Consent**: Interactive scenarios about data collection
- **Transparency & Explainability**: Understanding AI decision-making
- **Autonomous Vehicles**: Ethical dilemmas in self-driving cars
- **Social Media Algorithms**: Impact of recommendation systems
- **Facial Recognition**: Privacy and surveillance considerations

## Getting Started

### Prerequisites
- Node.js (16.0 or higher)
- npm (7.0 or higher)
- Modern web browser with ES6+ support

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/mindbomber/SimulateAI.git
   ```
2. Navigate to the project directory:
   ```bash
   cd SimulateAI
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser to `http://localhost:3000`

## Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Contributing
This project follows accessibility-first development practices. All interactive elements must be keyboard navigable and screen reader compatible.

## Educational Philosophy

SimulateAI is built on the principle that complex ethical concepts become more accessible through interactive exploration. Each simulation:

- Presents real-world scenarios without prescriptive solutions
- Encourages critical thinking through guided discovery
- Provides immediate feedback on decisions and their consequences
- Supports multiple learning styles through varied interaction modes

## License

MIT License - This project is open source and available for educational use.

## Repository

- **GitHub**: https://github.com/mindbomber/SimulateAI
- **Issues**: https://github.com/mindbomber/SimulateAI/issues
- **Contributions**: Welcome! Please see our contributing guidelines in the development guide.

## Contact

For questions about this educational platform, please open an issue on GitHub.

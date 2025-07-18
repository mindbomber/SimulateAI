/**
 * Copyright 2025 Armando Sori
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Professional Footer Component
 * Reusable footer for all SimulateAI pages
 */

/**
 * Footer Configuration
 */
const FOOTER_CONFIG = {
  brand: {
    name: 'SimulateAI',
    tagline: 'Ethical AI Education Through Interactive Simulations',
    year: new Date().getFullYear(),
  },

  sections: {
    platform: {
      title: 'Platform',
      links: [
        { text: 'Start Simulating', href: 'app.html', icon: '🚀' },
        { text: 'Browse Scenarios', href: 'app.html', icon: '🎯' },
        { text: 'Learning Labs', href: 'app.html#learning-labs', icon: '🧪' },
        { text: 'Badge System', href: 'app.html#badges', icon: '🏆' },
      ],
    },

    community: {
      title: 'Community',
      links: [
        { text: 'Research Study', href: 'research-consent.html', icon: '🔬' },
        { text: 'Blog & Insights', href: 'blog.html', icon: '📝' },
        {
          text: 'Educator Resources',
          href: 'docs/EDUCATOR_GUIDE.md',
          icon: '🎓',
        },
      ],
    },

    support: {
      title: 'Support',
      links: [
        { text: 'Help & FAQ', href: 'help.html', icon: '❓' },
        {
          text: 'Contact Us',
          href: 'mailto:support@simulateai.org',
          icon: '📧',
        },
        {
          text: 'Report Issue',
          href: 'mailto:support@simulateai.org?subject=Issue Report',
          icon: '🐛',
        },
        {
          text: 'Feedback',
          href: 'mailto:feedback@simulateai.org',
          icon: '💭',
        },
      ],
    },

    legal: {
      title: 'Legal & Privacy',
      links: [
        { text: 'Privacy Policy', href: 'privacy-notice.html', icon: '🔐' },
        { text: 'Terms of Use', href: 'terms-of-use.html', icon: '📋' },
        { text: 'Research Consent', href: 'research-consent.html', icon: '📝' },
        { text: 'Data Deletion', href: 'data-deletion.html', icon: '🗑️' },
      ],
    },
  },

  social: {
    links: [
      {
        text: 'GitHub',
        href: 'https://github.com/mindbomber/SimulateAI',
        icon: '💻',
      },
      { text: 'Academia', href: '#', icon: '🎓' },
      { text: 'LinkedIn', href: '#', icon: '👔' },
    ],
  },

  certifications: [
    { text: 'ISTE Standards Aligned', icon: '✅' },
    { text: 'GDPR Compliant', icon: '🇪🇺' },
    { text: 'Educational Research', icon: '📊' },
  ],
};

/**
 * Generate Footer HTML
 */
function generateFooterHTML() {
  const { brand, sections, social, certifications } = FOOTER_CONFIG;

  return `
    <footer class="professional-footer">
      <div class="footer-wave"></div>
      
      <div class="footer-content">
        <!-- Main Footer Content -->
        <div class="footer-main">
          <!-- Brand Section -->
          <div class="footer-brand">
            <div class="brand-logo">
              <span class="brand-icon">🤖</span>
              <span class="brand-name">${brand.name}</span>
            </div>
            <p class="brand-tagline">${brand.tagline}</p>
            <div class="brand-stats">
              <div class="stat-item">
                <span class="stat-number">25+</span>
                <span class="stat-label">Scenarios</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">10</span>
                <span class="stat-label">Categories</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">3</span>
                <span class="stat-label">Badge Tiers</span>
              </div>
            </div>
          </div>
          
          <!-- Navigation Sections -->
          <div class="footer-sections">
            ${Object.entries(sections)
              .map(
                ([_key, section]) => `
              <div class="footer-section">
                <h4 class="section-title">${section.title}</h4>
                <ul class="section-links">
                  ${section.links
                    .map(
                      link => `
                    <li>
                      <a href="${link.href}" ${link.href.includes('mailto:') ? '' : 'rel="noopener"'}>
                        <span class="link-icon">${link.icon}</span>
                        <span class="link-text">${link.text}</span>
                      </a>
                    </li>
                  `
                    )
                    .join('')}
                </ul>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
        
        <!-- Footer Bottom -->
        <div class="footer-bottom">
          <div class="footer-bottom-content">
            <!-- Copyright & Legal -->
            <div class="footer-copyright">
              <p class="copyright-text">
                © ${brand.year} <strong>${brand.name}</strong>. All rights reserved.
              </p>
              <p class="legal-notice">
                Created for educators, researchers, and digital citizens of the future
              </p>
            </div>
            
            <!-- Social and Certifications Container -->
            <div class="footer-social-cert-container">
              <!-- Social Links -->
              <div class="footer-social">
                <span class="social-label">Connect:</span>
                <div class="social-links">
                  ${social.links
                    .map(
                      link => `
                    <a href="${link.href}" target="_blank" rel="noopener noreferrer" aria-label="${link.text}">
                      <span class="social-icon">${link.icon}</span>
                      <span class="social-text">${link.text}</span>
                    </a>
                  `
                    )
                    .join('')}
                </div>
              </div>
              
              <!-- Certifications -->
              <div class="footer-certifications">
                ${certifications
                  .map(
                    cert => `
                  <div class="certification-item">
                    <span class="cert-icon">${cert.icon}</span>
                    <span class="cert-text">${cert.text}</span>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `;
}

/**
 * Generate Footer CSS
 */
function generateFooterCSS() {
  return `
    /* Professional Footer Styles */
    .professional-footer {
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      color: white;
      position: relative;
      margin-top: 60px;
    }
    
    .footer-wave {
      position: absolute;
      top: -50px;
      left: 0;
      width: 100%;
      height: 50px;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" fill="%232c3e50"></path></svg>') no-repeat;
      background-size: cover;
    }
    
    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 60px 20px 0;
    }
    
    .footer-main {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 60px;
      margin-bottom: 50px;
    }
    
    /* Brand Section */
    .footer-brand {
      max-width: 350px;
    }
    
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 15px;
    }
    
    .brand-icon {
      font-size: 2.5rem;
    }
    
    .brand-name {
      font-size: 1.8rem;
      font-weight: 700;
      background: linear-gradient(135deg, #3498db, #9b59b6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .brand-tagline {
      color: #bdc3c7;
      margin-bottom: 25px;
      line-height: 1.5;
      font-size: 1rem;
    }
    
    .brand-stats {
      display: flex;
      gap: 20px;
      margin-top: 20px;
    }
    
    .stat-item {
      text-align: center;
    }
    
    .stat-number {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: #3498db;
    }
    
    .stat-label {
      font-size: 0.85rem;
      color: #95a5a6;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    /* Navigation Sections */
    .footer-sections {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 30px;
    }
    
    @media (max-width: 1200px) {
      .footer-sections {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 25px;
      }
    }
    
    .footer-section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 20px;
      color: #ecf0f1;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #3498db;
      padding-bottom: 8px;
      display: inline-block;
    }
    
    .section-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .section-links li {
      margin-bottom: 12px;
    }
    
    .section-links a {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #bdc3c7;
      text-decoration: none;
      transition: all 0.3s ease;
      padding: 5px 0;
      border-radius: 4px;
    }
    
    .section-links a:hover {
      color: #3498db;
      transform: translateX(5px);
    }
    
    .link-icon {
      font-size: 0.9rem;
      opacity: 0.8;
    }
    
    .link-text {
      font-size: 0.95rem;
    }
    
    /* Footer Bottom */
    .footer-bottom {
      border-top: 1px solid #34495e;
      padding: 30px 0;
    }
    
    .footer-bottom-content {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 40px;
      align-items: center;
    }
    
    .footer-social-cert-container {
      display: flex;
      gap: 40px;
      align-items: center;
    }
    
    .footer-copyright {
      text-align: left;
    }
    
    .copyright-text {
      font-weight: 600;
      margin-bottom: 5px;
      color: #ecf0f1;
    }
    
    .legal-notice {
      font-size: 0.9rem;
      color: #95a5a6;
      margin: 0;
    }
    
    /* Social Links */
    .footer-social {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .social-label {
      font-size: 0.9rem;
      color: #95a5a6;
      font-weight: 500;
    }
    
    .social-links {
      display: flex;
      gap: 15px;
    }
    
    .social-links a {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #bdc3c7;
      text-decoration: none;
      padding: 8px 12px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }
    
    .social-links a:hover {
      background: rgba(52, 152, 219, 0.2);
      color: #3498db;
      transform: translateY(-2px);
    }
    
    /* Certifications */
    .footer-certifications {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .certification-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      color: #95a5a6;
    }
    
    .cert-icon {
      font-size: 0.9rem;
    }
    
    /* Mobile Responsiveness */
    @media (max-width: 1024px) {
      .footer-main {
        grid-template-columns: 1fr;
        gap: 40px;
      }
      
      .footer-sections {
        grid-template-columns: repeat(2, 1fr);
        gap: 30px;
      }
      
      .footer-bottom-content {
        grid-template-columns: 1fr auto;
        gap: 25px;
      }
      
      .footer-social-cert-container {
        text-align: center;
      }
      
      .brand-stats {
        justify-content: center;
      }
    }
    
    @media (max-width: 768px) {
      .footer-content {
        padding: 40px 15px 0;
      }
      
      .footer-main {
        grid-template-columns: 1fr;
        gap: 40px;
      }
      
      .footer-sections {
        grid-template-columns: repeat(2, 1fr);
        gap: 30px;
      }
      
      .brand-stats {
        justify-content: center;
      }
      
      /* Mobile Footer Bottom Grid Layout */
      .footer-bottom-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        align-items: start;
      }
      
      .footer-copyright {
        grid-column: 1 / -1;
        grid-row: 1 / 2;
        text-align: center;
        margin-bottom: 15px;
      }
      
      .footer-social-cert-container {
        grid-column: 1 / -1;
        grid-row: 2 / 3;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      
      .footer-social {
        grid-column: 1 / 2;
        grid-row: 1 / 2;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      
      .footer-certifications {
        grid-column: 2 / 3;
        grid-row: 1 / 2;
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
      }
      
      .social-label {
        font-size: 0.8rem;
        margin-bottom: 4px;
      }
      
      .social-links {
        flex-direction: column;
        gap: 8px;
        width: 100%;
      }
      
      .social-links a {
        width: 100%;
        justify-content: flex-start;
        padding: 6px 10px;
        font-size: 0.75rem;
        white-space: nowrap;
      }
      
      .social-text {
        display: inline;
      }
      
      .certification-item {
        font-size: 0.75rem;
        margin-bottom: 4px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .cert-text {
        display: inline;
      }
      
      .brand-stats {
        flex-direction: column;
        gap: 10px;
      }
    }
    
    @media (max-width: 480px) {
      .footer-wave {
        height: 30px;
        top: -30px;
      }
      
      .brand-logo {
        justify-content: center;
        text-align: center;
      }
      
      .footer-brand {
        text-align: center;
      }
      
      .social-links a {
        padding: 6px 10px;
        font-size: 0.85rem;
      }
    }
    
    /* High contrast mode */
    @media (prefers-contrast: high) {
      .professional-footer {
        background: #000;
        border-top: 2px solid #fff;
      }
      
      .section-title {
        border-bottom-color: #fff;
      }
      
      .section-links a:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
    
    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .section-links a,
      .social-links a {
        transition: none;
      }
      
      .section-links a:hover {
        transform: none;
      }
      
      .social-links a:hover {
        transform: none;
      }
    }
  `;
}

/**
 * Initialize Footer Component
 */
function initializeFooter() {
  // Add CSS to head
  const style = document.createElement('style');
  style.textContent = generateFooterCSS();
  document.head.appendChild(style);

  // Look for footer placeholder first
  const placeholder = document.getElementById('footer-placeholder');
  if (placeholder) {
    placeholder.outerHTML = generateFooterHTML();
    return;
  }

  // Find existing footer and replace it
  const existingFooter = document.querySelector('footer');
  if (existingFooter) {
    existingFooter.outerHTML = generateFooterHTML();
  } else {
    // If no footer exists, append to body
    document.body.insertAdjacentHTML('beforeend', generateFooterHTML());
  }
}

// Export for use in other modules
export {
  generateFooterHTML,
  generateFooterCSS,
  initializeFooter,
  FOOTER_CONFIG,
};

// Auto-initialize if script is loaded directly
if (typeof window !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFooter);
} else if (typeof window !== 'undefined') {
  initializeFooter();
}

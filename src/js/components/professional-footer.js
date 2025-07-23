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
    name: "SimulateAI",
    tagline: "Ethical AI Education Through Interactive Simulations",
    year: new Date().getFullYear(),
  },

  sections: {
    community: {
      title: "Community",
      links: [
        { text: "Research Study", href: "research-consent.html", icon: "🔬" },
        { text: "Blog & Insights", href: "blog.html", icon: "📝" },
        {
          text: "Educator Resources",
          href: "educator-tools.html",
          icon: "🎓",
        },
      ],
    },

    support: {
      title: "Support",
      links: [
        { text: "Help & FAQ", href: "help-faq.html", icon: "❓" },
        {
          text: "Contact Us",
          href: "mailto:research@simulateai.io",
          icon: "📧",
        },
        {
          text: "Report Issue",
          href: "mailto:research@simulateai.io?subject=Issue Report",
          icon: "🐛",
        },
        {
          text: "Feedback",
          href: "mailto:research@simulateai.io",
          icon: "💭",
        },
      ],
    },

    legal: {
      title: "Legal & Privacy",
      links: [
        { text: "Privacy Policy", href: "privacy-notice.html", icon: "🔐" },
        { text: "Terms of Use", href: "terms-of-use.html", icon: "📋" },
        { text: "Research Consent", href: "research-consent.html", icon: "📝" },
        { text: "Data Deletion", href: "data-deletion.html", icon: "🗑️" },
      ],
    },
  },

  social: {
    links: [
      {
        text: "GitHub",
        href: "https://github.com/mindbomber/SimulateAI",
        icon: "💻",
      },
      {
        text: "LinkedIn",
        href: "https://www.linkedin.com/company/simulateai-ethics",
        icon: "👔",
      },
      {
        text: "Slack",
        href: "https://simulateai.slack.com/",
        icon: "💬",
      },
    ],
  },

  certifications: [
    { text: "ISTE Standards Aligned", icon: "✅" },
    { text: "GDPR Compliant", icon: "🇪🇺" },
    { text: "Educational Research", icon: "📊" },
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
              <a href="index.html" aria-label="Return to SimulateAI Homepage">
                <img src="src/assets/icons/logo.svg" alt="SimulateAI Logo" class="brand-logo-img">
              </a>
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
                ([, section]) => `
              <div class="footer-section">
                <h4 class="section-title">${section.title}</h4>
                <ul class="section-links">
                  ${section.links
                    .map(
                      (link) => `
                    <li>
                      <a href="${link.href}" ${link.href.includes("mailto:") ? "" : 'rel="noopener"'}>
                        <span class="link-icon">${link.icon}</span>
                        <span class="link-text">${link.text}</span>
                      </a>
                    </li>
                  `,
                    )
                    .join("")}
                </ul>
              </div>
            `,
              )
              .join("")}
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
                      (link) => `
                    <a href="${link.href}" target="_blank" rel="noopener noreferrer" aria-label="${link.text}">
                      <span class="social-icon">${link.icon}</span>
                      <span class="social-text">${link.text}</span>
                    </a>
                  `,
                    )
                    .join("")}
                </div>
              </div>
              
              <!-- Certifications -->
              <div class="footer-certifications">
                ${certifications
                  .map(
                    (cert) => `
                  <div class="certification-item">
                    <span class="cert-icon">${cert.icon}</span>
                    <span class="cert-text">${cert.text}</span>
                  </div>
                `,
                  )
                  .join("")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `;
}

/**
 * Generate Footer CSS (now references external footer.css)
 */
function generateFooterCSS() {
  // CSS is now externally managed in src/styles/footer.css
  // This function maintained for compatibility but returns empty string
  return "";
}

/**
 * Initialize Footer Component
 */
function initializeFooter() {
  // Remove any existing inline footer styles (cleanup from old implementation)
  const existingStyles = document.querySelectorAll(
    "style[data-footer-component]",
  );
  existingStyles.forEach((style) => style.remove());

  // CSS is now managed externally in src/styles/footer.css
  // No need to inject inline styles

  // Look for footer placeholder first
  const placeholder = document.getElementById("footer-placeholder");
  if (placeholder) {
    placeholder.outerHTML = generateFooterHTML();
    return;
  }

  // Find existing footer and replace it
  const existingFooter = document.querySelector("footer");
  if (existingFooter) {
    existingFooter.outerHTML = generateFooterHTML();
  } else {
    // If no footer exists, append to body
    document.body.insertAdjacentHTML("beforeend", generateFooterHTML());
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
if (typeof window !== "undefined" && document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeFooter);
} else if (typeof window !== "undefined") {
  initializeFooter();
}

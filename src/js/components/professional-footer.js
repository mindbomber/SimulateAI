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
 *
 * Performance Optimizations:
 * - Pre-calculated current year to avoid repeated Date() calls
 * - Optimized DOM queries with caching and batched operations
 * - Streamlined footer replacement logic
 */

/**
 * Performance Constants - Pre-calculated values to avoid repeated operations
 */
const FOOTER_CONSTANTS = {
  CURRENT_YEAR: new Date().getFullYear(), // Pre-calculate to avoid repeated Date() calls
  INITIALIZED: false, // Track module initialization state (combined with DOM checking for robust duplicate prevention)
};

/**
 * Footer Configuration
 */
const FOOTER_CONFIG = {
  brand: {
    name: "SimulateAI",
    tagline: "Ethical AI Education Through Interactive Simulations",
    year: FOOTER_CONSTANTS.CURRENT_YEAR, // Use pre-calculated year
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
 * Generate Footer HTML with optimized template generation
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
 * Initialize Footer Component with robust duplicate prevention
 */
function initializeFooter() {
  // Robust duplicate prevention - check both module state AND DOM state
  const existingFooter = document.querySelector(".professional-footer");

  if (FOOTER_CONSTANTS.INITIALIZED && existingFooter) {
    console.debug(
      "Footer already initialized (module + DOM check), skipping duplicate execution",
    );
    return;
  }

  // If footer exists in DOM but module state was reset, just mark as initialized
  if (existingFooter && !FOOTER_CONSTANTS.INITIALIZED) {
    console.debug(
      "Footer found in DOM, updating module state without re-rendering",
    );
    FOOTER_CONSTANTS.INITIALIZED = true;
    return;
  }

  // Batch DOM cleanup operations - remove existing styles efficiently
  const existingStyles = document.querySelectorAll(
    "style[data-footer-component]",
  );
  if (existingStyles.length > 0) {
    existingStyles.forEach((style) => style.remove());
  }

  // CSS is now managed externally in src/styles/footer.css
  // No need to inject inline styles

  // Optimized footer replacement logic - single query strategy
  const footerHTML = generateFooterHTML(); // Generate once, reuse

  // Priority 1: Look for footer placeholder
  const placeholder = document.getElementById("footer-placeholder");
  if (placeholder) {
    placeholder.outerHTML = footerHTML;
    FOOTER_CONSTANTS.INITIALIZED = true; // Mark as initialized
    return;
  }

  // Priority 2: Find existing footer and replace it
  const existingGenericFooter = document.querySelector("footer");
  if (existingGenericFooter) {
    existingGenericFooter.outerHTML = footerHTML;
    FOOTER_CONSTANTS.INITIALIZED = true; // Mark as initialized
  } else {
    // Priority 3: If no footer exists, append to body
    document.body.insertAdjacentHTML("beforeend", footerHTML);
    FOOTER_CONSTANTS.INITIALIZED = true; // Mark as initialized
  }
}

/**
 * Force re-initialization of footer (useful for dynamic content updates)
 */
function reinitializeFooter() {
  FOOTER_CONSTANTS.INITIALIZED = false;
  initializeFooter();
}

// Export for use in other modules
export {
  generateFooterHTML,
  initializeFooter,
  reinitializeFooter,
  FOOTER_CONFIG,
};

// Auto-initialize if script is loaded directly
if (typeof window !== "undefined" && document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeFooter);
} else if (typeof window !== "undefined") {
  initializeFooter();
}

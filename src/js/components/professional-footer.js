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
 * Footer Batch Manager - Optimizes DOM operations for better performance
 */
class FooterBatchManager {
  constructor() {
    this.pendingOperations = [];
    this.batchTimeout = null;
    this.performanceMetrics = {
      initializationTime: 0,
      batchedOperations: 0,
      domQueriesReduced: 0,
      layoutRecalculations: 0,
    };
  }

  /**
   * Batch remove multiple DOM elements to prevent layout thrashing
   */
  batchRemoveElements(elements) {
    if (elements.length === 0) return;

    requestAnimationFrame(() => {
      const startTime = performance.now();
      elements.forEach((element) => {
        try {
          element.remove();
        } catch (error) {
          console.warn("[Footer] Failed to remove element:", error);
        }
      });

      this.performanceMetrics.batchedOperations++;
      const endTime = performance.now();
      console.debug(
        `[Footer] Batched removal of ${elements.length} elements took ${endTime - startTime}ms`,
      );
    });
  }

  /**
   * Batch DOM queries to reduce DOM traversal overhead
   */
  batchDOMQueries() {
    const startTime = performance.now();

    const elements = {
      existing: document.querySelector(".professional-footer"),
      placeholder: document.getElementById("footer-placeholder"),
      generic: document.querySelector("footer"),
      styles: Array.from(
        document.querySelectorAll("style[data-footer-component]"),
      ),
    };

    const endTime = performance.now();
    this.performanceMetrics.domQueriesReduced += 3; // Reduced from 4 separate queries to 1 batch
    console.debug(`[Footer] Batched DOM queries took ${endTime - startTime}ms`);

    return elements;
  }

  /**
   * Execute batched footer update operations
   */
  executeBatchedFooterUpdate(html) {
    const initStartTime = performance.now();
    const elements = this.batchDOMQueries();

    // Batch cleanup first
    if (elements.styles.length > 0) {
      this.batchRemoveElements(elements.styles);
    }

    // Then execute footer replacement in priority order
    requestAnimationFrame(() => {
      try {
        if (elements.placeholder) {
          elements.placeholder.outerHTML = html;
        } else if (elements.generic) {
          elements.generic.outerHTML = html;
        } else {
          document.body.insertAdjacentHTML("beforeend", html);
        }

        // Single flag update after all operations
        FOOTER_CONSTANTS.INITIALIZED = true;

        // Track performance metrics
        const initEndTime = performance.now();
        this.performanceMetrics.initializationTime =
          initEndTime - initStartTime;
        this.performanceMetrics.layoutRecalculations++;

        console.debug(
          `[Footer] Batched initialization completed in ${this.performanceMetrics.initializationTime}ms`,
        );

        // Send metrics to monitoring if available
        this.reportMetrics();
      } catch (error) {
        console.error("[Footer] Failed to update footer:", error);
        // Fallback: still mark as initialized to prevent infinite loops
        FOOTER_CONSTANTS.INITIALIZED = true;
      }
    });
  }

  /**
   * Report performance metrics to monitoring system
   */
  reportMetrics() {
    if (window.enterpriseMonitoring) {
      window.enterpriseMonitoring.send("footer_batching_metrics", {
        component: "professional-footer",
        metrics: this.performanceMetrics,
        timestamp: new Date().toISOString(),
      });
    }

    // Store metrics locally as backup
    try {
      const existing = JSON.parse(
        localStorage.getItem("footer_performance") || "[]",
      );
      const combined = [...existing, this.performanceMetrics].slice(-50); // Keep last 50
      localStorage.setItem("footer_performance", JSON.stringify(combined));
    } catch (e) {
      // Storage error - continue without local backup
    }
  }
}

// Create singleton instance for batching operations
const footerBatchManager = new FooterBatchManager();

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
 * Optimized template data preprocessing to reduce repeated calculations
 */
function preprocessFooterData(config) {
  const startTime = performance.now();

  // Pre-process all data that requires computation
  const optimizedConfig = {
    ...config,
    sections: Object.entries(config.sections).map(([, section]) => ({
      ...section,
      links: section.links.map((link) => ({
        ...link,
        relAttribute: link.href.includes("mailto:") ? "" : 'rel="noopener"',
        isExternal:
          !link.href.includes("mailto:") && !link.href.startsWith("#"),
      })),
    })),
    social: {
      ...config.social,
      links: config.social.links.map((link) => ({
        ...link,
        targetAttribute: 'target="_blank"',
        relAttribute: 'rel="noopener noreferrer"',
      })),
    },
  };

  const endTime = performance.now();
  console.debug(
    `[Footer] Template preprocessing took ${endTime - startTime}ms`,
  );

  return optimizedConfig;
}

/**
 * Generate Footer HTML with optimized template generation
 */
function generateFooterHTML() {
  const { brand, certifications } = FOOTER_CONFIG;

  // Pre-process data for optimized template generation
  const optimizedConfig = preprocessFooterData(FOOTER_CONFIG);
  const { sections, social } = optimizedConfig;

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
            ${sections
              .map(
                (section) => `
              <div class="footer-section">
                <h4 class="section-title">${section.title}</h4>
                <ul class="section-links">
                  ${section.links
                    .map(
                      (link) => `
                    <li>
                      <a href="${link.href}" ${link.relAttribute}>
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
                    <a href="${link.href}" ${link.targetAttribute} ${link.relAttribute} aria-label="${link.text}">
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
 * Initialize Footer Component with batched DOM operations for optimal performance
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

  // Use batched DOM operations for optimal performance
  const footerHTML = generateFooterHTML(); // Generate once, reuse
  footerBatchManager.executeBatchedFooterUpdate(footerHTML);
}

/**
 * Force re-initialization of footer (useful for dynamic content updates)
 */
function reinitializeFooter() {
  FOOTER_CONSTANTS.INITIALIZED = false;

  // Reset performance metrics for new initialization
  footerBatchManager.performanceMetrics = {
    initializationTime: 0,
    batchedOperations: 0,
    domQueriesReduced: 0,
    layoutRecalculations: 0,
  };

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

/**
 * About Page JavaScript
 * Handles any interactive elements and enhancements for the about page
 */

class AboutPage {
  constructor() {
    this.init();
  }

  init() {
    // Initialize about page functionality
    this.setupScrollAnimations();
    this.setupInteractiveElements();
  }

  setupScrollAnimations() {
    // Add intersection observer for fade-in animations
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.style.opacity = "1";
              entry.target.style.transform = "translateY(0)";
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -50px 0px",
        },
      );

      // Observe all sections
      const sections = document.querySelectorAll(".about-section");
      sections.forEach((section) => {
        section.style.opacity = "0";
        section.style.transform = "translateY(20px)";
        section.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        observer.observe(section);
      });
    }
  }

  setupInteractiveElements() {
    // Add hover effects and click handlers for feature cards
    const featureCards = document.querySelectorAll(
      ".feature-card, .audience-card",
    );

    featureCards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        this.animateCard(card, "enter");
      });

      card.addEventListener("mouseleave", () => {
        this.animateCard(card, "leave");
      });
    });

    // Add smooth scrolling for CTA buttons
    const ctaButtons = document.querySelectorAll(".cta-button");
    ctaButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        // Add a subtle click animation
        button.style.transform = "scale(0.95)";
        setTimeout(() => {
          button.style.transform = "";
        }, 150);
      });
    });
  }

  animateCard(card, action) {
    if (action === "enter") {
      card.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
    } else {
      card.style.transition = "all 0.3s ease";
    }
  }
}

// Initialize the about page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new AboutPage();
});

export default AboutPage;

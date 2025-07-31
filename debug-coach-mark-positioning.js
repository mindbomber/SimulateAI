/**
 * Debug script to test coach mark positioning behavior
 * Run this in the browser console to verify the fix
 */

function debugCoachMarkPositioning() {
  console.log("🔍 Testing Coach Mark Positioning Fix");

  // Find the onboarding tour instance
  const tour = window.onboardingTourInstance;
  if (!tour) {
    console.error("❌ No active onboarding tour instance found");
    return;
  }

  // Check current step configuration
  const currentTutorial = tour.tutorials[tour.currentTutorial];
  const currentStep = currentTutorial?.steps[tour.currentStep];

  if (!currentStep) {
    console.error("❌ No current step found");
    return;
  }

  console.log("📊 Current Step Info:", {
    tutorial: tour.currentTutorial,
    stepIndex: tour.currentStep,
    stepId: currentStep.id,
    hasResponsiveConfig: !!currentStep.responsiveConfig,
    responsiveConfig: currentStep.responsiveConfig,
  });

  // Check coach mark element
  const coachMark = tour.coachMark;
  if (!coachMark) {
    console.error("❌ No coach mark element found");
    return;
  }

  // Get dimensions and positioning info
  const rect = coachMark.getBoundingClientRect();
  const computedStyle = getComputedStyle(coachMark);
  const viewportWidth = window.innerWidth;

  console.log("📐 Coach Mark Dimensions:", {
    width: rect.width,
    height: rect.height,
    maxWidth: computedStyle.maxWidth,
    position: {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
    },
  });

  // Test responsive configuration
  const isMobile = viewportWidth <= 768;
  const isTablet = viewportWidth > 768 && viewportWidth <= 1024;
  const isDesktop = viewportWidth > 1024;

  let activeConfig = null;
  if (currentStep.responsiveConfig) {
    if (isMobile) activeConfig = currentStep.responsiveConfig.mobile;
    else if (isTablet) activeConfig = currentStep.responsiveConfig.tablet;
    else if (isDesktop) activeConfig = currentStep.responsiveConfig.desktop;
  }

  console.log("🎯 Responsive Configuration:", {
    viewportWidth,
    deviceType: isMobile ? "mobile" : isTablet ? "tablet" : "desktop",
    activeConfig,
    expectedMaxWidth: activeConfig?.maxWidth,
  });

  // Calculate expected width based on configuration
  if (activeConfig?.maxWidth && activeConfig.maxWidth.includes("%")) {
    const percentageValue = parseFloat(activeConfig.maxWidth) / 100;
    const calculatedWidthPx = viewportWidth * percentageValue;
    const cssMaxWidthPx = 400; // From CSS constraint
    const expectedEffectiveWidth = Math.min(calculatedWidthPx, cssMaxWidthPx);

    console.log("🧮 Width Calculation:", {
      configuredPercentage: activeConfig.maxWidth,
      calculatedFromPercentage: `${calculatedWidthPx}px`,
      cssMaxWidth: `${cssMaxWidthPx}px`,
      expectedEffectiveWidth: `${expectedEffectiveWidth}px`,
      actualWidth: `${rect.width}px`,
      isWithinExpected: Math.abs(rect.width - expectedEffectiveWidth) < 5,
    });
  }

  // Check if positioned correctly relative to target
  const targetElement = currentStep.target
    ? document.querySelector(currentStep.target)
    : null;
  if (targetElement) {
    const targetRect = targetElement.getBoundingClientRect();
    console.log("🎯 Target Element:", {
      selector: currentStep.target,
      found: !!targetElement,
      position: {
        left: targetRect.left,
        top: targetRect.top,
        right: targetRect.right,
        bottom: targetRect.bottom,
      },
    });

    // Check positioning relationship
    const isProperlyPositioned =
      rect.left >= 0 &&
      rect.right <= viewportWidth && // Within viewport horizontally
      rect.top >= 0 &&
      rect.bottom <= window.innerHeight; // Within viewport vertically

    console.log("✅ Positioning Check:", {
      isWithinViewport: isProperlyPositioned,
      coachMarkRect: {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
      targetRect: {
        left: Math.round(targetRect.left),
        top: Math.round(targetRect.top),
        width: Math.round(targetRect.width),
        height: Math.round(targetRect.height),
      },
    });
  }

  console.log("✅ Debug complete! Check the logged information above.");
}

// Export for global access
window.debugCoachMarkPositioning = debugCoachMarkPositioning;

console.log(
  "🛠️ Debug script loaded! Run debugCoachMarkPositioning() to test positioning.",
);

/**
 * SimulateAI reCAPTCHA Enterprise Verification Functions
 * Firebase Cloud Functions for server-side token verification
 */

const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const {
  RecaptchaEnterpriseServiceClient,
} = require("@google-cloud/recaptcha-enterprise");

// Set global options for cost control
setGlobalOptions({ maxInstances: 10 });

/**
 * Configuration for reCAPTCHA Enterprise verification
 */
const RECAPTCHA_CONFIG = {
  PROJECT_ID: "simulateai-research",
  SITE_KEY: "6LcuUpsrAAAAAEzAeX1qx0cjShEt7Nf0f73rvLjf",

  // Score thresholds for different security levels
  SCORE_THRESHOLDS: {
    high: 0.9,
    medium: 0.7,
    low: 0.5,
    minimum: 0.3,
  },

  // Valid actions from frontend
  VALID_ACTIONS: [
    "auth_login",
    "auth_signup",
    "submit_form",
    "contact_form",
    "research_consent",
    "feedback_form",
    "scenario_submit",
    "email_subscribe",
    "domain_test",
    "quick_test",
  ],
};

/**
 * reCAPTCHA Enterprise Verification Class
 */
class RecaptchaEnterpriseVerifier {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  /**
   * Initialize the reCAPTCHA Enterprise client
   */
  async initialize() {
    if (this.initialized) {
      return true;
    }

    try {
      this.client = new RecaptchaEnterpriseServiceClient();
      this.initialized = true;
      logger.info("✅ reCAPTCHA Enterprise client initialized");
      return true;
    } catch (error) {
      logger.error(
        "❌ Failed to initialize reCAPTCHA Enterprise client:",
        error,
      );
      return false;
    }
  }

  /**
   * Create assessment to verify reCAPTCHA token
   */
  async createAssessment(token, recaptchaAction, securityLevel = "medium") {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!this.client) {
        throw new Error("reCAPTCHA Enterprise client not available");
      }

      const projectPath = this.client.projectPath(RECAPTCHA_CONFIG.PROJECT_ID);
      const request = {
        assessment: {
          event: {
            token: token,
            siteKey: RECAPTCHA_CONFIG.SITE_KEY,
            expectedAction: recaptchaAction,
          },
        },
        parent: projectPath,
      };

      logger.info(`🔍 Creating assessment for action: ${recaptchaAction}`);

      const [response] = await this.client.createAssessment(request);
      return this.processAssessmentResponse(
        response,
        recaptchaAction,
        securityLevel,
      );
    } catch (error) {
      logger.error("❌ Assessment creation failed:", error);
      return {
        success: false,
        error: error.message,
        score: 0,
        valid: false,
        action: recaptchaAction,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Process the assessment response from reCAPTCHA Enterprise
   */
  processAssessmentResponse(response, expectedAction, securityLevel) {
    const result = {
      success: false,
      score: 0,
      valid: false,
      action: expectedAction,
      reasons: [],
      assessmentName: "",
      timestamp: new Date().toISOString(),
    };

    try {
      if (!response.tokenProperties.valid) {
        result.error = `Token invalid: ${response.tokenProperties.invalidReason}`;
        logger.warn(
          `❌ Invalid token: ${response.tokenProperties.invalidReason}`,
        );
        return result;
      }

      const actualAction = response.tokenProperties.action;
      if (actualAction !== expectedAction) {
        result.error = `Action mismatch. Expected: ${expectedAction}, Got: ${actualAction}`;
        logger.warn(
          `⚠️ Action mismatch: expected ${expectedAction}, got ${actualAction}`,
        );
        return result;
      }

      const riskAnalysis = response.riskAnalysis;
      result.score = riskAnalysis.score;
      result.reasons = riskAnalysis.reasons || [];
      result.valid = true;

      const requiredScore =
        RECAPTCHA_CONFIG.SCORE_THRESHOLDS[securityLevel] || 0.7;
      result.success = result.score >= requiredScore;
      result.assessmentName = response.name;

      logger.info(
        `✅ Assessment completed: Score ${result.score}, Required ${requiredScore}, Success ${result.success}`,
      );

      return result;
    } catch (error) {
      result.error = `Response processing failed: ${error.message}`;
      logger.error("❌ Response processing error:", error);
      return result;
    }
  }

  /**
   * Validate request parameters
   */
  validateRequest(params) {
    const { token, action, securityLevel } = params;

    if (!token || typeof token !== "string" || token.length < 20) {
      return { valid: false, error: "Invalid or missing token" };
    }

    if (!action || typeof action !== "string") {
      return { valid: false, error: "Invalid or missing action" };
    }

    if (
      securityLevel &&
      !Object.keys(RECAPTCHA_CONFIG.SCORE_THRESHOLDS).includes(securityLevel)
    ) {
      return { valid: false, error: "Invalid security level" };
    }

    if (!RECAPTCHA_CONFIG.VALID_ACTIONS.includes(action)) {
      logger.warn(`⚠️ Unknown action: ${action}`);
    }

    return { valid: true };
  }
}

// Create singleton instance
const verifier = new RecaptchaEnterpriseVerifier();

/**
 * Cloud Function for reCAPTCHA verification
 */
exports.verifyRecaptcha = onRequest({ cors: true }, async (req, res) => {
  // Set CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  // Only allow POST
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { token, action, securityLevel = "medium", siteKey } = req.body;

    // Validate request
    const validation = verifier.validateRequest({
      token,
      action,
      securityLevel,
    });
    if (!validation.valid) {
      logger.warn(`❌ Request validation failed: ${validation.error}`);
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    // Verify site key matches (security check)
    if (siteKey && siteKey !== RECAPTCHA_CONFIG.SITE_KEY) {
      logger.warn(`❌ Invalid site key provided: ${siteKey}`);
      return res.status(400).json({
        success: false,
        error: "Invalid site key",
      });
    }

    // Perform verification
    const result = await verifier.createAssessment(
      token,
      action,
      securityLevel,
    );

    // Log result for monitoring
    if (result.success) {
      logger.info(
        `✅ Verification successful: ${action} (score: ${result.score})`,
      );
    } else {
      logger.warn(
        `❌ Verification failed: ${action} (${result.error || "Low score"})`,
      );
    }

    // Return result
    res.json(result);
  } catch (error) {
    logger.error("❌ API endpoint error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * Health check function
 */
exports.recaptchaHealth = onRequest({ cors: true }, async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  try {
    const isInitialized = await verifier.initialize();
    res.json({
      status: "healthy",
      service: "recaptcha-enterprise-verification",
      initialized: isInitialized,
      projectId: RECAPTCHA_CONFIG.PROJECT_ID,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("❌ Health check failed:", error);
    res.status(500).json({
      status: "error",
      error: error.message,
    });
  }
});

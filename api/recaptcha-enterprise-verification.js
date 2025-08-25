/**
 * Node.js reCAPTCHA Enterprise Backend Verification API
 * Server-side token validation using Google Cloud reCAPTCHA Enterprise
 *
 * Deploy as Firebase Cloud Function or Express.js API
 *
 * @version 1.0.0
 * @author SimulateAI Team
 * @license Apache-2.0
 */

const {
  RecaptchaEnterpriseServiceClient,
} = require("@google-cloud/recaptcha-enterprise");

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
      // Create the reCAPTCHA Enterprise client
      this.client = new RecaptchaEnterpriseServiceClient();
      this.initialized = true;
      console.log("✅ reCAPTCHA Enterprise client initialized");
      return true;
    } catch (error) {
      console.error(
        "❌ Failed to initialize reCAPTCHA Enterprise client:",
        error,
      );
      return false;
    }
  }

  /**
   * Create assessment to verify reCAPTCHA token
   * @param {string} token - reCAPTCHA token from client
   * @param {string} recaptchaAction - Expected action name
   * @param {string} securityLevel - Security level requirement
   * @returns {Promise<Object>} Assessment result
   */
  async createAssessment(token, recaptchaAction, securityLevel = "medium") {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!this.client) {
        throw new Error("reCAPTCHA Enterprise client not available");
      }

      // Build the project path
      const projectPath = this.client.projectPath(RECAPTCHA_CONFIG.PROJECT_ID);

      // Create the assessment request
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

      console.log(`🔍 Creating assessment for action: ${recaptchaAction}`);

      // Call the reCAPTCHA Enterprise API
      const [response] = await this.client.createAssessment(request);

      // Process the response
      return this.processAssessmentResponse(
        response,
        recaptchaAction,
        securityLevel,
      );
    } catch (error) {
      console.error("❌ Assessment creation failed:", error);
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
   * @param {Object} response - API response
   * @param {string} expectedAction - Expected action
   * @param {string} securityLevel - Security level
   * @returns {Object} Processed result
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
      // Check if the token is valid
      if (!response.tokenProperties.valid) {
        result.error = `Token invalid: ${response.tokenProperties.invalidReason}`;
        console.log(
          `❌ Invalid token: ${response.tokenProperties.invalidReason}`,
        );
        return result;
      }

      // Check if the expected action was executed
      const actualAction = response.tokenProperties.action;
      if (actualAction !== expectedAction) {
        result.error = `Action mismatch. Expected: ${expectedAction}, Got: ${actualAction}`;
        console.log(
          `⚠️ Action mismatch: expected ${expectedAction}, got ${actualAction}`,
        );
        return result;
      }

      // Get the risk score and reasons
      const riskAnalysis = response.riskAnalysis;
      result.score = riskAnalysis.score;
      result.reasons = riskAnalysis.reasons || [];
      result.valid = true;

      // Check if score meets security requirements
      const requiredScore =
        RECAPTCHA_CONFIG.SCORE_THRESHOLDS[securityLevel] || 0.7;
      result.success = result.score >= requiredScore;

      // Get assessment name for potential annotation
      result.assessmentName = response.name;

      // Log the results
      console.log(`✅ Assessment completed:`);
      console.log(`   Score: ${result.score}`);
      console.log(`   Required: ${requiredScore}`);
      console.log(`   Success: ${result.success}`);
      console.log(`   Reasons: ${result.reasons.join(", ")}`);

      return result;
    } catch (error) {
      result.error = `Response processing failed: ${error.message}`;
      console.error("❌ Response processing error:", error);
      return result;
    }
  }

  /**
   * Validate request parameters
   * @param {Object} params - Request parameters
   * @returns {Object} Validation result
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
      console.warn(`⚠️ Unknown action: ${action}`);
    }

    return { valid: true };
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.initialized = false;
      console.log("🧹 reCAPTCHA Enterprise client cleaned up");
    }
  }
}

// Create singleton instance
const verifier = new RecaptchaEnterpriseVerifier();

/**
 * Express.js API endpoint for reCAPTCHA verification
 */
async function verifyRecaptchaToken(req, res) {
  try {
    const { token, action, securityLevel = "medium", siteKey } = req.body;

    // Validate request
    const validation = verifier.validateRequest({
      token,
      action,
      securityLevel,
    });
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    // Verify site key matches (security check)
    if (siteKey && siteKey !== RECAPTCHA_CONFIG.SITE_KEY) {
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

    // Return result
    res.json(result);
  } catch (error) {
    console.error("❌ API endpoint error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Health check endpoint
 */
async function healthCheck(req, res) {
  try {
    const isInitialized = await verifier.initialize();
    res.json({
      status: "healthy",
      service: "recaptcha-enterprise-verification",
      initialized: isInitialized,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
    });
  }
}

/**
 * Firebase Cloud Function implementation
 */
const functions = require("firebase-functions");

// Export as Firebase Cloud Function
exports.verifyRecaptcha = functions.https.onRequest(async (req, res) => {
  // Enable CORS
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

  await verifyRecaptchaToken(req, res);
});

// Health check function
exports.recaptchaHealth = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  await healthCheck(req, res);
});

/**
 * Express.js server implementation (for standalone deployment)
 */
if (require.main === module) {
  const express = require("express");
  const cors = require("cors");
  const app = express();

  app.use(cors());
  app.use(express.json());

  // API routes
  app.post("/api/verify-recaptcha", verifyRecaptchaToken);
  app.get("/api/health", healthCheck);

  // Start server
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 reCAPTCHA Enterprise API server running on port ${PORT}`);
  });

  // Graceful shutdown
  process.on("SIGTERM", async () => {
    console.log("📡 Shutting down server...");
    await verifier.cleanup();
    process.exit(0);
  });
}

// Export for testing and external use
module.exports = {
  RecaptchaEnterpriseVerifier,
  verifyRecaptchaToken,
  healthCheck,
  RECAPTCHA_CONFIG,
};

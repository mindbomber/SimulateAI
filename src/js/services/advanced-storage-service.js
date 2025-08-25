/**
 * Advanced Firebase Storage Features for SimulateAI
 * Image processing, batch operations, and enhanced file management
 */

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

/**
 * Advanced Storage Configuration
 */
const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB;
const BYTES_PER_GB = BYTES_PER_MB * BYTES_PER_KB;
const RESEARCHER_GB_LIMIT = 5;
const LARGE_FILE_MB_THRESHOLD = 10;
const HEX_BASE = 16;
const HEX_PAD_LENGTH = 2;
const IMAGE_SIZE_MULTIPLIER = 4;
const CHUNK_SIZE_KB = 256;
const SIMILARITY_THRESHOLD = 0.8;
const MONTH_STRING_LENGTH = 7;
const MILLISECONDS_MULTIPLIER = 1000;

const ADVANCED_CONFIG = {
  // Image processing settings
  IMAGE_PROCESSING: {
    PROFILE_SIZES: {
      thumbnail: { width: 64, height: 64 },
      small: { width: 128, height: 128 },
      medium: { width: 256, height: 256 },
      large: { width: 512, height: 512 },
    },
    BLOG_SIZES: {
      thumbnail: { width: 200, height: 150 },
      medium: { width: 600, height: 450 },
      large: { width: 1200, height: 900 },
    },
    QUALITY: 0.85,
    FORMATS: {
      webp: "image/webp",
      jpeg: "image/jpeg",
      png: "image/png",
    },
  },

  // User quotas (in bytes)
  USER_QUOTAS: {
    free: 100 * BYTES_PER_MB, // 100MB
    premium: BYTES_PER_GB, // 1GB
    researcher: RESEARCHER_GB_LIMIT * BYTES_PER_GB, // 5GB
  },

  // File validation
  ADVANCED_VALIDATION: {
    MAX_BATCH_SIZE: 10,
    VIRUS_SCAN_ENABLED: false, // Would require external service
    CONTENT_MODERATION: false, // Would require AI service
  },

  // Performance settings
  PERFORMANCE: {
    CHUNK_SIZE: CHUNK_SIZE_KB * BYTES_PER_KB, // 256KB chunks for resumable uploads
    MAX_CONCURRENT_UPLOADS: 3,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
  },
};

/**
 * Advanced Firebase Storage Service
 */
export class AdvancedStorageService {
  constructor(firebaseApp, hybridDataService = null) {
    this.app = firebaseApp;
    this.storage = getStorage(firebaseApp);
    this.hybridData = hybridDataService;
    this.activeUploads = new Map();
    this.uploadQueue = [];
    this.processingQueue = false;
    this.userQuotas = new Map();
  }

  /**
   * Image Processing Features
   */
  async processImageForProfile(
    file,
    sizes = ADVANCED_CONFIG.IMAGE_PROCESSING.PROFILE_SIZES,
  ) {
    const processedImages = {};

    for (const [sizeName, dimensions] of Object.entries(sizes)) {
      try {
        const processedFile = await this.resizeImage(
          file,
          dimensions.width,
          dimensions.height,
        );
        processedImages[sizeName] = processedFile;
      } catch (error) {
        // Failed to process image size, continue with next size
      }
    }

    return processedImages;
  }

  async resizeImage(
    file,
    maxWidth,
    maxHeight,
    quality = ADVANCED_CONFIG.IMAGE_PROCESSING.QUALITY,
  ) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        const { width, height } = this.calculateResizeDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight,
        );

        canvas.width = width;
        canvas.height = height;

        // Draw and resize image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              reject(new Error("Failed to create resized image"));
            }
          },
          "image/jpeg",
          quality,
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  }

  calculateResizeDimensions(
    originalWidth,
    originalHeight,
    maxWidth,
    maxHeight,
  ) {
    let width = originalWidth;
    let height = originalHeight;

    // Scale down if necessary
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Enhanced Profile Image Upload with Multiple Sizes
   */
  async uploadProfileImageWithSizes(userId, file, progressCallback = null) {
    try {
      // Check user quota
      const quotaCheck = await this.checkUserQuota(
        userId,
        file.size * IMAGE_SIZE_MULTIPLIER,
      ); // Estimate for multiple sizes
      if (!quotaCheck.allowed) {
        throw new Error(`Upload would exceed quota: ${quotaCheck.message}`);
      }

      // Process image into multiple sizes
      const processedImages = await this.processImageForProfile(file);
      const uploadResults = {};

      // Upload each size
      for (const [sizeName, processedFile] of Object.entries(processedImages)) {
        const filePath = `users/${userId}/profile/${sizeName}_${Date.now()}.jpg`;
        const storageRef = ref(this.storage, filePath);

        try {
          const result = await this.uploadFileWithProgress(
            storageRef,
            processedFile,
            (progress) => {
              if (progressCallback) {
                progressCallback({
                  size: sizeName,
                  progress: progress.progress,
                  overall:
                    (Object.keys(uploadResults).length /
                      Object.keys(processedImages).length) *
                    100,
                });
              }
            },
          );

          uploadResults[sizeName] = {
            downloadURL: result.downloadURL,
            filePath,
            size: processedFile.size,
          };
        } catch (uploadError) {
          // Failed to upload profile image size, continue with other sizes
        }
      }

      // Store metadata
      if (this.hybridData) {
        await this.hybridData.createFirestoreDocument(
          `user_files`,
          `${userId}_profile_images`,
          {
            userId,
            type: "profile_images",
            originalFileName: file.name,
            sizes: uploadResults,
            uploadedAt: new Date(),
            totalSize: Object.values(uploadResults).reduce(
              (sum, img) => sum + img.size,
              0,
            ),
          },
        );
      }

      // Update user quota
      await this.updateUserQuota(
        userId,
        Object.values(uploadResults).reduce((sum, img) => sum + img.size, 0),
      );

      return {
        success: true,
        sizes: uploadResults,
        originalFile: file.name,
      };
    } catch (error) {
      throw new Error(`Profile image processing failed: ${error.message}`);
    }
  }

  /**
   * Batch Upload Operations
   */
  async uploadMultipleFiles(files, uploadFunction, progressCallback = null) {
    const results = [];
    const maxConcurrent = ADVANCED_CONFIG.PERFORMANCE.MAX_CONCURRENT_UPLOADS;

    for (let i = 0; i < files.length; i += maxConcurrent) {
      const batch = files.slice(i, i + maxConcurrent);

      const batchPromises = batch.map(async (file, index) => {
        try {
          const result = await uploadFunction(file, (progress) => {
            if (progressCallback) {
              progressCallback({
                fileIndex: i + index,
                fileName: file.name,
                progress: progress.progress,
                overallProgress: ((i + index) / files.length) * 100,
              });
            }
          });

          return { file: file.name, success: true, result };
        } catch (error) {
          return { file: file.name, success: false, error: error.message };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      results.push(
        ...batchResults.map((r) =>
          r.status === "fulfilled" ? r.value : r.reason,
        ),
      );
    }

    return {
      total: files.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }

  /**
   * Smart Duplicate Detection
   */
  async checkForDuplicates(file, userId) {
    try {
      // Generate file hash for comparison
      const fileHash = await this.generateFileHash(file);

      // Check if this hash exists in user's files
      if (this.hybridData) {
        const existingFiles = await this.hybridData.queryFirestoreCollection(
          "user_files",
          {
            where: [
              ["userId", "==", userId],
              ["fileHash", "==", fileHash],
            ],
            limit: 1,
          },
        );

        if (existingFiles.length > 0) {
          return {
            isDuplicate: true,
            existingFile: existingFiles[0],
            message: `File "${file.name}" appears to be a duplicate of "${existingFiles[0].originalFileName}"`,
          };
        }
      }

      return { isDuplicate: false };
    } catch (error) {
      return { isDuplicate: false, error: error.message };
    }
  }

  async generateFileHash(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray
      .map((b) => b.toString(HEX_BASE).padStart(HEX_PAD_LENGTH, "0"))
      .join("");
  }

  /**
   * User Quota Management
   */
  async checkUserQuota(userId, fileSize) {
    try {
      // Get user's current usage
      const currentUsage = await this.getUserStorageUsage(userId);

      // Get user's quota (default to free tier)
      const userTier = await this.getUserTier(userId);
      const quota =
        ADVANCED_CONFIG.USER_QUOTAS[userTier] ||
        ADVANCED_CONFIG.USER_QUOTAS.free;

      const newTotal = currentUsage + fileSize;

      if (newTotal > quota) {
        return {
          allowed: false,
          currentUsage,
          quota,
          required: fileSize,
          message: `Would exceed quota by ${this.formatFileSize(newTotal - quota)}`,
        };
      }

      return {
        allowed: true,
        currentUsage,
        quota,
        remaining: quota - newTotal,
      };
    } catch (error) {
      // Default to allowing upload if quota check fails
      return { allowed: true, error: error.message };
    }
  }

  async getUserStorageUsage(userId) {
    try {
      if (this.hybridData) {
        const userFiles = await this.hybridData.queryFirestoreCollection(
          "user_files",
          {
            where: [["userId", "==", userId]],
          },
        );

        return userFiles.reduce(
          (total, file) => total + (file.totalSize || file.size || 0),
          0,
        );
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  async getUserTier(userId) {
    try {
      if (this.hybridData) {
        const userProfile = await this.hybridData.getFirestoreDocument(
          "users",
          userId,
        );
        return userProfile?.tier || userProfile?.subscription?.tier || "free";
      }
      return "free";
    } catch (error) {
      return "free";
    }
  }

  async updateUserQuota(userId, additionalUsage) {
    if (!this.hybridData) return;

    try {
      const currentUsage = await this.getUserStorageUsage(userId);
      await this.hybridData.updateFirestoreDocument("user_storage", userId, {
        totalUsage: currentUsage + additionalUsage,
        lastUpdated: new Date(),
      });
    } catch (error) {
      // Failed to update user quota - non-critical error
    }
  }

  /**
   * File Versioning
   */
  async uploadFileWithVersioning(
    userId,
    file,
    category,
    progressCallback = null,
  ) {
    try {
      // Check for existing versions
      const existingVersions = await this.getFileVersions(
        userId,
        file.name,
        category,
      );
      const version = existingVersions.length + 1;

      const filePath = `users/${userId}/${category}/v${version}_${Date.now()}_${file.name}`;
      const storageRef = ref(this.storage, filePath);

      const result = await this.uploadFileWithProgress(
        storageRef,
        file,
        progressCallback,
      );

      // Store version metadata
      if (this.hybridData) {
        await this.hybridData.createFirestoreDocument(
          "file_versions",
          `${userId}_${file.name}_v${version}`,
          {
            userId,
            fileName: file.name,
            category,
            version,
            filePath,
            downloadURL: result.downloadURL,
            size: file.size,
            uploadedAt: new Date(),
            isLatest: true,
          },
        );

        // Mark previous versions as not latest
        if (existingVersions.length > 0) {
          for (const existingVersion of existingVersions) {
            await this.hybridData.updateFirestoreDocument(
              "file_versions",
              existingVersion.id,
              {
                isLatest: false,
              },
            );
          }
        }
      }

      return {
        success: true,
        downloadURL: result.downloadURL,
        filePath,
        version,
        metadata: result.metadata,
      };
    } catch (error) {
      throw new Error(`Versioned upload failed: ${error.message}`);
    }
  }

  async getFileVersions(userId, fileName, category) {
    if (!this.hybridData) return [];

    try {
      return await this.hybridData.queryFirestoreCollection("file_versions", {
        where: [
          ["userId", "==", userId],
          ["fileName", "==", fileName],
          ["category", "==", category],
        ],
        orderBy: [["version", "desc"]],
      });
    } catch (error) {
      return [];
    }
  }

  /**
   * Enhanced Upload with Retry Logic
   */
  async uploadFileWithProgress(storageRef, file, progressCallback = null) {
    const maxRetries = ADVANCED_CONFIG.PERFORMANCE.RETRY_ATTEMPTS;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.attemptUpload(
          storageRef,
          file,
          progressCallback,
          attempt,
        );
      } catch (error) {
        lastError = error;

        if (attempt < maxRetries) {
          const delay = ADVANCED_CONFIG.PERFORMANCE.RETRY_DELAY * attempt;
          await new Promise((resolve) => setTimeout(resolve, delay));

          if (progressCallback) {
            progressCallback({
              progress: 0,
              state: "retrying",
              attempt,
              maxRetries,
            });
          }
        }
      }
    }

    throw new Error(
      `Upload failed after ${maxRetries} attempts: ${lastError.message}`,
    );
  }

  async attemptUpload(storageRef, file, progressCallback, attempt) {
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file, {
        chunkSize: ADVANCED_CONFIG.PERFORMANCE.CHUNK_SIZE,
      });

      const uploadId = `${storageRef.fullPath}_${Date.now()}_${attempt}`;
      this.activeUploads.set(uploadId, uploadTask);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

          if (progressCallback) {
            progressCallback({
              progress,
              state: snapshot.state,
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              attempt,
            });
          }
        },
        (error) => {
          this.activeUploads.delete(uploadId);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const { metadata } = uploadTask.snapshot;

            this.activeUploads.delete(uploadId);

            resolve({
              downloadURL,
              metadata,
              snapshot: uploadTask.snapshot,
            });
          } catch (error) {
            reject(error);
          }
        },
      );
    });
  }

  /**
   * Smart File Organization
   */
  async organizeUserFiles(userId) {
    try {
      if (!this.hybridData) {
        throw new Error("Hybrid data service not available");
      }

      // Get all user files
      const userFiles = await this.hybridData.queryFirestoreCollection(
        "user_files",
        {
          where: [["userId", "==", userId]],
        },
      );

      const organization = {
        images: [],
        documents: [],
        archives: [],
        other: [],
        duplicates: [],
        large: [], // Files over 10MB
      };

      for (const file of userFiles) {
        // Categorize by type
        if (file.contentType?.startsWith("image/")) {
          organization.images.push(file);
        } else if (
          file.contentType?.includes("pdf") ||
          file.contentType?.includes("document")
        ) {
          organization.documents.push(file);
        } else if (
          file.contentType?.includes("zip") ||
          file.contentType?.includes("archive")
        ) {
          organization.archives.push(file);
        } else {
          organization.other.push(file);
        }

        // Flag large files
        if (file.size > LARGE_FILE_MB_THRESHOLD * BYTES_PER_MB) {
          organization.large.push(file);
        }
      }

      // Find potential duplicates by name similarity
      for (let i = 0; i < userFiles.length; i++) {
        for (let j = i + 1; j < userFiles.length; j++) {
          if (
            this.calculateStringSimilarity(
              userFiles[i].fileName,
              userFiles[j].fileName,
            ) > SIMILARITY_THRESHOLD
          ) {
            organization.duplicates.push({
              file1: userFiles[i],
              file2: userFiles[j],
              similarity: this.calculateStringSimilarity(
                userFiles[i].fileName,
                userFiles[j].fileName,
              ),
            });
          }
        }
      }

      return {
        success: true,
        organization,
        summary: {
          total: userFiles.length,
          images: organization.images.length,
          documents: organization.documents.length,
          archives: organization.archives.length,
          other: organization.other.length,
          potentialDuplicates: organization.duplicates.length,
          largeFiles: organization.large.length,
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  calculateStringSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Utility Methods
   */
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Get comprehensive storage analytics
   */
  async getAdvancedStorageAnalytics(userId = null) {
    try {
      const analytics = {
        overview: {},
        fileTypes: {},
        uploadTrends: {},
        userActivity: {},
        quotaUsage: {},
      };

      if (this.hybridData) {
        const query = userId ? { where: [["userId", "==", userId]] } : {};

        const allFiles = await this.hybridData.queryFirestoreCollection(
          "user_files",
          query,
        );

        // Overview statistics
        analytics.overview = {
          totalFiles: allFiles.length,
          totalSize: allFiles.reduce((sum, file) => sum + (file.size || 0), 0),
          totalUsers: new Set(allFiles.map((f) => f.userId)).size,
          averageFileSize:
            allFiles.length > 0
              ? allFiles.reduce((sum, file) => sum + (file.size || 0), 0) /
                allFiles.length
              : 0,
        };

        // File type breakdown
        const typeStats = {};
        allFiles.forEach((file) => {
          const type = file.contentType || "unknown";
          if (!typeStats[type]) {
            typeStats[type] = { count: 0, totalSize: 0 };
          }
          typeStats[type].count++;
          typeStats[type].totalSize += file.size || 0;
        });
        analytics.fileTypes = typeStats;

        // Upload trends (by month)
        const trendStats = {};
        allFiles.forEach((file) => {
          if (file.uploadedAt) {
            const month = new Date(
              file.uploadedAt.seconds * MILLISECONDS_MULTIPLIER,
            )
              .toISOString()
              .substring(0, MONTH_STRING_LENGTH);
            if (!trendStats[month]) {
              trendStats[month] = { count: 0, totalSize: 0 };
            }
            trendStats[month].count++;
            trendStats[month].totalSize += file.size || 0;
          }
        });
        analytics.uploadTrends = trendStats;

        // User activity (if not filtering by specific user)
        if (!userId) {
          const userStats = {};
          allFiles.forEach((file) => {
            if (!userStats[file.userId]) {
              userStats[file.userId] = { files: 0, totalSize: 0 };
            }
            userStats[file.userId].files++;
            userStats[file.userId].totalSize += file.size || 0;
          });
          analytics.userActivity = userStats;
        }
      }

      return {
        success: true,
        analytics,
        generatedAt: new Date(),
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default AdvancedStorageService;

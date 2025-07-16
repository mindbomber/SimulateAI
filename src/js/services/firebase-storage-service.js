/**
 * Firebase Storage Service for SimulateAI
 * Handles file uploads for user profiles, blogs, and forums
 * Integrates with Hybrid Data Service for metadata storage
 */

import {
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

/**
 * Storage Configuration
 */
const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB;
const MAX_PROFILE_IMAGE_MB = 5;
const MAX_BLOG_IMAGE_MB = 10;
const MAX_FORUM_ATTACHMENT_MB = 25;
const MAX_DOCUMENT_MB = 50;

// Constants for utility functions
const RADIX_BASE_36 = 36;
const RANDOM_STRING_LENGTH = 8;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;
const FOLDER_DEPTH_OFFSET = -2;
const PARENT_FOLDER_INDEX = -1;
const FOLDER_NAME_INDEX = 0;

const STORAGE_CONFIG = {
  // File size limits (in bytes)
  MAX_FILE_SIZES: {
    PROFILE_IMAGE: MAX_PROFILE_IMAGE_MB * BYTES_PER_MB,
    BLOG_IMAGE: MAX_BLOG_IMAGE_MB * BYTES_PER_MB,
    FORUM_ATTACHMENT: MAX_FORUM_ATTACHMENT_MB * BYTES_PER_MB,
    DOCUMENT: MAX_DOCUMENT_MB * BYTES_PER_MB,
  },

  // Allowed file types
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    VIDEOS: ['video/mp4', 'video/webm', 'video/quicktime'],
  },

  // Storage paths
  PATHS: {
    USER_PROFILES: 'users/{userId}/profile',
    USER_DOCUMENTS: 'users/{userId}/documents',
    BLOG_IMAGES: 'blogs/{blogId}/images',
    BLOG_DOCUMENTS: 'blogs/{blogId}/documents',
    FORUM_ATTACHMENTS: 'forum/{postId}/attachments',
    SCENARIO_ASSETS: 'scenarios/{scenarioId}/assets',
    TEMP_UPLOADS: 'temp/{sessionId}',
  },
};

/**
 * Firebase Storage Service Class
 */
export class FirebaseStorageService {
  constructor(firebaseApp, hybridDataService = null) {
    this.app = firebaseApp;
    this.storage = getStorage(firebaseApp);
    this.hybridData = hybridDataService;
    this.activeUploads = new Map(); // Track ongoing uploads
    this.uploadCallbacks = new Map(); // Store progress callbacks
  }

  /**
   * Set hybrid data service reference
   */
  setHybridDataService(hybridDataService) {
    this.hybridData = hybridDataService;
  }

  /**
   * User Profile Operations
   */
  async uploadUserProfileImage(userId, file, progressCallback = null) {
    const validation = this.validateFile(file, 'PROFILE_IMAGE');
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const filePath = `${STORAGE_CONFIG.PATHS.USER_PROFILES.replace('{userId}', userId)}/avatar_${Date.now()}.${this.getFileExtension(file.name)}`;
    const storageRef = ref(this.storage, filePath);

    try {
      const result = await this.uploadFileWithProgress(
        storageRef,
        file,
        progressCallback
      );

      // Store metadata in hybrid data service
      if (this.hybridData) {
        await this.hybridData.createFirestoreDocument(
          'user_files',
          `${userId}_avatar`,
          {
            userId,
            type: 'profile_image',
            fileName: file.name,
            filePath,
            downloadURL: result.downloadURL,
            size: file.size,
            contentType: file.type,
            uploadedAt: new Date(),
          }
        );
      }

      return {
        success: true,
        downloadURL: result.downloadURL,
        filePath,
        metadata: result.metadata,
      };
    } catch (error) {
      throw new Error(`Profile image upload failed: ${error.message}`);
    }
  }

  async getUserProfileImages(userId) {
    const folderPath = STORAGE_CONFIG.PATHS.USER_PROFILES.replace(
      '{userId}',
      userId
    );
    const folderRef = ref(this.storage, folderPath);

    try {
      const listResult = await listAll(folderRef);
      const images = await Promise.all(
        listResult.items.map(async itemRef => {
          const downloadURL = await getDownloadURL(itemRef);
          const metadata = await getMetadata(itemRef);
          return {
            name: itemRef.name,
            downloadURL,
            size: metadata.size,
            contentType: metadata.contentType,
            timeCreated: metadata.timeCreated,
            path: itemRef.fullPath,
          };
        })
      );

      return { success: true, images };
    } catch (error) {
      throw new Error(`Failed to get profile images: ${error.message}`);
    }
  }

  /**
   * Blog Operations
   */
  async uploadBlogImage(blogId, file, progressCallback = null) {
    const validation = this.validateFile(file, 'BLOG_IMAGE');
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const filePath = `${STORAGE_CONFIG.PATHS.BLOG_IMAGES.replace('{blogId}', blogId)}/image_${Date.now()}_${file.name}`;
    const storageRef = ref(this.storage, filePath);

    try {
      const result = await this.uploadFileWithProgress(
        storageRef,
        file,
        progressCallback
      );

      // Store metadata
      if (this.hybridData) {
        await this.hybridData.createFirestoreDocument(
          'blog_files',
          `${blogId}_${Date.now()}`,
          {
            blogId,
            type: 'blog_image',
            fileName: file.name,
            filePath,
            downloadURL: result.downloadURL,
            size: file.size,
            contentType: file.type,
            uploadedAt: new Date(),
          }
        );
      }

      return {
        success: true,
        downloadURL: result.downloadURL,
        filePath,
        metadata: result.metadata,
      };
    } catch (error) {
      throw new Error(`Blog image upload failed: ${error.message}`);
    }
  }

  async getBlogImages(blogId) {
    const folderPath = STORAGE_CONFIG.PATHS.BLOG_IMAGES.replace(
      '{blogId}',
      blogId
    );
    const folderRef = ref(this.storage, folderPath);

    try {
      const listResult = await listAll(folderRef);
      const images = await Promise.all(
        listResult.items.map(async itemRef => {
          const downloadURL = await getDownloadURL(itemRef);
          const metadata = await getMetadata(itemRef);
          return {
            name: itemRef.name,
            downloadURL,
            size: metadata.size,
            contentType: metadata.contentType,
            timeCreated: metadata.timeCreated,
            path: itemRef.fullPath,
          };
        })
      );

      return { success: true, images };
    } catch (error) {
      throw new Error(`Failed to get blog images: ${error.message}`);
    }
  }

  /**
   * Forum Operations
   */
  async uploadForumAttachment(postId, file, progressCallback = null) {
    const validation = this.validateFile(file, 'FORUM_ATTACHMENT');
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const filePath = `${STORAGE_CONFIG.PATHS.FORUM_ATTACHMENTS.replace('{postId}', postId)}/attachment_${Date.now()}_${file.name}`;
    const storageRef = ref(this.storage, filePath);

    try {
      const result = await this.uploadFileWithProgress(
        storageRef,
        file,
        progressCallback
      );

      // Store metadata
      if (this.hybridData) {
        await this.hybridData.createFirestoreDocument(
          'forum_files',
          `${postId}_${Date.now()}`,
          {
            postId,
            type: 'forum_attachment',
            fileName: file.name,
            filePath,
            downloadURL: result.downloadURL,
            size: file.size,
            contentType: file.type,
            uploadedAt: new Date(),
          }
        );
      }

      return {
        success: true,
        downloadURL: result.downloadURL,
        filePath,
        metadata: result.metadata,
      };
    } catch (error) {
      throw new Error(`Forum attachment upload failed: ${error.message}`);
    }
  }

  async getForumAttachments(postId) {
    const folderPath = STORAGE_CONFIG.PATHS.FORUM_ATTACHMENTS.replace(
      '{postId}',
      postId
    );
    const folderRef = ref(this.storage, folderPath);

    try {
      const listResult = await listAll(folderRef);
      const attachments = await Promise.all(
        listResult.items.map(async itemRef => {
          const downloadURL = await getDownloadURL(itemRef);
          const metadata = await getMetadata(itemRef);
          return {
            name: itemRef.name,
            downloadURL,
            size: metadata.size,
            contentType: metadata.contentType,
            timeCreated: metadata.timeCreated,
            path: itemRef.fullPath,
          };
        })
      );

      return { success: true, attachments };
    } catch (error) {
      throw new Error(`Failed to get forum attachments: ${error.message}`);
    }
  }

  /**
   * Document Operations
   */
  async uploadUserDocument(
    userId,
    file,
    documentType = 'general',
    progressCallback = null
  ) {
    const validation = this.validateFile(file, 'DOCUMENT');
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const filePath = `${STORAGE_CONFIG.PATHS.USER_DOCUMENTS.replace('{userId}', userId)}/${documentType}_${Date.now()}_${file.name}`;
    const storageRef = ref(this.storage, filePath);

    try {
      const result = await this.uploadFileWithProgress(
        storageRef,
        file,
        progressCallback
      );

      // Store metadata
      if (this.hybridData) {
        await this.hybridData.createFirestoreDocument(
          'user_documents',
          `${userId}_${Date.now()}`,
          {
            userId,
            documentType,
            fileName: file.name,
            filePath,
            downloadURL: result.downloadURL,
            size: file.size,
            contentType: file.type,
            uploadedAt: new Date(),
          }
        );
      }

      return {
        success: true,
        downloadURL: result.downloadURL,
        filePath,
        metadata: result.metadata,
      };
    } catch (error) {
      throw new Error(`Document upload failed: ${error.message}`);
    }
  }

  /**
   * Generic Upload with Progress Monitoring
   */
  async uploadFileWithProgress(storageRef, file, progressCallback = null) {
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);
      const uploadId = `${storageRef.fullPath}_${Date.now()}`;

      this.activeUploads.set(uploadId, uploadTask);

      uploadTask.on(
        'state_changed',
        snapshot => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          const { state } = snapshot;

          if (progressCallback) {
            progressCallback({
              progress,
              state,
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
            });
          }

          switch (state) {
            case 'paused':
              // Upload paused
              break;
            case 'running':
              // Upload running
              break;
            default:
              break;
          }
        },
        error => {
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
        }
      );
    });
  }

  /**
   * Simple Upload (without progress monitoring)
   */
  async uploadFileSimple(storageRef, file) {
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      const { metadata } = snapshot;

      return {
        downloadURL,
        metadata,
        snapshot,
      };
    } catch (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * File Deletion
   */
  async deleteFile(filePath) {
    try {
      const fileRef = ref(this.storage, filePath);
      await deleteObject(fileRef);

      // Also remove metadata from hybrid data if available
      if (this.hybridData) {
        // Note: You might want to implement a more sophisticated cleanup
        // that finds and removes the metadata document based on filePath
      }

      return { success: true, deletedPath: filePath };
    } catch (error) {
      if (error.code === 'storage/object-not-found') {
        throw new Error('File not found');
      }
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(filePaths) {
    try {
      const deletePromises = filePaths.map(path => this.deleteFile(path));
      const results = await Promise.allSettled(deletePromises);

      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      return {
        success: failed.length === 0,
        successful: successful.length,
        failed: failed.length,
        errors: failed.map(f => f.reason.message),
      };
    } catch (error) {
      throw new Error(`Bulk file deletion failed: ${error.message}`);
    }
  }

  /**
   * Get Download URL for existing file
   */
  async getDownloadURL(filePath) {
    try {
      const fileRef = ref(this.storage, filePath);
      const downloadURL = await getDownloadURL(fileRef);
      return { success: true, downloadURL };
    } catch (error) {
      throw new Error(`Failed to get download URL: ${error.message}`);
    }
  }

  /**
   * Get File Metadata
   */
  async getFileMetadata(filePath) {
    try {
      const fileRef = ref(this.storage, filePath);
      const metadata = await getMetadata(fileRef);
      return { success: true, metadata };
    } catch (error) {
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }

  /**
   * File Validation
   */
  validateFile(file, uploadType) {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    // Check file size
    const maxSize = STORAGE_CONFIG.MAX_FILE_SIZES[uploadType];
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(maxSize)})`,
      };
    }

    // Check file type
    const allowedTypes = this.getAllowedTypesForUpload(uploadType);
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }

    return { valid: true };
  }

  /**
   * Get allowed file types for upload type
   */
  getAllowedTypesForUpload(uploadType) {
    switch (uploadType) {
      case 'PROFILE_IMAGE':
      case 'BLOG_IMAGE':
        return STORAGE_CONFIG.ALLOWED_TYPES.IMAGES;
      case 'FORUM_ATTACHMENT':
        return [
          ...STORAGE_CONFIG.ALLOWED_TYPES.IMAGES,
          ...STORAGE_CONFIG.ALLOWED_TYPES.DOCUMENTS,
        ];
      case 'DOCUMENT':
        return STORAGE_CONFIG.ALLOWED_TYPES.DOCUMENTS;
      default:
        return [
          ...STORAGE_CONFIG.ALLOWED_TYPES.IMAGES,
          ...STORAGE_CONFIG.ALLOWED_TYPES.DOCUMENTS,
          ...STORAGE_CONFIG.ALLOWED_TYPES.VIDEOS,
        ];
    }
  }

  /**
   * Upload Control Operations
   */
  pauseUpload(uploadId) {
    const uploadTask = this.activeUploads.get(uploadId);
    if (uploadTask) {
      uploadTask.pause();
      return true;
    }
    return false;
  }

  resumeUpload(uploadId) {
    const uploadTask = this.activeUploads.get(uploadId);
    if (uploadTask) {
      uploadTask.resume();
      return true;
    }
    return false;
  }

  cancelUpload(uploadId) {
    const uploadTask = this.activeUploads.get(uploadId);
    if (uploadTask) {
      uploadTask.cancel();
      this.activeUploads.delete(uploadId);
      return true;
    }
    return false;
  }

  /**
   * Utility Methods
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = BYTES_PER_KB;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  }

  generateUniqueFileName(originalName, prefix = '') {
    const timestamp = Date.now();
    const random = Math.random()
      .toString(RADIX_BASE_36)
      .substring(2, RANDOM_STRING_LENGTH);
    const extension = this.getFileExtension(originalName);
    const baseName = originalName.replace(/\.[^/.]+$/, '');

    return `${prefix}${timestamp}_${random}_${baseName}.${extension}`;
  }

  /**
   * Batch Operations
   */
  async uploadMultipleFiles(files, uploadType, progressCallback = null) {
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        let result;
        switch (uploadType) {
          case 'PROFILE_IMAGE':
            result = await this.uploadUserProfileImage(
              'current_user',
              file,
              progressCallback
            );
            break;
          case 'BLOG_IMAGE':
            result = await this.uploadBlogImage(
              'current_blog',
              file,
              progressCallback
            );
            break;
          case 'FORUM_ATTACHMENT':
            result = await this.uploadForumAttachment(
              'current_post',
              file,
              progressCallback
            );
            break;
          default:
            result = await this.uploadUserDocument(
              'current_user',
              file,
              'general',
              progressCallback
            );
        }

        results.push({ file: file.name, success: true, result });
      } catch (error) {
        results.push({ file: file.name, success: false, error: error.message });
      }
    }

    return {
      total: files.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  }

  /**
   * Cleanup and Housekeeping
   */
  async cleanupTempFiles(olderThanHours = 24) {
    try {
      const tempRef = ref(this.storage, 'temp/');
      const listResult = await listAll(tempRef);
      const cutoffTime =
        Date.now() -
        olderThanHours * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND;

      const filesToDelete = [];

      for (const itemRef of listResult.items) {
        const metadata = await getMetadata(itemRef);
        const fileTime = new Date(metadata.timeCreated).getTime();

        if (fileTime < cutoffTime) {
          filesToDelete.push(itemRef.fullPath);
        }
      }

      if (filesToDelete.length > 0) {
        const result = await this.deleteFiles(filesToDelete);
        return {
          success: true,
          cleaned: filesToDelete.length,
          details: result,
        };
      }

      return { success: true, cleaned: 0, message: 'No temp files to clean' };
    } catch (error) {
      throw new Error(`Temp file cleanup failed: ${error.message}`);
    }
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(userId = null) {
    try {
      const stats = {
        totalFiles: 0,
        totalSize: 0,
        fileTypes: {},
        folders: {},
      };

      const basePath = userId ? `users/${userId}` : '';
      const baseRef = ref(this.storage, basePath);
      const listResult = await listAll(baseRef);

      // Process files
      for (const itemRef of listResult.items) {
        try {
          const metadata = await getMetadata(itemRef);
          stats.totalFiles++;
          stats.totalSize += metadata.size;

          const type = metadata.contentType || 'unknown';
          stats.fileTypes[type] = (stats.fileTypes[type] || 0) + 1;

          const folder =
            itemRef.fullPath
              .split('/')
              .slice(FOLDER_DEPTH_OFFSET, PARENT_FOLDER_INDEX)[
              FOLDER_NAME_INDEX
            ] || 'root';
          if (!stats.folders[folder]) {
            stats.folders[folder] = { files: 0, size: 0 };
          }
          stats.folders[folder].files++;
          stats.folders[folder].size += metadata.size;
        } catch (error) {
          // Could not get metadata for file
        }
      }

      // Process subfolders recursively
      for (const folderRef of listResult.prefixes) {
        const folderStats = await this.getStorageStats(folderRef.fullPath);
        stats.totalFiles += folderStats.totalFiles;
        stats.totalSize += folderStats.totalSize;

        Object.keys(folderStats.fileTypes).forEach(type => {
          stats.fileTypes[type] =
            (stats.fileTypes[type] || 0) + folderStats.fileTypes[type];
        });
      }

      return {
        success: true,
        stats: {
          ...stats,
          totalSizeFormatted: this.formatFileSize(stats.totalSize),
        },
      };
    } catch (error) {
      throw new Error(`Failed to get storage stats: ${error.message}`);
    }
  }
}

// Export the service
export default FirebaseStorageService;

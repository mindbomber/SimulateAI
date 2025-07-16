// Enhanced categories.js - hybrid approach
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { ETHICAL_CATEGORIES } from './static-categories.js'; // Rename existing file

class CategoryService {
  constructor(firebaseService) {
    this.firebaseService = firebaseService;
    this.cache = new Map();
  }

  async getAllCategories() {
    // Get static categories
    const staticCategories = Object.values(ETHICAL_CATEGORIES);

    // Get Firestore categories
    const dynamicCategories = await this.getFirestoreCategories();

    // Merge and return (Firestore takes precedence for same IDs)
    const categoryMap = new Map();

    // Add static first
    staticCategories.forEach(cat =>
      categoryMap.set(cat.id, { ...cat, source: 'static' })
    );

    // Override with dynamic
    dynamicCategories.forEach(cat =>
      categoryMap.set(cat.id, { ...cat, source: 'firestore' })
    );

    return Array.from(categoryMap.values());
  }

  async getFirestoreCategories() {
    try {
      if (!this.firebaseService.db) return [];

      const categoriesRef = collection(this.firebaseService.db, 'categories');
      const snapshot = await getDocs(categoriesRef);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.warn(
        'Failed to load Firestore categories, using static only:',
        error
      );
      return [];
    }
  }
}

export default CategoryService;

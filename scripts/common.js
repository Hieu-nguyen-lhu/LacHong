// Common utility functions
const Utils = {
  // Generate unique ID
  generateId: () => Date.now().toString(36) + Math.random().toString(36).substr(2),

  // Validate file type
  validateFileType: (file, allowedTypes) => {
    const fileType = file.name.split('.').pop().toLowerCase();
    return allowedTypes.includes(fileType);
  },

  // Save to localStorage
  saveToStorage: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving to storage:', error);
      return false;
    }
  },

  // Load from localStorage
  loadFromStorage: (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading from storage:', error);
      return null;
    }
  },

  // Format date
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  }
};

// File handler
class FileHandler {
  constructor(allowedTypes) {
    this.allowedTypes = allowedTypes;
  }

  async handleFileUpload(file) {
    if (!Utils.validateFileType(file, this.allowedTypes)) {
      throw new Error('Invalid file type');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}
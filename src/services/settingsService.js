import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

const SETTINGS_DOC = 'appSettings';
const SETTINGS_COLLECTION = 'settings';

// Get settings
export const getSettings = async () => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { 
        success: true, 
        settings: docSnap.data() 
      };
    } else {
      // Return default settings if none exist
      const defaultSettings = {
        sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
        bazoTypes: ['Full Bazo', 'Half Bazo', 'No Bazo'],
        shirtTypes: ['Full Shirt', 'Half Shirt', 'Sleeveless'],
        updatedAt: Timestamp.now()
      };
      return { success: true, settings: defaultSettings };
    }
  } catch (error) {
    console.error('Error getting settings:', error);
    return { success: false, error: error.message };
  }
};

// Update settings
export const updateSettings = async (settings) => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC);
    await setDoc(docRef, {
      ...settings,
      updatedAt: Timestamp.now()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error updating settings:', error);
    return { success: false, error: error.message };
  }
};

// Add size
export const addSize = async (size) => {
  try {
    const result = await getSettings();
    if (result.success) {
      const sizes = result.settings.sizes || [];
      if (!sizes.includes(size)) {
        sizes.push(size);
        await updateSettings({ sizes });
        return { success: true };
      }
      return { success: false, error: 'Size already exists' };
    }
    return result;
  } catch (error) {
    console.error('Error adding size:', error);
    return { success: false, error: error.message };
  }
};

// Remove size
export const removeSize = async (size) => {
  try {
    const result = await getSettings();
    if (result.success) {
      const sizes = result.settings.sizes || [];
      const updatedSizes = sizes.filter(s => s !== size);
      await updateSettings({ sizes: updatedSizes });
      return { success: true };
    }
    return result;
  } catch (error) {
    console.error('Error removing size:', error);
    return { success: false, error: error.message };
  }
};

// Add bazo type
export const addBazoType = async (type) => {
  try {
    const result = await getSettings();
    if (result.success) {
      const bazoTypes = result.settings.bazoTypes || [];
      if (!bazoTypes.includes(type)) {
        bazoTypes.push(type);
        await updateSettings({ bazoTypes });
        return { success: true };
      }
      return { success: false, error: 'Bazo type already exists' };
    }
    return result;
  } catch (error) {
    console.error('Error adding bazo type:', error);
    return { success: false, error: error.message };
  }
};

// Remove bazo type
export const removeBazoType = async (type) => {
  try {
    const result = await getSettings();
    if (result.success) {
      const bazoTypes = result.settings.bazoTypes || [];
      const updatedTypes = bazoTypes.filter(t => t !== type);
      await updateSettings({ bazoTypes: updatedTypes });
      return { success: true };
    }
    return result;
  } catch (error) {
    console.error('Error removing bazo type:', error);
    return { success: false, error: error.message };
  }
};

// Add shirt type
export const addShirtType = async (type) => {
  try {
    const result = await getSettings();
    if (result.success) {
      const shirtTypes = result.settings.shirtTypes || [];
      if (!shirtTypes.includes(type)) {
        shirtTypes.push(type);
        await updateSettings({ shirtTypes });
        return { success: true };
      }
      return { success: false, error: 'Shirt type already exists' };
    }
    return result;
  } catch (error) {
    console.error('Error adding shirt type:', error);
    return { success: false, error: error.message };
  }
};

// Remove shirt type
export const removeShirtType = async (type) => {
  try {
    const result = await getSettings();
    if (result.success) {
      const shirtTypes = result.settings.shirtTypes || [];
      const updatedTypes = shirtTypes.filter(t => t !== type);
      await updateSettings({ shirtTypes: updatedTypes });
      return { success: true };
    }
    return result;
  } catch (error) {
    console.error('Error removing shirt type:', error);
    return { success: false, error: error.message };
  }
};
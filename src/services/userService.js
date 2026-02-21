import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

const USERS_COLLECTION = 'users';

// Add new user
export const addUser = async (userData) => {
  try {
    const docRef = await addDoc(collection(db, USERS_COLLECTION), {
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding user:', error);
    return { success: false, error: error.message };
  }
};

// Get all users
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by createdAt in JavaScript
    users.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return dateB - dateA;
    });
    
    return { success: true, users };
  } catch (error) {
    console.error('Error getting users:', error);
    return { success: false, error: error.message, users: [] };
  }
};

// Get single user by ID
export const getUserById = async (userId) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { 
        success: true, 
        user: { id: docSnap.id, ...docSnap.data() } 
      };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error('Error getting user:', error);
    return { success: false, error: error.message };
  }
};

// Update user
export const updateUser = async (userId, updates) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: error.message };
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
};
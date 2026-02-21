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
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

const ORDERS_COLLECTION = 'orders';
const DELETED_ORDERS_COLLECTION = 'deletedOrders';

// Add new order
export const addOrder = async (orderData) => {
  try {
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...orderData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding order:', error);
    return { success: false, error: error.message };
  }
};

// Get all orders
export const getAllOrders = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, ORDERS_COLLECTION));
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by createdAt in JavaScript (no Firestore index needed)
    orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return dateB - dateA; // Newest first
    });
    
    return { success: true, orders };
  } catch (error) {
    console.error('Error getting orders:', error);
    return { success: false, error: error.message, orders: [] };
  }
};

// Get single order by ID
export const getOrderById = async (orderId) => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { 
        success: true, 
        order: { id: docSnap.id, ...docSnap.data() } 
      };
    } else {
      return { success: false, error: 'Order not found' };
    }
  } catch (error) {
    console.error('Error getting order:', error);
    return { success: false, error: error.message };
  }
};

// Update order
export const updateOrder = async (orderId, updates) => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating order:', error);
    return { success: false, error: error.message };
  }
};

// Update order status
export const updateOrderStatus = async (orderId, newStatus) => {
  return updateOrder(orderId, { status: newStatus });
};

// Delete order (move to history)
export const deleteOrder = async (orderId) => {
  try {
    // Get the order first
    const orderDoc = await getDoc(doc(db, ORDERS_COLLECTION, orderId));
    
    if (!orderDoc.exists()) {
      return { success: false, error: 'Order not found' };
    }

    const orderData = orderDoc.data();

    // Save to deleted orders (history)
    await addDoc(collection(db, DELETED_ORDERS_COLLECTION), {
      ...orderData,
      originalId: orderId,
      deletedAt: Timestamp.now()
    });

    // Delete from orders
    await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting order:', error);
    return { success: false, error: error.message };
  }
};

// Delete multiple orders
export const deleteMultipleOrders = async (orderIds) => {
  try {
    const results = await Promise.all(
      orderIds.map(id => deleteOrder(id))
    );
    
    const successCount = results.filter(r => r.success).length;
    
    return { 
      success: true, 
      deletedCount: successCount,
      totalCount: orderIds.length
    };
  } catch (error) {
    console.error('Error deleting multiple orders:', error);
    return { success: false, error: error.message };
  }
};

// Get deleted orders (history)
export const getDeletedOrders = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, DELETED_ORDERS_COLLECTION));
    const deletedOrders = [];
    querySnapshot.forEach((doc) => {
      deletedOrders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by deletedAt
    deletedOrders.sort((a, b) => {
      const dateA = a.deletedAt?.toDate?.() || new Date(a.deletedAt || 0);
      const dateB = b.deletedAt?.toDate?.() || new Date(b.deletedAt || 0);
      return dateB - dateA; // Newest first
    });
    
    return { success: true, orders: deletedOrders };
  } catch (error) {
    console.error('Error getting deleted orders:', error);
    return { success: false, error: error.message, orders: [] };
  }
};

// Restore deleted order
export const restoreOrder = async (deletedOrderId) => {
  try {
    // Get deleted order
    const deletedDoc = await getDoc(doc(db, DELETED_ORDERS_COLLECTION, deletedOrderId));
    
    if (!deletedDoc.exists()) {
      return { success: false, error: 'Deleted order not found' };
    }

    const orderData = deletedDoc.data();
    
    // Remove delete-specific fields
    const { deletedAt, originalId, ...restoreData } = orderData;

    // Restore to orders collection
    await addDoc(collection(db, ORDERS_COLLECTION), {
      ...restoreData,
      updatedAt: Timestamp.now()
    });

    // Remove from deleted orders
    await deleteDoc(doc(db, DELETED_ORDERS_COLLECTION, deletedOrderId));
    
    return { success: true };
  } catch (error) {
    console.error('Error restoring order:', error);
    return { success: false, error: error.message };
  }
};

// Get orders by status
export const getOrdersByStatus = async (status) => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('status', '==', status)
    );
    const querySnapshot = await getDocs(q);
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by createdAt in JavaScript
    orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return dateB - dateA;
    });
    
    return { success: true, orders };
  } catch (error) {
    console.error('Error getting orders by status:', error);
    return { success: false, error: error.message, orders: [] };
  }
};
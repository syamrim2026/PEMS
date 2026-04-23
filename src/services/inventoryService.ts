import { 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  where
} from 'firebase/firestore';
import { db, handleFirestoreError, auth } from '../lib/firebase';
import { LogType, InventoryLog } from '../types';

const LOGS_COLLECTION = 'inventoryLogs';

export const inventoryService = {
  async logTransaction(materialId: string, batchId: string, type: LogType, quantity: number, reason?: string) {
    if (!auth.currentUser) throw new Error('Not authenticated');

    try {
      const data = {
        materialId,
        batchId,
        type,
        quantity,
        reason: reason || '',
        userId: auth.currentUser.uid,
        timestamp: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, LOGS_COLLECTION), data);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, 'create', LOGS_COLLECTION);
    }
  },

  async getLogsByMaterial(materialId: string) {
    try {
      const q = query(
        collection(db, LOGS_COLLECTION), 
        where('materialId', '==', materialId),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryLog));
    } catch (error) {
      handleFirestoreError(error, 'list', LOGS_COLLECTION);
    }
  }
};

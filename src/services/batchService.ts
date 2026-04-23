import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  getDocs, 
  serverTimestamp,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { Batch, BatchStatus } from '../types';

const getBatchesPath = (materialId: string) => `materials/${materialId}/batches`;

export const batchService = {
  async createBatch(materialId: string, batchNumber: string, expiryDate: Date, initialQuantity: number, location?: string) {
    try {
      const path = getBatchesPath(materialId);
      const data = {
        materialId,
        batchNumber,
        expiryDate: Timestamp.fromDate(expiryDate),
        initialQuantity,
        currentQuantity: initialQuantity,
        location: location || '',
        status: 'active' as BatchStatus,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, path), data);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, 'create', getBatchesPath(materialId));
    }
  },

  async updateBatch(materialId: string, batchId: string, updates: Partial<Batch>) {
    try {
      const docRef = doc(db, getBatchesPath(materialId), batchId);
      await updateDoc(docRef, updates as any);
    } catch (error) {
      handleFirestoreError(error, 'update', `${getBatchesPath(materialId)}/${batchId}`);
    }
  },

  async getBatchesForMaterial(materialId: string) {
    try {
      const q = query(collection(db, getBatchesPath(materialId)), orderBy('expiryDate'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Batch));
    } catch (error) {
      handleFirestoreError(error, 'list', getBatchesPath(materialId));
    }
  },

  async getAllBatches() {
    // Note: In a real app with many materials, this would need a collectionGroup query
    // For this app, we might just iterate materials if needed, or use a global batches collection.
    // Given the blueprint, they are nested. Let's stick to material-scoped fetching for now.
    // Or we can use collectionGroup if rules allow.
    // rules_version = '2' allows collectionGroup matches if set up.
    // match /{path=**}/batches/{batchId}
    // Let's assume we fetch per material or use a search-friendly structure.
    return []; 
  }
};

import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, auth } from '../lib/firebase';
import { Material, Unit } from '../types';

const MATERIALS_COLLECTION = 'materials';

export const materialService = {
  async createMaterial(name: string, category: string, brand: string, unit: Unit, minThreshold?: number) {
    if (!auth.currentUser) throw new Error('Not authenticated');
    
    try {
      const data = {
        name,
        category,
        brand,
        unit,
        minThreshold: minThreshold || 0,
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, MATERIALS_COLLECTION), data);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, 'create', MATERIALS_COLLECTION);
    }
  },

  async updateMaterial(id: string, updates: Partial<Pick<Material, 'name' | 'category' | 'brand' | 'unit' | 'minThreshold'>>) {
    try {
      const docRef = doc(db, MATERIALS_COLLECTION, id);
      await updateDoc(docRef, updates);
    } catch (error) {
      handleFirestoreError(error, 'update', `${MATERIALS_COLLECTION}/${id}`);
    }
  },

  async getAllMaterials() {
    try {
      const q = query(collection(db, MATERIALS_COLLECTION), orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Material));
    } catch (error) {
      handleFirestoreError(error, 'list', MATERIALS_COLLECTION);
    }
  },

  async deleteMaterial(id: string) {
    try {
      await deleteDoc(doc(db, MATERIALS_COLLECTION, id));
    } catch (error) {
      handleFirestoreError(error, 'delete', `${MATERIALS_COLLECTION}/${id}`);
    }
  }
};

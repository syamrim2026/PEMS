import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError } from '../lib/firebase';
import { NotificationSetting } from '../types';

const SETTINGS_COLLECTION = 'notificationSettings';

export const notificationService = {
  async getSettings(): Promise<NotificationSetting> {
    if (!auth.currentUser) throw new Error('Not authenticated');
    
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, auth.currentUser.uid);
      const snapshot = await getDoc(docRef);
      
      if (snapshot.exists()) {
        return snapshot.data() as NotificationSetting;
      } else {
        // Default settings
        return {
          userId: auth.currentUser.uid,
          thresholdDays: 30,
          emailEnabled: true,
          pushEnabled: false
        };
      }
    } catch (error) {
      handleFirestoreError(error, 'get', `${SETTINGS_COLLECTION}/me`);
    }
  },

  async updateSettings(settings: Partial<NotificationSetting>) {
    if (!auth.currentUser) throw new Error('Not authenticated');
    
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, auth.currentUser.uid);
      await setDoc(docRef, settings, { merge: true });
    } catch (error) {
      handleFirestoreError(error, 'write', `${SETTINGS_COLLECTION}/me`);
    }
  }
};

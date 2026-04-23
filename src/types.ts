import { Timestamp } from 'firebase/firestore';

export type Unit = 'liters' | 'gallons' | 'cans' | 'kg';

export interface Material {
  id: string;
  name: string;
  category: string;
  brand: string;
  unit: Unit;
  minThreshold?: number;
  createdAt: Timestamp;
  createdBy: string;
}

export type BatchStatus = 'active' | 'expired' | 'depleted';

export interface Batch {
  id: string;
  materialId: string;
  batchNumber: string;
  expiryDate: Timestamp;
  initialQuantity: number;
  currentQuantity: number;
  status: BatchStatus;
  location?: string;
  createdAt: Timestamp;
}

export interface NotificationSetting {
  userId: string;
  thresholdDays: number;
  emailEnabled: boolean;
  pushEnabled: boolean;
}

export type LogType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface InventoryLog {
  id: string;
  batchId: string;
  materialId: string;
  type: LogType;
  quantity: number;
  reason?: string;
  timestamp: Timestamp;
  userId: string;
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

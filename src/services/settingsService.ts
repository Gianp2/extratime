import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase/config';
import { UserSettings } from '../types';

const COLLECTION_NAME = 'settings';

export const DEFAULT_SETTINGS: Omit<UserSettings, 'userId' | 'updatedAt'> = {
  rateNormal: 1000,
  rate50: 1500,
  rate100: 2000,
  rateNocturna: 1350,
  rateFeriado: 2500,
  normalWorkdayHours: 8,
  monthlyGoalHours: 20,
  firstWorkday: 'monday',
  currency: '$',
  theme: 'system',
  language: 'es',
  timeFormat: '24h',
};

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const path = `${COLLECTION_NAME}/${userId}`;
  try {
    const ref = doc(db, COLLECTION_NAME, userId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as UserSettings;
    } else {
      const initialSettings: UserSettings = {
        ...DEFAULT_SETTINGS,
        userId,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(ref, initialSettings);
      return initialSettings;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export function subscribeUserSettings(userId: string, callback: (settings: UserSettings) => void): () => void {
  const ref = doc(db, COLLECTION_NAME, userId);
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as UserSettings);
      } else {
        const initialSettings: UserSettings = {
          ...DEFAULT_SETTINGS,
          userId,
          updatedAt: new Date().toISOString(),
        };
        setDoc(ref, initialSettings).catch((err) =>
          handleFirestoreError(err, OperationType.CREATE, `${COLLECTION_NAME}/${userId}`)
        );
        callback(initialSettings);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${userId}`);
    }
  );
}

export async function updateUserSettings(userId: string, data: Partial<UserSettings>): Promise<void> {
  const path = `${COLLECTION_NAME}/${userId}`;
  try {
    const ref = doc(db, COLLECTION_NAME, userId);
    const updatedData = {
      ...data,
      userId,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(ref, updatedData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function saveUserSettings(data: Partial<UserSettings>): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Usuario no autenticado');
  return updateUserSettings(userId, data);
}


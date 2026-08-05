import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { ExtraHourRecord } from '../types';

const COLLECTION_NAME = 'extraHours';

export async function getUserExtraHours(userId: string): Promise<ExtraHourRecord[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => docSnap.data() as ExtraHourRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
  }
}

export function subscribeUserExtraHours(userId: string, callback: (records: ExtraHourRecord[]) => void): () => void {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const records = snapshot.docs.map((docSnap) => docSnap.data() as ExtraHourRecord);
      records.sort((a, b) => b.date.localeCompare(a.date));
      callback(records);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    }
  );
}

export async function saveExtraHour(
  userId: string,
  recordData: Omit<ExtraHourRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<ExtraHourRecord> {
  const docId = existingId || `${userId}_${recordData.date}_${Date.now()}`;
  const path = `${COLLECTION_NAME}/${docId}`;
  const nowISO = new Date().toISOString();

  const record: ExtraHourRecord = {
    id: docId,
    userId,
    date: recordData.date,
    hours: Number(recordData.hours),
    entryTime: recordData.entryTime || '',
    exitTime: recordData.exitTime || '',
    hourType: recordData.hourType,
    notes: recordData.notes || '',
    createdAt: nowISO,
    updatedAt: nowISO,
  };

  try {
    const ref = doc(db, COLLECTION_NAME, docId);
    if (existingId) {
      await updateDoc(ref, {
        date: record.date,
        hours: record.hours,
        entryTime: record.entryTime,
        exitTime: record.exitTime,
        hourType: record.hourType,
        notes: record.notes,
        updatedAt: nowISO,
      });
    } else {
      await setDoc(ref, record);
    }
    return record;
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function deleteExtraHour(id: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

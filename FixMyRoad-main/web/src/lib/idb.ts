import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface RoadWatchDB extends DBSchema {
  drafts: {
    key: string;
    value: {
      id: string;
      photoDataUrl: string;
      latitude: number;
      longitude: number;
      address: string;
      category: string;
      severity: string;
      roadCategory: string;
      description?: string;
      timestamp: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<RoadWatchDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<RoadWatchDB>('roadwatch-store', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('drafts')) {
          db.createObjectStore('drafts', { keyPath: 'id' });
        }
      }
    });
  }
  return dbPromise;
}

export async function saveDraftOffline(draft: {
  id: string;
  photoDataUrl: string;
  latitude: number;
  longitude: number;
  address: string;
  category: string;
  severity: string;
  roadCategory: string;
  description?: string;
}) {
  const db = await getDB();
  await db.put('drafts', {
    ...draft,
    timestamp: Date.now()
  });
}

export async function getOfflineDrafts() {
  const db = await getDB();
  return db.getAll('drafts');
}

export async function deleteOfflineDraft(id: string) {
  const db = await getDB();
  return db.delete('drafts', id);
}

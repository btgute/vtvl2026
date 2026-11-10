'use client';

const DB_NAME = 'HCMUTE_VTVL_OFFLINE_DB';
const DB_VERSION = 1;
const STORE_DRAFTS = 'workbook_drafts';
const STORE_QUEUE = 'offline_sync_queue';

export interface LocalDraftRecord {
  id: string; // workbookId
  unitCode: string;
  reportingPeriod: string;
  operatorEmail: string;
  data: Record<string, any>;
  touchedCells: string[];
  clientSavedAt: string;
  clientTimestamp: number;
  serverRevision: number;
  isDirty: boolean;
}

export interface OfflineQueueItem {
  id: string;
  workbookId: string;
  baseRevision: number;
  data: Record<string, any>;
  touchedCells: string[];
  queuedAt: number;
  operatorEmail: string;
}

function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_DRAFTS)) {
          const draftStore = db.createObjectStore(STORE_DRAFTS, { keyPath: 'id' });
          draftStore.createIndex('unitCode', 'unitCode', { unique: false });
          draftStore.createIndex('operatorEmail', 'operatorEmail', { unique: false });
          draftStore.createIndex('clientTimestamp', 'clientTimestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_QUEUE)) {
          db.createObjectStore(STORE_QUEUE, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveLocalDraft(draft: LocalDraftRecord): Promise<boolean> {
  const db = await openDB();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_DRAFTS, 'readwrite');
      const store = tx.objectStore(STORE_DRAFTS);
      store.put(draft);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function getLocalDraft(workbookId: string): Promise<LocalDraftRecord | null> {
  const db = await openDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_DRAFTS, 'readonly');
      const store = tx.objectStore(STORE_DRAFTS);
      const req = store.get(workbookId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function queueOfflineSync(item: OfflineQueueItem): Promise<boolean> {
  const db = await openDB();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_QUEUE, 'readwrite');
      const store = tx.objectStore(STORE_QUEUE);
      store.put(item);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function getOfflineQueue(): Promise<OfflineQueueItem[]> {
  const db = await openDB();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_QUEUE, 'readonly');
      const store = tx.objectStore(STORE_QUEUE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export async function removeOfflineQueueItem(id: string): Promise<boolean> {
  const db = await openDB();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_QUEUE, 'readwrite');
      const store = tx.objectStore(STORE_QUEUE);
      store.delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

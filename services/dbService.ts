// services/dbService.ts

const DB_NAME = 'CrisisGuardianDB';
const DB_VERSION = 1;
const STORE_NAME = 'videoCache';

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('IndexedDB error:', request.error);
            reject('Error opening IndexedDB.');
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = () => {
            const dbInstance = request.result;
            if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
                dbInstance.createObjectStore(STORE_NAME);
            }
        };
    });
};

export const saveVideo = async (key: string, videoBlob: Blob): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(videoBlob, key);

        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Error saving video to IndexedDB:', request.error);
            reject('Failed to save video.');
        };
    });
};

export const getVideo = async (key: string): Promise<Blob | null> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
            resolve(request.result || null);
        };
        request.onerror = () => {
            console.error('Error getting video from IndexedDB:', request.error);
            reject('Failed to retrieve video.');
        };
    });
};

export const getAllVideoKeys = async (): Promise<string[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAllKeys();

        request.onsuccess = () => {
            resolve(request.result as string[]);
        };
        request.onerror = () => {
            console.error('Error getting all video keys from IndexedDB:', request.error);
            reject('Failed to retrieve video keys.');
        };
    });
};

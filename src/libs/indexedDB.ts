// IndexedDB Configuration
const DB_NAME = 'money_flow_db';
const DB_VERSION = 2; // Incremented to force upgrade
const STORES = {
  DATA: 'app_data',
} as const;

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Opens a connection to the IndexedDB database.
 * Creates the database and object stores if they don't exist.
 */
export function openDatabase(): Promise<IDBDatabase> {
  // Return existing promise if already opening
  if (dbPromise) {
    return dbPromise;
  }

  // Return existing instance if already open
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening IndexedDB:', request.error);
      dbPromise = null;
      reject(request.error);
    };

    request.onsuccess = () => {
      const db = request.result;
      
      // Verify the object store exists
      if (!db.objectStoreNames.contains(STORES.DATA)) {
        console.warn('Object store not found, recreating database...');
        db.close();
        dbPromise = null;
        dbInstance = null;
        
        // Delete and recreate the database
        const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
        deleteRequest.onsuccess = () => {
          // Retry opening
          openDatabase().then(resolve).catch(reject);
        };
        deleteRequest.onerror = () => {
          reject(new Error('Failed to delete corrupted database'));
        };
        return;
      }
      
      dbInstance = db;
      
      // Handle connection close
      db.onclose = () => {
        dbInstance = null;
        dbPromise = null;
      };
      
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store for key-value data if it doesn't exist
      if (!db.objectStoreNames.contains(STORES.DATA)) {
        db.createObjectStore(STORES.DATA, { keyPath: 'key' });
        console.log('Created object store:', STORES.DATA);
      }
    };
  });

  return dbPromise;
}

/**
 * Retrieves an item from IndexedDB by key.
 */
export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.DATA, 'readonly');
      const store = transaction.objectStore(STORES.DATA);
      const request = store.get(key);

      request.onerror = () => {
        console.error(`Error getting item from IndexedDB (${key}):`, request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
    });
  } catch (error) {
    console.error(`Error getting item from IndexedDB (${key}):`, error);
    return null;
  }
}

/**
 * Saves an item to IndexedDB with the specified key.
 */
export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.DATA, 'readwrite');
      const store = transaction.objectStore(STORES.DATA);
      const request = store.put({ key, value });

      request.onerror = () => {
        console.error(`Error saving item to IndexedDB (${key}):`, request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  } catch (error) {
    console.error(`Error saving item to IndexedDB (${key}):`, error);
  }
}

/**
 * Deletes an item from IndexedDB by key.
 */
export async function deleteItem(key: string): Promise<void> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.DATA, 'readwrite');
      const store = transaction.objectStore(STORES.DATA);
      const request = store.delete(key);

      request.onerror = () => {
        console.error(`Error deleting item from IndexedDB (${key}):`, request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  } catch (error) {
    console.error(`Error deleting item from IndexedDB (${key}):`, error);
  }
}


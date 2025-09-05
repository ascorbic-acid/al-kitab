// import { openDB, type IDBPDatabase,  } from 'idb';


// export class IDBService {
//   private static instance: IDBService;
  
//   private db: IDBDatabase | null = null;
  
//   private initPromise: Promise<void>;
  
//   private readonly DB_NAME = 'IDBServiceKV';
//   private readonly DB_VERSION = 1;
//   private readonly STORE_NAME = 'keyval';

//   private constructor() {
//     this.initPromise = new Promise((resolve, reject) => {
//       const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

//       request.onupgradeneeded = (event) => {
//         const db = (event.target as IDBOpenDBRequest).result;
//         if (!db.objectStoreNames.contains(this.STORE_NAME)) {
//           db.createObjectStore(this.STORE_NAME);
//           console.log('Object store created.');
//         }
//       };

//       request.onsuccess = (event) => {
//         this.db = (event.target as IDBOpenDBRequest).result;
//         console.log('Database opened successfully.');
//         resolve();
//       };

//       request.onerror = (event) => {
//         console.error('Database error:', (event.target as IDBOpenDBRequest).error);
//         reject((event.target as IDBOpenDBRequest).error);
//       };
//     });
//   }

//   public static getInstance(): IDBService {
//     if (!IDBService.instance) {
//       IDBService.instance = new IDBService();
//     }
//     return IDBService.instance;
//   }

//   public async get<T>(key: IDBValidKey): Promise<T | undefined> {
//     await this.initPromise;
//     if (!this.db) throw new Error('Database not initialized.');

//     return new Promise((resolve, reject) => {
//       const transaction = this.db!.transaction(this.STORE_NAME, 'readonly');
//       const store = transaction.objectStore(this.STORE_NAME);
//       const request = store.get(key);
      
//       request.onsuccess = () => resolve(request.result as T);
//       request.onerror = () => reject(request.error);
//     });
//   }


//   public async set<T>(key: IDBValidKey, value: T): Promise<void> {
//     await this.initPromise;
//     if (!this.db) throw new Error('Database not initialized.');

//     return new Promise((resolve, reject) => {
//       const transaction = this.db!.transaction(this.STORE_NAME, 'readwrite');
//       const store = transaction.objectStore(this.STORE_NAME);
//       const request = store.put(value, key);
      
//       request.onsuccess = () => resolve();
//       request.onerror = () => reject(request.error);
//     });
//   }
// }
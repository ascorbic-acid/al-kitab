// import { openDB, type IDBPDatabase,  } from 'idb';
// import { IDBSvc } from './idb_service';
// import type { Config } from '~/models/config/config_model';

// const KV_NAME = 'app-config'

// export class AppConfig {
//   private static instance: AppConfig;

//   public config!: Config;
//   private IDBSvc: IDBSvc;

//   private constructor() {
//     this.IDBSvc = IDBSvc.getInstance();
//     this.init();
//   }

//   public static getInstance(): AppConfig {
//     if (!AppConfig.instance) {
//       AppConfig.instance = new AppConfig();
//     }
//     return AppConfig.instance;
//   }

//   private async init() {
//     this.config = await this.IDBSvc.get<Config>(KV_NAME) || {
//       dark_mode: false,
//       db_version: 1,
//       last_opened_surah: 1
//     };
//   }

//   public async getConfig(): Promise<Config> {
//     // if (!this.config) {
//     //   this.config = await this.IDBSvc.get<Config>(KV_NAME)
//     // }
//     return this.config!;
//   }

//   public async setConfig(config: Config): Promise<void> {
//     this.config = config;
//     await this.IDBSvc.set(KV_NAME, config);
//   }

// }
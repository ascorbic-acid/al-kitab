import { openDB, type IDBPDatabase, } from 'idb';
import IDBService from './idb_service';
import type { Config } from '~/models/config/config_model';
import type { IService } from './locator';
import type ServiceLocator from './locator';

const KV_NAME = 'SettingsService'

export class SettingsService implements IService {

  public config?: Config;

  constructor() {
  }


  serviceMember(): void { } // Required for type checking

  async initSvc(sl: any) {
    const idbSvc = await sl.GetService(IDBService)
    
    this.config = idbSvc.get<Config>(KV_NAME) ?? {
      dark_mode: true,
      db_version: 0,
      last_opened_surah: 0
    }
  }

  disposeSvc(): void {
    console.log('LoggerService disposed');
  }



  public async getConfig(): Promise<Config> {
    // if (!this.config) {
    //   this.config = await this.idbService.get<Config>(KV_NAME)
    // }
    return this.config!;
  }

  public async setConfig(config: Config): Promise<void> {
    this.config = config;
    await this.idbService.set(KV_NAME, config);
  }

}
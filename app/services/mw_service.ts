import type { IService } from "~/models/locator/locator_iservice";
import type { Locator } from "./locator";
import { wrap, type Remote } from "comlink";

export default class MainWorkerService implements IService {
  private _worker!: Worker
  public remote!: Remote<any>
  
  constructor() {}

  serviceMember(): void {}
  
  async init(sl: Locator): Promise<void> {
        this._worker = new Worker(
          new URL('~/workers/main_worker.ts', import.meta.url), {
          type: 'module',
        })
    
        this.remote = wrap(this._worker)
        this.remote.init()
  }

  dispose(): void {

  }

  // public async set<T>(key: IDBValidKey, value: T): Promise<void> {
  
  // }
}
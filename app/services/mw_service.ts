import type { IService } from "~/models/locator/locator_iservice";
import type { Locator } from "./locator";
import { expose, proxy, wrap, type Remote } from "comlink";
import type { Surah } from "~/models/surah/surah_model";
import type { Config } from "~/models/config/config_model";

export default class MainWorkerService implements IService {
  private _worker!: Worker
  public remote!: Remote<any>

  constructor() { }

  serviceMember(): void { }

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

  public async getSurah(number: number): Promise<Surah | undefined> {
    return await this.remote.api.getSurah(number)
  }

  public async updateWorkerCfg(newConfig: Config): Promise<void> {
    console.log("from worker");
    return await this.remote.updateWorkerCfg(newConfig)
  }
}
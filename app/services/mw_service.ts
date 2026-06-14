import type { IService } from "~/models/locator/locator_iservice";
import type Locator from "./locator";
import { expose, proxy, wrap, type Remote } from "comlink";
import type { Surah } from "~/models/surah/surah_model";
import type { Config } from "~/models/config/config_model";
import type { AyahSearchResult } from "~/models/ayah/ayah_search_result";

export default class MWSvc implements IService {
  private _worker!: Worker
  public remote!: Remote<any>

  constructor() { }

  serviceMember(): void { }

  async init(sl: Locator): Promise<void> {
    this._worker = new Worker(
      new URL('~/workers/main.ts', import.meta.url), {
      type: 'module',
    })

    this.remote = wrap(this._worker)
    await this.remote.init()
  }

  dispose(): void {

  }

  public async getSurah(number: number): Promise<Surah | undefined> {
    const res = await this.remote.api.getSurah(number)
    return res
  }

  public async search(term: string): Promise<AyahSearchResult[] | undefined> {
    const res = await this.remote.api.search(term)
    return res
  }
}
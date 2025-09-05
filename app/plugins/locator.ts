import { defineNuxtPlugin } from '#app';
import IDBService  from '~/services/idb_service';
import { Locator } from '~/services/locator';



export default defineNuxtPlugin(async   () => {
    const sl = Locator.Instance
    // const idbSvc = sl.RegisterInstance(new IDBService());
    sl.register<IDBService>(IDBService)
    await useConfigStore().loadConfig()

    return {
        provide: {
            sl: sl,
        },
    };
});
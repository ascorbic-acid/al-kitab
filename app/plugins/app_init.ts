import IDBService from "~/services/idb_service";
import { Locator } from "~/services/locator";
import MainWorkerService from "~/services/mw_service";

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.hook('app:created', async (arg) => {
        const sl = Locator.Instance

        sl.register(IDBService)
        sl.register(MainWorkerService)
        
        // const mwSvc = sl.get(MainWorkerService)
        // mwSvc?.remote.init()

        await useConfigStore().init(sl)
        useAppStore().init(sl)


    })
})
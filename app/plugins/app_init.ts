import IDBSvc from "~/services/idb_service";
import Locator from "~/services/locator";
import MWSvc from "~/services/mw_service";

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.hook('app:created', async (arg) => {
        const sl = Locator.Instance;
        // Extend the Window interface to include 'sl'
        (window as any)["sl"] = sl

        sl.register(IDBSvc)
        sl.register(MWSvc)

        await Promise.all([
            sl.get(IDBSvc)?.init(sl),
            sl.get(MWSvc)?.init(sl)
        ])

        await useConfigStore().init()
        // debugger
        useAppStore().init()


    })
})
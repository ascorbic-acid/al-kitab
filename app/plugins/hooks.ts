import { AppConfig } from "~/service-worker/config";

export default defineNuxtPlugin((nuxtApp) => {
    const _worker = new Worker(new URL('~/workers/main_worker.ts', import.meta.url), {
        type: 'module',
    })

    nuxtApp.hook('app:created', (arg) => {
        (window as any)['alkitab'] = {
            version: AppConfig.VERSION
        }
        console.log("created!:", arg);
        useAppStore().earlyInit(_worker)

    })

})
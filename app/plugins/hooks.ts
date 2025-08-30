export default defineNuxtPlugin((nuxtApp) => {
    const _worker = new Worker(new URL('~/workers/main_worker.ts', import.meta.url), {
        type: 'module',
    })

    nuxtApp.hook('app:created', (arg) => {
        console.log("created!:", arg);
        useAppStore().earlyInit(_worker)

    })

})
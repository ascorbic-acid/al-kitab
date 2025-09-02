
export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.hook('app:created', (arg) => {
        console.log("created!:", arg);
        useAppStore().earlyInit()
    })
})
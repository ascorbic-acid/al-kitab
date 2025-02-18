<script setup lang="ts">
// import { useWindowSize } from '@vueuse/core'

const theme = useTheme()
// provide(
//   THEME_KEY,
//   computed(() => (theme.current.value.dark ? 'dark' : undefined)),
// )
import { useSwStore } from "~/stores/sw_store"

const route = useRoute()
const title = computed(() => {
  return route.meta?.title || route.matched[0].meta?.title || ''
})
// const appStore = useAppStore()
// const swStore = useswStore()

// const { width } = useWindowSize()
// watchEffect(() => {
//   if (width.value < 600) {
//     a
//   } else {
//     theme.global.name.value = 'light'
//   }
// })
useHead({
  title,
  titleTemplate: (t) => (t ? `${t} | Al Kitab` : 'Al Kitab'),
  htmlAttrs: { lang: 'en' },
  link: [{ rel: 'icon', href: '/favicon.ico' }],
})
useSeoMeta({
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  description: 'Al-Kitab Al Kareem',
  ogImage: '/social-image.png',
  twitterImage: '/social-image.png',
  twitterCard: 'summary_large_image',
})

onMounted(() => { 
  console.log(useSwStore().init());
   theme.global.name.value = 'dark'
  // navigator.serviceWorker.addEventListener("controllerchange", (event) => {
  //   console.log('ev: ', event);
    
  //   useswStore().init()
  // });
})
</script>

<template>
  <v-app>
    <AppDrawer />
    <SettingsDrawer />
    <AppBar />
    <v-main>
      <VitePwaManifest />
      <NuxtPage />
      <NuxtSnackbar />
    </v-main>
    <AppFooter />
  </v-app>
</template>

<style scoped>
.v-main {
  padding-top: 0;
  padding-bottom: 0;
  margin-top: var(--v-layout-top);
  margin-bottom: var(--v-layout-bottom);
  /* height: calc(100vh - var(--v-layout-top) - var(--v-layout-bottom)); */
  /* overflow-y: auto; */
  transition-property: padding;
}
</style>

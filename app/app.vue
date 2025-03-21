<script setup lang="ts">
const theme = useTheme()
const route = useRoute()
const title = computed(() => {
  return route.meta?.title || route.matched[0].meta?.title || ''
})
useAppStore().earlyInit()

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
  //  theme.global.name.value = 'dark'
   theme.global.name.value = 'light'

  // navigator.serviceWorker.addEventListener("controllerchange", (event) => {
  //   console.log('ev: ', event);
    
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
    <!-- <AppFooter /> -->
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

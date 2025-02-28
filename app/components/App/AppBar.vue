<template>
  <v-app-bar flat>
    <div style="margin-right: 15px; margin-left: 1px; margin-top: 15px; cursor: pointer;">
      <svgo-mi-book @click="appStore.drawer = !appStore.drawer" style="width: 45px; height: 45px; color: gray;" />
    </div>
    <v-chip class="mt-4 mx-2" label size="small">
    {{ appStore.loadedSurah?.name }}
  </v-chip>

    <!-- <v-breadcrumbs :items="breadcrumbs" /> -->
    <v-spacer />

    <v-spacer />

    <div class="mx-1 mt-4" style="display: flex; align-items: center;">
      <div style="width: 50px;">
        <v-btn @click="openSurahsSearchMenu($event)" color="orange" density="compact" rounded>
          <Icon name="icon-park-outline:search" size="28" />
        </v-btn>
      </div>
      <div style="width: 60px;">
        <v-btn @click="openMarkSurahAyahMenu($event)" color="orange" density="compact" rounded>
          <svgo-mark2 style="width: 25px; height: 25px;" />
        </v-btn>
      </div>
      <div>
        {{ appStore.fontSize }}
      </div>
      <div style="min-width: 80px;">
        <v-slider v-model="appStore.fontSize" color="orange" hide-details step="25" show-ticks></v-slider>
      </div>
      <v-spacer class="mx-0"></v-spacer>
      <div class="mx-1" @click="appStore.settingsDrawer = !appStore.settingsDrawer" style="cursor: pointer;">
        <Icon name="tabler:settings" color="gray" style="width: 35px; height: 35px; color: gray;" />
        <!-- <v-switch v-model="isDark" color="" hide-details density="compact" inset false-icon="mdi-white-balance-sunny"
          true-icon="mdi-weather-night" class="opacity-80" /> -->
      </div>
    </div>
  </v-app-bar>
</template>
+
<script setup lang="ts">
import { type MenuItem } from "~/models/custom-menu/menu_item_model"

const appStore = useAppStore()
const theme = useTheme()
const drawer = useState('drawer')
const route = useRoute()
const snackbar = useSnackbar();
const { $event } = useNuxtApp()


async function openMarkSurahAyahMenu(event: PointerEvent) {
  const markedAyahsData = uGetMarkedSurahsAyahsData()

  if(markedAyahsData.length < 1) {
    snackbar.add({type: 'info', text: "الرجاء النقر على الاية وضفتها للعلامات."})
    return
  } 

  let items: MenuItem[] = []

  for (let savedMark of markedAyahsData) {
    items.push({
      label: `${uGetSurahNameFromNr(savedMark.surahNumber, appStore.loadedSurahs)} (${savedMark.ayahNumber})`,
      icon: 'material-symbols-light:close',
      iconCB: async () => {
        uRemoveMarkedAyah(savedMark.ayahNumber, savedMark.surahNumber)
        snackbar.add({
          type: 'info',
          text: 'تم إزالة العلامة'
        })
      },
      itemCB: async () => {
        if (appStore.loadedSurah?.number === savedMark.surahNumber) {
          uGoToAyah(savedMark.ayahNumber, savedMark.surahNumber)
          uGlowAyah(savedMark.ayahNumber)
          await uSleep(2)
          uUnglowAyah(savedMark.ayahNumber)
        } else {
          await appStore.loadSurah(savedMark.surahNumber)
          await uSleep(0.5)
          uGoToAyah(savedMark.ayahNumber, savedMark.surahNumber)
          uGlowAyah(savedMark.ayahNumber)
          await uSleep(2)
          uUnglowAyah(savedMark.ayahNumber)
        }
      }
    })
  }
  $event("custom-menu", { items, target: event })
}

async function openSurahsSearchMenu(event: PointerEvent) {
  $event("search-dialog", {})
}

const breadcrumbs = computed(() => {
  return route!.matched
    .filter(
      (item) =>
        item.meta && item.meta.title && !(item.meta?.breadcrumb === 'hidden'),
    )
    .map((r) => ({
      title: r.meta.title!,
      disabled:
        r.meta?.breadcrumb === 'disabled' || r.path === route.path || false,
      to: r.path,
    }))
})
// const isDark = computed({
//   get() {
//     return theme.global.name.value === 'dark' ? true : false
//   },
//   set(v) {
//     theme.global.name.value = v ? 'dark' : 'light'
//   },
// })
</script>
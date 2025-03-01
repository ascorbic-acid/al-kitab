<template>
  <v-container>
    <QuranSearch />

    <!-- <v-btn @click="test_worker">test worker</v-btn> -->
    <!-- <v-text-field v-model="term" @input="debouncedFn"></v-text-field> -->
    <div v-if="true">

      <v-row>
        <v-col md="10">
          <v-chip  class="mx-1" label size="small">
            {{ appStore.loadedSurah?.name }}
          </v-chip>
          <div class="reading-card mx-0 mt-3">
            <h3
              v-if="appStore.loadedSurah?.number !== 9 && appStore.loadedSurah && !appStore.loading && appStore.loadedSurah?.number !== 500"
              class="text-center mb-3 mt-5" style="font-family: Kitab; font-size: 25px;">بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ
              ٱلرَّحِیمِ
            </h3>

            <v-skeleton-loader v-if="appStore.loading" class="mx-auto border" type="article"></v-skeleton-loader>

            <template v-if="appStore.loadedSurah && !appStore.loading" v-for="ayah, idx in appStore.loadedSurah.ayahs"
              :key="ayah.numberInSurah">
              <Ayah @click="openAyahMenu(ayah, $event)" :ayah="ayah" :font-size="appStore.fontSize" />
            </template>
          </div>
        </v-col>
      </v-row>
    </div>
    <AppCustomMenu />
  </v-container>
</template>

<script setup lang="ts">
import { useAppStore } from "~/stores/app_store"
import { useDebounceFn } from '@vueuse/core'

import type { Ayah } from "~/models/ayah/ayah_model"
import type { MenuItem } from "~/models/custom-menu/menu_item_model"

const snackbar = useSnackbar()
const appStore = useAppStore()
const { $event } = useNuxtApp()




const ayahOptions = [
  {
    title: "وضع علامة هنا",
    subtitle: "لاستكمال القرائة من هنا بعد فتح التطبيق",
    appendIcon: "subway:mark-2"
  }
]

const debouncedFn = useDebounceFn((event) => {
  search_surah(event)
}, 1000)


async function openAyahMenu(ayah: Ayah, event: PointerEvent) {

  // TODO: Clean up this mess
  let items: MenuItem[] = []

  for (let ayahOption of ayahOptions) {
    items.push({
      label: ayahOption.title,
      subtitle: ayahOption.subtitle,
      icon: 'subway:mark-2',
      itemCB: async () => {
        uMarkAyah(ayah.numberInSurah, appStore.loadedSurah?.number!)
        // uGlowAyah(ayah.numberInSurah)
        snackbar.add({ type: 'success', text: `تم حفض العلامة للاية (${ayah.numberInSurah})` })
      }
    })
  }
  $event("custom-menu", {
    items: items,
    target: event,
    openCB: function () {
      return uGlowAyah(ayah.numberInSurah)
    },
    closeCB: async function () {
      return uUnglowAyah(ayah.numberInSurah)
    }
  })
}

async function test_worker() {

}
onMounted(async () => {

})

</script>

<style scoped>
.reading-card {

  padding: 10px;
  height: calc(100vh - 150px) !important;
  overflow-y: scroll;
  background-color: #dfdfdf;
  border-radius: 8px;
  /* scrollbar-width: thin; */
  /* scrollbar-color: orange, orange; */
  /* height: calc(100vh - 300px) !important; */
  /* background-color: red; */
  /* display: flex; */
  /* flex-direction: row; */
  /* justify-content: start; */
  /* flex-flow: wrap; */
  /* word-break: normal; */
  /* word-spacing: -1px; */
  text-align: justify;
  text-justify: inter-word;
}



.sticky-row {
  position: sticky;
  top: 0;
  background-color: white;
  /* Or any desired background color */
  z-index: 1;
  /* Ensure it stays on top */
}

.scrollable-row {
  margin-top: 10px;
  /* Add some spacing between rows */
}
</style>

<template>
  <v-container>
    <!-- <p v-if="appStore.loadedSurahs">    loaded surahs: {{ appStore.loadedSurahs.length }}    </p>
    <v-btn @click="loadAllSurahs">load all surahs</v-btn> -->
    <div v-if="true">

      <v-row>
        <v-col md="10">
          <div class="mt-10">
            <h3
              v-if="appStore.loadedSurah?.number !== 9 && appStore.loadedSurah && !appStore.loading && appStore.loadedSurah?.number !== 500"
              class="text-center" style="font-family: Kitab; font-size: 25px;">بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ
            </h3>
            <!-- <v-skeleton-loader v-if="appStore.loadedSurah?.number !== 9 && appStore.loading" 
             class="mx-auto border" type="heading" width="300"></v-skeleton-loader> -->
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col md="10">
          <div class="reading-card mx-0" height="80%">
            <v-skeleton-loader v-if="appStore.loading" class="mx-auto border" type="article"></v-skeleton-loader>
            <template v-if="appStore.loadedSurah && !appStore.loading" v-for="ayah, idx in appStore.loadedSurah.ayahs"
              :key="ayah.numberInSurah">
              <Ayah @click="openAyahMenu(ayah, $event)" :ayah="ayah" />
              <AyahNumLogo :num="ayah.numberInSurah" />
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
import type { Ayah, AyahClickEvent } from "~/models/ayah/ayah_model"
import type { MenuItem } from "~/models/custom-menu/menu_item_model"

const appStore = useAppStore()
const menuOpen = ref(true)
const snackbar = useSnackbar()
const { $pwa } = useNuxtApp()
const { $event } = useNuxtApp()

const ayahOptions = [
  {
    title: "وضع علامة هنا",
    subtitle: "لاستكمال القرائة من هنا عن بعد فتح التطبيق",
    appendIcon: "subway:mark-2"
  }
]

async function openAyahMenu(ayah: Ayah, event: PointerEvent) {
  console.log(ayah);
  
  let items: MenuItem[] = []

  for (let ayahOption of ayahOptions) {
    items.push({
      label: ayahOption.title,
      subtitle: ayahOption.subtitle,
      icon: 'subway:mark-2',
      itemCB: async () => {
        uMarkAyah(ayah.numberInSurah, appStore.loadedSurah?.number!)
        // uGlowAyah(ayah.numberInSurah)
        snackbar.add({type: 'success', text: `تم حفض العلامة للاية (${ayah.numberInSurah})`})
      }
    })
  }
  $event("custom-menu", {
    items: items,
    target: event,
    openCB: function () {
      console.log('open called');
      return uGlowAyah(ayah.numberInSurah)
    },
    closeCB: async function () {
      console.log('close   called');
      return uUnglowAyah(ayah.numberInSurah)
    }
  })
}


// function openAyahMenu2(ayah: Ayah, event: PointerEvent) {
//   if(currentAyahMenu.value) return;
//   currentAyahMenu.value = { event: event, ayah: ayah }
//   menuOpen.value = true
//   console.log(toRaw(currentAyahMenu.value));
//   uGlowAyah(ayah.numberInSurah)
// } 

function ayahMenuClose(value: boolean) {
  console.log(value, " :closed, unglow: ", currentAyahMenu.value!.ayah.numberInSurah);

  uUnglowAyah(currentAyahMenu.value!.ayah.numberInSurah)
  if (!value) {
    currentAyahMenu.value = undefined
    menuOpen.value = false
  }
}


function runAyahAction(action: string) {
  console.log(action);

  if (action === "mark_ayah") {
    uMarkAyah(currentAyahMenu.value!.ayah.numberInSurah, appStore.loadedSurah?.number!)
    let md = uGetMarkedSurahsAyahsData()
    console.log(md);

  } else if (action === "hide_next_ayahs") {

  }
}


onMounted(() => {

})

</script>

<style scoped>
.reading-card {
  padding: 10px;
  /* display: flex; */
  /* flex-direction: row; */
  /* justify-content: start; */
  /* flex-flow: wrap; */
  /* word-break: normal; */
  /* word-spacing: -1px; */
  text-align: justify;
  text-justify: inter-word;
}

.ayah__span {
  display: inline;
  /* flex-shrink: 1; */
  /* flex-wrap: wrap; */
  /* border: 1px solid orange; */
  font-family: Kitab;
  font-size: 38px;
  /* word-break: keep-all; */
  /* white-space: 4; */
  /* text-overflow: ellipsis; */
  /* max-width: 200px; */

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

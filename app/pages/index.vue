<template>
  <v-container>
    <v-btn @click="test_db">test db</v-btn>
    <v-btn @click="build_db">build db</v-btn>

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
import { useSwStore } from "~/stores/sw_store"

import type { Ayah, AyahClickEvent } from "~/models/ayah/ayah_model"
import type { MenuItem } from "~/models/custom-menu/menu_item_model"
import type { Connection } from "jsstore"
import initSqlJs from "sql.js/dist/sql-wasm-debug"
import type { Surah } from "~/models/surah/surah_model"
// import { initDb } from 
const appStore = useAppStore()
const swStore = useSwStore()
const menuOpen = ref(true)
const snackbar = useSnackbar()
const { $pwa } = useNuxtApp()
const { $event } = useNuxtApp()
let appVersion = ref('')

let conn = ref<Connection>()






const ayahOptions = [
  {
    title: "وضع علامة هنا",
    subtitle: "لاستكمال القرائة من هنا بعد فتح التطبيق",
    appendIcon: "subway:mark-2"
  }
]

async function test_db() {
  let term = "ٱلْفَاتِحَةِ"

  let res = await conn.value?.select(
    {
      from: "Surah",
      where: {
        name: { like: `%${term}%` }
      }
    }
  )
  console.log(res);

}

async function build_db() {
  

  // const urls = uGetSurahsUrls()
  // let loadTasks: Promise<Surah>[] = []

  // for (let url of urls) {
  //   loadTasks.push($fetch<Surah>(url))
  // }
  // const res = await Promise.all(loadTasks)

  // let values = []

  // for(let surah of res) {
  //   values.push(surah)
  // }

  // conn.value?.insert({
  //   into: "Surah",
  //   values: values
  // })

  // let res1 = await conn.value?.select({
  //   from: "Surah",
  //   where: {
  //     number: 1
  //   }
  // })
  // console.log(res);


}


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
      console.log('open called');
      return uGlowAyah(ayah.numberInSurah)
    },
    closeCB: async function () {
      console.log('close   called');
      return uUnglowAyah(ayah.numberInSurah)
    }
  })
}


onMounted(async () => {
  // conn.value = await initDb()

  let config = {
    locateFile: (filename: string) => `/sql-wasm-debug.wasm`
  }

  initSqlJs(config).then(function (SQL: any) {
    //Create the database
    const db = new SQL.Database();
    // Run a query without reading the results
    db.run("CREATE TABLE test (col1, col2);");
    // Insert two rows: (1,111) and (2,222)
    db.run("INSERT INTO test VALUES (?,?), (?,?)", [1, 111, 2, 222]);

    window['db'] = db
    // Prepare a statement
    const stmt = db.prepare("SELECT * FROM test WHERE col1 BETWEEN $start AND $end");
    stmt.getAsObject({ $start: 1, $end: 1 }); // {col1:1, col2:111}


  });
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

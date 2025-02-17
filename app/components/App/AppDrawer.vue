<template>
  <v-navigation-drawer v-model="appStore.drawer">
    <div style="height: 120px; ">
      <v-list>
        <v-list-item class="pa-1">
          <v-list-item-title class="text-h5 font-weight-bold" style="line-height: 2rem">
            <div style="display: flex; justify-content: space-between;">
              <div>
                <span class="text-primary">الكتاب</span>
                <span style="font-size: 8px; font-weight: 100; margin: 5px;">v1.2.2</span>
              </div>
            </div>
          </v-list-item-title>

        </v-list-item>
        <v-list-item class="mt-0">
          <v-list-item-title>
            <v-text-field class="pt-2" label="بحث عن سورة" v-model="surahSearchTerm" variant="outlined"
              density="compact" placeholder="الانسان" clearable></v-text-field>

          </v-list-item-title>
        </v-list-item>
        <v-list-item v-if="searchSurahsResults.length == 0">
          <div class="text-center">
            <h5>لايوجد نتائج</h5>
          </div>
        </v-list-item>
      </v-list>
    </div>
    <div class="mt-3" style="display: flex; flex-direction: row; height: 100%; justify-content: space-around;">
      <!-- surahs column -->
      <div style="height: 80%; overflow-y: auto;">

        <template v-for="(surah, idx) in searchSurahsResults">
          <div class="px-2">
            <v-btn @click="appStore.loadSurah(surah.id)" block
              :color="surah.id == appStore.loadedSurah?.number ? 'orange' : ''" rounded="false"
              style="margin-right: 5px; margin-left: 5px; margin-bottom: 10px;">
              <p class="text-h6" style="font-size: 22px; font-family: Hafs;">{{ surah.id }}- {{ surah.name }}</p>
            </v-btn>
          </div>
        </template>
      </div>

      <!-- ayahs column -->
      <div style="height: 80%; overflow-y: auto; overflow-x: unset;">

        <template v-if="searchSurahsResults.length > 0" v-for="idx in appStore.loadedSurah?.numberOfAyahs">
          <div>
            <v-btn @click="scrollToAyah(idx)"
              :color="idx === uGetSurahMarkData(appStore.loadedSurah?.number!)?.ayahNumber ? 'orange' : ''"
              rounded="false" style="margin-right: 5px; margin-left: 5px; margin-bottom: 10px;">
              <p class="">{{ idx }}</p>
            </v-btn>
          </div>
        </template>
      </div>
    </div>



    <!-- <v-row style="background-color: gray">
      <v-col md="7">
        <v-list class="" style="height: 80%; overflow-y: scroll; scrollbar-width: thin; scrollbar-color: #f3f0dd">
          <template v-for="(surah, idx) in searchSurahsResults">
            <v-list-item class="text-h5" style="cursor: pointer;">
              <p class="pa-2" style="font-family: Hafs;">{{ idx + 1 }}- {{ surah.name }}</p>
            </v-list-item>
            <v-divider></v-divider>
          </template>
        </v-list>
      </v-col>
      <v-col md="5" >
        <v-list style=" height: 80%; overflow-y: scroll; scrollbar-width: thin; scrollbar-color: #f3f0dd">
          <template v-for="idx in 12">
            <v-list-item class="text-h6" style="cursor: pointer;">
              <p class="pa-2">{{ idx + 1 }}</p>
            </v-list-item>
          </template>
        </v-list>
      </v-col>
    </v-row> -->

    <!-- <v-spacer />
    <template #append>
      <v-list-item class="drawer-footer px-0 d-flex flex-column justify-center">
        <div class="text-caption pt-6 pt-md-0 text-center text-no-wrap">
          <p style="font-family: Hafs;">الكتاب</p>
          <a href="https://github.com/kingyue737" class="font-weight-bold text-primary" target="_blank">github open
            source</a>
        </div>
      </v-list-item>

    </template> -->
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useAppStore } from "~/stores/app_store"

const router = useRouter()
const routes = router.getRoutes().filter((r) => r.path.lastIndexOf('/') === 0)
const drawerState = useState('drawer', () => true)
const { mobile, lgAndUp, width } = useDisplay()
const appStore = useAppStore()
// const drawer = computed({
//   get() {
//     return drawerState.value || !mobile.value
//   },
//   set(val: boolean) {
//     drawerState.value = val
//   },
// })
const rail = computed(() => !drawerState.value && !mobile.value)
// routes.sort((a, b) => (a.meta?.drawerIndex ?? 99) - (b.meta?.drawerIndex ?? 98))

// drawerState.value = lgAndUp.value && width.value !== 1280
let surahSearchTerm = ref("")


async function scrollToAyah(number: number) {
  uGoToAyah(number, appStore.loadedSurah?.number!)
  uGlowAyah(number)
  await uSleep(2)
  uUnglowAyah(number)
}


const searchSurahsResults = computed(() => {
  if (surahSearchTerm.value) {
    return useAppStore().quranSurahs.filter(surah => {
      if (surah.name.includes(surahSearchTerm.value) || surah.transliteration.toLocaleLowerCase().includes(surahSearchTerm.value)) {
        return true
      } else {
        return false
      }
    })
  } else {
    return useAppStore().quranSurahs
  }
})

</script>

<style>
.active-ayah {
  background-color: red;
}

.v-navigation-drawer {
  transition-property: box-shadow, transform, visibility, width, height, left,
    right, top, bottom, border-radius !important;
  /* overflow: hidden; */

  &.v-navigation-drawer--rail {
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;

    &.v-navigation-drawer--is-hovering {
      border-top-right-radius: 15px;
      border-bottom-right-radius: 15px;
      box-shadow:
        0px 1px 2px 0px rgb(0 0 0 / 30%),
        0px 1px 3px 1px rgb(0 0 0 / 15%);
    }

    &:not(.v-navigation-drawer--is-hovering) {
      .drawer-footer {
        transform: translateX(-160px);
      }

      .drawer-header-icon {
        height: 1em !important;
        width: 1em !important;
      }

      .v-list-group {
        --list-indent-size: 0px;
        --prepend-width: 0px;
      }
    }
  }

  .v-navigation-drawer__content {
    overflow-x: unset;
    overflow-y: unset;

    @supports (scrollbar-gutter: stable) {
      scrollbar-gutter: stable;

      >.v-list--nav {
        padding-right: 0;
      }
    }

    /* &:hover {
      overflow-y: overlay;
    } */
  }

  .drawer-footer {
    transition: all 0.2s;
    min-height: 30px;
  }

  .drawer-header-icon {
    opacity: 1 !important;
    height: 1.2em !important;
    width: 1.2em !important;
    transition: all 0.2s;
    margin-right: -10px;
  }

  .v-list-group {
    --prepend-width: 10px;
  }

  .v-list-item {
    transition: all 0.2s;
  }
}
</style>

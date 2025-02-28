<template>
    <v-dialog v-model="dialog" opacity="0" width="500" max-height="80%" min-height="40%">
        <div>
            <v-text-field @update:model-value="search" v-model="first" append-inner-icon="mdi-magnify"
                label="ابحث في ايات القران" single-line hide-details full-width></v-text-field>
        </div>
        <v-card>
            <span class="mt-3"></span>
            <div class="mx-3">
                <h4 v-if="items.length < 1" class="text-center">لاتوجد نتائج بحث, أكتب كلمة من اربع احرف او اكثر</h4>
                <p class="my-3" style="font-size: 10px;">النتائج: {{ items.length }}</p>
                <v-virtual-scroll :items="items"      height="320"
                item-height="48">
                    <template v-slot:default="{ item }">
                        <v-card @click="searchSelect(item)" variant="text" class="hover-highlight" style="background-color: #dfdfdf;">
                            <div class="mx-2 my-3">
                                <v-chip label size="small">
                                    <p style="font-size: 14px;">{{ item.surah.name }}</p>
                                </v-chip>
                            </div>
                            <div class="mx-5 my-2">
                                <Ayah :ayah="item.ayah" :font-size="20" />
                            </div>
                        </v-card>
                        <div class="mb-3"></div>
                    </template>
                </v-virtual-scroll>

            </div>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import type { AyahSearchResult } from '~/models/ayah/ayah_search_result'
import { useDebounceFn } from "@vueuse/core"
const { $listen } = useNuxtApp()
const appStore = useAppStore()
let first = ref()

let dialog = ref(false)
// let search = ref('')
let items = ref<AyahSearchResult[]>([
    {
        surah: {
            name: "سُورَةُ ٱلْفَاتِحَةِ",
            number: 25
        },
        ayah: {
            numberInSurah: 71,
            text: "وَمَن تَابَ وَعَمِلَ صَـٰلِحࣰا فَإِنَّهُۥ یَتُوبُ إِلَى ٱللَّهِ مَتَابࣰا"
        }
    },
    {
        surah: {
            name: "سُورَةُ المُؤۡمِنُونَ",
            number: 23
        },
        ayah: {
            numberInSurah: 61,
            text: "أُو۟لَـٰۤىِٕكَ یُسَـٰرِعُونَ فِی ٱلۡخَیۡرَ ٰ⁠تِ وَهُمۡ لَهَا سَـٰبِقُونَ"
        }
    },
    {
        surah: {
            name: "سُورَةُ البَقَرَةِ",
            number: 2
        },
        ayah: {
            numberInSurah: 285,
            text: "ءَامَنَ ٱلرَّسُولُ بِمَاۤ أُنزِلَ إِلَیۡهِ مِن رَّبِّهِۦ وَٱلۡمُؤۡمِنُونَۚ كُلٌّ ءَامَنَ بِٱللَّهِ وَمَلَـٰۤىِٕكَتِهِۦ وَكُتُبِهِۦ وَرُسُلِهِۦ لَا نُفَرِّقُ بَیۡنَ أَحَدࣲ مِّن رُّسُلِهِۦۚ وَقَالُوا۟ سَمِعۡنَا وَأَطَعۡنَاۖ غُفۡرَانَكَ رَبَّنَا وَإِلَیۡكَ ٱلۡمَصِیرُ"
        }
    }
])


async function search(term: string) {
    dbcSearch(term)
}

let dbcSearch = useDebounceFn(async (term: string) => {
    if (term.length > 1) {
        let res = await appStore.wwLink!.api.searchSurahs(term)
        items.value = res
    } else {
        items.value = []
    }
}, 1000)

async function searchSelect(result: AyahSearchResult) {
    onMenuClose(true)
    setTimeout(() => {
        uGoToAyah(result.ayah.numberInSurah, result.surah.number, appStore)
    }, 500)
}

const filteredItems = computed(() => {
    return items.value.filter(item => {
        return item.title.toLowerCase().includes(search.value.toLowerCase());
    });
})

function onMenuOpen(_data: any) {
    dialog.value = true
    document.querySelector(".v-application__wrap")!.style = "filter: blur(5px)"
}

function onMenuClose(value: boolean) {
    dialog.value = false
    document.querySelector(".v-application__wrap")!.style = "filter: blur(0px)"
}

watch(dialog, (value) => {
    if (!value) onMenuClose(value)
})

$listen('search-dialog', (_data: any) => {
    onMenuOpen(_data)
})

</script>

<style scoped>
.v-dialog {
    opacity: 0.8;
    /* Increased transparency */
}

.hover-highlight:hover {
    background-color: rgba(0, 0, 0, 0.1);
    /* Highlight effect on hover */
}

.blur-background {
    filter: blur(10px);
    /* Apply blur effect */
    transition: filter 0.3s ease;
    /* Smooth transition */
}

.ayah-num-icon__container {
    position: relative;
    display: inline-block;
    top: 13px;
    margin-right: 5px;
    margin-left: 5px;
    user-select: none
}

.ayah-num-icon__icon {
    /* width: 100px; */
    /* Adjust size as needed */
    /* height: 100px; */
    /* Adjust size as needed */
}

.ayah-num-icon__text-num {
    position: absolute;
    top: 46%;
    left: 50%;
    transform: translate(-50%, -56%);
    color: rgb(0, 0, 0);
    /* font-weight: bold; */
    /* Change text color as needed */
    text-align: center;
}
</style>
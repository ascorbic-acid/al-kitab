<template>
    <div class="ayah__span" @click="clickEvent(ayah, $event)" @dblclick="dblClickEvent(ayah, $event)"
        :style="{ 'font-size': `clamp(1rem, ${fontSize}, 4rem)` }" :kbt-ayah-nr="props.ayah.numberInSurah"
        :id="`akb-ayah-nr__${props.ayah.numberInSurah}`">

        <template v-for="ayahWord, idx in props.ayah.ayah_words">
            <p :kbt-ayah-nr="props.ayah.numberInSurah"
                :style="{ 'display': 'inline', 'filter': ayahWord.hidden ? 'blur(6px)' : 'blur(0px)' }">{{ " " +
                    ayahWord.word + " " }}
            </p>

        </template>

        <!-- <span>{{ props.ayah.hidden }}</span> -->

        <div class="ayah-num-icon__container">
            <img class="ayah-num-icon__icon" src="/icons/ayah.svg" :style="{ 'width': `${ayahNumFontSize! + 15}px` }" />
            <span class="ayah-num-icon__text-num" :style="{ 'font-size': `${ayahNumFontSize}px` }">{{
                props.ayah.numberInSurah
                }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAppStore } from "~/stores/app_store"
import type { MenuItem } from "~/models/custom-menu/menu_item_model"
import type { Ayah } from "~/models/ayah/ayah_model"

// import { Tajweed } from 'tajweed';
const snackbar = useSnackbar()
// const props = defineProps(['idx', 'ayah', 'fontSize'])
const appStore = useAppStore()
const { $event } = useNuxtApp()

const props = defineProps<{
    idx: number,
    ayah: Ayah,
    fontSize: number
}>()

// let parseTajweed = new Tajweed()

const fontSize = computed(() => {
    if (props.fontSize === 15) {
        return "1.0rem"
    }
    else if (props.fontSize === 20) {
        return "1.3rem"
    }
    else if (props.fontSize === 25) {
        return "1.5rem"
    } else if (props.fontSize === 50) {
        return "1.8rem"
    } else if (props.fontSize === 75) {
        return "2.2rem"
    } else if (props.fontSize === 100) {
        return "2.4rem"
    }
})

const ayahNumFontSize = computed(() => {
    if (props.fontSize === 15) {
        return 10
    }
    else if (props.fontSize === 20) {
        return 11
    }
    else if (props.fontSize === 25) {
        return 11
    } else if (props.fontSize === 50) {
        return 13
    } else if (props.fontSize === 75) {
        return 15
    } else if (props.fontSize === 100) {
        return 18
    }
})

function clickEvent(ayah: Ayah, event: PointerEvent) {
    if(ayah.hidden) {
        const randTimes = Math.round(Math.random() + 1 * 1 )
        for(let i = 1; i <= randTimes; i++) {
            appStore.showNextHiddenAyah(props.idx, false)
        }
    } else {
        openAyahMenu(ayah, event)
    }
}

function dblClickEvent(ayah: Ayah, event: PointerEvent) {
    if(ayah.hidden) {
        appStore.showNextHiddenAyah(props.idx, true)
    } else {
        openAyahMenu(ayah, event)
    }
}

async function openAyahMenu(ayah: Ayah, event: PointerEvent) {
    $event("custom-menu", {
        items: [
            {
                label: "وضع علامة هنا",
                subtitle: "لاستكمال القرائة من هنا بعد فتح التطبيق",
                icon: 'subway:mark-2',
                itemCB: async () => {
                    uMarkAyah(ayah.numberInSurah, appStore.loadedSurah?.number!)
                    // uGlowAyah(ayah.numberInSurah)
                    snackbar.add({ type: 'success', text: `تم حفض العلامة للاية (${ayah.numberInSurah})` })
                }
            },
            {
                label: "إخفاء الايات التالية",
                subtitle: "للتدرب وتقيم مستوى الحفض",
                icon: 'material-symbols:model-training',
                itemCB: async () => {
                    appStore.hideAyahsStartFromIdx(props.idx)
                    snackbar.add({ type: 'info', text: `انقر مرة على اي نص مخفي لعرض الكلمات أو مرتين بسرعة لعرض الاية كاملة` })
                }
            }
        ],
        target: event,
        openCB: function () {
            return uGlowAyah(ayah.numberInSurah)
        },
        closeCB: async function () {
            return uUnglowAyah(ayah.numberInSurah)
        }
    })
}

// watch(async () => props.ayah.hidden, async (newVal, oldVal) => {
//     if (props.ayah.hidden) {
//         for (let word of props.ayah.ayah_words) {
//             word.hidden = true
//         }
//     } else {
//         for (let word of props.ayah.ayah_words) {
//             word.hidden = false
//         }
//     }
// }, { deep: true })


</script>

<style scoped>
.ayah__span {
    display: inline;
    /* flex-shrink: 1; */
    /* flex-wrap: wrap; */
    /* border: 1px solid orange; */
    cursor: pointer;
    font-family: Kitab;
    /* font-size: 38px; */
    /* word-break: keep-all; */
    /* white-space: 4; */
    /* text-overflow: ellipsis; */
    /* max-width: 200px; */

}

.ayah-num-icon__container {
    position: relative;
    display: inline-block;
    top: 13px;
    /* margin-right: 1px; */
    /* margin-lefst: 1px; */
    user-select: none
}

.ayah-num-icon__icon {
    /* display: block; */
    width: 33px
}

.ayah-num-icon__text-num {
    position: absolute;
    top: 42%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: rgb(0, 0, 0);
    /* font-weight: bold; */
    /* Change text color as needed */
    /* font-size: 15px; */
    text-align: center;
}
</style>
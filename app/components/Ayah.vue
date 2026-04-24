<template>
    <div class="ayah__container" :style="ayahStyles" @click="clickEvent(ayah, $event)"
        @dblclick="dblClickEvent(ayah, $event)" :kbt-ayah-nr="props.ayah.numberInSurah"
        :id="`akb-ayah-nr__${props.ayah.numberInSurah}`">

        <template v-for="ayahWord, idx in props.ayah.ayah_words">
            <p class="ayah-word" :kbt-ayah-nr="props.ayah.numberInSurah"
                :style="{ 'filter': ayahWord.hidden ? 'blur(6px)' : 'blur(0px)' }">{{ " " +
                    ayahWord.word + " " }}
            </p>
        </template>

        <div class="ayah-num-icon__container">
            <img class="ayah-num-icon__icon" src="/icons/ayah.svg" />
            <span class="ayah-num-icon__text-num">{{ props.ayah.numberInSurah }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAppStore } from "~/stores/app_store"
import type { Ayah } from "~/models/ayah/ayah_model"
import { getAyahFontSize, getAyahNumFontSize } from "~/utils/font_utils"

const appStore = useAppStore()
const { $event } = useNuxtApp()
const snackbar = useSnackbar()

const props = defineProps<{
    idx: number,
    ayah: Ayah,
    fontSize: number
}>()

const ayahStyles = computed(() => ({
    '--ayah-font-size': `clamp(1rem, ${getAyahFontSize(props.fontSize)}, 4rem)`,
    '--ayah-num-font-size': `${getAyahNumFontSize(props.fontSize)}px`,
    '--ayah-num-icon-width': `${getAyahNumFontSize(props.fontSize) + 15}px`
}))

function clickEvent(ayah: Ayah, event: PointerEvent) {
    if (ayah.hidden) {
        const randTimes = Math.round(Math.random() + 1 * 1)
        for (let i = 1; i <= randTimes; i++) {
            appStore.showNextHiddenAyah(props.idx, false)
        }
    } else {
        openAyahMenu(ayah, event)
    }
}

function dblClickEvent(ayah: Ayah, event: MouseEvent) {
    if (ayah.hidden) {
        appStore.showNextHiddenAyah(props.idx, true)
    } else {
        openAyahMenu(ayah, event)
    }
}

async function openAyahMenu(ayah: Ayah, event: MouseEvent) {
    $event("custom-menu", {
        items: [
            {
                label: "وضع علامة هنا",
                subtitle: "لاستكمال القرائة من هنا بعد فتح التطبيق",
                icon: 'subway:mark-2',
                itemCB: async () => {
                    uMarkAyah(ayah.numberInSurah, appStore.loadedSurah?.number!)
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
</script>

<style scoped>
.ayah__container {
    display: inline;
    cursor: pointer;
    font-family: Kitab;
    font-size: var(--ayah-font-size);
}

.ayah-word {
    display: inline;
}

.ayah-num-icon__container {
    position: relative;
    display: inline-block;
    top: 0px;
    user-select: none;
    line-height: 0;
    vertical-align: middle;
}

.ayah-num-icon__icon {
    width: var(--ayah-num-icon-width);
}

.ayah-num-icon__text-num {
    position: absolute;
    top: 53%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: rgb(0, 0, 0);
    font-size: var(--ayah-num-font-size);
    text-align: center;
    font-family: sans-serif;
    font-weight: bold;
}
</style>
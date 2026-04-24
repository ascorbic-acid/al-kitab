<template>
    <div class="ayah__container" :style="ayahStyles" :kbt-ayah-nr="props.item.numberInSurah"
        :id="`akb-ayah-nr__${props.item.numberInSurah}`">

        <template v-for="word, idx in props.item.text.split(' ')">
            <p class="ayah-word" :kbt-ayah-nr="props.item.numberInSurah">{{ " " + word + " " }}</p>
        </template>

        <div class="ayah-num-icon__container">
            <img class="ayah-num-icon__icon" src="/icons/ayah.svg" />
            <span class="ayah-num-icon__text-num">{{ props.item.numberInSurah }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { AyahSearchResult } from "~/models/ayah/ayah_search_result"
import { getAyahFontSize, getAyahNumFontSize } from "~/utils/font_utils"

const props = defineProps(
    {
        item: {
            type: Object as PropType<AyahSearchResult>,
            required: true
        },
        fontSize: {
            type: Number,
            required: true
        }
    }
)

const ayahStyles = computed(() => ({
    '--ayah-font-size': `clamp(1rem, ${getAyahFontSize(props.fontSize)}, 4rem)`,
    '--ayah-num-font-size': `${getAyahNumFontSize(props.fontSize)}px`,
    '--ayah-num-icon-width': `${getAyahNumFontSize(props.fontSize) + 15}px`
}))
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
    top: 13px;
    user-select: none;
    line-height: 0;
    vertical-align: middle;
}

.ayah-num-icon__icon {
    width: var(--ayah-num-icon-width);
}

.ayah-num-icon__text-num {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: rgb(0, 0, 0);
    font-size: var(--ayah-num-font-size);
    text-align: center;
    font-family: sans-serif;
    font-weight: bold;
}
</style>
<template>
    <div class="ayah__span" :style="{ 'font-size': `clamp(1rem, ${fontSize}, 4rem)`, 'cursor': 'pointer' }"
        :kbt-ayah-nr="props.ayah.numberInSurah" :id="`akb-ayah-nr__${props.ayah.numberInSurah}`">

        <template style="display: inline-block;" v-for="word, idx in props.ayah.text.split(' ')">
            <p :kbt-ayah-nr="props.ayah.numberInSurah" style="display: inline;">{{ " " + word + " " }}</p>
        </template>

        <div class="ayah-num-icon__container" >
            <img class="ayah-num-icon__icon" src="/icons/ayah.svg" :style="{'width': `${ayahNumFontSize!+15}px`}" />
            <span class="ayah-num-icon__text-num" :style="{'font-size': `${ayahNumFontSize}px`}" >{{ props.ayah.numberInSurah }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAppStore } from "~/stores/app_store"

// import { Tajweed } from 'tajweed';
const props = defineProps(['ayah', 'fontSize'])
const appStore = useAppStore()

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
</script>

<style scoped>
.ayah__span {
  display: inline;
  /* flex-shrink: 1; */
  /* flex-wrap: wrap; */
  /* border: 1px solid orange; */
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
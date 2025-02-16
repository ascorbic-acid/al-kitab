<template>
    <div class="ayah__span" :style="{ 'font-size': `clamp(1rem, ${fontSize}, 4rem)`,  'cursor': 'pointer' }" 
        :kbt-ayah-nr="props.ayah.numberInSurah"
        :id="`akb-ayah-nr__${props.ayah.numberInSurah}`"
        >
        
        <template style="display: inline-block;"
            v-for="word, idx in props.ayah.text.split(' ')">
            <p :kbt-ayah-nr="props.ayah.numberInSurah" style="display: inline;">{{ " " + word + " " }}</p>
        </template>
        
        
    </div>
</template>

<script setup lang="ts">
import { useAppStore } from "~/stores/app_store"

// import { Tajweed } from 'tajweed';
const props = defineProps(['ayah'])
const appStore = useAppStore()

// let parseTajweed = new Tajweed()

const fontSize = computed(() => {
    if (appStore.fontSize === 25) {
        return "1.5rem"
    } else if (appStore.fontSize === 50) {
        return "1.8rem"
    } else if (appStore.fontSize === 75) {
        return "2.2rem"
    } else if (appStore.fontSize === 100) {
        return "2.4rem"
    }
})

// remove new line character
function removeNewLine(text: string) {
    return text.replace(/\n/g, '')
}

</script>

<style scoped>
.ayah-num-icon__container {
    position: relative;
    display: inline-block;
    top: 10px;
    margin-right: 1px;
    margin-left: 1px;
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
    top: 50%;
    left: 50%;
    transform: translate(-50%, -56%);
    color: rgb(0, 0, 0);
    /* font-size: 15px; */
    font-weight: bold;
    /* Change text color as needed */
    text-align: center;
}
</style>
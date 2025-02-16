<template>
    <div class="ayah-num-icon__container" :style="{'width': `${logoSize}px`}">
        <img src="/icons/ayah.svg"  />
        <p class="ayah-num-icon__text-num" :style="{'font-size': logoFontSize}">{{ props.num }}</p>
    </div>
</template>

<script setup lang="ts">
import { useAppStore } from "~/stores/app_store"

const props = defineProps(['num'])
const appStore = useAppStore()

const logoSize = computed(() => {
    if (appStore.fontSize === 25) {
        return "25"
    } else if (appStore.fontSize === 50) {
        return "30"
    } else if (appStore.fontSize === 75) {
        return "33"
    } else if (appStore.fontSize === 100) {
        return "38"
    }
})

const logoFontSize = computed(() => {
    if (appStore.fontSize === 25) {
        return "11px"
    } else if (appStore.fontSize === 50) {
        return "13px"
    } else if (appStore.fontSize === 75) {
        return "15px"
    } else if (appStore.fontSize === 100) {
        return "18px"
    }
})

</script>



<style scoped>
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
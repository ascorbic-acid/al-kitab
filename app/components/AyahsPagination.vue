<template>
    <div class="ayah-pagination__container">
        <br>
        <div class="d-flex justify-center">
            <v-btn @click="setAyah(1)" class="mx-1" color="blue" size="30" rounded="false" variant="tonal">
                <span>1</span>
            </v-btn>


            <!-- Minus 5 Ayahs -->
            <v-btn @click="setAyah(currentAyah - 50)" v-if="currentAyah - 50 > 1" class="mx-1" color="gray" size="30" rounded="false" variant="tonal">
                <span>{{ currentAyah - 50 }}</span>
            </v-btn>

            <!-- Minus 10 Ayahs -->
            <v-btn @click="setAyah(currentAyah - 10)" v-if="currentAyah - 10 > 1" class="mx-1" color="gray" size="30" rounded="false" variant="tonal">
                <span>{{ currentAyah - 10 }}</span>
            </v-btn>

            <!-- Current Ayah -->
            <div class="mx-5">
                <p style="margin-top: 5px; font-size: 18px; font-weight: bold;">{{ currentAyah }}</p>
                <p style="margin-top: -15px;">...</p>
            </div>



            <!-- Plus 10 Ayahs -->
            <v-btn @click="setAyah(currentAyah + 10)" v-if="currentAyah + 10 < props.total"  class="mx-1" color="gray" size="30" rounded="false"
                variant="tonal">
                <span>{{ currentAyah + 10 }}</span>
            </v-btn>

            <!-- Plus 50 Ayahs -->
            <v-btn @click="setAyah(currentAyah + 50)" v-if="currentAyah + 50 < props.total" class="mx-1" color="gray" size="30" rounded="false"
                variant="tonal">
                <span>{{ currentAyah + 50 }}</span>
            </v-btn>

            <!-- Last Ayah -->
            <v-btn @click="setAyah(props.total)" class="mx-2" color="blue" size="30" rounded="false" variant="tonal">
                <span> {{ props.total }}</span>
            </v-btn>
        </div>
    </div>
</template>

<script setup lang="ts">
defineEmits(["ayahSet"])
const props = defineProps(['total'])
let currentAyah = ref(20)

function setAyah(num: number) {
    console.log(num, typeof num);
    
    let cls = `akb-ayah-nr__${num}`
    console.log('select ayah: ', cls);

    currentAyah.value = num
    document.getElementById(cls).scrollIntoView({behavior: 'smooth'})

}

</script>


<style scoped>
.ayah-num-icon__container {}
</style>
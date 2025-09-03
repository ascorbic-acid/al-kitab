<template>
    <div style="display: flex; justify-content: space-between;">
        <div>
            <h4 >تفعيل الوضع اليلي</h4>
            <p style="color: gray">يساعد على النظر</p> <span>{{ darkMode }}</span>
        </div>

        <div>
            <v-switch v-model="model" hide-details inset></v-switch>
        </div>
    </div>


</template>

<script setup lang="ts">
import { SettingsService } from '~/services/settings_service';


const { t } = useI18n()
const theme = useTheme()
const nuxtApp = useNuxtApp()

console.log(nuxtApp.$sl.GetService(SettingsService));


const darkMode = toRef(1)



const model = computed({
    async get() {
        
        if(darkMode) {
            theme.change("light")
        } else {
            theme.change("dark")
        }
        return darkMode
    },
    async set(value) {
        if(await value) {
            theme.change("dark")
        } else {
            theme.change("light")
        }
        // appConfig.setConfig({dark_mode: value} as any)
    }
})


// function darkModeChange(value: boolean) {
//     appStore.setConfig({
//         dark_mode: value
//     } as any)

//     if(value) {
//         theme.change("dark")
//     } else {
//         theme.change("light")
//     }
// }

</script>
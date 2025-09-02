<template>
    <div style="display: flex; justify-content: space-between;">
        <div>
            <h4 >تفعيل الوضع اليلي</h4>
            <p style="color: gray">يساعد على النظر</p>
        </div>

        <div>
            <v-switch v-model="model" hide-details inset></v-switch>
        </div>
    </div>


</template>

<script setup lang="ts">
const { t } = useI18n()
const theme = useTheme()
const appStore = useAppStore()




const model = computed({
    get() {
        if(appStore.config?.dark_mode) {
            theme.change("dark")
        } else {
            theme.change("light")
        }
        return appStore.config?.dark_mode
    },
    set(value) {
        appStore.setConfig({
            dark_mode: value
        } as any)

        if(value) {
            theme.change("dark")
        } else {
            theme.change("light")
        }
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
<template>
    <div style="display: flex; justify-content: space-between;">
        <div>
            <h4 >تفعيل الوضع اليلي</h4>
            <p style="color: gray">يساعد على النظر</p> <span>{{ darkMode }}</span>
        </div>

        <div>
            <v-switch v-model="darkMode" hide-details inset></v-switch>
        </div>
    </div>
</template>

<script setup lang="ts">
const theme = useTheme()
const cfgStore = useConfigStore()

const darkMode = computed({
    get() {
        const val = cfgStore.config?.dark_mode
        val ? theme.change("dark") : theme.change("light")
        return cfgStore.config?.dark_mode
    },
    set(val: boolean) {
        cfgStore.setConfig({dark_mode: val})
        val ? theme.change("dark") : theme.change("light")
    }
})

</script>
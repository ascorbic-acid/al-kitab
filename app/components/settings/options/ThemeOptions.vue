<template>
    <div style="display: flex; justify-content: space-between;">
        <div>
            <h4 >تفعيل الوضع اليلي</h4>
            <p style="color: gray">يساعد على النظر</p>
        </div>

        <div>
            <v-switch v-model="model"  hide-details inset></v-switch>
        </div>
    </div>


</template>

<script setup lang="ts">
const { t } = useI18n()
const theme = useTheme()


const model = computed({
    get() {
        return theme.global.name.value === 'dark'
    },
    set(value) {
        theme.global.name.value = value ? 'dark' : 'light'
    }
})

</script>
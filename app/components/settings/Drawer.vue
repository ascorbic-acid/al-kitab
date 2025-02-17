<template>
    <v-navigation-drawer id="settings-drawer" v-model="appStore.settingsDrawer" :location="'left'" width="350" disable-route-watcher
        temporary touchless>
        <v-toolbar :title="'الإعدادات العامة'" flat>
            <template #append>
                <v-btn icon="mdi-close" variant="flat" @click="" />
            </template>
        </v-toolbar>

        <v-divider />

        <v-container class="px-3 py-3">
            <SettingsOptionsThemeOptions />
            <v-divider class="my-3" />
        </v-container>
    </v-navigation-drawer>
</template>

<script setup lang="ts">
const appStore = useAppStore()

</script>

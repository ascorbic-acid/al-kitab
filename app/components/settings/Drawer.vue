<template>
    <v-navigation-drawer id="settings-drawer" v-model="appStore.settingsDrawer" :location="'left'" disable-route-watcher
        temporary touchless>
        <v-toolbar :title="'الإعدادات العامة'" flat>
            <template #append>
                <v-btn icon="mdi-close" variant="flat" size="small" @click="appStore.settingsDrawer = false" />
            </template>
        </v-toolbar>

        <v-divider />

        <v-container class="px-3 py-3">
            <SettingsOptionsThemeOptions />
            <v-divider class="my-3" />
        </v-container>

        <template #append>
            <v-divider></v-divider>
            <v-row class="mt-5 mx-0">
                <v-col md="6" >
                    <div style="display: flex; white-space: nowrap;">
                        <p style="color: gray;">إصدار التطبيق</p>
                    </div>
                </v-col>
                <v-spacer></v-spacer>
                <v-col md="6" >
                    <div style="display: flex; justify-content: end;">
                        <v-chip class="mx-1" label size="small" append-icon="qlementine-icons:version-control-16">
                            {{ AppConfig.VERSION }}
                        </v-chip>
                    </div>
                </v-col>

            </v-row>
            <a href="https://github.com/ascorbic-acid/al-kitab">
                <v-row class="mb-5 mx-0" style="cursor: pointer;">
                    <v-col md="6" >
                        <div style="display: flex; white-space: nowrap;">
                            <p style="color: gray;">رابط المشروع</p>
                        </div>
                    </v-col>
                    <v-spacer></v-spacer>
                    <v-col md="6" >
                        <div style="display: flex; justify-content: end;">
                            <v-chip class="mx-1" label size="small" append-icon="mdi:source-repository">
                                GITHUB
                            </v-chip>
                        </div>
                    </v-col>
    
                </v-row>
            </a>

        </template>


    </v-navigation-drawer>
</template>

<script setup lang="ts">
import { AppConfig } from "~/service-worker/config"

const appStore = useAppStore()

</script>

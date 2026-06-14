<template>
  <div>
    <v-menu v-if="menuOpen && data?.target" v-model="menuOpen"
       location-strategy="connected"
       :target="[data?.target.clientX!, data?.target.clientY!]"
      location="center" :close-on-content-click="true" @update:model-value="onMenuClose">
      <v-list>
        <v-list-item @click="item.itemCB()" v-for="item in data!.items!" 
          style="cursor: pointer;">
          <template #title>
            <p>{{ item.label }}</p>
          </template>
          <template v-if="item.subtitle" #subtitle>
            <p>{{ item.subtitle }}</p>
          </template>
          <template #append v-if="item.icon">
            <div @click.stop="iconCBHandler(item)" style="margin-right: 15px; margin-left: 5px">
                <Icon :name="item.icon" size="25" />
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import type { MenuData } from "~/models/custom-menu/menu_data_model"
import type { MenuItem } from "~/models/custom-menu/menu_item_model"
const { $listen } = useNuxtApp()
const menuOpen = ref(false)
const data = ref<MenuData>()

function iconCBHandler(item: MenuItem) {
  if (item.iconCB) {
    item.iconCB()
    onMenuClose(false)
  }
}

function onMenuOpen(_data: MenuData) {
  if (menuOpen.value) return;
  data.value = _data
  menuOpen.value = true
  if(data.value.openCB) {
    data.value?.openCB()
  }
}

function onMenuClose(value: boolean) {
  if (!value) {
    menuOpen.value = false
  }
  if(data.value?.closeCB) data.value?.closeCB()
}


$listen('custom-menu', (_data: MenuData) => {
  onMenuOpen(_data)
})

</script>
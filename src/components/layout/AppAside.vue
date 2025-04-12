<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'

const menuItems = ref([
  { icon: 'pi pi-home', title: 'Inicio' },
  { icon: 'pi pi-user', title: 'Perfil' },
  { icon: 'pi pi-cog', title: 'Configuración' },
])

const logoutItem = { icon: 'pi pi-sign-out', title: 'Salir' }
</script>

<template>
  <aside
    class="h-svh w-16 border-r border-surface-300 flex flex-col items-center p-4 bg-surface shadow-md"
  >
    <div class="flex flex-col gap-4 flex-grow">
      <Button
        v-for="item in menuItems"
        :key="item.icon"
        :icon="item.icon"
        class="text-primary-500 hover:text-primary-700 transition"
        v-tooltip.right="item.title"
        text
      />
    </div>
    <Button
      :icon="logoutItem.icon"
      class="text-red-500 hover:text-red-700 transition"
      v-tooltip.right="logoutItem.title"
      text
    />
  </aside>
</template>

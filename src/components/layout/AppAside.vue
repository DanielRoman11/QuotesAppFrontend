<script setup lang="ts">
import Button from 'primevue/button'

const menuItems = [
  { icon: 'pi pi-home', title: 'Home', path: '/' },
  { icon: 'pi pi-chart-bar', title: 'Dashboard', path: '/dashboard' },
  { icon: 'pi pi-book', title: 'Quotes', path: '/quotes' },
]

const logoutItem = { icon: 'pi pi-sign-out', title: 'Logout' }
</script>

<template>
  <aside
    class="h-svh w-16 border-r border-surface-300 flex flex-col items-center p-4 bg-surface shadow-md"
  >
    <div class="flex flex-col gap-4 flex-grow">
      <router-link
        v-for="item in menuItems"
        :key="item.icon"
        :to="item.path"
        class="p-button p-button-text text-primary-500 hover:text-primary-700 transition flex items-center gap-2"
        v-tooltip.right="item.title"
      >
        <i :class="item.icon" />
      </router-link>
    </div>
    <Button
      :icon="logoutItem.icon"
      class="text-red-500 hover:text-red-700 transition"
      v-tooltip.right="logoutItem.title"
      text
    />
  </aside>
</template>

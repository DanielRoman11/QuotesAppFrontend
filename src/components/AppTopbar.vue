<script setup>
import { useLayout } from '../composables/useLayout'
import AppConfig from './AppConfig.vue'

const { isDarkMode, toggleDarkMode } = useLayout()
</script>

<template>
  <div
    class="bg-surface-0 dark:bg-surface-900 p-6 rounded-2xl max-w-7xl mx-auto border border-surface-200 dark:border-surface-700 w-full"
  >
    <div class="flex justify-between items-center">
      <div class="flex gap-3 items-center">
        <figure>
          <span class="text-4xl">👻</span>
        </figure>
        <span class="hidden sm:flex flex-col"
          ><span class="text-xl font-light text-surface-700 dark:text-surface-100 leading-none"
            >Quotes App</span
          >
          <span class="text-sm font-medium text-primary leading-tight"
            >Daniel Mora Román</span
          ></span
        >
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-all text-surface-900 dark:text-surface-0 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 dark:focus-visible:ring-offset-surface-950"
          @click="toggleDarkMode"
        >
          <i :class="['pi text-base', { 'pi-moon': isDarkMode, 'pi-sun': !isDarkMode }]" />
        </button>
        <div class="relative">
          <Button
            v-styleclass="{
              selector: '@next',
              enterFromClass: 'hidden',
              enterActiveClass: 'animate-scalein',
              leaveToClass: 'hidden',
              leaveActiveClass: 'animate-fadeout',
              hideOnOutsideClick: true,
            }"
            icon="pi pi-cog"
            text
            rounded
            aria-label="Settings"
          />
          <AppConfig />
        </div>
      </div>
    </div>
  </div>
</template>

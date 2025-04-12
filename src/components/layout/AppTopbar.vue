<script setup>
import { useLayout } from '../../composables/useLayout'
import AppConfig from './AppConfig.vue'

const { isDarkMode, toggleDarkMode } = useLayout()
</script>

<template>
  <div
    class="flex justify-between items-center rounded-2xl max-w-7xl mx-auto w-full mb-5 p-4 bg-surface"
  >
    <div>
      <span class="text-sm text-surface-500 dark:text-surface-400 block">Resumen</span>
      <h1 class="text-surface-900 dark:text-surface-50 text-2xl font-semibold">
        Bienvenido <span class="text-primary font-bold">Daniel Mora Román</span>
      </h1>
    </div>

    <div class="flex items-center gap-4">
      <!-- Botón de Modo Oscuro -->
      <button
        type="button"
        class="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-200 dark:bg-surface-800 hover:bg-primary/10 dark:hover:bg-primary/20 transition-all text-surface-900 dark:text-surface-0 focus:outline-none focus:ring-2 focus:ring-primary"
        @click="toggleDarkMode"
      >
        <i :class="['pi text-lg', { 'pi-moon': isDarkMode, 'pi-sun': !isDarkMode }]" />
      </button>

      <!-- Botón de Configuración -->
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
          class="text-primary hover:text-primary-700 transition-all"
          aria-label="Configuración"
        />
        <AppConfig />
      </div>
    </div>
  </div>
</template>

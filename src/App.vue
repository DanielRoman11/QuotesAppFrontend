<script setup>
import AppFooter from './components/layout/AppFooter.vue'
import AppTopbar from './components/layout/AppTopbar.vue'
import AppAside from './components/layout/AppAside.vue'
import { ScrollPanel, Toast } from 'primevue'
</script>
<template>
  <section class="flex h-svh">
    <AppAside />
    <ScrollPanel class="dark:bg-surface-950 w-full py-6 overflow-hidden h-screen">
      <AppTopbar />
      <div class="flex flex-col w-full max-w-7xl mx-auto my-4">
        <router-view />
      </div>
      <AppFooter />
    </ScrollPanel>
  </section>
  <Toast position="bottom-right" />
</template>

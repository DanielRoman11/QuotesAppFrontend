<template>
  <div class="bg-surface-50 dark:bg-surface-950">
    <div class="bg-surface-0 dark:bg-surface-900 p-6 rounded-2xl flex flex-col gap-4">
      <div class="flex gap-4">
        <div class="flex flex-col gap-2 flex-1">
          <div class="text-2xl leading-tight font-semibold text-surface-900 dark:text-surface-0">
            {{ title }}
          </div>
          <div class="text-base leading-tight text-surface-500 dark:text-surface-300">
            {{ description }}
          </div>
        </div>
      </div>
      <div>
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

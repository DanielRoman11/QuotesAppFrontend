<script setup lang="ts">
import useStats from '@/composables/useStats'
import { formatCurrency } from '@/utils/common'

const { stats, currencyData, quotesData } = useStats()
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <div
      v-if="stats.length"
      v-for="(stat, index) in stats"
      :key="index"
      class="bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 flex flex-col gap-4"
    >
      <div class="flex items-start gap-2 justify-between">
        <span class="text-xl font-light leading-tight">{{ stat.title }}</span>
        <span
          class="shrink-0 bg-primary-100 dark:bg-primary-400/20 text-primary rounded-lg w-8 h-8 flex items-center justify-center border border-primary-200 dark:border-primary-400/40"
        >
          <i :class="['pi', stat.icon, 'text-xl!', 'leading-none!']"></i>
        </span>
      </div>

      <div class="flex flex-col gap-1 w-full">
        <!-- Mostrar datos del mes actual -->
        <div
          class="text-2xl text-center text-primary overflow-hidden line-clamp-1 whitespace-pre font-medium leading-tight"
        >
          {{
            ['Revenue', 'Currency Trend'].includes(stat.title) &&
            typeof stat.value.current === 'number'
              ? formatCurrency(stat.value.current)
              : stat.value.current
          }}
        </div>
        <div class="text-surface-600 dark:text-surface-400 text-sm leading-tight"></div>

        <!-- Mostrar datos del mes anterior -->
        <div class="text-sm font-medium leading-tight text-muted-color mt-2">
          {{
            ['Revenue', 'Currency Trend'].includes(stat.title) &&
            typeof stat.value.current === 'number'
              ? formatCurrency(stat.value.current)
              : stat.value.current
          }}
          Last Month
        </div>
        <div class="text-surface-600 dark:text-surface-400 text-sm leading-tight"></div>
      </div>
    </div>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
    <div class="col-span-1">
      <p-card title="Total Quotes" class="shadow-2xl">
        <Chart type="bar" :data="quotesData" class="h-64" />
      </p-card>
    </div>
    <div class="col-span-1">
      <p-card title="Revenue" class="shadow-2xl">
        <Chart :type="'bar'" :data="currencyData" class="h-64" />
      </p-card>
    </div>
  </div>
</template>

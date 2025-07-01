<script>
import QuotesOverviewWidget from '@/components/dashboard/QuotesOverviewWidget.vue'
import StatsWidget from '@/components/dashboard/StatsWidget.vue'
</script>
<template>
  <div class="flex flex-col w-full max-w-7xl mx-auto p-4">
    <StatsWidget />
    <Divider />
    <QuotesOverviewWidget />
  </div>
</template>

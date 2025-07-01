<script setup>
import Card from '@/components/common/Card.vue'
import CreateQuoteView from '@/components/quotes/CreateQuoteView.vue'
</script>
<template>
  <Card
    title="Create Quotes"
    description="Create quotes for your clients and see how they perform. Get insights on your clients' satisfaction and identify areas for improvement."
  >
    <div
      class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-lg flex items-center justify-center"
    >
      <CreateQuoteView />
    </div>
  </Card>
</template>

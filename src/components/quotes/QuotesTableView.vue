<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Paginator from 'primevue/paginator'
import Dialog from 'primevue/dialog'
import axios from 'axios'
import config from '@/config'

interface QuoteItem {
  id: number | string
  category: string
  quantity: number
  price: string | number
  product: {
    id: number | string
    description: string
    unit: string
  }
}

interface Quote {
  id: string
  createdAt: string
  author: string
  client: { companyName: string }
  priority: string
  currency: string
  totalPrice: string | number
  status: string
  approvedBy: string
  items: QuoteItem[]
}

const quotes = ref<Quote[]>([])
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const loading = ref(false)
const selectedQuote = ref<Quote | null>(null)
const showDialog = ref(false)

async function fetchQuotes(pageNum = 1) {
  loading.value = true
  try {
    const response = (
      await axios.get(`${config.API_URL}/quote`, {
        params: {
          page: pageNum,
          limit: limit.value,
          distributed: false,
        },
      })
    ).data

    quotes.value = response.data
    total.value = response.total
    page.value = response.page || 1
  } catch (error: any) {
    console.error('Error en la petición:', error)
    console.error('Error response:', error.response)
  } finally {
    loading.value = false
  }
}

function onPageChange(event: any) {
  fetchQuotes(event.page + 1)
}

function showDetails(quote: Quote) {
  selectedQuote.value = quote
  showDialog.value = true
}

onMounted(() => {
  fetchQuotes()
})
</script>

<template>
  <div class="p-6 mx-auto w-full max-w-6xl">
    <h2 class="text-2xl font-semibold mb-6 text-surface-900 dark:text-surface-0">Quotes List</h2>
    <DataTable :value="quotes" :loading="loading" responsiveLayout="scroll" class="mb-4">
      <Column field="id" header="ID" />
      <Column field="createdAt" header="Created At">
        <template #body="{ data }">
          {{ new Date(data.createdAt).toLocaleString() }}
        </template>
      </Column>
      <Column field="author" header="Author" />
      <Column field="client.companyName" header="Client" />
      <Column field="priority" header="Priority" />
      <Column field="currency" header="Currency" />
      <Column field="totalPrice" header="Total Price" />
      <Column field="status" header="Status" />
      <Column field="approvedBy" header="Approved By" />
      <Column header="Details">
        <template #body="{ data }">
          <Button label="View Items" size="small" @click="showDetails(data)" />
        </template>
      </Column>
    </DataTable>
    <Paginator
      :rows="limit"
      :totalRecords="total"
      :first="(page - 1) * limit"
      @page="onPageChange"
    />

    <Dialog v-model:visible="showDialog" modal header="Quote Items" :style="{ width: '50vw' }">
      <div v-if="selectedQuote">
        <h3 class="font-bold mb-2">Items for Quote {{ selectedQuote.id }}</h3>
        <DataTable :value="selectedQuote.items" responsiveLayout="scroll">
          <Column field="id" header="Item ID" />
          <Column field="category" header="Category" />
          <Column field="quantity" header="Quantity" />
          <Column field="price" header="Price" />
          <Column field="product.description" header="Description" />
          <Column field="product.unit" header="Unit" />
        </DataTable>
      </div>
    </Dialog>
  </div>
</template>

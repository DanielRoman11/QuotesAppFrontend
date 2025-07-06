<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'
import config from '@/config'
import axios from 'axios'
import { formatCurrency } from '@/utils/common'
import { useToast } from 'primevue/usetoast'

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

const router = useRouter()
const quotes = ref<Quote[]>([])
const total = ref(0)
const totalPages = ref(0)
const page = ref(1)
const limit = ref(5)
const first = ref(0)
const last = ref(0)
const loading = ref(false)
const hasNext = ref(false)
const hasPrev = ref(false)
const selectedQuote = ref<Quote | null>(null)
const showDialog = ref(false)
const searchTerm = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')
const showStatusCard = ref(false)
const showPriorityCard = ref(false)
const toast = useToast()
const confirmDeleteDialog = ref(false)
const quoteIdToDelete = ref<string | null>(null)

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const statusOptions = [
  { label: 'Todos', value: '' },
  { label: 'En Progreso', value: 'En Progreso' },
  { label: 'Aprobada', value: 'Aprobada' },
]

const priorityOptions = [
  { label: 'Todos', value: '' },
  { label: 'Alta', value: 'Alta' },
  { label: 'Normal', value: 'Normal' },
  { label: 'Baja', value: 'Baja' },
]

async function fetchQuotes() {
  loading.value = true
  try {
    const response = (
      await axios.get(`${config.API_URL}/quote`, {
        params: {
          page: page.value,
          limit: limit.value,
          search: searchTerm.value,
        },
      })
    ).data

    // Forzar reactividad asignando un nuevo array
    quotes.value = [...response.data]
    total.value = response.total
    totalPages.value = response.totalPages
    page.value = response.page
    limit.value = response.limit
    first.value = (response.page - 1) * response.limit
    last.value = Math.min(first.value + response.limit, response.total)
    hasNext.value = response.hasNext
    hasPrev.value = response.hasPrev
  } catch (error) {
    loading.value = false
    console.log('Algo salió mal', error)
  } finally {
    loading.value = false
  }
}

const filteredQuotes = computed(() => {
  return quotes.value.filter((q) => {
    const statusMatch = !statusFilter.value || q.status === statusFilter.value
    const priorityMatch = !priorityFilter.value || q.priority === priorityFilter.value
    return statusMatch && priorityMatch
  })
})

// Agrupar items por categoría
const groupedItems = computed(() => {
  if (!selectedQuote.value) return {}

  const groups: Record<string, QuoteItem[]> = {}

  selectedQuote.value.items.forEach((item: QuoteItem) => {
    const category = item.category || 'Sin categoría'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(item)
  })

  return groups
})

function onPageChange(event: any) {
  first.value = event.first
  page.value = Math.floor(event.first / event.rows) + 1
  limit.value = event.rows
  last.value = Math.min(first.value + limit.value, total.value)
  fetchQuotes()
}

function goToFirstPage() {
  if (page.value > 1) {
    page.value = 1
    first.value = 0
    last.value = Math.min(limit.value, total.value)
    fetchQuotes()
  }
}

function goToPrevPage() {
  if (page.value > 1) {
    page.value--
    first.value -= limit.value
    last.value = Math.min(first.value + limit.value, total.value)
    fetchQuotes()
  }
}

function goToNextPage() {
  if (page.value < totalPages.value) {
    page.value++
    first.value += limit.value
    last.value = Math.min(first.value + limit.value, total.value)
    fetchQuotes()
  }
}

function goToLastPage() {
  if (page.value < totalPages.value) {
    page.value = totalPages.value
    first.value = (totalPages.value - 1) * limit.value
    last.value = total.value
    fetchQuotes()
  }
}

function onLimitChange() {
  page.value = 1
  first.value = 0
  last.value = Math.min(limit.value, total.value)
  fetchQuotes()
}

function showDetails(quote: Quote) {
  selectedQuote.value = quote
  showDialog.value = true
}

function applyFilters() {
  // Solo aplica búsqueda al backend, los filtros de estado y prioridad son frontend
  page.value = 1
  first.value = 0
  last.value = Math.min(limit.value, total.value)
  fetchQuotes()
}

watch(searchTerm, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    first.value = 0
    fetchQuotes()
  }, 1000)
})

// Watchers para filtros frontend (no afectan la paginación)
watch(statusFilter, () => {
  // Solo filtrado local, no fetch
})

watch(priorityFilter, () => {
  // Solo filtrado local, no fetch
})

function goToCreate() {
  router.push('/quotes/create')
}

async function deleteQuote(quoteId: string) {
  const prevQuotes = [...quotes.value]
  quotes.value = quotes.value.filter((q) => q.id !== quoteId)
  try {
    const response = await axios.delete(`${config.API_URL}/quote/${quoteId}`)
    const data = response.data
    if (Array.isArray(data.raw) && data.raw.length === 0) {
      toast.add({
        severity: 'warn',
        summary: 'Cotización eliminada',
        detail: `Se eliminó la cotización ID: ${quoteId} (afectadas: ${data.affected})`,
        life: 4000,
      })
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Cotización eliminada',
        detail: `ID: ${quoteId} | Respuesta: ${JSON.stringify(data)}`,
        life: 4000,
      })
    }
  } catch (error) {
    quotes.value = prevQuotes
    toast.add({
      severity: 'error',
      summary: 'Error al eliminar',
      detail: 'No se pudo eliminar la cotización. Intenta de nuevo.',
      life: 4000,
    })
  }
}

function askDeleteQuote(id: string) {
  quoteIdToDelete.value = id
  confirmDeleteDialog.value = true
}

function confirmDelete() {
  if (quoteIdToDelete.value) {
    deleteQuote(quoteIdToDelete.value)
  }
  confirmDeleteDialog.value = false
  quoteIdToDelete.value = null
}

function cancelDelete() {
  confirmDeleteDialog.value = false
  quoteIdToDelete.value = null
}

onMounted(() => {
  fetchQuotes()
})
</script>

<template>
  <div class="p-4">
    <Card class="mb-4 rounded-3xl border-0 shadow-none">
      <template #title>
        <div class="flex items-center gap-3 justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl font-semibold text-primary">Gestión de Cotizaciones</span>
            <div class="flex items-center gap-2">
              <span
                class="inline-block px-2 py-1 rounded bg-primary text-white text-xs font-bold"
                >{{ total }}</span
              >
              <span class="text-sm text-surface-600 dark:text-surface-400">
                (Página {{ page }}/{{ totalPages }})
              </span>
            </div>
          </div>
          <Button
            label="Añadir cotización"
            icon="pi pi-plus"
            class="bg-primary text-primary-contrast hover:bg-primary-700"
            @click="goToCreate"
          />
        </div>
      </template>

      <template #content>
        <!-- Filtros -->
        <div class="mb-6 p-4 bg-white dark:bg-surface-800 rounded-3xl shadow-none">
          <h3 class="text-lg font-medium mb-4 text-primary flex items-center gap-2">
            <i class="pi pi-filter mr-2"></i>Filtros
          </h3>
          <div class="flex items-center justify-between gap-4">
            <!-- Filtros con iconos -->
            <div class="flex items-center gap-6">
              <!-- Filtro de Estado -->
              <div class="relative">
                <button
                  @click="showStatusCard = !showStatusCard"
                  class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                >
                  <span class="text-sm font-medium text-surface-700 dark:text-surface-300"
                    >Estado</span
                  >
                  <i class="pi pi-filter text-primary"></i>
                </button>

                <!-- Mini card con dropdown -->
                <div
                  v-if="showStatusCard"
                  class="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-surface-800 rounded-xl shadow-lg border border-surface-200 dark:border-surface-700 z-50 min-w-48"
                >
                  <Dropdown
                    v-model="statusFilter"
                    :options="statusOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Seleccionar estado"
                    class="w-full"
                    :showClear="true"
                  />
                </div>
              </div>

              <!-- Filtro de Prioridad -->
              <div class="relative">
                <button
                  @click="showPriorityCard = !showPriorityCard"
                  class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                >
                  <span class="text-sm font-medium text-surface-700 dark:text-surface-300"
                    >Prioridad</span
                  >
                  <i class="pi pi-filter text-primary"></i>
                </button>

                <!-- Mini card con dropdown -->
                <div
                  v-if="showPriorityCard"
                  class="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-surface-800 rounded-xl shadow-lg border border-surface-200 dark:border-surface-700 z-50 min-w-48"
                >
                  <Dropdown
                    v-model="priorityFilter"
                    :options="priorityOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Seleccionar prioridad"
                    class="w-full"
                    :showClear="true"
                  />
                </div>
              </div>
            </div>

            <!-- Buscador al final -->
            <div class="flex items-center gap-2">
              <InputText
                v-model="searchTerm"
                placeholder="Buscar palabra clave..."
                class="w-64 rounded-2xl border-0 focus:ring-1 focus:ring-primary/30 bg-transparent"
                @keyup.enter="applyFilters"
              />
            </div>
          </div>
        </div>

        <!-- Tabla de cotizaciones -->
        <div class="p-4 rounded-3xl border border-surface-200 dark:border-surface-800">
          <DataTable
            scrollable
            stripedRows
            scrollDirection="horizontal"
            :value="filteredQuotes"
            :loading="loading"
            class="whitespace-nowrap"
          >
            <template #paginatorstart>
              <div class="flex items-center gap-2">
                <Button
                  type="button"
                  icon="pi pi-angle-double-left"
                  text
                  :disabled="page === 1"
                  @click="goToFirstPage"
                />
                <Button
                  type="button"
                  icon="pi pi-angle-left"
                  text
                  :disabled="page === 1"
                  @click="goToPrevPage"
                />
                <span class="text-sm text-surface-600 dark:text-surface-400">
                  Página {{ page }} de {{ totalPages }}
                </span>
                <Button
                  type="button"
                  icon="pi pi-angle-right"
                  text
                  :disabled="page === totalPages"
                  @click="goToNextPage"
                />
                <Button
                  type="button"
                  icon="pi pi-angle-double-right"
                  text
                  :disabled="page === totalPages"
                  @click="goToLastPage"
                />
              </div>
            </template>
            <template #paginatorend>
              <div class="flex items-center gap-2">
                <span class="text-sm text-surface-600 dark:text-surface-400">
                  Filas por página:
                </span>
                <Dropdown
                  v-model="limit"
                  :options="[5, 10, 20, 50]"
                  class="w-32"
                  @change="onLimitChange"
                />
                <span class="text-sm text-surface-600 dark:text-surface-400">
                  {{ first + 1 }} a {{ last }} de {{ total }}
                </span>
              </div>
            </template>
            <Column header="Acciones" style="width: 100px">
              <template #body="{ data }">
                <div class="flex gap-2">
                  <Button
                    icon="pi pi-eye"
                    size="small"
                    text
                    rounded
                    class="hover:bg-primary/10 text-primary transition-colors duration-150"
                    @click="showDetails(data)"
                    v-tooltip.top="'Ver detalles'"
                  />
                  <Button
                    icon="pi pi-pencil"
                    size="small"
                    text
                    rounded
                    class="hover:bg-warning/10 text-warning transition-colors duration-150"
                    v-tooltip.top="'Editar'"
                  />
                  <Button
                    icon="pi pi-trash"
                    size="small"
                    text
                    rounded
                    class="hover:bg-danger/10 text-danger transition-colors duration-150"
                    v-tooltip.top="'Eliminar'"
                    @click="askDeleteQuote(data.id)"
                  />
                </div>
              </template>
            </Column>
            <Column field="id" header="ID" sortable style="width: 80px">
              <template #body="{ data }">
                <span
                  class="inline-block px-2 py-1 rounded bg-primary text-primary-contrast text-xs font-bold"
                  >{{ data.id }}</span
                >
              </template>
            </Column>

            <Column field="createdAt" header="Fecha de Creación" sortable style="width: 180px">
              <template #body="{ data }">
                <div class="flex flex-col">
                  <span class="font-medium">{{
                    new Date(data.createdAt).toLocaleDateString()
                  }}</span>
                  <span class="text-xs text-surface-500">{{
                    new Date(data.createdAt).toLocaleTimeString()
                  }}</span>
                </div>
              </template>
            </Column>

            <Column field="author" header="Autor" sortable style="width: 150px">
              <template #body="{ data }">
                <div class="flex items-center gap-2">
                  <i class="pi pi-user text-primary"></i>
                  <span>{{ data.author }}</span>
                </div>
              </template>
            </Column>

            <Column field="client.companyName" header="Cliente" sortable style="width: 200px">
              <template #body="{ data }">
                <div class="flex items-center gap-2">
                  <i class="pi pi-building text-primary"></i>
                  <span class="font-medium">{{ data.client.companyName }}</span>
                </div>
              </template>
            </Column>

            <Column field="priority" header="Prioridad" sortable style="width: 120px">
              <template #body="{ data }">
                <Tag v-if="data.priority === 'Alta'" value="Alta" severity="danger" />
                <Tag v-else-if="data.priority === 'Normal'" value="Normal" severity="warning" />
                <Tag v-else-if="data.priority === 'Baja'" value="Baja" severity="success" />
              </template>
            </Column>

            <Column field="totalPrice" header="Precio Total" sortable style="width: 150px">
              <template #body="{ data }">
                <span class="font-bold text-primary">
                  {{ formatCurrency(data.totalPrice, data.currency) }}
                </span>
              </template>
            </Column>

            <Column field="status" header="Estado" sortable style="width: 120px">
              <template #body="{ data }">
                <Tag v-if="data.status === 'En Progreso'" value="En Progreso" severity="info" />
                <Tag v-else-if="data.status === 'Aprobada'" value="Aprobada" severity="success" />
              </template>
            </Column>

            <Column field="approvedBy" header="Aprobado Por" sortable style="width: 150px">
              <template #body="{ data }">
                <div v-if="data.approvedBy" class="flex items-center gap-2">
                  <i class="pi pi-check-circle text-success"></i>
                  <span>{{ data.approvedBy }}</span>
                </div>
                <span v-else class="text-surface-400">-</span>
              </template>
            </Column>
          </DataTable>

          <!-- Paginación manual -->
          <div class="mt-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Button
                type="button"
                icon="pi pi-angle-double-left"
                text
                :disabled="page === 1"
                @click="goToFirstPage"
              />
              <Button
                type="button"
                icon="pi pi-angle-left"
                text
                :disabled="page === 1"
                @click="goToPrevPage"
              />
              <span class="text-sm text-surface-600 dark:text-surface-400">
                Página {{ page }} de {{ totalPages }}
              </span>
              <Button
                type="button"
                icon="pi pi-angle-right"
                text
                :disabled="page === totalPages"
                @click="goToNextPage"
              />
              <Button
                type="button"
                icon="pi pi-angle-double-right"
                text
                :disabled="page === totalPages"
                @click="goToLastPage"
              />
            </div>

            <div class="flex items-center gap-2">
              <span class="text-sm text-surface-600 dark:text-surface-400">
                Filas por página:
              </span>
              <Dropdown
                v-model="limit"
                :options="[5, 10, 20, 50]"
                class="w-32"
                @change="onLimitChange"
              />
              <span class="text-sm text-surface-600 dark:text-surface-400">
                {{ first + 1 }} a {{ last }} de {{ total }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Diálogo de detalles -->
    <Dialog
      v-model:visible="showDialog"
      modal
      header="Detalles de la Cotización"
      :style="{ width: '70vw', borderRadius: '2rem' }"
      :closable="true"
      :draggable="false"
      class="rounded-3xl"
    >
      <div v-if="selectedQuote" class="space-y-6">
        <!-- Información general -->
        <Card class="rounded-3xl border-0 shadow-none">
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-info-circle text-primary"></i>
              <span>Información General</span>
            </div>
          </template>
          <template #content>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label class="text-sm font-medium text-surface-600">ID:</label>
                <p class="font-bold">{{ selectedQuote.id }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-surface-600">Autor:</label>
                <p>{{ selectedQuote.author }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-surface-600">Cliente:</label>
                <p>{{ selectedQuote.client.companyName }}</p>
              </div>
              <div class="flex flex-col *:w-fit">
                <label class="text-sm font-medium text-surface-600">Estado:</label>
                <Tag
                  v-if="selectedQuote.status === 'En Progreso'"
                  value="En Progreso"
                  severity="info"
                />
                <Tag
                  v-else-if="selectedQuote.status === 'Aprobada'"
                  value="Aprobada"
                  severity="success"
                />
              </div>
            </div>
          </template>
        </Card>

        <!-- Items de la cotización organizados por categoría -->
        <Card class="rounded-3xl border-0 shadow-none">
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-list text-primary"></i>
              <span>Items de la Cotización ({{ selectedQuote.items.length }})</span>
            </div>
          </template>
          <template #content>
            <div class="space-y-6">
              <div v-for="(items, category) in groupedItems" :key="category" class="space-y-4">
                <!-- Header de categoría -->
                <div
                  class="flex items-center justify-between border-b border-surface-200 dark:border-surface-700 pb-2"
                >
                  <div class="flex items-center gap-3">
                    <Tag :value="category" severity="primary" />
                    <span class="text-sm text-surface-600 dark:text-surface-400">
                      {{ items.length }} item{{ items.length > 1 ? 's' : '' }}
                    </span>
                  </div>
                  <div class="text-sm font-medium text-surface-600 dark:text-surface-400">
                    Subtotal:
                    {{
                      formatCurrency(
                        items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
                        selectedQuote.currency,
                      )
                    }}
                  </div>
                </div>

                <!-- Tabla de items de esta categoría -->
                <div class="overflow-x-auto">
                  <DataTable
                    :value="items"
                    responsiveLayout="scroll"
                    stripedRows
                    scrollable
                    scrollDirection="horizontal"
                    class="min-w-full"
                    :showGridlines="false"
                  >
                    <Column field="id" header="ID" style="width: 80px">
                      <template #body="{ data }">
                        <Tag :value="data.id.toString()" severity="secondary" />
                      </template>
                    </Column>
                    <Column
                      field="product.description"
                      header="Descripción"
                      style="min-width: 200px"
                    >
                      <template #body="{ data }">
                        <div class="flex flex-col">
                          <span class="font-medium">{{ data.product.description }}</span>
                          <span class="text-sm text-surface-500"
                            >Unidad: {{ data.product.unit }}</span
                          >
                        </div>
                      </template>
                    </Column>
                    <Column field="quantity" header="Cantidad" sortable style="width: 100px">
                      <template #body="{ data }">
                        <Tag :value="data.quantity.toString()" severity="info" />
                      </template>
                    </Column>
                    <Column field="price" header="Precio" sortable style="width: 120px">
                      <template #body="{ data }">
                        <span class="font-bold text-primary">
                          {{ formatCurrency(data.price, selectedQuote.currency) }}
                        </span>
                      </template>
                    </Column>
                    <Column header="Subtotal" style="width: 120px">
                      <template #body="{ data }">
                        <span class="font-bold text-success">
                          {{
                            formatCurrency(
                              Number(data.price) * data.quantity,
                              selectedQuote.currency,
                            )
                          }}
                        </span>
                      </template>
                    </Column>
                  </DataTable>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </Dialog>

    <!-- Dialog de confirmación -->
    <Dialog
      v-model:visible="confirmDeleteDialog"
      modal
      header="Confirmar eliminación"
      :closable="false"
      :draggable="false"
      class="rounded-3xl"
    >
      <div class="py-4">
        <span
          >¿Está seguro que desea eliminar la cotización <b>{{ quoteIdToDelete }}</b
          >?</span
        >
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" @click="cancelDelete" />
        <Button label="Eliminar" severity="danger" @click="confirmDelete" />
      </template>
    </Dialog>
  </div>
</template>

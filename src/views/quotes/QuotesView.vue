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
const page = ref(1)
const limit = ref(10)
const first = ref(0)
const loading = ref(false)
const selectedQuote = ref<Quote | null>(null)
const showDialog = ref(false)
const searchTerm = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')
let searchTimeout: ReturnType<typeof setTimeout> | null = null
const toast = useToast()
const confirmDeleteDialog = ref(false)
const quoteIdToDelete = ref<string | null>(null)

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

function getStatusSeverity(status: string) {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'success'
    case 'pending':
      return 'warning'
    case 'rejected':
      return 'danger'
    default:
      return 'info'
  }
}

function getPrioritySeverity(priority: string) {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'danger'
    case 'medium':
      return 'warning'
    case 'low':
      return 'success'
    default:
      return 'info'
  }
}

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

    quotes.value = response.data
    total.value = response.total
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

function onPageChange(event: any) {
  limit.value = event.rows
  page.value = event.page + 1
  first.value = event.first
  fetchQuotes()
}

function showDetails(quote: Quote) {
  selectedQuote.value = quote
  showDialog.value = true
}

function goToCreate() {
  router.push('/quotes/create')
}

function clearFilters() {
  searchTerm.value = ''
  statusFilter.value = ''
  priorityFilter.value = ''
  page.value = 1
  first.value = 0
  fetchQuotes()
}

function applyFilters() {
  page.value = 1
  first.value = 0
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
    <Card class="mb-4">
      <template #title>
        <div class="flex items-center gap-3 justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl font-semibold text-primary">Gestión de Cotizaciones</span>
            <span
              class="inline-block px-2 py-1 rounded bg-primary text-white text-xs font-bold ml-2"
              >{{ total }}</span
            >
          </div>
          <Button
            label="Añadir cotización"
            icon="pi pi-plus"
            class="bg-primary text-white hover:bg-primary-700"
            @click="goToCreate"
          />
        </div>
      </template>

      <template #content>
        <!-- Filtros -->
        <div class="mb-6 p-4 surface-50 dark:surface-800 rounded-lg">
          <h3 class="text-lg font-medium mb-4 text-primary">
            <i class="pi pi-filter mr-2"></i>Filtros
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="flex flex-col">
              <label class="mb-2 text-sm font-medium text-surface-700 dark:text-surface-300"
                >Buscar</label
              >
              <InputText
                v-model="searchTerm"
                placeholder="Buscar por ID, cliente o autor..."
                class="w-full"
                @keyup.enter="applyFilters"
              />
            </div>
            <div class="flex flex-col">
              <label class="mb-2 text-sm font-medium text-surface-700 dark:text-surface-300"
                >Estado</label
              >
              <Dropdown
                v-model="statusFilter"
                :options="statusOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar estado"
                class="w-full"
              />
            </div>
            <div class="flex flex-col">
              <label class="mb-2 text-sm font-medium text-surface-700 dark:text-surface-300"
                >Prioridad</label
              >
              <Dropdown
                v-model="priorityFilter"
                :options="priorityOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar prioridad"
                class="w-full"
              />
            </div>
            <div class="flex items-end gap-2">
              <Button
                label="Aplicar"
                icon="pi pi-search"
                @click="applyFilters"
                class="flex-1 bg-primary text-white hover:bg-primary-700"
              />
              <Button
                label="Limpiar"
                icon="pi pi-times"
                severity="secondary"
                @click="clearFilters"
                class="flex-1 bg-secondary text-white hover:bg-secondary-700"
              />
            </div>
          </div>
        </div>

        <!-- Tabla de cotizaciones -->
        <div class="overflow-x-auto">
          <DataTable
            :value="filteredQuotes"
            :loading="loading"
            responsiveLayout="scroll"
            class="mb-4 w-full whitespace-nowrap"
            stripedRows
            showGridlines
            paginator
            :rows="limit"
            :totalRecords="total"
            :first="first"
            @page="onPageChange"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} cotizaciones"
            scrollable
            scrollDirection="horizontal"
          >
            <Column header="Acciones" style="width: 120px">
              <template #body="{ data }">
                <div class="flex gap-2">
                  <Button
                    icon="pi pi-eye"
                    size="small"
                    severity="info"
                    @click="showDetails(data)"
                    v-tooltip.top="'Ver detalles'"
                  />
                  <Button
                    icon="pi pi-pencil"
                    size="small"
                    severity="warning"
                    v-tooltip.top="'Editar'"
                  />
                  <Button
                    icon="pi pi-trash"
                    size="small"
                    severity="danger"
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
                <span
                  v-if="data.priority === 'Alta'"
                  class="inline-block px-2 py-1 rounded bg-primary text-primary-contrast text-xs font-bold"
                  >Alta</span
                >
                <span
                  v-else-if="data.priority === 'Normal'"
                  class="inline-block px-2 py-1 rounded bg-secondary text-secondary-contrast text-xs font-bold"
                  >Normal</span
                >
                <span
                  v-else-if="data.priority === 'Baja'"
                  class="inline-block px-2 py-1 rounded bg-success text-success-contrast text-xs font-bold"
                  >Baja</span
                >
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
                <span
                  v-if="data.status === 'En Progreso'"
                  class="inline-block px-2 py-1 rounded bg-primary text-primary-contrast text-xs font-bold"
                  >En Progreso</span
                >
                <span
                  v-else-if="data.status === 'Aprobada'"
                  class="inline-block px-2 py-1 rounded bg-success text-success-contrast text-xs font-bold"
                  >Aprobada</span
                >
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
        </div>
      </template>
    </Card>

    <!-- Diálogo de detalles -->
    <Dialog
      v-model:visible="showDialog"
      modal
      header="Detalles de la Cotización"
      :style="{ width: '70vw' }"
      :closable="true"
      :draggable="false"
    >
      <div v-if="selectedQuote" class="space-y-6">
        <!-- Información general -->
        <Card>
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
              <div>
                <label class="text-sm font-medium text-surface-600">Estado:</label>
                <span
                  v-if="selectedQuote.status === 'En Progreso'"
                  class="inline-block px-2 py-1 rounded bg-primary text-primary-contrast text-xs font-bold"
                  >En Progreso</span
                >
                <span
                  v-else-if="selectedQuote.status === 'Aprobada'"
                  class="inline-block px-2 py-1 rounded bg-success text-success-contrast text-xs font-bold"
                  >Aprobada</span
                >
              </div>
            </div>
          </template>
        </Card>

        <!-- Items de la cotización -->
        <Card>
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-list text-primary"></i>
              <span>Items de la Cotización ({{ selectedQuote.items.length }})</span>
            </div>
          </template>
          <template #content>
            <div class="overflow-x-auto">
              <DataTable
                :value="selectedQuote.items"
                responsiveLayout="scroll"
                stripedRows
                showGridlines
                scrollable
                scrollHeight="300px"
                scrollDirection="both"
                class="min-w-full"
              >
                <Column field="id" header="ID" style="width: 80px">
                  <template #body="{ data }">
                    <span
                      class="inline-block px-2 py-1 rounded bg-primary text-primary-contrast text-xs font-bold"
                      >{{ data.id }}</span
                    >
                  </template>
                </Column>
                <Column field="category" header="Categoría" sortable style="width: 150px">
                  <template #body="{ data }">
                    <span
                      class="inline-block px-2 py-1 rounded bg-primary text-primary-contrast text-xs font-bold"
                      >{{ data.category }}</span
                    >
                  </template>
                </Column>
                <Column field="quantity" header="Cantidad" sortable style="width: 100px">
                  <template #body="{ data }">
                    <span
                      class="inline-block px-2 py-1 rounded bg-primary text-primary-contrast text-xs font-bold"
                      >{{ data.quantity }}</span
                    >
                  </template>
                </Column>
                <Column field="price" header="Precio" sortable style="width: 120px">
                  <template #body="{ data }">
                    <span class="font-bold text-primary">
                      {{ formatCurrency(data.price, selectedQuote.currency) }}
                    </span>
                  </template>
                </Column>
                <Column field="product.description" header="Descripción" style="min-width: 200px">
                  <template #body="{ data }">
                    <div class="flex flex-col">
                      <span class="font-medium">{{ data.product.description }}</span>
                      <span class="text-sm text-surface-500">Unidad: {{ data.product.unit }}</span>
                    </div>
                  </template>
                </Column>
                <Column header="Subtotal" style="width: 120px">
                  <template #body="{ data }">
                    <span class="font-bold text-success">
                      {{
                        formatCurrency(Number(data.price) * data.quantity, selectedQuote.currency)
                      }}
                    </span>
                  </template>
                </Column>
              </DataTable>
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

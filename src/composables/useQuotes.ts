import config from '@/config'
import axios from 'axios'
import BigNumber from 'bignumber.js'
import { useToast } from 'primevue'
import { onMounted, ref, watch, computed } from 'vue'

export default function useQuotes() {
  const toast = useToast()
  const search = ref<string>('')
  const quotes = ref<any[]>([])
  const editingRows = ref([])
  const expandedRows = ref([])
  const dialogVisible = ref(false)
  const selectedQuote = ref<any>(null)
  const errors = ref<any>([])

  // --- Funciones que NO dependen de quotes.value ---
  const getSeverity = (
    value: string,
  ): 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast' | undefined => {
    switch (value) {
      case 'En Progreso':
        return 'info'
      case 'Aprobada':
        return 'contrast'
      case 'Alta':
        return 'success'
      case 'Normal':
        return 'warn'
      case 'Baja':
        return 'danger'
      default:
        return undefined
    }
  }

  const getAuthorImage = (author: string) => {
    switch (author) {
      case 'DANIEL MORA ROMÁN':
        return 'https://avatars.githubusercontent.com/u/88067941?v=4'
      case 'DUVAN MORA ROMÁN':
        return 'https://res.cloudinary.com/dakerpersonalspace/image/upload/f_auto,q_auto/v1/Hidro/n2jjdllyzsdvhp5shpff'
      default:
        return 'https://primefaces.org/cdn/primevue/images/avatar/ionibowcher.png'
    }
  }

  // --- Funciones que SÍ dependen de quotes.value ---
  const getQuotesByAuthor = (author: string) => {
    return quotes.value.filter((q) => q.author === author).length
  }

  const getTotalByAuthor = (author: string) => {
    if (!quotes.value || !Array.isArray(quotes.value)) return '0.00'
    return quotes.value
      .filter((q) => q.author === author)
      .reduce((sum, q) => {
        const price = new BigNumber(q.totalPrice || 0)
        let multiplier = new BigNumber(1)

        switch (q.currency) {
          case 'USD':
            multiplier = new BigNumber(4000)
            break
          case 'EUR':
            multiplier = new BigNumber(4500)
            break
          case 'COP':
          default:
            multiplier = new BigNumber(1)
            break
        }

        return sum.plus(price.multipliedBy(multiplier))
      }, new BigNumber(0))
      .toFixed(2)
  }

  const getSuccessByAuthor = (author: string) => {
    if (!quotes.value || !Array.isArray(quotes.value)) return '0.00'
    const authorQuotes = quotes.value.filter((q) => q.author === author)
    const authorTotalQuotes = new BigNumber(authorQuotes.length)
    const authorTotalOrders = new BigNumber(
      JSON.parse(JSON.stringify(authorQuotes)).filter((q: any) => q.order).length,
    )

    return authorTotalQuotes.isZero()
      ? '0.00'
      : authorTotalOrders.dividedBy(authorTotalQuotes).times(100).toFixed(2)
  }

  // --- Funciones de API y manejo de datos ---
  async function getQuotes(searchParam?: string) {
    try {
      const response = (
        await axios.get(`${config.API_URL}/quote`, {
          params: {
            search: searchParam || '',
            limit: 20,
            distributed: true,
          },
        })
      ).data

      quotes.value = response.data
    } catch (err) {
      console.error(err)
    }
  }

  const updateQuote = async (event: any) => {
    const { newData } = event

    const index = quotes.value.findIndex((q: any) => q.id === newData.id)
    if (index !== -1) {
      const prevData = JSON.parse(JSON.stringify(quotes.value[index]))
      quotes.value.splice(index, 1, newData)

      try {
        await axios.patch(`${config.API_URL}/quote/${newData.id}`, newData)
        toast.add({
          severity: 'success',
          summary: 'Actualizado',
          detail: 'Los datos se actualizaron correctamente',
          life: 3000,
        })
      } catch (error) {
        console.error('Error al actualizar:', error)
        errors.value.push(error)
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al actualizar los datos, se revirtió el cambio',
          life: 3000,
        })

        quotes.value.splice(index, 1, prevData)
      }
    }
  }

  const openItemsDialog = (quote: null) => {
    selectedQuote.value = quote
    dialogVisible.value = true
  }

  const onCellEditComplete = (event: { newValue: any; field: any; data: any }) => {
    const { newValue, field, data: item } = event
    if (newValue !== undefined) {
      item[field] = newValue

      const quote = quotes.value.find((q) => q.items.includes(item))
      if (quote) {
        quote.totalPrice = quote.items.reduce(
          (acc: number, i: { quantity: number; price: number }) => acc + i.quantity * i.price,
          0,
        )
      }
    }
  }

  // --- Lifecycle y watchers ---
  onMounted(getQuotes)

  let debounceTimeout: ReturnType<typeof setTimeout>
  watch(search, () => {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
      search.value.length > 0 && getQuotes(search.value)
    }, 1500)
  })

  return {
    quotes,
    search,
    errors,
    editingRows,
    expandedRows,
    updateQuote,
    getSeverity,
    openItemsDialog,
    onCellEditComplete,
    dialogVisible,
    selectedQuote,
    getAuthorImage,
    getQuotesByAuthor,
    getSuccessByAuthor,
    getTotalByAuthor,
  }
}

export function useCreateQuote() {
  // --- Formulario principal ---
  const currencies = [
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
    { label: 'COP', value: 'COP' },
  ]
  const units = [
    { label: 'Unit', value: 'unit' },
    { label: 'Box', value: 'box' },
    { label: 'Package', value: 'package' },
  ]
  const approvedByOptions = [
    { label: 'Technical Management (JOSE GUILLERMO MORA)', value: 'JOSE GUILLERMO MORA' },
    { label: 'General Management (CLAUDIA MILENA ROMÁN)', value: 'CLAUDIA MILENA ROMÁN' },
  ]
  const form = ref({
    author: '',
    createdAt: null as Date | null,
    currency: null as string | null,
    approvedBy: null as string | null,
    client: {
      companyName: '',
      id: undefined as number | undefined,
    },
    items: [
      {
        quantity: null as number | null,
        price: null as number | null,
        category: '',
        product: {
          description: '',
          unit: null as string | null,
          id: undefined as number | undefined,
        },
      },
    ],
  })

  // --- Validaciones ---
  const errors = ref<any>({})
  function validateForm() {
    const err: any = {}
    if (!form.value.author) err.author = 'Author is required.'
    if (!form.value.createdAt) err.createdAt = 'Creation date is required.'
    if (!form.value.currency) err.currency = 'Currency is required.'
    if (!form.value.approvedBy) err.approvedBy = 'Approver is required.'
    if (!form.value.client.companyName) err.companyName = 'The client is required.'
    if (!form.value.items.length) err.items = 'At least one item is required.'
    err.itemsFields = []
    form.value.items.forEach((item, idx) => {
      const itemErr: any = {}
      if (!item.quantity || item.quantity <= 0) itemErr.quantity = 'Quantity is required (>0).'
      if (!item.price || item.price <= 0) itemErr.price = 'Price is required (>0).'
      if (!item.product.description) itemErr.description = 'Description is required.'
      if (!item.product.unit) itemErr.unit = 'Unit is required.'
      err.itemsFields[idx] = itemErr
    })
    errors.value = err
    return (
      Object.keys(err).filter((k) => k !== 'itemsFields').length === 0 &&
      err.itemsFields.every((itemErr: any) => Object.keys(itemErr).length === 0)
    )
  }
  const isFormValid = computed(() => validateForm())

  // --- Manejo de items ---
  function addItem() {
    form.value.items.push({
      quantity: null,
      price: null,
      category: '',
      product: {
        description: '',
        unit: null,
        id: undefined,
      },
    })
  }

  function addItemToCategory(category: string) {
    form.value.items.push({
      quantity: null,
      price: null,
      category: category === 'No category' ? '' : category,
      product: {
        description: '',
        unit: null,
        id: undefined,
      },
    })
  }
  function removeItem(idx: number) {
    if (form.value.items.length > 1) {
      form.value.items.splice(idx, 1)
    }
  }

  // --- Categorías ---
  const categoryInputs = ref<string[]>([])
  const categoryTimeouts = ref<any[]>([])
  watch(
    () => form.value.items.length,
    (newLen) => {
      while (categoryInputs.value.length < newLen) categoryInputs.value.push('')
      while (categoryInputs.value.length > newLen) categoryInputs.value.pop()
      // Inicializa los valores si no están
      form.value.items.forEach((item, idx) => {
        if (!categoryInputs.value[idx]) categoryInputs.value[idx] = item.category || ''
      })
    },
    { immediate: true },
  )
  function onCategoryInput(val: string, idx: number) {
    categoryInputs.value[idx] = val
    clearTimeout(categoryTimeouts.value[idx])
    categoryTimeouts.value[idx] = setTimeout(() => {
      form.value.items[idx].category = val
    }, 1000)
  }
  function onCategoryBlur(idx: number) {
    clearTimeout(categoryTimeouts.value[idx])
    form.value.items[idx].category = categoryInputs.value[idx]
  }
  const getCategories = computed(() => {
    const cats = form.value.items.map((i) => i.category?.trim() || 'No category')
    return Array.from(new Set(cats))
  })

  // --- Cliente (autocompletado) ---
  const clientInput = ref('')
  const clientSuggestions = ref<any[]>([])
  const showClientDropdown = ref(false)
  const clientLoading = ref(false)
  const clientSearchTimeout = ref<any>(null)
  const clientLocked = ref(false)
  watch(
    () => form.value.client.companyName,
    (val) => {
      clientInput.value = val
    },
    { immediate: true },
  )
  function onClientInput(e: any) {
    const val = e.target.value
    clientInput.value = val
    form.value.client.companyName = val
    form.value.client.id = undefined
    clearTimeout(clientSearchTimeout.value)
    if (!val || val.length < 2) {
      clientSuggestions.value = []
      showClientDropdown.value = false
      clientLoading.value = false
      return
    }
    clientLoading.value = true
    clientSearchTimeout.value = setTimeout(async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/client/suggestions?companyName=${encodeURIComponent(val)}`,
        )
        if (res.ok) {
          clientSuggestions.value = await res.json()
          showClientDropdown.value = true
        } else {
          clientSuggestions.value = []
          showClientDropdown.value = true
        }
      } catch {
        clientSuggestions.value = []
        showClientDropdown.value = true
      }
      clientLoading.value = false
    }, 1000)
  }
  function selectClientSuggestion(suggestion: any) {
    form.value.client.companyName = suggestion.companyName
    form.value.client.id = suggestion.id
    clientInput.value = suggestion.companyName
    showClientDropdown.value = false
    clientLocked.value = true
  }
  function cancelClientSelection() {
    form.value.client.id = undefined
    clientLocked.value = false
  }
  function onClientFocus() {
    if (clientSuggestions.value.length > 0) showClientDropdown.value = true
  }
  function onClientBlur() {
    setTimeout(() => {
      showClientDropdown.value = false
    }, 200)
  }

  // --- Productos (autocompletado en descripción) ---
  const descriptionInputs = ref<string[]>([])
  const descriptionLocked = ref<boolean[]>([])
  const productSuggestions = ref<any[][]>([])
  const showProductDropdown = ref<boolean[]>([])
  const productLoading = ref<boolean[]>([])
  const productSearchTimeoutsTextarea = ref<any[]>([])
  watch(
    () => form.value.items.length,
    (newLen) => {
      while (descriptionInputs.value.length < newLen) descriptionInputs.value.push('')
      while (descriptionInputs.value.length > newLen) descriptionInputs.value.pop()
      while (descriptionLocked.value.length < newLen) descriptionLocked.value.push(false)
      while (descriptionLocked.value.length > newLen) descriptionLocked.value.pop()
      while (productSuggestions.value.length < newLen) productSuggestions.value.push([])
      while (productSuggestions.value.length > newLen) productSuggestions.value.pop()
      while (showProductDropdown.value.length < newLen) showProductDropdown.value.push(false)
      while (showProductDropdown.value.length > newLen) showProductDropdown.value.pop()
      while (productLoading.value.length < newLen) productLoading.value.push(false)
      while (productLoading.value.length > newLen) productLoading.value.pop()
      // Inicializa los valores si no están
      form.value.items.forEach((item, idx) => {
        if (!descriptionInputs.value[idx])
          descriptionInputs.value[idx] = item.product.description || ''
        if (item.product.id) descriptionLocked.value[idx] = true
        else descriptionLocked.value[idx] = false
      })
    },
    { immediate: true },
  )
  function onTextareaInput(e: any, idx: number) {
    const val = e.target.value
    descriptionInputs.value[idx] = val
    form.value.items[idx].product.description = val
    if (form.value.items[idx].product.id) {
      form.value.items[idx].product.id = undefined
      descriptionLocked.value[idx] = false
    }
    searchProductTextarea(val, idx)
  }
  function selectProductSuggestion(suggestion: any, idx: number) {
    form.value.items[idx].product.description = suggestion.description
    form.value.items[idx].product.unit = suggestion.unit
    form.value.items[idx].product.id = suggestion.id
    descriptionInputs.value[idx] = suggestion.description
    descriptionLocked.value[idx] = true
    showProductDropdown.value[idx] = false
  }
  function cancelProductSelection(idx: number) {
    form.value.items[idx].product.id = undefined
    descriptionLocked.value[idx] = false
  }
  function onTextareaFocus(idx: number) {
    if (productSuggestions.value[idx]?.length > 0) {
      showProductDropdown.value[idx] = true
    }
  }
  function onTextareaBlur(idx: number) {
    setTimeout(() => {
      showProductDropdown.value[idx] = false
    }, 200)
  }
  async function searchProductTextarea(val: string, idx: number) {
    clearTimeout(productSearchTimeoutsTextarea.value[idx])
    if (!val || val.length < 2) {
      productSuggestions.value[idx] = []
      showProductDropdown.value[idx] = false
      productLoading.value[idx] = false
      return
    }
    productLoading.value[idx] = true
    productSearchTimeoutsTextarea.value[idx] = setTimeout(async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/product/suggestions?description=${encodeURIComponent(val)}`,
        )
        if (res.ok) {
          productSuggestions.value[idx] = await res.json()
          showProductDropdown.value[idx] = true
        } else {
          productSuggestions.value[idx] = []
          showProductDropdown.value[idx] = true
        }
      } catch {
        productSuggestions.value[idx] = []
        showProductDropdown.value[idx] = true
      }
      productLoading.value[idx] = false
    }, 2000)
  }

  // --- Unidad (autocompletado) ---
  const unitSuggestions = ['Unit', 'Meters', 'Kg', 'Liters', 'Package', 'Box', 'Piece', 'Set']
  const unitFiltered = ref<string[][]>([])
  watch(
    () => form.value.items.length,
    (newLen) => {
      while (unitFiltered.value.length < newLen) unitFiltered.value.push([])
      while (unitFiltered.value.length > newLen) unitFiltered.value.pop()
    },
    { immediate: true },
  )
  function searchUnit(event: { query: string }, idx: number) {
    const query = event.query.toLowerCase()
    unitFiltered.value[idx] = unitSuggestions.filter((u) => u.toLowerCase().includes(query))
  }

  // --- Subtotales y total ---
  function formatCurrency(value: number) {
    const currency = form.value.currency || 'USD'
    return value.toLocaleString('en-US', { style: 'currency', currency })
  }
  function getCategorySubtotal(cat: string) {
    return form.value.items
      .filter((item) => (item.category?.trim() || 'No category') === cat)
      .reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
  }
  const totalGeneral = computed(() => {
    return form.value.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
  })

  // --- Guardar ---
  async function submitForm() {
    if (!validateForm()) return
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.value),
      })
      if (res.ok) {
        console.log('Quote created successfully')
        // Aquí puedes mostrar un toast de éxito
      } else {
        const error = await res.text()
        console.error('Error creating quote:', error)
        // Aquí puedes mostrar un toast de error
      }
    } catch (err) {
      console.error('Error creating quote:', err)
      // Aquí puedes mostrar un toast de error
    }
  }

  return {
    form,
    currencies,
    units,
    approvedByOptions,
    errors,
    isFormValid,
    addItem,
    addItemToCategory,
    removeItem,
    categoryInputs,
    onCategoryInput,
    onCategoryBlur,
    getCategories,
    clientInput,
    clientSuggestions,
    showClientDropdown,
    clientLoading,
    clientLocked,
    onClientInput,
    selectClientSuggestion,
    cancelClientSelection,
    onClientFocus,
    onClientBlur,
    descriptionInputs,
    descriptionLocked,
    productSuggestions,
    showProductDropdown,
    productLoading,
    onTextareaInput,
    selectProductSuggestion,
    cancelProductSelection,
    onTextareaFocus,
    onTextareaBlur,
    searchProductTextarea,
    unitFiltered,
    searchUnit,
    formatCurrency,
    getCategorySubtotal,
    totalGeneral,
    submitForm,
  }
}

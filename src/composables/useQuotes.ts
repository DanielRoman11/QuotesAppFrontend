import axios from 'axios'
import { useToast } from 'primevue'
import { onMounted, ref, watch } from 'vue'

export default function useProduct() {
  const toast = useToast()
  const quotes = ref<any[]>([])
  const editingRows = ref([])
  const expandedRows = ref({})
  const itemsColumns = ref([
    { field: 'id', header: 'Id' },
    { field: 'description', header: 'Description' },
    { field: 'price', header: 'totalPrice' },
    { field: 'quantity', header: 'Quantity' },
  ])

  async function getQuotes() {
    try {
      const response = await axios.get('http://localhost:3000/quote')
      quotes.value = response.data
    } catch (err) {
      console.error(err)
    }
  }

  const updateQuote = async (event: any) => {
    const { newData } = event
    console.log('Datos nuevos:', newData)

    const index = quotes.value.findIndex((q: any) => q.id === newData.id)
    if (index !== -1) {
      //? Copia profunda de los datos
      const prevData = JSON.parse(JSON.stringify(quotes.value[index]))
      //? Actualización optimista
      quotes.value.splice(index, 1, newData)

      try {
        await axios.patch(`http://localhost:3000/quote/${newData.id}`, newData)
        toast.add({
          severity: 'success',
          summary: 'Actualizado',
          detail: 'Los datos se actualizaron correctamente',
          life: 3000,
        })
      } catch (error) {
        console.error('Error al actualizar:', error)
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al actualizar los datos, se revirtió el cambio',
          life: 3000,
        })

        //? Revertir la actualización optimista usando el estado anterior
        quotes.value.splice(index, 1, prevData)
      }
    }
  }

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

  onMounted(getQuotes)
  watch(editingRows, () => {
    console.log(editingRows)
  })

  return {
    quotes,
    editingRows,
    itemsColumns,
    expandedRows,
    updateQuote,
    getSeverity,
  }
}

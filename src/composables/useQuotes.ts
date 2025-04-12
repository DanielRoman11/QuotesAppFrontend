import axios from 'axios'
import { onMounted, ref } from 'vue'

export default function useProduct() {
  const quotes = ref([])
  const editingRows = ref({})
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
    console.log(newData)
    try {
      await axios.put(`http://localhost:3000/quote/${newData.id}`, newData)
      console.log('Datos actualizados:', newData)
    } catch (error) {
      console.error('Error al actualizar:', error)
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

  return {
    quotes,
    editingRows,
    itemsColumns,
    expandedRows,
    updateQuote,
    getSeverity,
  }
}

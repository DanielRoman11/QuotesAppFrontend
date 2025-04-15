import axios from 'axios'
import BigNumber from 'bignumber.js'
import { useToast } from 'primevue'
import { onMounted, ref, watch } from 'vue'

export default function useProduct() {
  const toast = useToast()
  const search = ref<string>('')
  const quotes = ref<any[]>([])
  const editingRows = ref([])
  const expandedRows = ref([])
  const dialogVisible = ref(false)
  const selectedQuote = ref<any>(null)

  async function getQuotes(search: string) {
    try {
      const response = await axios.get('http://localhost:3000/quote', {
        params: {
          search,
        },
      })
      quotes.value = response.data
    } catch (err) {
      console.error(err)
    }
  }

  const updateQuote = async (event: any) => {
    const { newData } = event

    const index = quotes.value.findIndex((q: any) => q.id === newData.id)
    if (index !== -1) {
      const prevData = JSON.parse(JSON.stringify(quotes.value[index])) //? Copia profunda de los datos
      quotes.value.splice(index, 1, newData) //? Actualización optimista

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

        quotes.value.splice(index, 1, prevData) //? Revertir la actualización optimista usando el estado anterior
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

  const getTotalByAuthor = (author: string) => {
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
    const authorQuotes = quotes.value.filter((q) => q.author === author)
    const authorTotalQuotes = new BigNumber(authorQuotes.length)
    const authorTotalOrders = new BigNumber(
      JSON.parse(JSON.stringify(authorQuotes)).filter((q: any) => q.order).length,
    )

    return authorTotalOrders.dividedBy(authorTotalQuotes).times(100).toFixed(2)
  }

  const getQuotesByAuthor = (author: string) => {
    return quotes.value.filter((q) => q.author === author).length
  }

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

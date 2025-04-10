import axios from 'axios'
import { ref, watch } from 'vue'

export default function useProductOverview() {
  const quotes = ref([])
  const selectedQuote = ref(null)
  const searchQuery = ref('')
  const loading = ref(false)
  const filteredQuotes = ref([])

  async function searchQuote() {
    const response = await axios.get('http://localhost:3000/quote')
  }

  watch(searchQuery, () => {})

  return {}
}

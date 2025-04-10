import axios from 'axios'
import { computed, onMounted, ref } from 'vue'

export default function useStats() {
  const totalquotes = ref(0)
  const totalclients = ref(0)
  const revenue = ref(0)
  const success = ref(0)

  async function fetchStats() {
    try {
      const result = await axios.get('http://localhost:3000')
      const data = result.data

      totalquotes.value = Number(data.totalquotes)
      totalclients.value = Number(data.totalclients)
      revenue.value = Number(Number(data.revenue).toFixed(2))
      success.value = Number(data.success)
    } catch (err) {
      console.error(err)
    }
  }

  onMounted(fetchStats)

  const stats = computed(() => [
    {
      title: 'Total Quotes',
      icon: 'pi-shopping-cart',
      value: totalquotes.value,
      subtitle: 'Last Month',
    },
    {
      title: 'Total Clients',
      icon: 'pi-users',
      value: totalclients.value,
      subtitle: 'Last Month',
    },
    {
      title: 'Revenue',
      icon: 'pi-dollar',
      value: `$${revenue.value}`,
      subtitle: 'Last Month',
    },
    {
      title: 'Success Rate',
      icon: 'pi-chart-line',
      value: `${success.value}%`,
      subtitle: 'Last Month',
    },
  ])

  return {
    stats,
  }
}

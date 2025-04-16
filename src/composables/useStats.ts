import axios from 'axios'
import { computed, onMounted, ref } from 'vue'

export default function useStats() {
  const currentStats = ref<any>({})
  const lastMonthStats = ref<any>({})

  async function fetchStats() {
    try {
      const result = await axios.get('http://localhost:3000')
      const data = result.data

      currentStats.value = data.find((item: any) => item.datequery === 'Current Month') || {}
      lastMonthStats.value = data.find((item: any) => item.datequery === 'Last Month') || {}
    } catch (err) {
      console.error(err)
    }
  }

  onMounted(fetchStats)

  const stats = computed(() => [
    {
      title: 'Total Quotes',
      icon: 'pi-shopping-cart',
      value: {
        current: currentStats.value.totalquotes ? Number(currentStats.value.totalquotes) : 0,
        last: lastMonthStats.value.totalquotes ? Number(lastMonthStats.value.totalquotes) : 0,
      },
      subtitle: 'Quotes',
    },
    {
      title: 'Total Orders',
      icon: 'pi-list',
      value: {
        current: currentStats.value.totalorders ? Number(currentStats.value.totalorders) : 0,
        last: lastMonthStats.value.totalorders ? Number(lastMonthStats.value.totalorders) : 0,
      },
      subtitle: 'Orders',
    },
    {
      title: 'Revenue',
      icon: 'pi-dollar',
      value: {
        current: currentStats.value.revenue ? Number(Number(currentStats.value.revenue).toFixed(2)) : 0,
        last: lastMonthStats.value.revenue ? Number(Number(lastMonthStats.value.revenue).toFixed(2)) : 0,
      },
      subtitle: 'Revenue',
    },
    {
      title: 'Success Rate',
      icon: 'pi-chart-line',
      value: {
        current: currentStats.value.success ? `${currentStats.value.success}%` : '0%',
        last: lastMonthStats.value.success ? `${lastMonthStats.value.success}%` : '0%',
      },
      subtitle: 'Success',
    },
  ])

  return {
    stats,
  }
}

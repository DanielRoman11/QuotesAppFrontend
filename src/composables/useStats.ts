import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'

export default function useStats() {
  const currentStats = ref<any>({})
  const lastMonthStats = ref<any>({})
  const quotesData = ref({})
  const currencyData = ref({})

  function setQuotesData() {
    return {
      labels: ['Last Month', 'Current Month'],
      datasets: [
        {
          label: 'Total Quotes',
          data: [stats.value[0].value.last, stats.value[0].value.current],
          backgroundColor: ['#42A5F5', '#12B886'],
        },
        {
          label: 'Total Orders',
          data: [stats.value[1].value.last, stats.value[1].value.current],
          backgroundColor: ['#66BB6A', '#42A5F5'],
        },
      ],
    }
  }

  function setCurrencyData() {
    return {
      labels: ['Last Month', 'Current Month'],
      datasets: [
        {
          label: 'USD',
          data: [
            currencyTrend.value.data.dolarLast ? Number(currencyTrend.value.data.dolarLast) : 0,
            currencyTrend.value.data.dolarCurrent
              ? Number(currencyTrend.value.data.dolarCurrent)
              : 0,
          ],
          backgroundColor: '#36A2EB',
          borderColor: '#36A2EB',
          fill: false,
        },
        {
          label: 'EUR',
          data: [
            currencyTrend.value.data.euroLast ? Number(currencyTrend.value.data.euroLast) : 0,
            currencyTrend.value.data.euroCurrent ? Number(currencyTrend.value.data.euroCurrent) : 0,
          ],
          backgroundColor: '#FFCE56',
          borderColor: '#FFCE56',
          fill: false,
        },
        {
          label: 'COP',
          data: [
            currencyTrend.value.data.copLast ? Number(currencyTrend.value.data.copLast) : 0,
            currencyTrend.value.data.copCurrent ? Number(currencyTrend.value.data.dolarCurrent) : 0,
          ],
          backgroundColor: '#4BC0C0',
          borderColor: '#4BC0C0',
          fill: false,
        },
      ],
      options: {
        plugins: {
          legend: {
            title: {
              display: true,
              text: 'Currency Trend',
            },
          },
        },
      },
    }
  }

  async function fetchStats() {
    try {
      const result = await axios.get('http://localhost:3000/stats')
      const data = result.data
      console.log(data)

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
        current: currentStats.value.revenue
          ? Number(Number(currentStats.value.revenue).toFixed(2))
          : 0,
        last: lastMonthStats.value.revenue
          ? Number(Number(lastMonthStats.value.revenue).toFixed(2))
          : 0,
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

  const currencyTrend = computed(() => ({
    title: 'Currency Trend',
    icon: 'pi-chart-line',
    data: {
      dolarCurrent: currentStats.value.quotedusd ? Number(currentStats.value.quotedusd) : 0,
      dolarLast: lastMonthStats.value.quotedusd ? Number(lastMonthStats.value.quotedusd) : 0,
      euroCurrent: currentStats.value.quotedeur ? Number(currentStats.value.quotedeur) : 0,
      euroLast: lastMonthStats.value.quotedeur ? Number(lastMonthStats.value.quotedeur) : 0,
      copCurrent: currentStats.value.quotedcop ? Number(currentStats.value.quotedcop) : 0,
      copLast: lastMonthStats.value.quotedcop ? Number(lastMonthStats.value.quotedcop) : 0,
    },
    subtitle: 'Quoted By Currency',
  }))

	watch(
    () => stats.value,
    (newStats) => {
      if (newStats.length) {
        quotesData.value = setQuotesData()
        currencyData.value = setCurrencyData()
      }
    },
    { immediate: true },
  )

  return {
    stats,
    currencyTrend,
		quotesData,
		currencyData,
  }
}

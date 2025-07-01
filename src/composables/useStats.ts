import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'
import BigNumber from 'bignumber.js'
import * as Chartjs from 'chart.js'
import config from '@/config'

export default function useStats() {
  const currentStats = ref<any>({})
  const lastMonthStats = ref<any>({})
  const quotesData = ref({})
  const currencyData = ref({})

  async function fetchStats() {
    try {
			console.log("URL BACKEND", config.API_URL)
      const result = await axios.get(`${config.API_URL}/stats`)
      const data = result.data

      currentStats.value = data.find((item: any) => item.datequery === 'Current Month') || {}
      lastMonthStats.value = data.find((item: any) => item.datequery === 'Last Month') || {}
    } catch (err) {
      console.error(err)
    }
  }

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
      dolarCurrent: currentStats.value.quotedusd
        ? Number(BigNumber(currentStats.value.quotedusd).times(4400).toFixed(2))
        : 0,
      dolarLast: lastMonthStats.value.quotedusd
        ? Number(BigNumber(lastMonthStats.value.quotedusd).times(4400).toFixed(2))
        : 0,
      euroCurrent: currentStats.value.quotedeur
        ? Number(BigNumber(currentStats.value.quotedeur).times(4500).toFixed(2))
        : 0,
      euroLast: lastMonthStats.value.quotedeur
        ? Number(BigNumber(lastMonthStats.value.quotedeur).times(4500).toFixed(2))
        : 0,
      copCurrent: currentStats.value.quotedcop
        ? Number(BigNumber(currentStats.value.quotedcop).toFixed(2))
        : 0,
      copLast: lastMonthStats.value.quotedcop
        ? Number(BigNumber(lastMonthStats.value.quotedcop).toFixed(2))
        : 0,
    },
    subtitle: 'Quoted By Currency',
  }))

  Chartjs.Chart.register(Chartjs.Title, Chartjs.Legend, Chartjs.Tooltip)

  function setQuotesData() {
    return {
      type: 'line',
      data: {
        labels: ['Last Month', 'Current Month'], // Eje X: el tiempo
        datasets: [
          {
            label: 'Total Quotes',
            data: [stats.value[0].value.last, stats.value[0].value.current], // valores en el tiempo
            backgroundColor: 'rgba(255, 206, 86, 0.4)',
            borderColor: '#FFCE56',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Total Orders',
            data: [stats.value[1].value.last, stats.value[1].value.current],
            backgroundColor: 'rgba(54, 162, 235, 0.4)',
            borderColor: '#36A2EB',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Quotes with Orders',
          },
          legend: {
            display: true,
            position: 'top',
          },
        },
      },
    }
  }

  function setCurrencyData() {
    return {
      type: 'bar',
      data: {
        labels: ['Last Month', 'Current Month'],
        datasets: [
          {
            label: 'USD',
            data: [
              currencyTrend.value.data.dolarLast ? currencyTrend.value.data.dolarLast : 0,
              currencyTrend.value.data.dolarCurrent ? currencyTrend.value.data.dolarCurrent : 0,
            ],
            backgroundColor: '#36A2EB',
            fill: false,
          },
          {
            label: 'EUR',
            data: [
              currencyTrend.value.data.euroLast ? currencyTrend.value.data.euroLast : 0,
              currencyTrend.value.data.euroCurrent ? currencyTrend.value.data.euroCurrent : 0,
            ],
            backgroundColor: '#FFCE56',
            fill: false,
          },
          {
            label: 'COP',
            data: [
              currencyTrend.value.data.copLast ? currencyTrend.value.data.copLast : 0,
              currencyTrend.value.data.copCurrent ? currencyTrend.value.data.copCurrent : 0,
            ],
            backgroundColor: '#4BC0C0',
            borderColor: '#4BC0C0',
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Currency Trend in COP',
          },
          legend: {
            display: true,
            position: 'top',
          },
        },
      },
    }
  }

  onMounted(fetchStats)

  watch(
    () => [stats.value, currentStats.value, lastMonthStats.value],
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

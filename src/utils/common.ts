export function formatCurrency(amount: string | number, currency = 'COP') {
  const locale = currency === 'USD' ? 'en-US' : currency === 'EUR' ? 'es-ES' : 'es-CO'
  return Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount))
}

export function formatDate(dateString?: string) {
  if (!dateString) return 'Fecha no válida'

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Fecha no válida'

  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

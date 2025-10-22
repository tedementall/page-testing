export function formatCurrency(value) {
  const numberValue = typeof value === "number" ? value : parseCurrency(value)
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numberValue || 0)
}

export function parseCurrency(value) {
  if (typeof value === "number") return value
  if (!value) return 0
  const cleaned = value.toString().replace(/[^0-9]/g, "")
  const parsed = Number.parseInt(cleaned, 10)
  return Number.isNaN(parsed) ? 0 : parsed
}

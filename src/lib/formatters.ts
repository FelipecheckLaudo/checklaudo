/**
 * Centralized formatting utilities
 */

/**
 * Formats a Brazilian CPF number
 * @param value - CPF string (with or without formatting)
 * @returns Formatted CPF (XXX.XXX.XXX-XX)
 */
export function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  }
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
}

/**
 * Formats a Brazilian license plate
 * @param value - Plate string (with or without formatting)
 * @returns Formatted plate (XXX-XXXX or XXX-X#XX for Mercosul)
 */
export function formatPlaca(value: string): string {
  const cleaned = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (cleaned.length <= 3) return cleaned;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}`;
}

/**
 * Formats a number or string as Brazilian currency
 * @param value - Number or string to format
 * @returns Formatted currency (R$ X.XXX,XX)
 */
export function formatCurrency(value: number | string): string {
  const numValue = typeof value === "string" ? parseCurrencyToNumber(value) : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numValue);
}

/**
 * Parses a formatted currency string to number
 * @param currency - Formatted currency string
 * @returns Numeric value
 */
export function parseCurrencyToNumber(currency: string): number {
  return parseFloat(currency.replace(/[^\d,-]/g, "").replace(",", ".")) || 0;
}

/**
 * Formats an ISO date string
 * @param isoDate - ISO date string
 * @param format - Optional format ('short' | 'long' | 'time')
 * @returns Formatted date string
 */
export function formatDate(isoDate: string, format: 'short' | 'long' | 'time' = 'short'): string {
  const date = new Date(isoDate);
  
  switch (format) {
    case 'long':
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    case 'time':
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    case 'short':
    default:
      return date.toLocaleDateString("pt-BR");
  }
}

/**
 * Formats a value as a phone number
 * @param value - Phone string (with or without formatting)
 * @returns Formatted phone number
 */
export function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 2) return `(${numbers}`;
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

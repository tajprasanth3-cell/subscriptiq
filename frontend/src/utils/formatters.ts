/**
 * Formatting utilities for SubscriptIQ
 */

export function formatCurrency(amount: number, currency = '₹'): string {
  return `${currency}${amount.toLocaleString('en-IN')}`;
}

export function formatNumber(value: number | string): string {
  if (typeof value === 'string') return value;
  return value.toLocaleString('en-US');
}

export function formatPercentage(val: number): string {
  return `${val}%`;
}


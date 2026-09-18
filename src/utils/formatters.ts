export function formatOSNumber(num: number): string {
  return String(num).padStart(5, '0');
}

export function formatCurrency(val?: number): string {
  if (val === undefined || val === null || isNaN(val)) return 'R$ 0,00';
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDateBR(dateStr?: string): string {
  if (!dateStr) return '';
  // Handles YYYY-MM-DD
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function cleanPhone(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

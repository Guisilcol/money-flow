import { Transaction } from '../types';

/**
 * Calcula o gasto diário sugerido baseado no saldo variável disponível
 * e nos dias restantes do período.
 */
export function calculateDailyBudget(
  currentVariableBalance: number,
  endDate: string,
  currentDate: Date = new Date()
): number {
  const end = new Date(endDate + 'T23:59:59');
  const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  
  // Se o período já acabou, retorna 0
  if (today > end) return 0;
  
  // Calcula dias restantes (incluindo hoje)
  const diffTime = end.getTime() - today.getTime();
  const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  if (remainingDays <= 0) return 0;
  
  return currentVariableBalance / remainingDays;
}

/**
 * Retorna o número de dias restantes no período (incluindo hoje)
 */
export function getRemainingDays(
  endDate: string,
  currentDate: Date = new Date()
): number {
  const end = new Date(endDate + 'T23:59:59');
  const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  
  if (today > end) return 0;
  
  const diffTime = end.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Retorna lista de todas as datas do período (yyyy-mm-dd)
 */
export function getPeriodDaysRange(startDate: string, endDate: string): string[] {
  const days: string[] = [];
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  
  const current = new Date(start);
  while (current <= end) {
    days.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}

/**
 * Retorna lista de datas do período que não possuem transações
 */
export function getDaysWithoutTransactions(
  startDate: string,
  endDate: string,
  transactions: Transaction[],
  currentDate: Date = new Date()
): string[] {
  const periodDays = getPeriodDaysRange(startDate, endDate);
  const transactionDates = new Set(transactions.map(t => t.date));
  
  // Filtra apenas dias passados ou hoje (não mostrar dias futuros como "sem lançamento")
  const today = currentDate.toISOString().split('T')[0];
  
  return periodDays.filter(day => 
    day <= today && !transactionDates.has(day)
  );
}

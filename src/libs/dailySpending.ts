import { Transaction } from '../types';

/**
 * Retorna as datas que tem lançamentos "ZERO GASTOS"
 */
export function getZeroDays(transactions: Transaction[]): Set<string> {
  return new Set(
    transactions
      .filter(t => t.description === 'ZERO GASTOS' && t.amount === 0)
      .map(t => t.date)
  );
}

/**
 * Calcula o gasto diário sugerido baseado no saldo variável disponível
 * e nos dias restantes do período, excluindo dias "zerados".
 */
export function calculateDailyBudget(
  currentVariableBalance: number,
  endDate: string,
  transactions: Transaction[] = [],
  currentDate: Date = new Date()
): number {
  const end = new Date(endDate + 'T23:59:59');
  const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  
  // Se o período já acabou, retorna 0
  if (today > end) return 0;
  
  // Calcula dias restantes (incluindo hoje)
  const diffTime = end.getTime() - today.getTime();
  const totalRemainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  if (totalRemainingDays <= 0) return 0;
  
  // Conta quantos dias "zerados" estão nos dias restantes (hoje até o fim)
  const zeroDays = getZeroDays(transactions);
  let zeroDaysInRemaining = 0;
  
  const current = new Date(today);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    if (zeroDays.has(dateStr)) {
      zeroDaysInRemaining++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  // Dias efetivos = dias restantes - dias zerados
  const effectiveRemainingDays = totalRemainingDays - zeroDaysInRemaining;
  
  if (effectiveRemainingDays <= 0) return 0;
  
  return currentVariableBalance / effectiveRemainingDays;
}

/**
 * Retorna o número de dias restantes no período (incluindo hoje),
 * excluindo dias com "ZERO GASTOS".
 */
export function getRemainingDays(
  endDate: string,
  transactions: Transaction[] = [],
  currentDate: Date = new Date()
): number {
  const end = new Date(endDate + 'T23:59:59');
  const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  
  if (today > end) return 0;
  
  const diffTime = end.getTime() - today.getTime();
  const totalRemainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  // Conta dias zerados nos dias restantes
  const zeroDays = getZeroDays(transactions);
  let zeroDaysInRemaining = 0;
  
  const current = new Date(today);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    if (zeroDays.has(dateStr)) {
      zeroDaysInRemaining++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return totalRemainingDays - zeroDaysInRemaining;
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

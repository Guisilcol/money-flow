import { Transaction } from './types';

/**
 * Retorna as datas que têm qualquer transação (dia "usado/fechado")
 */
export function getDaysWithTransactions(transactions: Transaction[]): Set<string> {
  return new Set(transactions.map(t => t.date));
}

/**
 * Calcula o gasto diário sugerido baseado no saldo variável disponível
 * e nos dias restantes do período que ainda não têm transações.
 * 
 * Lógica: quando você faz uma transação em um dia (qualquer valor),
 * esse dia é considerado "fechado" e o saldo restante é redistribuído
 * entre os dias sem transações.
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
  
  // Dias que já têm transações (considerados "fechados")
  const usedDays = getDaysWithTransactions(transactions);
  
  // Conta dias restantes SEM transações (de hoje até o fim do período)
  let daysWithoutTransactions = 0;
  
  const current = new Date(today);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    if (!usedDays.has(dateStr)) {
      daysWithoutTransactions++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  // Se todos os dias já têm transações, não há mais dias para gastar
  if (daysWithoutTransactions <= 0) return 0;
  
  return currentVariableBalance / daysWithoutTransactions;
}

/**
 * Retorna o número de dias restantes no período que ainda não têm transações.
 */
export function getRemainingDays(
  endDate: string,
  transactions: Transaction[] = [],
  currentDate: Date = new Date()
): number {
  const end = new Date(endDate + 'T23:59:59');
  const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  
  if (today > end) return 0;
  
  // Dias que já têm transações
  const usedDays = getDaysWithTransactions(transactions);
  
  // Conta dias restantes SEM transações
  let daysWithoutTransactions = 0;
  
  const current = new Date(today);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    if (!usedDays.has(dateStr)) {
      daysWithoutTransactions++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return daysWithoutTransactions;
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

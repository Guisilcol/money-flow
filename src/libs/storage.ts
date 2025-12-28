import { AccountingPeriod, Transaction } from '../types';

// Storage keys as constants
const STORAGE_KEYS = {
  PERIODS: 'finance_periods_v3',
  TRANSACTIONS: 'finance_transactions_v3',
} as const;

// Legacy keys for migration
const LEGACY_KEYS = {
  PERIODS: 'finance_periods_v2',
  TRANSACTIONS: 'finance_transactions_v2',
} as const;

// Generic functions
function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error loading data from localStorage (${key}):`, error);
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving data to localStorage (${key}):`, error);
  }
}

// Migration function to convert old data format
function migrateData(): { periods: AccountingPeriod[]; transactions: Transaction[] } {
  // Check if we already have v3 data
  const existingPeriods = getItem<AccountingPeriod[]>(STORAGE_KEYS.PERIODS);
  const existingTransactions = getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS);

  if (existingPeriods !== null && existingTransactions !== null) {
    return { periods: existingPeriods, transactions: existingTransactions };
  }

  // Load legacy v2 data
  const legacyPeriods = getItem<any[]>(LEGACY_KEYS.PERIODS) ?? [];
  const legacyTransactions = getItem<any[]>(LEGACY_KEYS.TRANSACTIONS) ?? [];

  // Migrate periods - add fixedExpenses array if not present
  const migratedPeriods: AccountingPeriod[] = legacyPeriods.map(period => ({
    ...period,
    fixedExpenses: period.fixedExpenses ?? []
  }));

  // Filter out old FIXED_EXPENSE transactions and convert them to fixedExpenses
  const fixedExpenseTransactions = legacyTransactions.filter(
    (t: any) => t.category === 'FIXED_EXPENSE'
  );

  // Add fixed expenses from transactions to their respective periods
  fixedExpenseTransactions.forEach((t: any) => {
    const period = migratedPeriods.find(p => p.id === t.periodId);
    if (period) {
      period.fixedExpenses.push({
        id: t.id,
        periodId: t.periodId,
        name: t.description,
        amount: t.amount
      });
    }
  });

  // Filter out FIXED_EXPENSE from transactions
  const migratedTransactions: Transaction[] = legacyTransactions
    .filter((t: any) => t.category !== 'FIXED_EXPENSE')
    .map((t: any) => ({
      ...t,
      category: t.category === 'ENTRY' ? 'ENTRY' : 'VARIABLE_EXPENSE'
    }));

  // Save migrated data
  setItem(STORAGE_KEYS.PERIODS, migratedPeriods);
  setItem(STORAGE_KEYS.TRANSACTIONS, migratedTransactions);

  return { periods: migratedPeriods, transactions: migratedTransactions };
}

// Domain-specific functions
export function loadPeriods(): AccountingPeriod[] {
  const { periods } = migrateData();
  return periods;
}

export function loadTransactions(): Transaction[] {
  const { transactions } = migrateData();
  return transactions;
}

export function savePeriods(periods: AccountingPeriod[]): void {
  setItem(STORAGE_KEYS.PERIODS, periods);
}

export function saveTransactions(transactions: Transaction[]): void {
  setItem(STORAGE_KEYS.TRANSACTIONS, transactions);
}

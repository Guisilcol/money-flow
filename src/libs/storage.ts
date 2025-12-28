import { AccountingPeriod, Transaction } from '../types';

// Storage keys as constants
const STORAGE_KEYS = {
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

// Domain-specific functions
export function loadPeriods(): AccountingPeriod[] {
  return getItem<AccountingPeriod[]>(STORAGE_KEYS.PERIODS) ?? [];
}

export function loadTransactions(): Transaction[] {
  return getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS) ?? [];
}

export function savePeriods(periods: AccountingPeriod[]): void {
  setItem(STORAGE_KEYS.PERIODS, periods);
}

export function saveTransactions(transactions: Transaction[]): void {
  setItem(STORAGE_KEYS.TRANSACTIONS, transactions);
}

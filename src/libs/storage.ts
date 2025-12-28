import { AccountingPeriod, Transaction, Template } from '../types';

// Storage keys as constants
const STORAGE_KEYS = {
  PERIODS: 'finance_periods_v4',
  TRANSACTIONS: 'finance_transactions_v4',
  TEMPLATE: 'finance_template_v1',
} as const;

// Legacy keys for migration
const LEGACY_KEYS = {
  PERIODS_V3: 'finance_periods_v3',
  TRANSACTIONS_V3: 'finance_transactions_v3',
  PERIODS_V2: 'finance_periods_v2',
  TRANSACTIONS_V2: 'finance_transactions_v2',
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
  // Check if we already have v4 data
  const existingPeriods = getItem<AccountingPeriod[]>(STORAGE_KEYS.PERIODS);
  const existingTransactions = getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS);

  if (existingPeriods !== null && existingTransactions !== null) {
    return { periods: existingPeriods, transactions: existingTransactions };
  }

  // Try to load v3 data first, then v2
  let legacyPeriods = getItem<any[]>(LEGACY_KEYS.PERIODS_V3);
  let legacyTransactions = getItem<any[]>(LEGACY_KEYS.TRANSACTIONS_V3);

  if (legacyPeriods === null) {
    legacyPeriods = getItem<any[]>(LEGACY_KEYS.PERIODS_V2) ?? [];
    legacyTransactions = getItem<any[]>(LEGACY_KEYS.TRANSACTIONS_V2) ?? [];
  }

  legacyPeriods = legacyPeriods ?? [];
  legacyTransactions = legacyTransactions ?? [];

  // Migrate periods - add entries array if not present
  const migratedPeriods: AccountingPeriod[] = legacyPeriods.map(period => ({
    ...period,
    fixedExpenses: period.fixedExpenses ?? [],
    entries: period.entries ?? []
  }));

  // Filter out old FIXED_EXPENSE and ENTRY transactions and convert them
  const fixedExpenseTransactions = legacyTransactions.filter(
    (t: any) => t.category === 'FIXED_EXPENSE'
  );
  const entryTransactions = legacyTransactions.filter(
    (t: any) => t.category === 'ENTRY' || t.type === 'ENTRY'
  );

  // Add fixed expenses from transactions to their respective periods
  fixedExpenseTransactions.forEach((t: any) => {
    const period = migratedPeriods.find(p => p.id === t.periodId);
    if (period && !period.fixedExpenses.some(e => e.id === t.id)) {
      period.fixedExpenses.push({
        id: t.id,
        periodId: t.periodId,
        name: t.description,
        amount: t.amount
      });
    }
  });

  // Add entries from transactions to their respective periods
  entryTransactions.forEach((t: any) => {
    const period = migratedPeriods.find(p => p.id === t.periodId);
    if (period && !period.entries.some(e => e.id === t.id)) {
      period.entries.push({
        id: t.id,
        periodId: t.periodId,
        name: t.description,
        amount: t.amount
      });
    }
  });

  // Filter out FIXED_EXPENSE and ENTRY from transactions - only keep VARIABLE_EXPENSE
  const migratedTransactions: Transaction[] = legacyTransactions
    .filter((t: any) => t.category !== 'FIXED_EXPENSE' && t.category !== 'ENTRY' && t.type !== 'ENTRY')
    .map((t: any) => ({
      ...t,
      type: 'EXPENSE',
      category: 'VARIABLE_EXPENSE'
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

// Template storage functions
const DEFAULT_TEMPLATE: Template = {
  entries: [],
  fixedExpenses: [],
};

export function loadTemplate(): Template {
  const template = getItem<Template>(STORAGE_KEYS.TEMPLATE);
  return template ?? DEFAULT_TEMPLATE;
}

export function saveTemplate(template: Template): void {
  setItem(STORAGE_KEYS.TEMPLATE, template);
}

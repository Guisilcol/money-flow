import { AccountingPeriod, Transaction, Template } from '../types';
import { getItem, setItem } from './indexeddb';

// Storage keys as constants
const STORAGE_KEYS = {
  PERIODS: 'finance_periods_v4',
  TRANSACTIONS: 'finance_transactions_v4',
  TEMPLATE: 'finance_template_v1',
} as const;

// Domain-specific functions
export async function loadPeriods(): Promise<AccountingPeriod[]> {
  const periods = await getItem<AccountingPeriod[]>(STORAGE_KEYS.PERIODS);
  return periods ?? [];
}

export async function loadTransactions(): Promise<Transaction[]> {
  const transactions = await getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS);
  return transactions ?? [];
}

export async function savePeriods(periods: AccountingPeriod[]): Promise<void> {
  await setItem(STORAGE_KEYS.PERIODS, periods);
}

export async function saveTransactions(transactions: Transaction[]): Promise<void> {
  await setItem(STORAGE_KEYS.TRANSACTIONS, transactions);
}

// Template storage functions
const DEFAULT_TEMPLATE: Template = {
  entries: [],
  fixedExpenses: [],
};

export async function loadTemplate(): Promise<Template> {
  const template = await getItem<Template>(STORAGE_KEYS.TEMPLATE);
  return template ?? DEFAULT_TEMPLATE;
}

export async function saveTemplate(template: Template): Promise<void> {
  await setItem(STORAGE_KEYS.TEMPLATE, template);
}

// Database Export/Import types and functions
export interface DatabaseExport {
  version: number;
  exportedAt: string;
  periods: AccountingPeriod[];
  transactions: Transaction[];
  template: Template;
}

const CURRENT_EXPORT_VERSION = 1;

export async function exportAllData(): Promise<DatabaseExport> {
  const periods = await loadPeriods();
  const transactions = await loadTransactions();
  const template = await loadTemplate();

  return {
    version: CURRENT_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    periods,
    transactions,
    template,
  };
}

export async function importAllData(data: DatabaseExport): Promise<void> {
  // Basic validation
  if (!data.version || !Array.isArray(data.periods) || !Array.isArray(data.transactions) || !data.template) {
    throw new Error('Formato de arquivo inválido');
  }

  if (data.version > CURRENT_EXPORT_VERSION) {
    throw new Error('Versão do arquivo não suportada. Atualize o aplicativo.');
  }

  // Save all data (replaces existing)
  await savePeriods(data.periods);
  await saveTransactions(data.transactions);
  await saveTemplate(data.template);
}

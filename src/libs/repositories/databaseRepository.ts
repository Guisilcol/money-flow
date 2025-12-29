import { AccountingPeriod, Transaction, Template } from '../../types';
import { loadPeriods, savePeriods } from './periodsRepository';
import { loadTransactions, saveTransactions } from './transactionsRepository';
import { loadTemplate, saveTemplate } from './templateRepository';

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

import { Transaction } from '../types';
import { getItem, setItem } from '../indexedDB';

const TRANSACTIONS_STORAGE_KEY = 'finance_transactions_v4';

export async function loadTransactions(): Promise<Transaction[]> {
  const transactions = await getItem<Transaction[]>(TRANSACTIONS_STORAGE_KEY);
  return transactions ?? [];
}

export async function saveTransactions(transactions: Transaction[]): Promise<void> {
  await setItem(TRANSACTIONS_STORAGE_KEY, transactions);
}

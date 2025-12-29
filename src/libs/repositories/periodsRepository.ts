import { AccountingPeriod } from '../../types';
import { getItem, setItem } from '../indexedDB';

const PERIODS_STORAGE_KEY = 'finance_periods_v4';

export async function loadPeriods(): Promise<AccountingPeriod[]> {
  const periods = await getItem<AccountingPeriod[]>(PERIODS_STORAGE_KEY);
  return periods ?? [];
}

export async function savePeriods(periods: AccountingPeriod[]): Promise<void> {
  await setItem(PERIODS_STORAGE_KEY, periods);
}


export enum TransactionType {
  ENTRY = 'ENTRY',
  EXPENSE = 'EXPENSE'
}

export interface Transaction {
  id: string;
  periodId: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  date: string;
  isFixed: boolean;
}

export interface AccountingPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isOpen: boolean;
}

export interface PeriodSummary {
  totalEntries: number;
  totalExpenses: number;
  fixedExpenses: number;
  variableExpenses: number;
  balance: number;
}

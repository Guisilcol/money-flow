
export enum TransactionType {
  ENTRY = 'ENTRY',
  EXPENSE = 'EXPENSE'
}

export enum TransactionCategory {
  FIXED_EXPENSE = 'FIXED_EXPENSE',
  VARIABLE_EXPENSE = 'VARIABLE_EXPENSE',
  ENTRY = 'ENTRY'
}

export interface Transaction {
  id: string;
  periodId: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  date: string;
}

export interface AccountingPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isOpen: boolean;
  investmentPercentage: number;
}

export interface PeriodSummary {
  totalEntries: number;
  totalExpenses: number;
  fixedExpenses: number;
  variableExpenses: number;
  balance: number;
  investmentAmount: number;
  projectedVariableBalance: number;
  currentVariableBalance: number;
}

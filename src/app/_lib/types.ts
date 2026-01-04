
export enum TransactionType {
  EXPENSE = 'EXPENSE'
}

export enum TransactionCategory {
  VARIABLE_EXPENSE = 'VARIABLE_EXPENSE'
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

export interface FixedExpense {
  id: string;
  periodId: string;
  name: string;
  amount: number;
}

export interface Entry {
  id: string;
  periodId: string;
  name: string;
  amount: number;
}

export interface AccountingPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isOpen: boolean;
  investmentPercentage: number;
  fixedExpenses: FixedExpense[];
  entries: Entry[];
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

export interface TemplateEntry {
  id: string;
  name: string;
  amount: number;
}

export interface TemplateFixedExpense {
  id: string;
  name: string;
  amount: number;
}

export interface Template {
  entries: TemplateEntry[];
  fixedExpenses: TemplateFixedExpense[];
}
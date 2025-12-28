
export enum TransactionType {
  EXPENSE = 'EXPENSE'
}

export enum TransactionCategory {
  VARIABLE_EXPENSE = 'VARIABLE_EXPENSE'
}

// Transações são apenas gastos variáveis (com data)
export interface Transaction {
  id: string;
  periodId: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  date: string;
}

// Gastos Fixos - valores nomeados vinculados ao período, sem data
export interface FixedExpense {
  id: string;
  periodId: string;
  name: string;
  amount: number;
}

// Entradas - valores nomeados vinculados ao período, sem data
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

// Handler types for callback functions
export type AddTransactionHandler = (transaction: Transaction) => void;
export type DeleteTransactionHandler = (id: string) => void;
export type UpdatePeriodHandler = (period: AccountingPeriod) => void;
export type AddFixedExpenseHandler = (expense: FixedExpense) => void;
export type DeleteFixedExpenseHandler = (expenseId: string) => void;
export type AddEntryHandler = (entry: Entry) => void;
export type DeleteEntryHandler = (entryId: string) => void;

import { useState, useMemo } from 'react';
import { Transaction } from '../types';

interface UseTransactionsReturn {
  transactions: Transaction[];
  periodTransactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  handleAddTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  handleUpdateTransaction: (transaction: Transaction) => void;
}

export function useTransactions(selectedPeriodId: string | null): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const periodTransactions = useMemo(
    () => transactions.filter(t => t.periodId === selectedPeriodId),
    [transactions, selectedPeriodId]
  );

  const handleAddTransaction = (newTransaction: Transaction) => {
    setTransactions(prev => [...prev, newTransaction]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t =>
      t.id === updatedTransaction.id ? updatedTransaction : t
    ));
  };

  return {
    transactions,
    periodTransactions,
    setTransactions,
    handleAddTransaction,
    deleteTransaction,
    handleUpdateTransaction,
  };
}

import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, AccountingPeriod, FixedExpense, Entry } from './types';
import { Sidebar } from './components/Sidebar';
import { PeriodDetails } from './pages/PeriodDetails';
import { WelcomePage } from './pages/WelcomePage';
import { loadPeriods, loadTransactions, savePeriods, saveTransactions } from './libs/storage';

const App: React.FC = () => {
  // --- State ---
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // --- Derived State ---
  const selectedPeriod = useMemo(() =>
    periods.find(p => p.id === selectedPeriodId), [periods, selectedPeriodId]
  );

  const periodTransactions = useMemo(() =>
    transactions.filter(t => t.periodId === selectedPeriodId), [transactions, selectedPeriodId]
  );

  // --- Initial Data ---
  useEffect(() => {
    const savedPeriods = loadPeriods();
    const savedTransactions = loadTransactions();

    setPeriods(savedPeriods);
    if (savedPeriods.length > 0 && !selectedPeriodId) {
      setSelectedPeriodId(savedPeriods[0].id);
    }
    setTransactions(savedTransactions);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    savePeriods(periods);
    saveTransactions(transactions);
  }, [periods, transactions, isInitialized]);

  // --- Handlers ---
  const handleCreatePeriod = (newPeriod: AccountingPeriod) => {
    // Ensure fixedExpenses and entries are initialized
    const periodWithDefaults = {
      ...newPeriod,
      fixedExpenses: newPeriod.fixedExpenses || [],
      entries: newPeriod.entries || []
    };
    setPeriods(prev => [periodWithDefaults, ...prev]);
    setSelectedPeriodId(periodWithDefaults.id);
  };

  const handleAddTransaction = (newTransaction: Transaction) => {
    setTransactions(prev => [...prev, newTransaction]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleUpdatePeriod = (updatedPeriod: AccountingPeriod) => {
    setPeriods(prev => prev.map(p => p.id === updatedPeriod.id ? updatedPeriod : p));
  };

  const deletePeriod = (id: string) => {
    const confirmDelete = window.confirm('Deseja excluir este período permanentemente? Todas as transações serão perdidas.');

    if (confirmDelete) {
      const updatedPeriods = periods.filter(p => p.id !== id);
      setPeriods(updatedPeriods);

      const updatedTransactions = transactions.filter(t => t.periodId !== id);
      setTransactions(updatedTransactions);

      if (selectedPeriodId === id) {
        setSelectedPeriodId(updatedPeriods.length > 0 ? updatedPeriods[0].id : null);
      }
    }
  };

  // --- Fixed Expense Handlers ---
  const handleAddFixedExpense = (expense: FixedExpense) => {
    setPeriods(prev => prev.map(p => {
      if (p.id === expense.periodId) {
        return {
          ...p,
          fixedExpenses: [...(p.fixedExpenses || []), expense]
        };
      }
      return p;
    }));
  };

  const handleDeleteFixedExpense = (expenseId: string) => {
    setPeriods(prev => prev.map(p => {
      if (p.id === selectedPeriodId) {
        return {
          ...p,
          fixedExpenses: (p.fixedExpenses || []).filter(e => e.id !== expenseId)
        };
      }
      return p;
    }));
  };

  // --- Entry Handlers ---
  const handleAddEntry = (entry: Entry) => {
    setPeriods(prev => prev.map(p => {
      if (p.id === entry.periodId) {
        return {
          ...p,
          entries: [...(p.entries || []), entry]
        };
      }
      return p;
    }));
  };

  const handleDeleteEntry = (entryId: string) => {
    setPeriods(prev => prev.map(p => {
      if (p.id === selectedPeriodId) {
        return {
          ...p,
          entries: (p.entries || []).filter(e => e.id !== entryId)
        };
      }
      return p;
    }));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] text-slate-900">
      {/* Sidebar - Periods */}
      <Sidebar
        periods={periods}
        selectedPeriodId={selectedPeriodId}
        onSelectPeriod={setSelectedPeriodId}
        onCreatePeriod={handleCreatePeriod}
        onDeletePeriod={deletePeriod}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 lg:p-14 overflow-y-auto">
        {!selectedPeriod ? (
          <WelcomePage />
        ) : (
          <PeriodDetails
            period={selectedPeriod}
            transactions={periodTransactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={deleteTransaction}
            onUpdatePeriod={handleUpdatePeriod}
            onAddFixedExpense={handleAddFixedExpense}
            onDeleteFixedExpense={handleDeleteFixedExpense}
            onAddEntry={handleAddEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        )}
      </main>
    </div>
  );
};

export default App;
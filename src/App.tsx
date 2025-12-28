import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, AccountingPeriod } from './types';
import { Sidebar } from './components/Sidebar';
import { PeriodDetails } from './pages/PeriodDetails';
import { WelcomePage } from './pages/WelcomePage';

const App: React.FC = () => {
  // --- State ---
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // --- Derived State ---
  const selectedPeriod = useMemo(() =>
    periods.find(p => p.id === selectedPeriodId), [periods, selectedPeriodId]
  );

  const periodTransactions = useMemo(() =>
    transactions.filter(t => t.periodId === selectedPeriodId), [transactions, selectedPeriodId]
  );

  // --- Initial Data ---
  useEffect(() => {
    try {
      const savedPeriods = localStorage.getItem('finance_periods_v2');
      const savedTransactions = localStorage.getItem('finance_transactions_v2');

      if (savedPeriods) {
        const parsed = JSON.parse(savedPeriods);
        setPeriods(parsed);
        if (parsed.length > 0 && !selectedPeriodId) setSelectedPeriodId(parsed[0].id);
      }
      if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    } catch (e) {
      console.error("Erro ao carregar dados", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('finance_periods_v2', JSON.stringify(periods));
    localStorage.setItem('finance_transactions_v2', JSON.stringify(transactions));
  }, [periods, transactions]);

  // --- Handlers ---
  const handleCreatePeriod = (newPeriod: AccountingPeriod) => {
    setPeriods(prev => [newPeriod, ...prev]);
    setSelectedPeriodId(newPeriod.id);
  };

  const handleAddTransaction = (newTransaction: Transaction) => {
    setTransactions(prev => [...prev, newTransaction]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
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
          />
        )}
      </main>
    </div>
  );
};

export default App;
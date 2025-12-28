import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, AccountingPeriod } from './types';
import { Icons } from './constants';
import { Sidebar } from './components/Sidebar';
import { PeriodDetails } from './pages/PeriodDetails';

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
    // Confirmação simples
    const confirmDelete = window.confirm('Deseja excluir este período permanentemente? Todas as transações serão perdidas.');
    
    if (confirmDelete) {
      // Atualiza a lista de períodos removendo o alvo
      const updatedPeriods = periods.filter(p => p.id !== id);
      setPeriods(updatedPeriods);
      
      // Remove transações orfãs
      const updatedTransactions = transactions.filter(t => t.periodId !== id);
      setTransactions(updatedTransactions);
      
      // Se o período deletado era o selecionado, limpa a seleção ou seleciona outro
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
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-6">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-slate-100 text-indigo-600">
              <Icons.Wallet />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Controle Simples</h2>
              <p className="text-slate-500 leading-relaxed font-medium">
                Crie um <strong>período contábil</strong> usando o menu lateral para começar a registrar suas entradas e gastos fixos.
              </p>
            </div>
          </div>
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
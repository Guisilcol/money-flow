import { useEffect, useState, useCallback } from 'react';
import {
  AccountingPeriod,
  Transaction,
  Template,
} from '../types';
import {
  loadPeriods,
  loadTransactions,
  loadTemplate,
  savePeriods,
  saveTransactions,
  saveTemplate,
  exportAllData,
  importAllData,
  DatabaseExport,
} from '../libs/repositories';

interface UseDataPersistenceParams {
  periods: {
    periods: AccountingPeriod[];
    setPeriods: React.Dispatch<React.SetStateAction<AccountingPeriod[]>>;
    setSelectedPeriodId: React.Dispatch<React.SetStateAction<string | null>>;
  };
  transactions: {
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  };
  template: {
    template: Template;
    setTemplate: React.Dispatch<React.SetStateAction<Template>>;
    setIsTemplateView: React.Dispatch<React.SetStateAction<boolean>>;
  };
}

interface UseDataPersistenceReturn {
  isInitialized: boolean;
  handleExportData: () => Promise<void>;
  handleImportData: (file: File) => Promise<void>;
}

export function useDataPersistence({
  periods,
  transactions,
  template,
}: UseDataPersistenceParams): UseDataPersistenceReturn {
  const [isInitialized, setIsInitialized] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      const savedPeriods = await loadPeriods();
      const savedTransactions = await loadTransactions();
      const savedTemplate = await loadTemplate();

      periods.setPeriods(savedPeriods);
      if (savedPeriods.length > 0) {
        periods.setSelectedPeriodId(savedPeriods[0].id);
      }
      transactions.setTransactions(savedTransactions);
      template.setTemplate(savedTemplate);
      setIsInitialized(true);
    };
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save data on changes
  useEffect(() => {
    if (!isInitialized) return;
    const saveData = async () => {
      await savePeriods(periods.periods);
      await saveTransactions(transactions.transactions);
      await saveTemplate(template.template);
    };
    saveData();
  }, [periods.periods, transactions.transactions, template.template, isInitialized]);

  const handleExportData = useCallback(async () => {
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moneyflow-backup-${data.exportedAt.split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      alert('Erro ao exportar dados. Tente novamente.');
    }
  }, []);

  const handleImportData = useCallback(async (file: File) => {
    const confirmImport = window.confirm(
      'ATENÇÃO: Isso substituirá TODOS os dados existentes no sistema. Esta ação não pode ser desfeita. Deseja continuar?'
    );

    if (!confirmImport) {
      return;
    }

    try {
      const text = await file.text();
      const data: DatabaseExport = JSON.parse(text);
      await importAllData(data);

      // Reload all state from storage
      const savedPeriods = await loadPeriods();
      const savedTransactions = await loadTransactions();
      const savedTemplate = await loadTemplate();

      periods.setPeriods(savedPeriods);
      transactions.setTransactions(savedTransactions);
      template.setTemplate(savedTemplate);
      periods.setSelectedPeriodId(savedPeriods.length > 0 ? savedPeriods[0].id : null);
      template.setIsTemplateView(false);

      alert('Dados importados com sucesso!');
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      alert('Erro ao importar dados. Verifique se o arquivo é válido.');
    }
  }, [periods, transactions, template]);

  return {
    isInitialized,
    handleExportData,
    handleImportData,
  };
}

import { useState } from 'react';
import { Template, TemplateEntry, TemplateFixedExpense } from '../types';

interface UseTemplateReturn {
  template: Template;
  isTemplateView: boolean;
  setTemplate: React.Dispatch<React.SetStateAction<Template>>;
  setIsTemplateView: React.Dispatch<React.SetStateAction<boolean>>;
  handleAddTemplateEntry: (entry: TemplateEntry) => void;
  handleUpdateTemplateEntry: (entry: TemplateEntry) => void;
  handleDeleteTemplateEntry: (entryId: string) => void;
  handleAddTemplateFixedExpense: (expense: TemplateFixedExpense) => void;
  handleUpdateTemplateFixedExpense: (expense: TemplateFixedExpense) => void;
  handleDeleteTemplateFixedExpense: (expenseId: string) => void;
  handleOpenTemplate: () => void;
}

export function useTemplate(): UseTemplateReturn {
  const [template, setTemplate] = useState<Template>({ entries: [], fixedExpenses: [] });
  const [isTemplateView, setIsTemplateView] = useState(false);

  const handleAddTemplateEntry = (entry: TemplateEntry) => {
    setTemplate(prev => ({
      ...prev,
      entries: [...prev.entries, entry]
    }));
  };

  const handleUpdateTemplateEntry = (updatedEntry: TemplateEntry) => {
    setTemplate(prev => ({
      ...prev,
      entries: prev.entries.map(e => e.id === updatedEntry.id ? updatedEntry : e)
    }));
  };

  const handleDeleteTemplateEntry = (entryId: string) => {
    setTemplate(prev => ({
      ...prev,
      entries: prev.entries.filter(e => e.id !== entryId)
    }));
  };

  const handleAddTemplateFixedExpense = (expense: TemplateFixedExpense) => {
    setTemplate(prev => ({
      ...prev,
      fixedExpenses: [...prev.fixedExpenses, expense]
    }));
  };

  const handleUpdateTemplateFixedExpense = (updatedExpense: TemplateFixedExpense) => {
    setTemplate(prev => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.map(e => e.id === updatedExpense.id ? updatedExpense : e)
    }));
  };

  const handleDeleteTemplateFixedExpense = (expenseId: string) => {
    setTemplate(prev => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.filter(e => e.id !== expenseId)
    }));
  };

  const handleOpenTemplate = () => {
    setIsTemplateView(true);
  };

  return {
    template,
    isTemplateView,
    setTemplate,
    setIsTemplateView,
    handleAddTemplateEntry,
    handleUpdateTemplateEntry,
    handleDeleteTemplateEntry,
    handleAddTemplateFixedExpense,
    handleUpdateTemplateFixedExpense,
    handleDeleteTemplateFixedExpense,
    handleOpenTemplate,
  };
}

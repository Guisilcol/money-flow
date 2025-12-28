import React, { useState } from 'react';
import { AccountingPeriod } from '../types';
import { Icons } from '../constants';
import { Modal } from './Modal';
import { generateId, getFirstDayOfMonth, getLastDayOfMonth } from '../utils';

interface SidebarProps {
  periods: AccountingPeriod[];
  selectedPeriodId: string | null;
  isTemplateView: boolean;
  onSelectPeriod: (id: string) => void;
  onCreatePeriod: (period: AccountingPeriod) => void;
  onDeletePeriod: (id: string) => void;
  onOpenTemplate: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  periods,
  selectedPeriodId,
  isTemplateView,
  onSelectPeriod,
  onCreatePeriod,
  onDeletePeriod,
  onOpenTemplate,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const newPeriod: AccountingPeriod = {
      id: generateId(),
      name: `${startDate} - ${endDate}`,
      startDate,
      endDate,
      isOpen: true,
      investmentPercentage: 0,
      fixedExpenses: [],
      entries: []
    };

    onCreatePeriod(newPeriod);
    setIsModalOpen(false);
  };

  return (
    <>
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col h-auto md:h-screen sticky top-0 z-10">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200">
              <Icons.Wallet />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">FinanceFlow</h1>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"
          >
            <Icons.Plus /> Novo Período
          </button>
          <button
            onClick={onOpenTemplate}
            className={`w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all border-2 ${isTemplateView
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
          >
            <Icons.Settings /> Template Padrão
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
          <h2 className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Janelas Contábeis</h2>
          {periods.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-xs text-slate-400 italic">Nenhum período criado.</p>
            </div>
          ) : (
            periods.map(period => {
              const isSelected = selectedPeriodId === period.id;
              return (
                <div
                  key={period.id}
                  className={`group w-full flex items-center rounded-2xl border transition-all overflow-hidden mb-2 ${isSelected
                    ? 'bg-slate-900 border-slate-900 shadow-xl translate-x-1'
                    : 'bg-white border-slate-100 hover:border-indigo-200'
                    }`}
                >
                  <button
                    onClick={() => onSelectPeriod(period.id)}
                    className="flex-1 flex items-center gap-4 p-4 text-left min-w-0 focus:outline-none"
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-600'}`}>
                      <Icons.Calendar />
                    </div>
                    <div className="overflow-hidden">
                      <div className={`font-bold truncate text-sm ${isSelected ? 'text-white' : 'text-slate-900'}`}>{period.name}</div>
                      <div className={`text-[10px] font-mono font-medium ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                        {period.startDate.split('-').reverse().slice(0, 2).join('/')} — {period.endDate.split('-').reverse().slice(0, 2).join('/')}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDeletePeriod(period.id);
                    }}
                    className={`h-full p-4 shrink-0 transition-colors cursor-pointer flex items-center justify-center ${isSelected
                      ? 'text-slate-500 hover:text-rose-400 hover:bg-white/10'
                      : 'text-slate-300 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                    title="Excluir período"
                    aria-label="Excluir período"
                  >
                    <div className="pointer-events-none">
                      <Icons.Trash />
                    </div>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Período Contábil"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Início</label>
              <div className="relative group">
                <input
                  name="startDate"
                  type="date"
                  required
                  defaultValue={getFirstDayOfMonth()}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                  className="w-full p-4 bg-slate-50 border-slate-200 border-2 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold cursor-pointer"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors">
                  <Icons.Calendar />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fim</label>
              <div className="relative group">
                <input
                  name="endDate"
                  type="date"
                  required
                  defaultValue={getLastDayOfMonth()}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                  className="w-full p-4 bg-slate-50 border-slate-200 border-2 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold cursor-pointer"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors">
                  <Icons.Calendar />
                </div>
              </div>
            </div>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]">
            Criar Período
          </button>
        </form>
      </Modal>
    </>
  );
};
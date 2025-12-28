import React, { useState } from 'react';
import { Icons } from '../constants';

interface SettingsAccordionProps {
    investmentPercentage: number;
    onChangeInvestmentPercentage: (value: number) => void;
}

export const SettingsAccordion: React.FC<SettingsAccordionProps> = ({
    investmentPercentage,
    onChangeInvestmentPercentage
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-all"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
                        <Icons.Settings />
                    </div>
                    <span className="font-bold text-slate-700">Configurações do Período</span>
                </div>
                <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </div>
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-6 pb-6 pt-2 border-t border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <label className="text-sm font-bold text-slate-600 whitespace-nowrap">
                            Porcentagem de Investimento:
                        </label>
                        <div className="flex items-center gap-4 flex-1">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={investmentPercentage}
                                onChange={(e) => onChangeInvestmentPercentage(Number(e.target.value))}
                                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={investmentPercentage}
                                    onChange={(e) => onChangeInvestmentPercentage(Math.min(100, Math.max(0, Number(e.target.value))))}
                                    className="w-20 px-3 py-2 text-center font-bold text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <span className="text-sm font-bold text-slate-500">%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

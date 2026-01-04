import React from 'react';
import { Icons } from '../_lib/constants';

export const WelcomePage: React.FC = () => (
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
);

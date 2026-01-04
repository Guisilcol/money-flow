"use client";

import React from 'react';
import { Icons } from './_lib/constants';

export default function Home() {
    return (
        <main className="flex-1 p-4 md:p-10 lg:p-14 overflow-y-auto flex items-center justify-center">
            <div className="text-center max-w-lg">
                <div className="w-20 h-20 rounded-3xl bg-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-8">
                    <Icons.Wallet />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-4">
                    Bem-vindo ao MoneyFlow
                </h1>
                <p className="text-slate-500 text-lg mb-8">
                    Gerencie suas finanças de forma simples e eficiente.
                    Crie um novo período para começar ou selecione um existente no menu lateral.
                </p>
            </div>
        </main>
    );
}

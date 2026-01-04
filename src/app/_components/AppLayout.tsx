"use client";

import React from 'react';
import { Sidebar } from './Sidebar';
import { PeriodsProvider, usePeriodsContext } from '../_contexts/PeriodsContext';

interface AppLayoutProps {
    children: React.ReactNode;
}

/**
 * Inner layout that consumes context to control render timing.
 */
function AppLayoutContent({ children }: AppLayoutProps) {
    const { isInitialized } = usePeriodsContext();

    if (!isInitialized) return null;

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] text-slate-900">
            <Sidebar />
            {children}
        </div>
    );
}

/**
 * Main application layout component.
 * Provides the PeriodsContext and renders the sidebar with children.
 */
export function AppLayout({ children }: AppLayoutProps) {
    return (
        <PeriodsProvider>
            <AppLayoutContent>{children}</AppLayoutContent>
        </PeriodsProvider>
    );
}

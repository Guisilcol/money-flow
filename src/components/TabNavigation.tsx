import React from 'react';

interface Tab {
    id: string;
    label: string;
}

interface TabNavigationProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (id: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
    tabs,
    activeTab,
    onTabChange
}) => (
    <div className="flex bg-slate-50/50 border-b overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
            <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-8 py-5 text-sm font-bold transition-all whitespace-nowrap border-b-4 ${activeTab === tab.id
                        ? 'border-indigo-600 text-indigo-600 bg-white'
                        : 'border-transparent text-slate-400 hover:text-slate-700 hover:bg-white/50'
                    }`}
            >
                {tab.label}
            </button>
        ))}
    </div>
);

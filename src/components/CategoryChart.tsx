import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { TransactionType } from '../types';

interface ChartDataItem {
    name: string;
    value: number;
    type: TransactionType;
}

interface CategoryChartProps {
    data: ChartDataItem[];
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => (
    <div className="h-72">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
            Fluxo por Categoria
        </h4>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                />
                <Tooltip
                    contentStyle={{
                        borderRadius: '16px',
                        border: 'none',
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                        padding: '12px'
                    }}
                    cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={entry.type === TransactionType.ENTRY ? '#10b981' : '#6366f1'}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </div>
);

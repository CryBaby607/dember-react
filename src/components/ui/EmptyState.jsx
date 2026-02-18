import React from 'react';
import { SearchX } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EmptyState({
    title = "No hay datos",
    description,
    icon: Icon = SearchX,
    action,
    className
}) {
    return (
        <div className={cn("h-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300", className)}>
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                <Icon className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
            </div>

            <h3 className="text-lg font-medium text-slate-900 mb-1">{title}</h3>

            {description && (
                <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
                    {description}
                </p>
            )}

            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    );
}

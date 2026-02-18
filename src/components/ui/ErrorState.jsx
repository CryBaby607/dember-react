import React from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ErrorState({
    title = "Algo salió mal",
    message,
    onRetry,
    retryLabel = "Reintentar",
    className
}) {
    return (
        <div className={cn("h-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300", className)}>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
            </div>

            <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>

            {message && (
                <p className="text-sm text-slate-500 max-w-xs mb-6 leading-relaxed">
                    {message}
                </p>
            )}

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm active:scale-95"
                >
                    <RotateCw size={16} />
                    {retryLabel}
                </button>
            )}
        </div>
    );
}

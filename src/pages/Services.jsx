import React from 'react';
import { ServiceList } from '@/components/configuration/ServiceList';


export function Services() {
    return (
        <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Servicios</h1>
                        <p className="text-sm text-slate-500 font-medium">Catálogo de precios y tiempos</p>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 p-8 w-full max-w-5xl mx-auto pb-20">
                <ServiceList />
            </div>
        </div>
    );
}

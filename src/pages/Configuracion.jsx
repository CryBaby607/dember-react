import React from 'react';
import { BarberManagement } from '@/components/configuration/BarberManagement';
import { BusinessHours } from '@/components/configuration/BusinessHours';


export function Configuracion() {
    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            {/* Header */}
            <header className="px-8 py-6 sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Administración</h1>
                        <p className="text-sm text-slate-500 font-medium tracking-wide mt-1">Configuración general y permisos del sistema</p>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 p-8 w-full max-w-7xl mx-auto space-y-8 pb-20">
                {/* Module: Business Hours & Barber Management */}
                <section className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <BusinessHours />
                    <BarberManagement />
                </section>
            </div>
        </div>
    );
}

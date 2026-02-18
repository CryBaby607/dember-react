import React from 'react';
import { BarberManagement } from '@/components/configuration/BarberManagement';
import { BusinessHours } from '@/components/configuration/BusinessHours';


export function Configuracion() {
    return (
        <div className="flex flex-col h-full bg-[#0F0F13] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            {/* Header */}
            <header className="px-8 py-8 sticky top-0 z-10 bg-[#0F0F13]/80 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight uppercase">Administración</h1>
                        <p className="text-sm text-zinc-400 font-medium tracking-wide mt-1">Configuración general y permisos del sistema</p>
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

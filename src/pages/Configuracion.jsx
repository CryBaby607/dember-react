import React from 'react';
import { BarberManagement } from '@/components/configuration/BarberManagement';
import { BusinessHours } from '@/components/configuration/BusinessHours';
import { Settings } from 'lucide-react';

export function Configuracion() {
    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2.5 rounded-xl text-slate-700">
                        <Settings size={28} aria-hidden="true" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Administración</h1>
                        <p className="text-sm text-slate-500 font-medium">Configuración general del sistema y permisos</p>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 p-8 w-full max-w-7xl mx-auto space-y-8 pb-20">

                {/* Module: Business Hours & Barber Management */}
                <section className="flex flex-col gap-8">
                    <BusinessHours />
                    <BarberManagement />
                </section>
            </div>
        </div>
    );
}

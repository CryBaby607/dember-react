import React from 'react';
import { BarberManagement } from '@/components/configuration/BarberManagement';
import { BusinessHours } from '@/components/configuration/BusinessHours';
import { Settings, Shield, Bell } from 'lucide-react';

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

                <div className="border-t border-slate-200 pt-8">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Próximos Módulos</h2>

                    {/* Placeholders for future modules */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/50 border border-slate-200 border-dashed p-6 rounded-xl flex items-start gap-4 hover:bg-slate-50 transition-colors group cursor-not-allowed">
                            <div className="bg-blue-50 p-3 rounded-lg text-blue-400 group-hover:text-blue-500 transition-colors">
                                <Shield size={24} aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-700 group-hover:text-slate-800">Roles y Permisos</h3>
                                <p className="text-sm text-slate-500 mt-1 leading-relaxed">Control granular de acceso para recepcionistas, barberos y administradores.</p>
                                <span className="inline-block mt-3 text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded">En Desarrollo</span>
                            </div>
                        </div>

                        <div className="bg-white/50 border border-slate-200 border-dashed p-6 rounded-xl flex items-start gap-4 hover:bg-slate-50 transition-colors group cursor-not-allowed">
                            <div className="bg-amber-50 p-3 rounded-lg text-amber-400 group-hover:text-amber-500 transition-colors">
                                <Bell size={24} aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-700 group-hover:text-slate-800">Notificaciones</h3>
                                <p className="text-sm text-slate-500 mt-1 leading-relaxed">Configuración de recordatorios por WhatsApp y correo electrónico para clientes.</p>
                                <span className="inline-block mt-3 text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Próximamente</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

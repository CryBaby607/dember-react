import React, { useState } from 'react';
import { useBarbers } from '@/hooks/useBarbers';
import { AddBarberModal } from './AddBarberModal';
import { UserPlus, Power, PowerOff, Loader2, Search, Filter, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

import { es } from 'date-fns/locale';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';


export function BarberManagement() {
    const { barbers, loading, toggleBarberStatus, deleteBarber, refreshBarbers } = useBarbers();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBarbers = barbers.filter(b =>
        b.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;
    }

    const handleDelete = async (barber) => {
        if (window.confirm(`¿Estás seguro de eliminar a ${barber.full_name}? Esta acción no se puede deshacer.`)) {
            await deleteBarber(barber.id);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header / Actions */}
            <div className="p-8 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">Equipo de Barberos</h3>
                    <p className="text-sm text-slate-500 mt-1">Gestiona el acceso y estado de los profesionales.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} aria-hidden="true" />
                        <input
                            type="text"
                            placeholder="Buscar profesional..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-700 focus-visible:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 w-full sm:w-64 transition-all duration-300 placeholder:text-slate-400 hover:border-slate-400"
                            aria-label="Buscar barbero"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide shadow-[0_0_15px_-3px_rgba(79,70,229,0.4)] hover:shadow-[0_0_20px_-3px_rgba(79,70,229,0.5)] transition-all duration-300 active:scale-95 border border-indigo-400/20"
                    >
                        <UserPlus size={16} aria-hidden="true" className="transition-transform group-hover:scale-110" />
                        <span className="hidden sm:inline">Nuevo Barbero</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                        <tr>
                            <th className="px-8 py-5 pl-8">Profesional</th>
                            <th className="px-6 py-5">Estado</th>
                            <th className="px-6 py-5">Fecha Registro</th>
                            <th className="px-8 py-5 text-right pr-8">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredBarbers.map((barber) => (
                            <tr key={barber.id} className="group hover:bg-slate-50 transition-colors duration-200">
                                <td className="px-8 py-5 pl-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm border border-slate-300 shadow-sm">
                                            {barber.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{barber.full_name}</p>
                                            <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {barber.id.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border ${barber.is_active
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                        : 'bg-slate-100 text-slate-500 border-slate-300'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${barber.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`}></span>
                                        {barber.is_active ? 'ACTIVO' : 'INACTIVO'}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-slate-500 font-medium text-xs">
                                    {format(new Date(barber.created_at), "d MMM, yyyy", { locale: es })}
                                </td>
                                <td className="px-8 py-5 text-right pr-8">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            onClick={() => toggleBarberStatus(barber.id, barber.is_active)}
                                            className={`p-2 rounded-lg transition-all duration-200 border ${barber.is_active
                                                ? 'bg-white border-slate-300 text-slate-400 hover:text-amber-500 hover:border-amber-400 hover:bg-amber-50'
                                                : 'bg-emerald-50 border-emerald-200 text-emerald-500 hover:bg-emerald-100'
                                                }`}
                                            title={barber.is_active ? "Desactivar acceso" : "Reactivar acceso"}
                                        >
                                            {barber.is_active ? <PowerOff size={16} /> : <Power size={16} />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(barber)}
                                            className="p-2 rounded-lg bg-white border border-slate-300 text-slate-400 hover:text-rose-500 hover:border-rose-400 hover:bg-rose-50 transition-all duration-200"
                                            title="Eliminar profesional"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredBarbers.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-0">
                                    <div className="py-12 flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                            <Search className="text-slate-400" size={24} />
                                        </div>
                                        <h3 className="text-slate-700 font-bold mb-1">No se encontraron resultados</h3>
                                        <p className="text-slate-500 text-sm max-w-xs mx-auto">
                                            {searchTerm ? `No hay barberos que coincidan con "${searchTerm}"` : "Aún no has registrado ningún barbero en el sistema."}
                                        </p>
                                        {!searchTerm && (
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="mt-4 text-indigo-400 hover:text-indigo-300 font-bold text-sm hover:underline"
                                            >
                                                Registrar el primero
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <AddBarberModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={refreshBarbers}
            />
        </div>
    );
}

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
        <div className="bg-[#18181B] rounded-2xl shadow-2xl border border-white/5 overflow-hidden">
            {/* Header / Actions */}
            <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h3 className="text-lg font-bold text-zinc-100 tracking-tight">Equipo de Barberos</h3>
                    <p className="text-sm text-zinc-400 mt-1">Gestiona el acceso y estado de los profesionales.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} aria-hidden="true" />
                        <input
                            type="text"
                            placeholder="Buscar profesional..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 pr-4 py-2.5 bg-[#09090b] border border-zinc-800 rounded-xl text-sm text-zinc-200 focus-visible:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 w-full sm:w-64 transition-all duration-300 placeholder:text-zinc-600 hover:border-zinc-700"
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
                    <thead className="bg-[#09090b]/50 text-zinc-500 uppercase text-[11px] font-bold tracking-wider border-b border-white/5">
                        <tr>
                            <th className="px-8 py-5 pl-8">Profesional</th>
                            <th className="px-6 py-5">Estado</th>
                            <th className="px-6 py-5">Fecha Registro</th>
                            <th className="px-8 py-5 text-right pr-8">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredBarbers.map((barber) => (
                            <tr key={barber.id} className="group hover:bg-white/[0.02] transition-colors duration-200">
                                <td className="px-8 py-5 pl-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-300 flex items-center justify-center font-bold text-sm border border-white/5 shadow-inner ring-1 ring-white/5">
                                            {barber.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-zinc-200 group-hover:text-white transition-colors">{barber.full_name}</p>
                                            <p className="text-xs text-zinc-500 font-mono mt-0.5">ID: {barber.id.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border ${barber.is_active
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_-4px_rgba(16,185,129,0.3)]'
                                        : 'bg-zinc-800/50 text-zinc-500 border-zinc-700'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${barber.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`}></span>
                                        {barber.is_active ? 'ACTIVO' : 'INACTIVO'}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-zinc-400 font-medium text-xs">
                                    {format(new Date(barber.created_at), "d MMM, yyyy", { locale: es })}
                                </td>
                                <td className="px-8 py-5 text-right pr-8">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            onClick={() => toggleBarberStatus(barber.id, barber.is_active)}
                                            className={`p-2 rounded-lg transition-all duration-200 border ${barber.is_active
                                                ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/10'
                                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                                }`}
                                            title={barber.is_active ? "Desactivar acceso" : "Reactivar acceso"}
                                        >
                                            {barber.is_active ? <PowerOff size={16} /> : <Power size={16} />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(barber)}
                                            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition-all duration-200"
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
                                        <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                                            <Search className="text-zinc-600" size={24} />
                                        </div>
                                        <h3 className="text-zinc-300 font-bold mb-1">No se encontraron resultados</h3>
                                        <p className="text-zinc-500 text-sm max-w-xs mx-auto">
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

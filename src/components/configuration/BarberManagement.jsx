import React, { useState } from 'react';
import { useBarbers } from '@/hooks/useBarbers';
import { AddBarberModal } from './AddBarberModal';
import { UserPlus, Power, PowerOff, Loader2, Search, Filter, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function BarberManagement() {
    const { barbers, loading, toggleBarberStatus, deleteBarber, refreshBarbers } = useBarbers();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBarbers = barbers.filter(b =>
        b.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;
    }

    const handleDelete = async (barber) => {
        if (window.confirm(`¿Estás seguro de eliminar a ${barber.full_name}? Esta acción no se puede deshacer.`)) {
            await deleteBarber(barber.id);
        }
    };



    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header / Actions */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Equipo de Barberos</h3>
                    <p className="text-sm text-slate-500 mt-1">Gestiona el personal y sus accesos</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} aria-hidden="true" />
                        <input
                            type="text"
                            placeholder="Buscar barbero…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus-visible:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full sm:w-64 transition-colors"
                            aria-label="Buscar barbero"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-md shadow-slate-900/10 active:scale-95"
                    >
                        <UserPlus size={16} aria-hidden="true" />
                        <span className="hidden sm:inline">Nuevo Barbero</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/50 text-slate-500 uppercase text-xs font-semibold tracking-wider border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 pl-8">Profesional</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4">Fecha Registro</th>
                            <th className="px-6 py-4 text-right pr-8">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredBarbers.map((barber) => (
                            <tr key={barber.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-6 py-4 pl-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
                                            {barber.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-700">{barber.full_name}</p>
                                            <p className="text-xs text-slate-400">ID: {barber.id.slice(0, 8)}...</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${barber.is_active
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${barber.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                        {barber.is_active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 font-medium">
                                    {format(new Date(barber.created_at), "d MMM, yyyy", { locale: es })}
                                </td>
                                <td className="px-6 py-4 text-right pr-8">
                                    <button
                                        onClick={() => toggleBarberStatus(barber.id, barber.is_active)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 border ${barber.is_active
                                            ? 'bg-white border-slate-200 text-slate-600 hover:border-red-200 hover:text-red-600 hover:bg-red-50'
                                            : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                            }`}
                                        title={barber.is_active ? "Desactivar acceso" : "Reactivar acceso"}
                                    >
                                        {barber.is_active ? (
                                            <>
                                                <PowerOff size={14} />
                                                <span className="group-hover:inline hidden">Desactivar</span>
                                            </>
                                        ) : (
                                            <>
                                                <Power size={14} /> Reactivar
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(barber)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 border bg-white border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-600 hover:bg-red-50 ml-2"
                                        title="Eliminar barbero"
                                        aria-label={`Eliminar a ${barber.full_name}`}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredBarbers.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="bg-slate-50 p-3 rounded-full">
                                            <Search size={24} className="opacity-50" />
                                        </div>
                                        <p>No se encontraron barberos</p>
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

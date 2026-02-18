import React, { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { LayoutGrid, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function BusinessHours() {
    const { settings, loading, updateSettings } = useSettings();
    const [formData, setFormData] = useState({
        opening_time: '08:00',
        closing_time: '20:00',
        slot_interval: 30
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (settings) {
            setFormData({
                opening_time: settings.opening_time || '08:00',
                closing_time: settings.closing_time || '20:00',
                slot_interval: settings.slot_interval || 30
            });
        }
    }, [settings]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.opening_time >= formData.closing_time) {
            toast.error('La hora de apertura debe ser antes que la de cierre');
            return;
        }

        setIsSaving(true);
        try {
            await updateSettings(formData);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-500" aria-hidden="true" /></div>;
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-200 flex flex-col gap-2">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                    Horarios de Atención
                </h3>
                <p className="text-sm text-slate-500">
                    Define el rango operativo de la agenda y la duración de los bloques.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Opening Time */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">
                        Apertura
                    </label>
                    <div className="relative group">
                        <input
                            type="time"
                            value={formData.opening_time}
                            onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus-visible:outline-none transition-all duration-300 group-hover:border-slate-400"
                        />
                    </div>
                </div>

                {/* Closing Time */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">
                        Cierre
                    </label>
                    <div className="relative group">
                        <input
                            type="time"
                            value={formData.closing_time}
                            onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus-visible:outline-none transition-all duration-300 group-hover:border-slate-400"
                        />
                    </div>
                </div>

                {/* Slot Interval */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1 flex items-center gap-2">
                        <LayoutGrid size={14} className="text-slate-400" />
                        Intervalo
                    </label>
                    <div className="relative group">
                        <select
                            value={formData.slot_interval}
                            onChange={(e) => setFormData({ ...formData, slot_interval: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus-visible:outline-none transition-all duration-300 appearance-none group-hover:border-slate-400"
                            style={{ backgroundImage: 'none' }}
                        >
                            <option value={15}>15 minutos</option>
                            <option value={20}>20 minutos</option>
                            <option value={30}>30 minutos</option>
                            <option value={45}>45 minutos</option>
                            <option value={60}>1 hora (60 min)</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="md:col-span-3 flex justify-end pt-6 border-t border-slate-200">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm tracking-wide shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                <span className="opacity-80">Guardando...</span>
                            </>
                        ) : (
                            <>
                                <Save size={18} className="text-white transition-transform group-hover:scale-110" />
                                <span>Guardar Cambios</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

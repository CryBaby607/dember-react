import React, { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Clock, LayoutGrid, Save, Loader2, CheckCircle2 } from 'lucide-react';
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
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-600" aria-hidden="true" /></div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
            <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="text-indigo-600" size={20} aria-hidden="true" />
                    Horarios de Atención
                </h3>
                <p className="text-sm text-slate-500 mt-1">Configura el rango operativo de la agenda y la duración de los bloques.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Opening Time */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Hora de Apertura</label>
                    <input
                        type="time"
                        value={formData.opening_time}
                        onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus-visible:outline-none transition-colors"
                    />
                </div>

                {/* Closing Time */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Hora de Cierre</label>
                    <input
                        type="time"
                        value={formData.closing_time}
                        onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus-visible:outline-none transition-colors"
                    />
                </div>

                {/* Slot Interval */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <LayoutGrid size={16} className="text-slate-400" aria-hidden="true" />
                        Intervalo de Citas
                    </label>
                    <select
                        value={formData.slot_interval}
                        onChange={(e) => setFormData({ ...formData, slot_interval: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus-visible:outline-none transition-colors bg-white"
                    >
                        <option value={15}>15 minutos</option>
                        <option value={20}>20 minutos</option>
                        <option value={30}>30 minutos</option>
                        <option value={45}>45 minutos</option>
                        <option value={60}>1 hora (60 min)</option>
                    </select>
                </div>

                {/* Actions */}
                <div className="md:col-span-3 flex justify-end pt-4 border-t border-slate-100">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-md active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Guardar Cambios
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

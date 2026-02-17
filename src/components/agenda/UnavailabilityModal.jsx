import React, { useState, useEffect } from 'react';
import { X, Clock, User, AlertCircle, Ban, Check } from 'lucide-react';
import { format, addMinutes, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { fromZoned } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export function UnavailabilityModal({ isOpen, onClose, onSave, date, barbers = [] }) {
    const [selectedBarberId, setSelectedBarberId] = useState('');
    const [startTime, setStartTime] = useState('13:00');
    const [endTime, setEndTime] = useState('14:00');
    const [reason, setReason] = useState('');
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setSelectedBarberId('');
            setStartTime('13:00');
            setEndTime('14:00'); // Default 1 hour lunch?
            setReason('');
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!selectedBarberId) {
            setError('Selecciona un barbero');
            return;
        }
        if (!reason.trim()) {
            setError('Indica una razón (ej. Comida)');
            return;
        }
        if (startTime >= endTime) {
            setError('La hora de fin debe ser posterior a la de inicio');
            return;
        }

        // Construct full timestamps
        const startDateTime = new Date(date);
        const [startH, startM] = startTime.split(':');
        startDateTime.setHours(parseInt(startH), parseInt(startM), 0, 0);

        const endDateTime = new Date(date);
        const [endH, endM] = endTime.split(':');
        endDateTime.setHours(parseInt(endH), parseInt(endM), 0, 0);

        // Convert Zoned dates to UTC for backend
        const startUTC = fromZoned(startDateTime);
        const endUTC = fromZoned(endDateTime);

        setIsSaving(true);
        try {
            await onSave({
                barber_id: selectedBarberId,
                start_time: startUTC.toISOString(),
                end_time: endUTC.toISOString(),
                reason: reason
            });
            onClose();
        } catch (err) {
            console.error(err);
            // Error handling is done in parent, but we might catch specific messages here if passed back
            // For now, parent handles toast/error display or re-throws?
            // Ideally parent catches. But if parent throws, we want to show error here.
            // Let's assume parent handles `toast` but we want to show inline error if it's a conflict "P0002"
            if (err.message && err.message.includes('No se puede bloquear')) {
                setError(err.message);
            } else if (err.code === 'P0002') {
                setError('No se puede bloquear: Ya existen citas en este horario.');
            } else {
                setError('Error al guardar bloqueo.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" style={{ overscrollBehavior: 'contain' }}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200">
                {/* Header */}
                <div className="bg-gray-800 px-6 py-4 flex items-center justify-between text-white">
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Ban size={18} className="text-red-400" />
                            Bloquear Horario
                        </h3>
                        <p className="text-gray-300 text-xs mt-0.5 flex items-center gap-1">
                            {format(date, "EEEE d 'de' MMMM", { locale: es })}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full" aria-label="Cerrar">
                        <X size={20} aria-hidden="true" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Barber Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Barbero</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                value={selectedBarberId}
                                onChange={(e) => setSelectedBarberId(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors focus-visible:outline-none appearance-none cursor-pointer"
                            >
                                <option value="">Seleccionar barbero...</option>
                                {barbers.map(b => (
                                    <option key={b.id} value={b.id}>{b.full_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Desde</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full pl-10 pr-2 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 transition-colors focus-visible:outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Hasta</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full pl-10 pr-2 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 transition-colors focus-visible:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Razón</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Ej. Comida, Trámite personal…"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 transition-colors focus-visible:outline-none h-20 resize-none"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2 border border-red-100 animate-in slide-in-from-top-2">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-slate-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 px-4 py-2.5 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors shadow-md shadow-gray-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <>Guardando…</>
                            ) : (
                                <>
                                    <Check size={18} />
                                    Confirmar Bloqueo
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

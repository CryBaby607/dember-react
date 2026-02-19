import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { X, Clock, User, Scissors, Check, AlertCircle, Play, CheckCircle, Ban, Calendar, Edit2, Save, Trash2 } from 'lucide-react';
import { format, addMinutes, parseISO, areIntervalsOverlapping } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { toZoned, TIMEZONE, formatZoned, normalizeToMinute } from '@/lib/dateUtils';
import { formatTime } from '@/utils/formatTime';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { BOOKING_STATUS, STATUS_CONFIG } from '@/constants/bookingStatus';

import { useServices } from '@/hooks/useServices';

export function AppointmentModal({ isOpen, onClose, onSave, onStatusChange, initialData, existingBookings = [], barbers = [] }) {
    const [clientName, setClientName] = useState('');
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [pendingAction, setPendingAction] = useState(null); // 'complete' | 'cancel' | null
    const actionLock = useRef(false); // Synchronous guard against double-click

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [selectedBarberId, setSelectedBarberId] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    // Mode: 'create' or 'view'
    const isViewMode = initialData?.bookingId !== undefined;
    const booking = useMemo(() =>
        isViewMode ? existingBookings.find(b => b.id === initialData.bookingId) : null
        , [isViewMode, existingBookings, initialData]);

    const { services } = useServices();

    const activeServices = useMemo(() =>
        services.filter(s => s.is_active || (isViewMode && s.id === booking?.service_id))
        , [services, isViewMode, booking]);

    // Reset form when opening
    useEffect(() => {
        if (isOpen) {
            setError(null);
            setIsEditing(false);
            setPendingAction(null);

            if (isViewMode && booking) {
                setClientName(booking.client_name || booking.clients?.full_name || '');
                setSelectedServiceId(booking.service_id);

                // Initialize Edit State from Booking
                setSelectedBarberId(booking.barber_id);
                const zonedStart = toZoned(parseISO(booking.start_time));
                setSelectedDate(format(zonedStart, 'yyyy-MM-dd'));
                setSelectedTime(format(zonedStart, 'HH:mm'));

            } else {
                setClientName('');
                setSelectedServiceId('');

                // Initialize from Slot
                if (initialData) {
                    setSelectedBarberId(initialData.barber.id);
                    const zTime = toZoned(initialData.time);
                    setSelectedDate(format(zTime, 'yyyy-MM-dd'));
                    setSelectedTime(format(zTime, 'HH:mm'));
                }
            }
        }
    }, [isOpen, isViewMode, booking, initialData]);

    // --- ALL HOOKS MUST BE ABOVE ANY CONDITIONAL RETURN ---

    // Data Prep (safe even when initialData is null)
    const currentBarber = isEditing
        ? barbers.find(b => b.id === selectedBarberId) || initialData?.barber
        : initialData?.barber || null;

    // Calculate Start Time (Real UTC)
    const startTime = useMemo(() => {
        if (isEditing) {
            if (selectedDate && selectedTime) {
                return fromZonedTime(`${selectedDate} ${selectedTime}`, TIMEZONE);
            } else {
                return new Date();
            }
        } else {
            return isViewMode && booking ? parseISO(booking.start_time) : (initialData?.time ? new Date(initialData.time) : new Date());
        }
    }, [isEditing, selectedDate, selectedTime, isViewMode, booking, initialData]);

    const service = useMemo(() => services.find(s => s.id === selectedServiceId), [services, selectedServiceId]);

    const duration = useMemo(() =>
        isViewMode && booking ? booking.duration_minutes : (service ? service.duration_minutes : 0)
        , [isViewMode, booking, service]);

    const endTime = useMemo(() =>
        duration ? addMinutes(startTime, duration) : startTime
        , [startTime, duration]);

    // Handlers
    const handleUpdate = useCallback(async () => {
        if (!booking || actionLock.current) return;
        actionLock.current = true;
        setError(null);
        setIsSaving(true);

        try {
            if (!selectedBarberId) throw new Error('Selecciona un barbero');
            if (!selectedDate || !selectedTime) throw new Error('Define fecha y hora');

            const utcStart = normalizeToMinute(startTime);
            const utcEnd = normalizeToMinute(endTime);

            const { error: rpcError } = await supabase.rpc('update_booking_safe', {
                p_booking_id: booking.id,
                p_barber_id: selectedBarberId,
                p_start_time: utcStart.toISOString(),
                p_end_time: utcEnd.toISOString(),
                p_client_name: clientName.trim() || null,
                p_service_id: selectedServiceId || null
            });

            if (rpcError) {
                if (rpcError.code === 'P0001') throw new Error(rpcError.message);
                if (rpcError.code === '23P01') throw new Error('Conflicto: Ya existe una cita en este horario.');
                if (rpcError.code === 'P0004') throw new Error(rpcError.message);
                throw rpcError;
            }

            if (onStatusChange) onStatusChange();
            setIsEditing(false);
            onClose();

        } catch (err) {
            console.error('Update Error:', err);
            setError(err.message || 'Error al actualizar');
        } finally {
            setIsSaving(false);
            actionLock.current = false;
        }
    }, [booking, selectedBarberId, selectedDate, selectedTime, startTime, endTime, clientName, selectedServiceId, onStatusChange, onClose]);


    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        // Edit mode — delegate entirely to handleUpdate (it manages its own lock)
        if (isEditing) {
            await handleUpdate();
            return;
        }

        if (actionLock.current) return;
        actionLock.current = true;

        if (isViewMode) {
            actionLock.current = false;
            return;
        }

        setError(null);

        if (!clientName.trim()) {
            setError('El nombre del cliente es obligatorio');
            return;
        }
        if (!selectedServiceId) {
            setError('Debes seleccionar un servicio');
            return;
        }

        const utcStart = normalizeToMinute(startTime);
        const utcEnd = normalizeToMinute(endTime);

        const blockingBookings = existingBookings.filter(b =>
            b.status === 'scheduled' || b.status === 'in_progress'
        );

        const hasConflict = blockingBookings.some(b => {
            if (b.barber_id !== currentBarber?.id) return false;
            const bookingStart = parseISO(b.start_time);
            const bookingDuration = b.duration_minutes || 30;
            const bookingEnd = addMinutes(bookingStart, bookingDuration);

            return areIntervalsOverlapping(
                { start: utcStart, end: utcEnd },
                { start: bookingStart, end: bookingEnd }
            );
        });

        if (hasConflict) {
            setError('El barbero ya tiene una cita en este horario.');
            return;
        }

        const appointmentData = {
            barber_id: currentBarber.id,
            client_name: clientName,
            service_id: selectedServiceId,
            price_at_booking: service.price,
            start_time: utcStart.toISOString(),
            end_time: utcEnd.toISOString(),
            duration_minutes: duration,
            status: 'scheduled'
        };

        setIsSaving(true);
        try {
            await onSave(appointmentData);
            onClose();
        } catch (err) {
            setError('Error al guardar la cita');
            console.error(err);
        } finally {
            setIsSaving(false);
            actionLock.current = false;
        }
    }, [isSaving, isEditing, handleUpdate, isViewMode, clientName, selectedServiceId, startTime, endTime, existingBookings, currentBarber, service, duration, onSave, onClose]);


    // State Transition Handlers
    const handleStatusAction = useCallback(async (action) => {
        if (!booking || actionLock.current) return;

        // Require confirmation for destructive actions
        if ((action === 'complete' || action === 'cancel') && pendingAction !== action) {
            setPendingAction(action);
            return;
        }

        actionLock.current = true;
        setPendingAction(null);
        setIsSaving(true);
        try {
            let rpcName = '';
            if (action === 'start') rpcName = 'start_booking';
            if (action === 'complete') rpcName = 'complete_booking';
            if (action === 'cancel') rpcName = 'cancel_booking';

            const { error } = await supabase.rpc(rpcName, { p_booking_id: booking.id });
            if (error) throw error;

            if (onStatusChange) onStatusChange();
            onClose();
        } catch (err) {
            console.error(`Error executing ${action}:`, err);
            setError(err.message || 'Error al actualizar el estado');
        } finally {
            setIsSaving(false);
            actionLock.current = false;
        }
    }, [booking, isSaving, pendingAction, onStatusChange, onClose]);

    // Delete Handler
    const handleDelete = useCallback(async () => {
        if (!booking || actionLock.current) return;

        // Require confirmation first
        if (pendingAction !== 'delete') {
            setPendingAction('delete');
            return;
        }

        actionLock.current = true;
        setPendingAction(null);
        setIsSaving(true);
        try {
            const { error } = await supabase.rpc('delete_booking_safe', { p_booking_id: booking.id });
            if (error) {
                if (error.code === 'P0003') throw new Error('Cita no encontrada.');
                if (error.code === 'P0004') throw new Error(error.message);
                throw error;
            }

            if (onStatusChange) onStatusChange();
            onClose();
        } catch (err) {
            console.error('Delete Error:', err);
            setError(err.message || 'Error al eliminar la cita');
        } finally {
            setIsSaving(false);
            actionLock.current = false;
        }
    }, [booking, isSaving, pendingAction, onStatusChange, onClose]);

    // --- EARLY RETURN AFTER ALL HOOKS ---
    if (!isOpen || !initialData) return null;

    // Derived Status Props
    const status = booking?.status || BOOKING_STATUS.NEW;
    const isReadOnly = isViewMode;
    const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG[BOOKING_STATUS.SCHEDULED];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" style={{ overscrollBehavior: 'contain' }}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className={cn(
                    "px-6 py-4 flex items-center justify-between text-white transition-colors",
                    statusConfig.modal.headerBg
                )}>
                    <div>
                        <h3 className="font-bold text-lg">
                            {status === BOOKING_STATUS.NEW ? 'Nueva Cita' : statusConfig.modalLabel || statusConfig.label}
                        </h3>
                        <p className={cn("text-xs mt-0.5 flex items-center gap-1",
                            statusConfig.modal.subText
                        )}>
                            {isEditing ? (
                                <span className={cn("text-xs flex items-center gap-1 px-2 py-0.5 rounded",
                                    statusConfig.modal.badge
                                )}>
                                    <Edit2 size={10} /> Editando
                                </span>
                            ) : (
                                <>
                                    <Clock size={12} />
                                    {formatZoned(startTime, "EEEE d 'de' MMMM")} • {formatTime(startTime)}
                                </>
                            )}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full" aria-label="Cerrar">
                        <X size={20} aria-hidden="true" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Barber Info or Selection */}
                    {isEditing ? (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Barbero</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    value={selectedBarberId}
                                    onChange={(e) => setSelectedBarberId(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors focus-visible:outline-none"
                                >
                                    {barbers.map(b => (
                                        <option key={b.id} value={b.id}>{b.full_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                                {currentBarber?.full_name?.charAt(0) || 'B'}
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium uppercase">Barbero asignado</p>
                                <p className="font-semibold text-slate-800">{currentBarber?.full_name || 'Desconocido'}</p>
                            </div>
                        </div>
                    )}

                    {/* Date & Time Selection (Editing Only) */}
                    {isEditing && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full pl-10 pr-2 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors focus-visible:outline-none text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Hora</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="time"
                                        value={selectedTime}
                                        onChange={(e) => setSelectedTime(e.target.value)}
                                        className="w-full pl-10 pr-2 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors focus-visible:outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Client Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder="Nombre del cliente…"
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors focus-visible:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                autoFocus={!isReadOnly && !('ontouchstart' in window)}
                                disabled={isReadOnly && !isEditing}
                            />
                        </div>
                    </div>

                    {/* Service Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Servicio</label>
                        <div className="relative">
                            <Scissors className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                value={selectedServiceId}
                                onChange={(e) => setSelectedServiceId(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors focus-visible:outline-none appearance-none disabled:bg-gray-100 disabled:text-gray-500"
                                disabled={isReadOnly && !isEditing}
                            >
                                <option value="">Seleccionar servicio...</option>
                                {activeServices.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} ({s.duration_minutes} min) - ${s.price}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Summary & Validation */}
                    {service && (
                        <div className={cn(
                            "p-3 rounded-lg border flex justify-between items-center text-sm",
                            status === 'cancelled' ? "bg-gray-50 border-gray-200 text-gray-500" : "bg-indigo-50 border-indigo-100"
                        )}>
                            <span className={cn("font-medium", status !== 'cancelled' && "text-indigo-700")}>Horario estimado:</span>
                            <span className={cn("font-bold", status !== 'cancelled' && "text-indigo-900")}>
                                {formatTime(startTime)} - {formatTime(endTime)}
                            </span>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2 border border-red-100 animate-in slide-in-from-top-2">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Actions Toolbar */}
                    <div className="pt-2 flex flex-col gap-2">
                        {status === BOOKING_STATUS.NEW && (
                            <div className="flex gap-3">
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
                                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? "Guardando…" : <><Check size={18} aria-hidden="true" /> Confirmar Cita</>}
                                </button>
                            </div>
                        )}

                        {/* Edit Actions */}
                        {isEditing && (
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-slate-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-[2] px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? "Guardando…" : <><Save size={18} aria-hidden="true" /> Guardar Cambios</>}
                                </button>
                            </div>
                        )}

                        {status === BOOKING_STATUS.SCHEDULED && !isEditing && (
                            pendingAction === 'cancel' ? (
                                <div className="space-y-2">
                                    <div className="text-center py-2 px-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm font-medium text-red-700">¿Cancelar esta cita?</p>
                                        <p className="text-xs text-red-500 mt-0.5">Esta acción no se puede deshacer.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPendingAction(null)}
                                            disabled={isSaving}
                                            className="px-4 py-2.5 bg-white border border-gray-200 text-slate-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            Volver
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleStatusAction('cancel')}
                                            disabled={isSaving}
                                            className="px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-md shadow-red-200 flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Ban size={16} />} Confirmar
                                        </button>
                                    </div>
                                </div>
                            ) : pendingAction === 'delete' ? (
                                <div className="space-y-2">
                                    <div className="text-center py-2 px-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm font-medium text-red-700">¿Estás seguro de que deseas eliminar esta cita?</p>
                                        <p className="text-xs text-red-500 mt-0.5">Esta acción no se puede deshacer.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPendingAction(null)}
                                            disabled={isSaving}
                                            className="px-4 py-2.5 bg-white border border-gray-200 text-slate-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            disabled={isSaving}
                                            className="px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-md shadow-red-200 flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 size={16} />} Eliminar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleStatusAction('cancel')}
                                            disabled={isSaving}
                                            className="px-3 py-2.5 bg-white border border-gray-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            <Ban size={16} /> Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(true)}
                                            disabled={isSaving}
                                            className="px-3 py-2.5 bg-white border border-gray-200 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Edit2 size={16} /> Editar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleStatusAction('start')}
                                            disabled={isSaving}
                                            className="col-span-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play size={18} />} Iniciar Cita
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={isSaving}
                                        className="w-full px-3 py-2 bg-white border border-red-200 text-red-500 font-medium rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        <Trash2 size={14} /> Eliminar
                                    </button>
                                </div>
                            )
                        )}

                        {status === BOOKING_STATUS.IN_PROGRESS && (
                            pendingAction === 'complete' ? (
                                <div className="space-y-2">
                                    <div className="text-center py-2 px-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                        <p className="text-sm font-medium text-emerald-700">¿Finalizar esta cita?</p>
                                        <p className="text-xs text-emerald-500 mt-0.5">El servicio será marcado como completado.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPendingAction(null)}
                                            disabled={isSaving}
                                            className="px-4 py-2.5 bg-white border border-gray-200 text-slate-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            Volver
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleStatusAction('complete')}
                                            disabled={isSaving}
                                            className="px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200 flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={18} />} Confirmar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleStatusAction('complete')}
                                    disabled={isSaving}
                                    className="w-full px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle size={18} /> Finalizar Cita
                                </button>
                            )
                        )}

                        {(status === BOOKING_STATUS.COMPLETED || status === BOOKING_STATUS.CANCELLED) && (
                            pendingAction === 'delete' ? (
                                <div className="space-y-2">
                                    <div className="text-center py-2 px-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm font-medium text-red-700">¿Estás seguro de que deseas eliminar esta cita?</p>
                                        <p className="text-xs text-red-500 mt-0.5">Esta acción no se puede deshacer.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPendingAction(null)}
                                            disabled={isSaving}
                                            className="px-4 py-2.5 bg-white border border-gray-200 text-slate-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            disabled={isSaving}
                                            className="px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-md shadow-red-200 flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 size={16} />} Eliminar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={isSaving}
                                        className="px-3 py-2.5 bg-white border border-red-200 text-red-500 font-medium rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2.5 bg-gray-100 text-slate-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                </form>
            </div >
        </div >
    );
}

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
// useRef saveLock is used as synchronous guard against double-click race conditions
import { X, Clock, User, Check, Loader2 } from 'lucide-react';
import { format, addMinutes } from 'date-fns';
import { toZoned, normalizeToMinute } from '@/lib/dateUtils';
import { formatTime } from '@/utils/formatTime';
import { cn } from '@/lib/utils';
import { useServices } from '@/hooks/useServices';

// --- Panel Position Calculator ---
function calcPanelPosition(rect, panelWidth = 340, panelMaxHeight = 480) {
    if (!rect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = 12;

    // Prefer right side of the slot
    let left = rect.right + gap;
    if (left + panelWidth > vw - 16) {
        // Not enough space right → try left
        left = rect.left - panelWidth - gap;
    }
    if (left < 16) left = 16; // Clamp

    // Vertical: align top of panel with top of slot
    let top = rect.top;
    if (top + panelMaxHeight > vh - 16) {
        top = vh - panelMaxHeight - 16;
    }
    if (top < 16) top = 16;

    return { top: `${top}px`, left: `${left}px` };
}

// --- Service Chip ---
const ServiceChip = React.memo(function ServiceChip({ service, isSelected, onSelect }) {
    return (
        <button
            type="button"
            onClick={() => onSelect(service.id)}
            className={cn(
                "flex flex-col items-start p-3 rounded-lg border-2 transition-all duration-150 text-left cursor-pointer",
                "min-h-[56px]",
                isSelected
                    ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500/20 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            )}
        >
            <span className={cn(
                "text-sm font-semibold leading-tight truncate w-full",
                isSelected ? "text-indigo-700" : "text-slate-800"
            )}>
                {service.name}
            </span>
            <span className={cn(
                "text-[11px] font-medium mt-0.5",
                isSelected ? "text-indigo-500" : "text-slate-400"
            )}>
                {service.duration_minutes} min · ${service.price}
            </span>
        </button>
    );
});

// --- Quick Create Panel ---
export function QuickCreatePanel({ isOpen, onClose, barber, time, anchorRect, onSave }) {
    const [clientName, setClientName] = useState('');
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const saveLock = useRef(false);
    const [panelPos, setPanelPos] = useState(null);

    const panelRef = useRef(null);
    const inputRef = useRef(null);

    const { services } = useServices();
    const activeServices = useMemo(() => services.filter(s => s.is_active), [services]);
    const selectedService = useMemo(() => services.find(s => s.id === selectedServiceId), [services, selectedServiceId]);

    // Reset & position when opening
    useEffect(() => {
        if (isOpen) {
            setClientName('');
            setSelectedServiceId('');
            setError(null);
            setIsSaving(false);
            setPanelPos(calcPanelPosition(anchorRect));

            // Autofocus with slight delay for animation
            requestAnimationFrame(() => {
                inputRef.current?.focus();
            });
        }
    }, [isOpen, anchorRect]);

    // Click outside to close
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                onClose();
            }
        };

        // Use mousedown for immediate response
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // ESC to close
    useEffect(() => {
        if (!isOpen) return;
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const handleConfirm = useCallback(async () => {
        if (saveLock.current || !clientName.trim() || !selectedService) return;
        saveLock.current = true;

        setError(null);
        setIsSaving(true);

        try {
            const utcStart = normalizeToMinute(new Date(time));
            const utcEnd = normalizeToMinute(addMinutes(utcStart, selectedService.duration_minutes));

            const appointmentData = {
                barber_id: barber.id,
                client_name: clientName.trim(),
                service_id: selectedServiceId,
                price_at_booking: selectedService.price,
                start_time: utcStart.toISOString(),
                end_time: utcEnd.toISOString(),
                duration_minutes: selectedService.duration_minutes,
                status: 'scheduled'
            };

            await onSave(appointmentData);
            onClose(); // Auto-close on success
        } catch (err) {
            // Error already notified by Agenda.jsx via toast
            // Panel stays open so the user can retry
        } finally {
            setIsSaving(false);
            saveLock.current = false;
        }
    }, [isSaving, clientName, selectedService, selectedServiceId, time, barber, onSave, onClose]);

    const isFormValid = clientName.trim().length > 0 && selectedServiceId;

    if (!isOpen || !barber || !time) return null;

    const zonedTime = toZoned(time);

    return (
        <div className="fixed inset-0 z-50" style={{ background: 'transparent' }}>
            <div
                ref={panelRef}
                className={cn(
                    "fixed w-[min(340px,calc(100vw-120px))] max-h-[min(480px,calc(100vh-32px))] overflow-y-auto",
                    "bg-white rounded-xl shadow-2xl ring-1 ring-slate-900/10",
                    "flex flex-col",
                    "animate-in fade-in slide-in-from-bottom-2 duration-200"
                )}
                style={panelPos || {}}
            >
                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 rounded-t-xl">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                            <Clock size={14} className="text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 tabular-nums">
                                {formatTime(zonedTime)}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium truncate">
                                {barber.full_name}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        aria-label="Cerrar"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col gap-3">
                    {/* Client Name Input */}
                    <div>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                ref={inputRef}
                                type="text"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder="Nombre del cliente"
                                className={cn(
                                    "w-full pl-9 pr-3 py-3 text-sm",
                                    "bg-slate-50 border border-slate-200 rounded-lg",
                                    "focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400",
                                    "transition-colors focus-visible:outline-none",
                                    "placeholder:text-slate-400"
                                )}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && isFormValid) {
                                        e.preventDefault();
                                        handleConfirm();
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Service Chips */}
                    <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Servicio
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {activeServices.map(service => (
                                <ServiceChip
                                    key={service.id}
                                    service={service}
                                    isSelected={selectedServiceId === service.id}
                                    onSelect={setSelectedServiceId}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Summary (when service selected) */}
                    {selectedService && clientName.trim() && (
                        <div className="flex items-center justify-between px-3 py-2 bg-indigo-50/60 border border-indigo-100 rounded-lg text-xs">
                            <span className="text-indigo-600 font-medium">Horario:</span>
                            <span className="text-indigo-800 font-bold tabular-nums">
                                {formatTime(zonedTime)} — {formatTime(addMinutes(zonedTime, selectedService.duration_minutes))}
                            </span>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="px-3 py-2 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Confirm Button */}
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!isFormValid || isSaving}
                        className={cn(
                            "w-full py-3 rounded-lg font-semibold text-sm",
                            "flex items-center justify-center gap-2",
                            "transition-all duration-150",
                            isFormValid && !isSaving
                                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 active:scale-[0.98] cursor-pointer"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        )}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Guardando…
                            </>
                        ) : (
                            <>
                                <Check size={16} />
                                Confirmar Cita
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

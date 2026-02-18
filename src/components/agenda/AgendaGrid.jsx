
import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { format, addMinutes, differenceInMinutes, parseISO, isSameDay, setHours, setMinutes, areIntervalsOverlapping } from 'date-fns';
import { toZoned, now, normalizeToMinute } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { Loader2, PlayCircle, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { BOOKING_STATUS, STATUS_CONFIG } from '@/constants/bookingStatus';
import { DndContext, useSensor, useSensors, MouseSensor, TouchSensor, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { UserX } from 'lucide-react';

// --- Visual Constants ---
const VISUAL_SLOT_HEIGHT = 60;

// --- Draggable Booking Component (Memoized) ---
const DraggableBooking = React.memo(function DraggableBooking({ booking, top, height, onClick, statusClassName, children }) {
    const isDraggable = booking.status === BOOKING_STATUS.SCHEDULED;

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: booking.id,
        data: { ...booking, originalTop: top },
        disabled: !isDraggable,
    });

    const style = {
        top: top,
        height: height - 2,
        transform: CSS.Translate.toString(transform),
        touchAction: 'none', // Required for touch DnD — prevents browser scroll interference
        zIndex: isDragging ? 50 : 10,
        opacity: isDragging ? 0.95 : 1,
        scale: isDragging ? 1.03 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                // Posicionamiento y overflow
                "absolute inset-x-1 overflow-hidden",
                // Estilo base: fondo neutro, borde izq 4px, esquinas derechas redondeadas
                "bg-white rounded-r-md",
                // Profundidad: custom warm shadow para separación del canvas + micro-borde de definición
                "shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-slate-900/5",
                "transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]", // Smooth landing
                // Estado Dragging: Elevación máxima (Tactile Flux)
                isDragging && "shadow-2xl ring-2 ring-indigo-500/20 cursor-grabbing",
                // Feedback táctil: elevación al tocar
                !isDragging && "active:scale-[1.02] cursor-pointer",
                // Estilos dinámicos por estado (border-l color, hover bg, etc.)
                statusClassName
            )}
            onClick={(e) => {
                if (!isDragging) onClick(e);
            }}
        >
            {children}
        </div>
    );
});

// --- Droppable Barber Column (Memoized) ---
const DroppableBarberColumn = React.memo(function DroppableBarberColumn({ barberId, children, className }) {
    const { setNodeRef, isOver } = useDroppable({
        id: barberId,
    });

    return (
        <div ref={setNodeRef} className={cn(className, "transition-colors duration-300 ease-in-out", isOver && "bg-indigo-50/20")}>
            {children}
        </div>
    );
});

// --- Status Icons Map ---
const STATUS_ICONS = {
    PlayCircle: PlayCircle,
    CheckCircle2: CheckCircle2,
    XCircle: XCircle,
    Sparkles: Sparkles,
};

// --- Booking Item Content (Memoized) ---
const BookingItemContent = React.memo(function BookingItemContent({ booking, start, height, config }) {
    const textConfig = config.text || {
        primary: 'text-slate-900',
        secondary: 'text-slate-500',
        tertiary: 'text-slate-400'
    };

    const isShort = booking.duration_minutes < 30;
    const clientName = booking.client_name || booking.clients?.full_name || 'Cita';
    const serviceName = booking.services?.name;

    // Status Icon Resolution
    const IconComponent = config.icon ? STATUS_ICONS[config.icon] : null;

    return (
        <div className={cn(
            "h-full w-full flex relative", // relative for icon positioning
            isShort ? "flex-row items-center px-2 gap-2" : "flex-col justify-center px-2.5 py-1"
        )}>
            {/* Status Icon (Absolute Top-Right for non-short) */}
            {IconComponent && !isShort && (
                <div className="absolute top-1.5 right-1.5 opacity-80">
                    <IconComponent size={14} className={textConfig.secondary} />
                </div>
            )}

            {/* Nivel 1: Nombre del Cliente */}
            <span className={cn(
                "text-sm truncate leading-tight tracking-tight",
                isShort && "flex-1 min-w-0 font-medium",
                textConfig.primary
            )}>
                {clientName}
            </span>

            {/* Nivel 2: Servicio + Hora (citas >= 30min) */}
            {!isShort && (
                <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                    {serviceName && (
                        <span className={cn(
                            "text-[10px] uppercase font-bold tracking-wide truncate",
                            textConfig.secondary
                        )}>
                            {serviceName}
                        </span>
                    )}
                    {serviceName && height > 40 && (
                        <span className="text-[10px] text-slate-300">•</span>
                    )}
                    {height > 40 && (
                        <span className={cn(
                            "text-[10px] font-medium tabular-nums shrink-0",
                            textConfig.tertiary
                        )}>
                            {format(start, 'HH:mm')} · {booking.duration_minutes}m
                        </span>
                    )}
                </div>
            )}

            {/* Versión compacta (<30min): solo hora */}
            {isShort && (
                <span className={cn(
                    "text-xs font-medium tabular-nums shrink-0",
                    textConfig.tertiary
                )}>
                    {format(start, 'HH:mm')}
                </span>
            )}
        </div>
    );
});

// --- Unavailability Item (Memoized) ---
const UnavailabilityItem = React.memo(function UnavailabilityItem({ block, top, height }) {
    return (
        <div
            className="absolute inset-x-0 bg-gray-100/90 border-l-[3px] border-gray-400 z-20 flex flex-col justify-center p-2 cursor-not-allowed shadow-sm"
            style={{
                top,
                height: height - 2,
                backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 10px, transparent 10px, transparent 20px)'
            }}
            title={block.reason}
        >
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider truncate flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                No Disponible
            </div>
            {height > 30 && (
                <div className="text-[10px] text-gray-400 truncate pl-3">
                    {block.reason}
                </div>
            )}
        </div>
    );
});

// --- Current Time Hook ---
const useCurrentTime = (updateInterval = 30000) => {
    const [currentTime, setCurrentTime] = useState(now());
    useEffect(() => {
        const intervalId = setInterval(() => setCurrentTime(now()), updateInterval);
        return () => clearInterval(intervalId);
    }, [updateInterval]);
    return currentTime;
};

// --- Current Time Marker (Pill in Sticky Column) ---
const CurrentTimeMarker = React.memo(function CurrentTimeMarker({ currentTime, startHourStr, endHourStr, pixelsPerMinute }) {
    const currentTotalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const startTotalMinutes = parseInt(startHourStr.split(':')[0]) * 60 + parseInt(startHourStr.split(':')[1]);
    const endTotalMinutes = parseInt(endHourStr.split(':')[0]) * 60 + parseInt(endHourStr.split(':')[1]);

    if (currentTotalMinutes < startTotalMinutes || currentTotalMinutes >= endTotalMinutes) return null;

    const minutesFromStart = currentTotalMinutes - startTotalMinutes;
    const top = minutesFromStart * pixelsPerMinute;

    return (
        <div
            className="absolute left-0 w-full z-30 pointer-events-none flex justify-end items-center pr-0.5"
            style={{ top }}
        >
            <div
                className="w-1.5 h-2.5 bg-rose-500/90 rounded-l-sm rounded-r-md shadow-sm"
                title={format(currentTime, 'HH:mm')}
            />
        </div>
    );
});

// --- Current Time Horizontal Line (Across Grid) ---
const CurrentTimeHorizontalLine = React.memo(function CurrentTimeHorizontalLine({ currentTime, startHourStr, endHourStr, pixelsPerMinute }) {
    const currentTotalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const startTotalMinutes = parseInt(startHourStr.split(':')[0]) * 60 + parseInt(startHourStr.split(':')[1]);
    const endTotalMinutes = parseInt(endHourStr.split(':')[0]) * 60 + parseInt(endHourStr.split(':')[1]);

    if (currentTotalMinutes < startTotalMinutes || currentTotalMinutes >= endTotalMinutes) return null;

    const minutesFromStart = currentTotalMinutes - startTotalMinutes;
    const top = minutesFromStart * pixelsPerMinute;

    return (
        <div
            className="absolute left-0 right-0 z-0 pointer-events-none border-t border-rose-500/30 shadow-[0_1px_0_rgba(255,255,255,0.4)]"
            style={{ top }}
        />
    );
});


export function AgendaGrid({ date, barbers = [], bookings = [], unavailability = [], loading = false, error = null, onSlotClick, onStatusChange }) {

    const { settings, loading: settingsLoading } = useSettings();

    // Default values/fallback
    const startHourStr = settings?.opening_time || '08:00';
    const endHourStr = settings?.closing_time || '20:00';
    const slotInterval = settings?.slot_interval || 30;

    // Time State (Centralized)
    const currentTime = useCurrentTime();
    const isToday = isSameDay(date, new Date());

    // Derived Constants
    const pixelsPerMinute = useMemo(() => VISUAL_SLOT_HEIGHT / slotInterval, [slotInterval]);

    // CSS Grid template for barber columns
    const gridColumns = useMemo(() =>
        `repeat(${barbers.length}, minmax(170px, 1fr))`,
        [barbers.length]
    );

    const timeSlots = useMemo(() => {
        const slots = [];
        if (!settings) return [];

        let currentTime = toZoned(date);
        currentTime = setHours(currentTime, parseInt(startHourStr.split(':')[0]));
        currentTime = setMinutes(currentTime, parseInt(startHourStr.split(':')[1]));

        let endTime = toZoned(date);
        endTime = setHours(endTime, parseInt(endHourStr.split(':')[0]));
        endTime = setMinutes(endTime, parseInt(endHourStr.split(':')[1]));

        while (currentTime < endTime) {
            slots.push(new Date(currentTime));
            currentTime = addMinutes(currentTime, slotInterval).getTime();
        }
        return slots;
    }, [date, settings, startHourStr, endHourStr, slotInterval]);

    // Sensors — Separate MouseSensor + TouchSensor for cross-device support.
    // MouseSensor: distance:8 prevents click-drag conflicts on desktop.
    // TouchSensor: delay:200ms allows normal scroll; drag activates on press-and-hold.
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,
                tolerance: 5,
            },
        })
    );

    // Local state
    const [localBookings, setLocalBookings] = useState(bookings);
    const [isSaving, setIsSaving] = useState(false); // Visual feedback for RPC
    const isUpdating = useRef(false); // Guard for optimistic updates
    const isDraggingLocked = useRef(false); // Prevents concurrent drag RPCs

    useEffect(() => {
        if (!isUpdating.current) {
            setLocalBookings(bookings);
        }
    }, [bookings]);

    // Optimize Booking Rendering: Pre-calculate positions
    const renderableBookings = useMemo(() => {
        const openingDate = toZoned(date);
        openingDate.setHours(parseInt(startHourStr.split(':')[0]), parseInt(startHourStr.split(':')[1]), 0, 0);

        return localBookings.map(booking => {
            const start = toZoned(parseISO(booking.start_time));
            if (!isSameDay(start, date)) return null;

            const minutesFromStart = differenceInMinutes(start, openingDate);
            const top = minutesFromStart * pixelsPerMinute;
            const height = booking.duration_minutes * pixelsPerMinute;

            const status = booking.status || BOOKING_STATUS.SCHEDULED;
            const config = STATUS_CONFIG[status] || STATUS_CONFIG[BOOKING_STATUS.SCHEDULED];

            return { ...booking, _visual: { start, top, height, config } };
        }).filter(Boolean);
    }, [localBookings, date, startHourStr, pixelsPerMinute]);

    // Optimize Unavailability Rendering
    const renderableUnavailability = useMemo(() => {
        const openingDate = toZoned(date);
        openingDate.setHours(parseInt(startHourStr.split(':')[0]), parseInt(startHourStr.split(':')[1]), 0, 0);

        return unavailability.map(block => {
            const start = toZoned(parseISO(block.start_time));
            const end = toZoned(parseISO(block.end_time));
            if (!isSameDay(start, date) && !isSameDay(end, date)) return null;

            const minutesFromStart = differenceInMinutes(start, openingDate);
            const top = minutesFromStart * pixelsPerMinute;
            const duration = differenceInMinutes(end, start);
            const height = duration * pixelsPerMinute;

            return { ...block, _visual: { top, height } };
        }).filter(Boolean);
    }, [unavailability, date, startHourStr, pixelsPerMinute]);


    const handleDragEnd = useCallback(async (event) => {
        const { active, over, delta } = event;

        if (!over || isDraggingLocked.current) return;

        const bookingId = active.id;
        const targetBarberId = over.id;
        const booking = active.data.current;

        const minutesShift = Math.round(delta.y / pixelsPerMinute / slotInterval) * slotInterval;

        if (minutesShift === 0 && booking.barber_id === targetBarberId) return;

        const oldStart = parseISO(booking.start_time);
        const oldEnd = parseISO(booking.end_time);

        const newStart = normalizeToMinute(addMinutes(oldStart, minutesShift));
        const newEnd = normalizeToMinute(addMinutes(oldEnd, minutesShift));

        // Validation against CURRENT local state (ref access would be better but state is ok if updated)
        // Using callback form of setLocalBookings to ensure we check against latest if we were to move logic there,
        // but for validation we need access to state.
        // We can trust `localBookings` from closure if dependency array is correct or we use ref.
        // For `handleDragEnd`, we need it to be recreated when `localBookings` changes OR use a ref.
        // Given complexity, let's just rely on closure capturing `localBookings`.

        const hasConflict = localBookings.some(b => {
            if (b.id === bookingId) return false;
            if (b.barber_id !== targetBarberId) return false;
            if (!['scheduled', 'in_progress'].includes(b.status)) return false;

            const bStart = parseISO(b.start_time);
            const bEnd = parseISO(b.end_time);

            return areIntervalsOverlapping(
                { start: newStart, end: newEnd },
                { start: bStart, end: bEnd }
            );
        });

        if (hasConflict) {
            toast.error("No se puede mover la cita. El barbero ya tiene un servicio agendado en ese horario.");
            return;
        }

        const originalBookings = [...localBookings];
        const updatedBooking = {
            ...booking,
            barber_id: targetBarberId,
            start_time: newStart.toISOString(),
            end_time: newEnd.toISOString(),
        };

        isUpdating.current = true; // Block external sync
        isDraggingLocked.current = true; // Block concurrent drags
        setIsSaving(true); // Visual feedback loop
        setLocalBookings(prev => prev.map(b => b.id === bookingId ? updatedBooking : b));

        try {
            const { error } = await supabase.rpc('update_booking_safe', {
                p_booking_id: bookingId,
                p_barber_id: targetBarberId,
                p_start_time: newStart.toISOString(),
                p_end_time: newEnd.toISOString()
            });

            if (error) {
                console.error("Move failed", error);
                setLocalBookings(originalBookings); // Revert

                if (error.code === 'P0001' || error.code === '23P01') {
                    toast.error("No se puede mover la cita. El horario ya está ocupado.");
                } else {
                    toast.error(`Error al mover cita: ${error.message}`);
                }
            } else {
                isUpdating.current = false; // Unlock BEFORE refresh to accept incoming data
                if (onStatusChange) onStatusChange();
            }

        } catch (err) {
            console.error("Unexpected error move", err);
            setLocalBookings(originalBookings); // Revert
            toast.error("Error de conexión al mover cita.");
        } finally {
            if (isUpdating.current) isUpdating.current = false; // Only reset if still locked (success path already unlocked)
            isDraggingLocked.current = false; // Unlock DnD
            setIsSaving(false);
        }
    }, [localBookings, pixelsPerMinute, slotInterval, onStatusChange]);


    const handleSlotClick = useCallback((barber, slot, e) => {
        const rect = e?.currentTarget?.getBoundingClientRect?.();
        if (onSlotClick) onSlotClick(barber, slot, null, rect);
    }, [onSlotClick]);

    const handleBookingClick = useCallback((barber, start, booking, e) => {
        // e is passed from DraggableBooking
        if (onSlotClick) onSlotClick(barber, start, booking);
    }, [onSlotClick]);


    if (loading || settingsLoading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;

    if (error) {
        return (
            <ErrorState
                title="Error al cargar la agenda"
                message={error}
                onRetry={() => window.location.reload()} // Simple reload for now, or trigger fetch
            />
        );
    }

    if (!barbers || barbers.length === 0) {
        return (
            <EmptyState
                title="No hay barberos activos"
                description="Ve a Configuración para agregar barberos y comenzar a gestionar la agenda."
                icon={UserX}
                action={
                    <a href="/config" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                        Ir a Configuración &rarr;
                    </a>
                }
            />
        );
    }

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className={cn(
                "flex flex-col h-full bg-white shadow-sm rounded-lg border border-slate-200/80 overflow-hidden transition-opacity duration-300",
                isSaving && "opacity-90 cursor-wait pointer-events-none"
            )}>
                {/* Vertical scroll wrapper — both zones scroll vertically together */}
                <div className="flex-1 overflow-y-auto relative scrollbar-thin">
                    <div className="flex">

                        {/* ══════ TIME COLUMN (fixed, never scrolls horizontally) ══════ */}
                        <div className="w-16 shrink-0 bg-white z-20">
                            {/* Sticky header cell */}
                            <div className="h-[44px] sticky top-0 z-40 bg-slate-50 border-b border-slate-200 border-r border-r-slate-200 shadow-sm" />

                            {/* Time slots */}
                            <div className="relative border-r border-slate-100 text-xs text-slate-400 font-medium text-right pr-2">
                                {timeSlots.map((slot, i) => (
                                    <div key={i} className="flex items-start justify-end pr-2 pt-1 border-b border-transparent" style={{ height: VISUAL_SLOT_HEIGHT }}>
                                        <span className="-mt-2 bg-white relative z-10 px-1">{format(slot, 'HH:mm')}</span>
                                    </div>
                                ))}
                                {isToday && (
                                    <CurrentTimeMarker
                                        currentTime={currentTime}
                                        startHourStr={startHourStr}
                                        endHourStr={endHourStr}
                                        pixelsPerMinute={pixelsPerMinute}
                                    />
                                )}
                            </div>
                        </div>

                        {/* ══════ BARBER ZONE (horizontal scroll when columns exceed width) ══════ */}
                        <div className="flex-1 overflow-x-auto">
                            {/* Sticky barber header — CSS Grid */}
                            <div
                                className="grid sticky top-0 z-30 bg-slate-50 border-b border-slate-200 shadow-sm"
                                style={{ gridTemplateColumns: gridColumns }}
                            >
                                {barbers.map(barber => (
                                    <div key={barber.id} className="text-center py-3 font-semibold text-slate-700 uppercase tracking-wide text-xs border-r border-slate-200 last:border-r-0">
                                        {barber.full_name}
                                    </div>
                                ))}
                            </div>

                            {/* Body — CSS Grid */}
                            <div
                                className="grid relative"
                                style={{ gridTemplateColumns: gridColumns }}
                            >
                                {barbers.map((barber) => (
                                    <DroppableBarberColumn
                                        key={barber.id}
                                        barberId={barber.id}
                                        className="border-r border-slate-100 relative last:border-r-0"
                                    >
                                        {/* Background Slots */}
                                        {timeSlots.map((slot, i) => {
                                            const isFullHour = slot.getMinutes() === 0;
                                            return (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        "w-full hover:bg-indigo-50/30 transition-colors group cursor-pointer border-b",
                                                        isFullHour ? "border-slate-200/60" : "border-slate-50"
                                                    )}
                                                    style={{ height: VISUAL_SLOT_HEIGHT }}
                                                    onClick={(e) => handleSlotClick(barber, slot, e)}
                                                >
                                                    <div className="hidden group-hover:flex items-center justify-center h-full w-full opacity-0 group-hover:opacity-100 text-indigo-200/70 font-semibold text-xl">
                                                        +
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Bookings */}
                                        {renderableBookings
                                            .filter(b => b.barber_id === barber.id)
                                            .map(booking => (
                                                <DraggableBooking
                                                    key={booking.id}
                                                    booking={booking}
                                                    top={booking._visual.top}
                                                    height={booking._visual.height}
                                                    statusClassName={booking._visual.config.grid?.className}
                                                    onClick={(e) => handleBookingClick(barber, booking._visual.start, booking, e)}
                                                >
                                                    <BookingItemContent
                                                        booking={booking}
                                                        start={booking._visual.start}
                                                        height={booking._visual.height}
                                                        config={booking._visual.config}
                                                    />
                                                </DraggableBooking>
                                            ))
                                        }

                                        {/* Unavailability Blocks */}
                                        {renderableUnavailability
                                            .filter(u => u.barber_id === barber.id)
                                            .map(block => (
                                                <UnavailabilityItem
                                                    key={block.id}
                                                    block={block}
                                                    top={block._visual.top}
                                                    height={block._visual.height}
                                                />
                                            ))
                                        }
                                    </DroppableBarberColumn>
                                ))}
                                {isToday && (
                                    <CurrentTimeHorizontalLine
                                        currentTime={currentTime}
                                        startHourStr={startHourStr}
                                        endHourStr={endHourStr}
                                        pixelsPerMinute={pixelsPerMinute}
                                    />
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </DndContext>
    );
}

import React, { useState, useRef } from 'react';
import { AgendaGrid } from '@/components/agenda/AgendaGrid';
import { AppointmentModal } from '@/components/agenda/AppointmentModal';
import { QuickCreatePanel } from '@/components/agenda/QuickCreatePanel';
import { format, addDays, subDays, parse } from 'date-fns';

import { now, formatZoned, toZoned, es } from '@/lib/dateUtils';
import { ChevronLeft, ChevronRight, Ban } from 'lucide-react';
import { UnavailabilityModal } from '@/components/agenda/UnavailabilityModal';
import { supabase } from '@/lib/supabase';
import { useAgenda } from '@/hooks/useAgenda';
import { Toaster, toast } from 'sonner';

export function Agenda() {
    // State for Date Navigation
    // State for Date Navigation
    // Initialize with "now" in the target timezone
    const [currentDate, setCurrentDate] = useState(now());

    // State for Data Fetching (Hoisted from Grid)
    const { barbers, bookings, unavailability, loading, error, refresh } = useAgenda(currentDate);

    // State for Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUnavailabilityModalOpen, setIsUnavailabilityModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    // State for Quick Create Panel
    const [quickCreateData, setQuickCreateData] = useState(null);

    const handlePrevDay = () => setCurrentDate(prev => subDays(prev, 1));
    const handleNextDay = () => setCurrentDate(prev => addDays(prev, 1));

    // Date Picker Logic
    const dateInputRef = useRef(null);

    const handleDateChange = (e) => {
        // Parse the YYYY-MM-DD string to a Date object (local time)
        // using the current date as reference for time (though we only care about date)
        if (e.target.value) {
            // We need to interpret the input YYYY-MM-DD as a date in the target timezone
            // parse from date-fns returns a local date.
            // If we use string manipulation:
            const newDate = new Date(`${e.target.value}T12:00:00`); // Avoid TZ shifts on midnight by picking noon? 
            // Better: use date-fns-tz helpers if available, or just keep it simple.
            // Let's use the local date object but treat it as the "day" representation.
            // Actually, `now()` returns a Date that looks like the TZ time. 
            // So if we pick 2023-10-27, we want a Date that prints 2023-10-27 in local system?
            // No, we want a Date that prints 2023-10-27 in Mexico.

            // Simpler: 
            const [y, m, d] = e.target.value.split('-').map(Number);
            const targetDate = new Date(y, m - 1, d, 12, 0, 0); // Noon to avoid boundary issues
            setCurrentDate(targetDate);
        }
    };

    const handleDateClick = (e) => {
        try {
            // Try to open the browser's native picker programmatically
            e.target.showPicker();
        } catch (error) {
            // Fallback: the input remains focused (standard behavior)
        }
    };

    const handleSlotClick = (barber, time, booking = null, rect = null) => {
        if (booking) {
            // Existing booking → Full AppointmentModal
            setQuickCreateData(null);
            setSelectedSlot({
                barber,
                time,
                bookingId: booking.id
            });
            setIsModalOpen(true);
        } else {
            // Empty slot → Quick Create Panel
            setIsModalOpen(false);
            setQuickCreateData({ barber, time, rect });
        }
    };

    const handleSaveAppointment = async (appointmentData) => {
        try {
            // Use RPC for safe booking
            const { error } = await supabase.rpc('create_booking_safe', {
                p_barber_id: appointmentData.barber_id,
                p_service_id: appointmentData.service_id,
                p_client_name: appointmentData.client_name,
                p_client_id: appointmentData.client_id || null,
                p_start_time: appointmentData.start_time,
                p_end_time: appointmentData.end_time,
                p_price: appointmentData.price_at_booking
            });

            if (error) throw error;

            toast.success('Cita creada correctamente');
            handleRefresh();
        } catch (error) {
            console.error('Error saving appointment:', error);

            if (error.code === 'P0001') {
                toast.error(error.message); // Custom RPC error (Unavailability)
            } else if (error.code === '23P01') {
                toast.error('Lo sentimos, este horario ya ha sido ocupado por otra persona.');
            } else {
                toast.error('Error al guardar la cita');
            }
            throw error;
        }
    };

    const handleSaveUnavailability = async (data) => {
        try {
            const { error } = await supabase.rpc('create_unavailability_safe', {
                p_barber_id: data.barber_id,
                p_start_time: data.start_time,
                p_end_time: data.end_time,
                p_reason: data.reason
            });

            if (error) throw error;

            toast.success('Horario bloqueado correctamente');
            handleRefresh();
        } catch (error) {
            console.error('Error saving unavailability:', error);
            if (error.code === 'P0002') {
                toast.error(error.message); // Booking conflict
            } else if (error.code === '23P01') {
                toast.error('Ya existe un bloqueo en este horario.');
            } else {
                toast.error('Error al bloquear horario');
            }
            throw error;
        }
    };

    const handleRefresh = async () => {
        // Small delay to ensure DB write propagation before re-fetching
        await new Promise(resolve => setTimeout(resolve, 500));
        await refresh();
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            <Toaster position="top-right" richColors />

            {/* Header with Date Picker */}
            <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4 flex flex-wrap items-center justify-between gap-2 shadow-sm z-10">
                <div className="flex items-center gap-3 lg:gap-6">
                    <div className="flex items-center gap-2">
                        <div>
                            <h2 className="text-lg lg:text-xl font-bold text-slate-800 leading-tight">Agenda Diaria</h2>
                            <p className="text-xs text-slate-500 font-medium hidden lg:block">Gestión Operativa</p>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-gray-200 mx-1 lg:mx-2 hidden lg:block"></div>

                    {/* Date Navigation */}
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1 shadow-sm">
                        <button onClick={handlePrevDay} className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white hover:text-indigo-600 rounded-md shadow-sm transition-colors text-slate-500" aria-label="Día anterior">
                            <ChevronLeft size={18} aria-hidden="true" />
                        </button>
                        <div className="relative group">
                            <div className="px-3 lg:px-4 py-1 font-semibold text-slate-700 min-w-[150px] lg:min-w-[180px] text-center capitalize text-sm cursor-pointer hover:bg-gray-100 rounded transition-colors">
                                {format(currentDate, "EEEE d 'de' MMMM", { locale: es })}
                            </div>
                            <input
                                ref={dateInputRef}
                                type="date"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                value={formatZoned(currentDate, 'yyyy-MM-dd')}
                                onChange={handleDateChange}
                                onClick={handleDateClick}
                                aria-label="Seleccionar fecha"
                                title="Cambiar fecha"
                            />
                        </div>
                        <button onClick={handleNextDay} className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white hover:text-indigo-600 rounded-md shadow-sm transition-colors text-slate-500" aria-label="Día siguiente">
                            <ChevronRight size={18} aria-hidden="true" />
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div>
                    <button
                        onClick={() => setIsUnavailabilityModalOpen(true)}
                        className="flex items-center gap-2 px-3 lg:px-4 py-2 min-h-[44px] bg-white border border-gray-300 shadow-sm text-slate-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:text-red-600 transition-colors"
                    >
                        <Ban size={16} aria-hidden="true" />
                        <span className="hidden lg:inline">Bloquear Horario</span>
                        <span className="lg:hidden">Bloquear</span>
                    </button>
                </div>


            </header>

            {/* Grid Content */}
            <div className="flex-1 overflow-hidden relative bg-gray-50">
                <AgendaGrid
                    date={currentDate}
                    barbers={barbers}
                    bookings={bookings}
                    unavailability={unavailability}
                    loading={loading}
                    error={error}
                    onSlotClick={handleSlotClick}
                    onStatusChange={handleRefresh}
                />
            </div>

            {/* Quick Create Panel (Empty Slot) */}
            <QuickCreatePanel
                isOpen={!!quickCreateData}
                onClose={() => setQuickCreateData(null)}
                barber={quickCreateData?.barber}
                time={quickCreateData?.time}
                anchorRect={quickCreateData?.rect}
                onSave={handleSaveAppointment}
            />

            {/* Appointment Modal */}
            <AppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveAppointment}
                onStatusChange={handleRefresh}
                initialData={selectedSlot}
                existingBookings={bookings}
                barbers={barbers}
            />

            {/* Unavailability Modal */}
            <UnavailabilityModal
                isOpen={isUnavailabilityModalOpen}
                onClose={() => setIsUnavailabilityModalOpen(false)}
                onSave={handleSaveUnavailability}
                date={currentDate}
                barbers={barbers}
            />
        </div>
    );
}

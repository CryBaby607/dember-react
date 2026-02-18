import { supabase } from '@/lib/supabase';
import { formatISO } from 'date-fns';
import { startOfDayZoned, endOfDayZoned } from '@/lib/dateUtils';

// Generic fetcher for simple Supabase queries
export const fetcher = async (key) => {
    // This is a placeholder; usually SWR fetchers take a URL. 
    // For Supabase, we might use custom keys or a key-based switch.
    // However, it's often cleaner to just write specific fetch functions for SWR to use.
    throw new Error('Generic fetcher not implemented. Use specific fetchers.');
};

// --- Agenda Fetchers ---

export const fetchBarbers = async () => {
    const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
};

export const fetchBookings = async ([_, date]) => {
    const start = formatISO(startOfDayZoned(date));
    const end = formatISO(endOfDayZoned(date));

    const { data, error } = await supabase
        .from('bookings')
        .select('*, clients(full_name), services(name)')
        .gte('start_time', start)
        .lte('start_time', end);

    if (error) throw error;
    return data;
};

export const fetchUnavailability = async ([_, date]) => {
    const start = formatISO(startOfDayZoned(date));
    const end = formatISO(endOfDayZoned(date));

    const { data, error } = await supabase
        .from('barber_unavailability')
        .select('*')
        .gte('start_time', start)
        .lte('start_time', end);

    if (error) throw error;
    return data;
};

// --- Configuration Fetchers ---

export const fetchAllBarbers = async () => {
    const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
};

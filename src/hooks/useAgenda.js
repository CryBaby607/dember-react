import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

import { formatISO } from 'date-fns';
import { startOfDayZoned, endOfDayZoned } from '@/lib/dateUtils';

export function useAgenda(date, refreshTrigger = 0) {
    const [barbers, setBarbers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [unavailability, setUnavailability] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);

                // 1. Fetch Barbers
                const { data: barbersData, error: barbersError } = await supabase
                    .from('barbers')
                    .select('*')
                    .eq('is_active', true)
                    .order('created_at', { ascending: true });

                if (barbersError) throw barbersError;
                setBarbers(barbersData || []);

                // 2. Fetch Bookings for Date
                const start = formatISO(startOfDayZoned(date));
                const end = formatISO(endOfDayZoned(date));

                const { data: bookingsData, error: bookingsError } = await supabase
                    .from('bookings')
                    .select('*, clients(full_name), services(name)')
                    .gte('start_time', start)
                    .lte('start_time', end);

                if (bookingsError) throw bookingsError;
                setBookings(bookingsData || []);

                // 3. Fetch Unavailability for Date
                const { data: unavailabilityData, error: unavailabilityError } = await supabase
                    .from('barber_unavailability')
                    .select('*')
                    .gte('start_time', start)
                    .lte('start_time', end);

                if (unavailabilityError) throw unavailabilityError;
                setUnavailability(unavailabilityData || []);

            } catch (err) {
                console.error('Error fetching agenda:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [date, refreshTrigger]);

    return useMemo(() => ({
        barbers, bookings, unavailability, loading, error
    }), [barbers, bookings, unavailability, loading, error]);
}

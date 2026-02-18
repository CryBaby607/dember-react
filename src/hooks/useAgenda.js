import { useMemo } from 'react';
import useSWR from 'swr';
import { fetchBarbers, fetchBookings, fetchUnavailability } from '@/lib/fetchers';

export function useAgenda(date) {
    // 1. Fetch Barbers (Active only)
    // SWR Key: 'active_barbers' - static as it doesn't depend on date (mostly)
    // We could add a timestamp or version if we needed strict sync, but usually lists are stable.
    const {
        data: barbers,
        error: barbersError,
        isLoading: barbersLoading
    } = useSWR('active_barbers', fetchBarbers, {
        revalidateOnFocus: false, // Don't flickering on window focus
        dedupingInterval: 60000,   // Cache for 1 min
    });

    // 2. Fetch Bookings for Date
    const {
        data: bookings,
        error: bookingsError,
        isLoading: bookingsLoading,
        mutate: mutateBookings
    } = useSWR(['bookings', date], fetchBookings, {
        keepPreviousData: true, // Show old data while fetching new date
    });

    // 3. Fetch Unavailability for Date
    const {
        data: unavailability,
        error: unavailabilityError,
        isLoading: unavailabilityLoading,
        mutate: mutateUnavailability
    } = useSWR(['unavailability', date], fetchUnavailability, {
        keepPreviousData: true,
    });

    const loading = barbersLoading || bookingsLoading || unavailabilityLoading;
    const error = barbersError || bookingsError || unavailabilityError;

    // Combined refresh function for manual triggers (legacy support)
    const refresh = async () => {
        await Promise.all([
            mutateBookings(),
            mutateUnavailability()
        ]);
    };

    return {
        barbers: barbers || [],
        bookings: bookings || [],
        unavailability: unavailability || [],
        loading,
        error: error ? error.message : null,
        refresh // Expose refresh for actions that need immediate updates
    };
}

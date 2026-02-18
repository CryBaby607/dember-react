import { useSWRConfig } from 'swr';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { fetchAllBarbers } from '@/lib/fetchers';

export function useBarbers() {
    const { mutate } = useSWRConfig();

    const {
        data: barbers,
        error,
        isLoading: loading
    } = useSWR('all_barbers', fetchAllBarbers, {
        revalidateOnFocus: false
    });

    const refreshBarbers = () => {
        mutate('all_barbers');
    };

    // Helper to refresh both lists (all for management, active for agenda)
    const refreshAll = () => {
        mutate('all_barbers');
        mutate('active_barbers');
    };

    const addBarber = async (name, isActive = true) => {
        try {
            const { data, error } = await supabase
                .from('barbers')
                .insert([{ full_name: name, is_active: isActive }])
                .select()
                .single();

            if (error) throw error;

            toast.success('Barbero agregado correctamente');
            refreshAll();
            return data;
        } catch (err) {
            console.error('Error adding barber:', err);
            toast.error('Error al agregar barbero');
            throw err;
        }
    };

    const toggleBarberStatus = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('barbers')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            toast.success(`Barbero ${!currentStatus ? 'activado' : 'desactivado'}`);
            refreshAll();
        } catch (err) {
            console.error('Error updating barber status:', err);
            toast.error('Error al actualizar estado');
            throw err;
        }
    };

    const deleteBarber = async (id) => {
        try {
            // 1. Check for existing bookings
            const { count, error: countError } = await supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .eq('barber_id', id);

            if (countError) throw countError;

            if (count > 0) {
                toast.error('No se puede eliminar: El barbero tiene citas registradas.');
                return { success: false };
            }

            // 2. Delete Barber
            const { error } = await supabase
                .from('barbers')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Barbero eliminado correctamente');
            refreshAll();
            return { success: true };
        } catch (err) {
            console.error('Error deleting barber:', err);
            toast.error('Error al eliminar barbero');
            return { success: false, error: err.message };
        }
    };

    return {
        barbers: barbers || [],
        loading,
        error: error ? error.message : null,
        addBarber,
        toggleBarberStatus,
        deleteBarber,
        refreshBarbers
    };
}

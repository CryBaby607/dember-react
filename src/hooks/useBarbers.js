import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useBarbers() {
    const [barbers, setBarbers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBarbers = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('barbers')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setBarbers(data || []);
        } catch (err) {
            console.error('Error fetching barbers:', err);
            setError(err.message);
            toast.error('Error al cargar barberos');
        } finally {
            setLoading(false);
        }
    }, []);

    const addBarber = async (name, isActive = true) => {
        try {
            const { data, error } = await supabase
                .from('barbers')
                .insert([{ full_name: name, is_active: isActive }])
                .select()
                .single();

            if (error) throw error;

            setBarbers(prev => [...prev, data]);
            toast.success('Barbero agregado correctamente');
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

            setBarbers(prev => prev.map(barber =>
                barber.id === id ? { ...barber, is_active: !currentStatus } : barber
            ));
            toast.success(`Barbero ${!currentStatus ? 'activado' : 'desactivado'}`);
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

            setBarbers(prev => prev.filter(b => b.id !== id));
            toast.success('Barbero eliminado correctamente');
            return { success: true };
        } catch (err) {
            console.error('Error deleting barber:', err);
            toast.error('Error al eliminar barbero');
            return { success: false, error: err.message };
        }
    };

    useEffect(() => {
        fetchBarbers();
    }, [fetchBarbers]);

    return {
        barbers,
        loading,
        error,
        addBarber,
        toggleBarberStatus,
        deleteBarber,
        refreshBarbers: fetchBarbers
    };
}

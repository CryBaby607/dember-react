import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useServices() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all services
    const fetchServices = async () => {
        try {
            setLoading(true);



            const { data, error } = await supabase
                .from('services')
                .select('*')
                .order('name', { ascending: true });



            if (error) throw error;
            setServices(data || []);
        } catch (err) {
            console.error('Error fetching services:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    // Create Service
    const createService = async (serviceData) => {
        try {
            const { data, error } = await supabase
                .from('services')
                .insert([{
                    name: serviceData.name,
                    duration_minutes: Math.max(1, parseInt(serviceData.duration_minutes)), // Ensure at least 1 min
                    price: Math.max(0, parseFloat(serviceData.price)), // Ensure non-negative
                    is_active: serviceData.is_active !== undefined ? serviceData.is_active : true
                }])
                .select()
                .single();

            if (error) throw error;
            setServices(prev => [...prev, data]);
            return { success: true, data };
        } catch (err) {
            console.error('Error creating service:', err);
            return { success: false, error: err.message };
        }
    };

    // Update Service
    const updateService = async (id, updates) => {
        try {
            const { data, error } = await supabase
                .from('services')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setServices(prev => prev.map(s => s.id === id ? data : s));
            return { success: true };
        } catch (err) {
            console.error('Error updating service:', err);
            return { success: false, error: err.message };
        }
    };

    // Toggle Active Status (Soft Delete)
    const toggleServiceStatus = async (id, currentStatus) => {
        return updateService(id, { is_active: !currentStatus });
    };

    // Delete Service - Logic to check appointments should ideally be here or backend
    // For now, we will rely on UI to just offer "Deactivate" mostly, but if we implement delete:
    const deleteService = async (id) => {
        try {
            // First check for existing bookings (if we want to enforce this in frontend too)
            const { count, error: countError } = await supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .eq('service_id', id);

            if (countError) throw countError;

            if (count > 0) {
                return { success: false, error: 'Cannot delete service with existing appointments. Please deactivate it instead.' };
            }

            const { error } = await supabase
                .from('services')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setServices(prev => prev.filter(s => s.id !== id));
            return { success: true };
        } catch (err) {
            console.error('Error deleting service:', err);
            return { success: false, error: err.message };
        }
    };

    return {
        services,
        loading,
        error,
        fetchServices,
        createService,
        updateService,
        toggleServiceStatus,
        deleteService
    };
}

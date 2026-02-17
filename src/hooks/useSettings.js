import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useSettings() {
    const [settings, setSettings] = useState({
        opening_time: '08:00',
        closing_time: '20:00',
        slot_interval: 30
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('business_settings')
                .select('*')
                .limit(1)
                .single();

            if (error) throw error;
            if (data) setSettings(data);
        } catch (err) {
            console.error('Error fetching settings:', err);
            // Don't show toast on load if it's just empty, default details will be used
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSettings = async (newSettings) => {
        try {
            // We assume there's always one row, if not we insert (handled by DB init usually, but let's be safe)
            // Ideally we update the existing ID

            const { data, error } = await supabase
                .from('business_settings')
                .update(newSettings)
                .eq('id', settings.id) // safer if we have ID
                .select()
                .single();

            if (error) throw error;

            setSettings(data);
            toast.success('Configuración actualizada correctly');
            return true;
        } catch (err) {
            console.error('Error updating settings:', err);
            toast.error('Error al guardar configuración');
            return false;
        }
    };

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return {
        settings,
        loading,
        updateSettings
    };
}

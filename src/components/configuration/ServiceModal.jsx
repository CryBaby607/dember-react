import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { toast } from 'sonner';

export function ServiceModal({ isOpen, onClose, onSave, serviceToEdit = null }) {
    const [formData, setFormData] = useState({
        name: '',
        duration_minutes: 30,
        price: '',
        is_active: true
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (serviceToEdit) {
                setFormData({
                    name: serviceToEdit.name,
                    duration_minutes: serviceToEdit.duration_minutes,
                    price: serviceToEdit.price,
                    is_active: serviceToEdit.is_active
                });
            } else {
                // Reset for new entry
                setFormData({
                    name: '',
                    duration_minutes: 30,
                    price: '',
                    is_active: true
                });
            }
        }
    }, [isOpen, serviceToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name.trim()) return toast.error('El nombre es requerido');
        if (formData.duration_minutes <= 0) return toast.error('La duración debe ser mayor a 0');
        if (formData.price < 0) return toast.error('El precio no puede ser negativo');

        try {
            setLoading(true);
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error(error);
            // Error handling usually done in parent/hook
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{ overscrollBehavior: 'contain' }}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-lg font-semibold text-slate-800">
                        {serviceToEdit ? 'Editar Servicio' : 'Nuevo Servicio'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label="Cerrar"
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Name */}
                    <div className="space-y-1.5">
                        <label htmlFor="service-name" className="text-sm font-medium text-slate-700">Nombre del Servicio</label>
                        <input
                            id="service-name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus-visible:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                            placeholder="ej. Corte de Cabello…"
                            autoFocus={!('ontouchstart' in window)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Duration */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Duración (min)</label>
                            <input
                                type="number"
                                min="5"
                                step="5"
                                value={formData.duration_minutes}
                                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus-visible:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                            />
                        </div>

                        {/* Price */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Precio ($)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus-visible:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Active Toggle (Only for edit or advanced creation if needed, though mostly relevant for edit) */}
                    <div className="pt-2 flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-700" id="service-status-label">Estado</label>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={formData.is_active}
                            aria-labelledby="service-status-label"
                            onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 ${formData.is_active ? 'bg-green-500' : 'bg-gray-200'}`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`}
                            />
                        </button>
                    </div>
                    <div className="text-xs text-slate-500 text-right">
                        {formData.is_active ? 'Activo' : 'Inactivo'}
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save size={16} />
                                    Guardar
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

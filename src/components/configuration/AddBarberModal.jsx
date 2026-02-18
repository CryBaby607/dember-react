import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useBarbers } from '@/hooks/useBarbers';

export function AddBarberModal({ isOpen, onClose, onSuccess }) {
    const { addBarber } = useBarbers();
    const [name, setName] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            setIsSubmitting(true);
            await addBarber(name, isActive);
            setName('');
            setIsActive(true);
            onSuccess?.();
            onClose();
        } catch {
            // Error handling is already in the hook via toast
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" style={{ overscrollBehavior: 'contain' }}>
            <div className="bg-[#18181B] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10 ring-1 ring-black/50">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#18181B]">
                    <h3 className="font-bold text-lg text-zinc-100 tracking-tight">Agregar Nuevo Barbero</h3>
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-zinc-300 p-2 rounded-lg hover:bg-white/5 transition-colors"
                        aria-label="Cerrar"
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Name Input */}
                    <div className="space-y-2">
                        <label htmlFor="barber-name" className="text-xs font-bold text-zinc-500 uppercase tracking-wider block ml-1">
                            Nombre Completo
                        </label>
                        <input
                            id="barber-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-[#09090b] border border-zinc-800 rounded-xl text-zinc-200 font-medium placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus-visible:outline-none transition-all duration-300 hover:border-zinc-700"
                            placeholder="Ej. Juan Pérez..."
                            autoFocus={!('ontouchstart' in window)}
                            required
                        />
                    </div>

                    {/* Status Switch */}
                    <div className="flex items-center justify-between p-4 bg-[#09090b] rounded-xl border border-zinc-800/50">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-zinc-300" id="barber-status-label">Estado Inicial</span>
                            <span className="text-xs text-zinc-500">¿Puede recibir citas inmediatamente?</span>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={isActive}
                            aria-labelledby="barber-status-label"
                            onClick={() => setIsActive(!isActive)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${isActive ? 'bg-indigo-600' : 'bg-zinc-700'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-zinc-700 text-zinc-300 rounded-xl text-sm font-bold hover:bg-zinc-800 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !name.trim()}
                            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-500 transition-all shadow-[0_0_15px_-3px_rgba(79,70,229,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                                    <span className="opacity-80">Guardando...</span>
                                </>
                            ) : (
                                'Guardar Barbero'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { Plus, Edit2, Archive, CheckCircle, Clock, DollarSign, Search } from 'lucide-react';
import { useServices } from '@/hooks/useServices';
import { ServiceModal } from './ServiceModal';

export function ServiceList() {
    const { services, loading, error, toggleServiceStatus, createService, updateService } = useServices();
    // Re-calling useServices here might create a separate state instance? 
    // No, standard custom hooks don't share state unless using Context. 
    // My useServices uses local useState, so calling it again in ServiceList will trigger a new fetch.
    // That's fine for this component.

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [showInactive, setShowInactive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredServices = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = showInactive ? true : service.is_active;
        return matchesSearch && matchesStatus;
    });

    const handleOpenCreate = () => {
        setEditingService(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (service) => {
        setEditingService(service);
        setIsModalOpen(true);
    };

    const handleSave = async (serviceData) => {
        if (editingService) {
            await updateService(editingService.id, serviceData);
        } else {
            await createService(serviceData);
        }
    };

    if (loading && services.length === 0) {
        return <div className="p-8 text-center text-slate-500">Cargando servicios...</div>;
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">
                <p className="font-bold">Error al cargar servicios</p>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Catálogo de Servicios</h3>
                    <p className="text-sm text-slate-500">Gestiona los precios y duraciones</p>
                </div>

                <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                    <button
                        onClick={() => setShowInactive(false)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-[background-color,color,box-shadow] ${!showInactive ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Activos
                    </button>
                    <button
                        onClick={() => setShowInactive(true)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-[background-color,color,box-shadow] ${showInactive ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Todos
                    </button>
                </div>

                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
                        <input
                            type="text"
                            placeholder="Buscar…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus-visible:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 w-full sm:w-48"
                            aria-label="Buscar servicio"
                        />
                    </div>
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm shadow-slate-200"
                    >
                        <Plus size={18} aria-hidden="true" />
                        Nuevo
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-100">
                {filteredServices.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Archive className="text-gray-300" size={24} aria-hidden="true" />
                        </div>
                        <h3 className="text-slate-900 font-medium mb-1">No hay servicios encontrados</h3>
                        <p className="text-slate-500 text-sm">Prueba ajustando los filtros o agrega uno nuevo.</p>
                    </div>
                ) : (
                    filteredServices.map((service) => (
                        <div key={service.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${service.is_active ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                    {service.is_active ? <CheckCircle size={20} aria-hidden="true" /> : <Archive size={20} aria-hidden="true" />}
                                </div>
                                <div>
                                    <h4 className={`font-medium ${service.is_active ? 'text-slate-800' : 'text-slate-400 line-through decoration-slate-300'}`}>
                                        {service.name}
                                    </h4>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} aria-hidden="true" />
                                            {service.duration_minutes} min
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <DollarSign size={12} aria-hidden="true" />
                                            ${service.price}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleOpenEdit(service)}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Editar"
                                    aria-label={`Editar ${service.name}`}
                                >
                                    <Edit2 size={18} aria-hidden="true" />
                                </button>
                                <button
                                    onClick={() => toggleServiceStatus(service.id, service.is_active)}
                                    className={`p-2 rounded-lg transition-colors ${service.is_active
                                        ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                        : 'text-slate-400 hover:text-green-600 hover:bg-green-50'}`}
                                    title={service.is_active ? "Desactivar" : "Activar"}
                                    aria-label={service.is_active ? `Desactivar ${service.name}` : `Activar ${service.name}`}
                                >
                                    {service.is_active ? <Archive size={18} aria-hidden="true" /> : <CheckCircle size={18} aria-hidden="true" />}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ServiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                serviceToEdit={editingService}
            />
        </div>
    );
}

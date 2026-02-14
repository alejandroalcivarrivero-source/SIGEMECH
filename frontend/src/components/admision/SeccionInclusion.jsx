import React from 'react';

const SeccionInclusion = ({ formData, handleChange, catalogos, formHabilitado }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-sm font-bold text-blue-900 border-b-2 border-blue-100 pb-1 mb-4 uppercase tracking-wider">
                2.1 Datos de Inclusión (Etnia y Discapacidad)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Autoidentificación Étnica */}
                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                        Etnia <span className="text-red-500">*</span>
                    </label>
                    <select 
                        name="autoidentificacionEtnica" 
                        value={formData.autoidentificacionEtnica} 
                        onChange={handleChange} 
                        disabled={!formHabilitado}
                        className="w-full rounded border-gray-400 text-sm focus:ring-blue-500 focus:border-blue-500 border-2"
                        required
                    >
                        <option value="">Seleccione</option>
                        {catalogos.etnias.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                    </select>
                </div>

                {/* Pueblo Kichwa (Condicional) */}
                {formData.autoidentificacionEtnica === 'INDIGENA' && (
                    <div className="md:col-span-1 animate-in fade-in slide-in-from-top-1 duration-300">
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                            Nacionalidad/Pueblo <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="puebloKichwa"
                            value={formData.puebloKichwa}
                            onChange={handleChange}
                            disabled={!formHabilitado}
                            placeholder="Especifique"
                            className="w-full rounded border-gray-400 text-sm border-2"
                            required
                        />
                    </div>
                )}

                {/* Grupo Prioritario */}
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Grupo Prioritario</label>
                    <select 
                        name="grupoPrioritario" 
                        value={formData.grupoPrioritario} 
                        onChange={handleChange} 
                        disabled={!formHabilitado}
                        className="w-full rounded border-gray-400 text-sm border-2"
                    >
                        <option value="">Ninguno</option>
                        <option value="ADULTO_MAYOR">Adulto Mayor</option>
                        <option value="EMBARAZADA">Embarazada</option>
                        <option value="NINO_NINA">Niño/Niña</option>
                        <option value="MOVILIDAD_REDUCIDA">Movilidad Reducida</option>
                    </select>
                </div>

                {/* Discapacidad */}
                <div className="md:col-span-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center mb-4">
                        <input 
                            type="checkbox" 
                            name="tieneDiscapacidad" 
                            id="tieneDiscapacidad"
                            checked={formData.tieneDiscapacidad} 
                            onChange={handleChange} 
                            disabled={!formHabilitado}
                            className="w-4 h-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500 border-2"
                        />
                        <label htmlFor="tieneDiscapacidad" className="ml-2 text-xs font-bold text-gray-700 uppercase">
                            ¿Posee carnet de discapacidad?
                        </label>
                    </div>
                    
                    {formData.tieneDiscapacidad && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase">Tipo de Discapacidad</label>
                                <input 
                                    type="text" 
                                    name="tipoDiscapacidad" 
                                    value={formData.tipoDiscapacidad} 
                                    onChange={handleChange} 
                                    className="w-full rounded border-gray-400 text-sm border-2"
                                    placeholder="Física, Auditiva, etc."
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase">Porcentaje (%)</label>
                                <input 
                                    type="number" 
                                    name="porcentajeDiscapacidad" 
                                    value={formData.porcentajeDiscapacidad} 
                                    onChange={handleChange} 
                                    className="w-full rounded border-gray-400 text-sm border-2"
                                    min="0" max="100"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase">Nro. de Carnet/CONADIS</label>
                                <input 
                                    type="text" 
                                    name="carnetDiscapacidad" 
                                    value={formData.carnetDiscapacidad} 
                                    onChange={handleChange} 
                                    className="w-full rounded border-gray-400 text-sm border-2"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SeccionInclusion;

import React from 'react';

const SeccionContactoEmergencia = ({ formData, handleChange, catalogos, formHabilitado }) => {
    const inputClasses = "w-full rounded border-gray-400 bg-white text-[11px] py-1 px-1.5 focus:border-blue-600 focus:outline-none font-medium h-7 border-2 shadow-sm transition-colors";
    const labelClasses = "block text-[10px] font-bold text-gray-700 mb-0.5 uppercase truncate";

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-blue-900 border-b border-blue-200 pb-0.5 mb-2 uppercase tracking-tight">
                5. Datos de Contacto (Emergencia)
            </h3>
            
            <div className="grid grid-cols-4 gap-x-2 gap-y-2">
                {/* Nombre del Contacto */}
                <div className="col-span-2">
                    <label className={labelClasses}>
                        Nombre del Contacto <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="contactoEmergenciaNombre"
                        value={formData.contactoEmergenciaNombre}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        placeholder="Nombres y Apellidos"
                        className={`${inputClasses} uppercase font-bold`}
                        required
                    />
                </div>

                {/* Parentesco */}
                <div className="col-span-1">
                    <label className={labelClasses}>
                        Parentesco <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="contactoEmergenciaParentesco"
                        value={formData.contactoEmergenciaParentesco}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        className={inputClasses}
                        required
                    >
                        <option value="">Seleccione</option>
                        {catalogos.parentescos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                </div>

                {/* Teléfono */}
                <div className="col-span-1">
                    <label className={labelClasses}>
                        Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="contactoEmergenciaTelefono"
                        value={formData.contactoEmergenciaTelefono}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        placeholder="09XXXXXXXX"
                        className={`${inputClasses} font-bold`}
                        required
                    />
                </div>

                {/* Dirección */}
                <div className="col-span-4">
                    <label className={labelClasses}>
                        Dirección <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="contactoEmergenciaDireccion"
                        value={formData.contactoEmergenciaDireccion}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        rows="2"
                        className="w-full rounded border-gray-400 bg-white text-[11px] py-1 px-1.5 focus:border-blue-600 focus:outline-none font-medium border-2 shadow-sm transition-colors"
                        placeholder="Provincia, Cantón, Calle y Referencia"
                        required
                    ></textarea>
                </div>
            </div>
        </div>
    );
};

export default SeccionContactoEmergencia;

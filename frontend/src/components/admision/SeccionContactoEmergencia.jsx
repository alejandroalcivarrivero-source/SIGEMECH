import React from 'react';

/**
 * SIGEMECH | SISTEMA GESTION DE EMERGENCIA CHONE
 * SECCIÓN 5: DATOS DEL CONTACTO (EMERGENCIA)
 */
const SeccionContactoEmergencia = ({ formData, handleChange, catalogos, formHabilitado }) => {
    // Clases estandarizadas para el sistema SIGEMECH (Azul/Oro)
    const inputClasses = "w-full rounded border-2 border-gray-400 bg-white text-[11px] py-1 px-1.5 focus:border-blue-600 focus:outline-none font-bold h-7 shadow-sm transition-colors uppercase";
    const labelClasses = "block text-[10px] font-bold text-blue-900 mb-0.5 uppercase truncate";

    /**
     * Validación estricta para teléfonos: Solo números
     */
    const handleTelefonoChange = (e) => {
        const { value } = e.target;
        if (value === '' || /^\d+$/.test(value)) {
            handleChange(e);
        }
    };

    return (
        <div className="space-y-3 p-2 bg-slate-50 border-l-4 border-yellow-500 rounded-r shadow-inner">
            <h3 className="text-xs font-extrabold text-blue-900 border-b-2 border-blue-200 pb-0.5 mb-2 uppercase tracking-tight flex items-center">
                <span className="bg-blue-900 text-white px-1.5 py-0.5 rounded mr-2 text-[10px]">5</span>
                DATOS DEL CONTACTO (EMERGENCIA)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 gap-y-2">
                {/* COLUMNA 1: NOMBRES */}
                <div className="col-span-1">
                    <label className={labelClasses}>
                        NOMBRES DEL CONTACTO <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        tabIndex="501"
                        name="nombre_representante"
                        value={formData.nombre_representante || ''}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        placeholder="NOMBRES Y APELLIDOS COMPLETOS"
                        className={inputClasses}
                        required
                    />
                </div>

                {/* COLUMNA 2: PARENTESCO */}
                <div className="col-span-1">
                    <label className={labelClasses}>
                        PARENTESCO <span className="text-red-500">*</span>
                    </label>
                    <select
                        tabIndex="502"
                        name="id_parentesco_representante"
                        value={formData.id_parentesco_representante || ''}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        className={inputClasses}
                        required
                    >
                        <option value="">SELECCIONE PARENTESCO</option>
                        {catalogos?.parentescos?.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.nombre?.toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>

                {/* COLUMNA 3: TELÉFONO */}
                <div className="col-span-1">
                    <label className={labelClasses}>
                        TELÉFONO <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        tabIndex="503"
                        name="documento_representante"
                        value={formData.documento_representante || ''}
                        onChange={handleTelefonoChange}
                        disabled={!formHabilitado}
                        placeholder="SÓLO NÚMEROS (EJ: 09XXXXXXXX)"
                        className={inputClasses}
                        required
                        maxLength={15}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-y-2 mt-2">
                <div className="col-span-1">
                    <label className={labelClasses}>
                        DIRECCIÓN DEL CONTACTO <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        tabIndex="504"
                        name="direccion_representante"
                        value={formData.direccion_representante || ''}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        rows="2"
                        className="w-full rounded border-2 border-gray-400 bg-white text-[11px] py-1 px-1.5 focus:border-blue-600 focus:outline-none font-bold shadow-sm transition-colors uppercase"
                        placeholder="PROVINCIA, CANTÓN, CALLE Y REFERENCIAS"
                        required
                    ></textarea>
                </div>
            </div>
        </div>
    );
};

export default SeccionContactoEmergencia;

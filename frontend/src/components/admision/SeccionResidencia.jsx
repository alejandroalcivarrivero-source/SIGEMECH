import React from 'react';

const SeccionResidencia = ({ 
    formData, 
    handleChange, 
    catalogos, 
    cantonesFiltrados, 
    parroquiasFiltradas, 
    formHabilitado 
}) => {
    const inputClasses = "w-full rounded border-gray-400 bg-white text-[11px] py-1 px-1.5 focus:border-blue-600 focus:outline-none font-medium h-7 border-2 shadow-sm transition-colors";
    const labelClasses = "block text-[10px] font-bold text-gray-600 mb-0.5 uppercase truncate";

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-blue-900 border-b border-blue-200 pb-0.5 mb-2 uppercase tracking-tight">
                3. Residencia Habitual
            </h3>
            
            <div className="grid grid-cols-4 gap-x-2 gap-y-2">
                {/* Fila 1: Ubicación Política */}
                <div className="col-span-1">
                    <label className={labelClasses}>
                        País <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="paisResidencia"
                        value={formData.paisResidencia}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        className={inputClasses}
                        required
                    >
                        <option value="Ecuador">Ecuador</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>

                <div className="col-span-1">
                    <label className={labelClasses}>
                        Provincia <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="provinciaResidencia"
                        value={formData.provinciaResidencia}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        className={inputClasses}
                        required
                    >
                        <option value="">Seleccione</option>
                        {catalogos.provincias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                </div>

                <div className="col-span-1">
                    <label className={labelClasses}>
                        Cantón <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="cantonResidencia"
                        value={formData.cantonResidencia}
                        onChange={handleChange}
                        disabled={!formHabilitado || !formData.provinciaResidencia}
                        className={inputClasses}
                        required
                    >
                        <option value="">Seleccione</option>
                        {cantonesFiltrados.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                </div>

                <div className="col-span-1">
                    <label className={labelClasses}>
                        Parroquia <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="parroquiaResidencia"
                        value={formData.parroquiaResidencia}
                        onChange={handleChange}
                        disabled={!formHabilitado || !formData.cantonResidencia}
                        className={inputClasses}
                        required
                    >
                        <option value="">Seleccione</option>
                        {parroquiasFiltradas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                </div>

                {/* Fila 2: Dirección Detallada */}
                <div className="col-span-2">
                    <label className={labelClasses}>
                        Calle Principal <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="callePrincipal"
                        value={formData.callePrincipal}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        placeholder="Vía principal"
                        className={inputClasses}
                        required
                    />
                </div>

                <div className="col-span-1">
                    <label className={labelClasses}>Número</label>
                    <input
                        type="text"
                        name="numeroCasa"
                        value={formData.numeroCasa}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        placeholder="Ej: S/N"
                        className={inputClasses}
                    />
                </div>

                <div className="col-span-1">
                    <label className={labelClasses}>Calle Sec.</label>
                    <input
                        type="text"
                        name="calleSecundaria"
                        value={formData.calleSecundaria}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        placeholder="Transversal"
                        className={inputClasses}
                    />
                </div>

                {/* Fila 3: Barrio y Referencia */}
                <div className="col-span-1">
                    <label className={labelClasses}>Barrio</label>
                    <input
                        type="text"
                        name="barrio"
                        value={formData.barrio}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        placeholder="Sector"
                        className={inputClasses}
                    />
                </div>

                <div className="col-span-3">
                    <label className={labelClasses}>Referencia</label>
                    <input
                        type="text"
                        name="referenciaResidencia"
                        value={formData.referenciaResidencia}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        className={inputClasses}
                        placeholder="Color de casa, hitos cercanos..."
                    />
                </div>
            </div>
        </div>
    );
};

export default SeccionResidencia;

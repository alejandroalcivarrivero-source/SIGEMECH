import React from 'react';

// Componente para la Pestaña 4: Datos Adicionales (Socio-Económicos)
const SeccionDatosAdicionales = ({ paciente, formData, handleChange, catalogos, formHabilitado }) => {
    
    // Misión: "Blindaje de Datos". Si los catálogos aún no están cargados,
    // se usan arrays vacíos para prevenir errores de renderizado (`.map` of undefined).
    const etnias = catalogos?.etnias || [];
    const nivelesEducacion = catalogos?.nivelesEducacion || [];
    const segurosSalud = catalogos?.segurosSalud || [];

    // Misión: Identidad Visual Azul/Oro. Clases centralizadas para consistencia.
    // Se usa `disabled:bg-gray-100` para feedback visual en campos bloqueados.
    const inputClasses = "w-full rounded border-gray-400 bg-white text-[11px] py-1 px-1.5 focus:border-blue-600 focus:outline-none font-medium h-7 border-2 shadow-sm transition-colors disabled:bg-gray-100";
    const labelClasses = "block text-[10px] font-bold text-gray-600 mb-0.5 uppercase truncate";
    
    // Misión: Validación Visual. El asterisco de requerido sigue el esquema de color.
    const requiredStar = <span className="text-yellow-500 font-bold">*</span>;

    return (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* --- TÍTULO DE LA SECCIÓN --- */}
            <h3 className="text-xs font-extrabold text-blue-900 border-b-2 border-yellow-400 pb-1 mb-3 uppercase tracking-tight">
                4. Datos Socio-Económicos
            </h3>
            
            <div className="grid grid-cols-4 gap-x-2 gap-y-2">
                {/* --- CAMPO: AUTOIDENTIFICACIÓN ÉTNICA --- */}
                <div className="col-span-1">
                    <label className={labelClasses}>
                        Autoidentificación {requiredStar}
                    </label>
                    <select
                        name="id_autoidentificacion_etnica"
                        // Misión: Blindaje a nivel de campo.
                        value={formData.id_autoidentificacion_etnica || ''}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        className={inputClasses}
                        required // Misión: Validación. Campo obligatorio.
                    >
                        <option value="">Seleccione Etnia</option>
                        {etnias.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                    </select>
                </div>

                {/* --- CAMPO: NIVEL DE INSTRUCCIÓN --- */}
                <div className="col-span-1">
                    <label className={labelClasses}>
                        Nivel de Instrucción {requiredStar}
                    </label>
                    <select
                        name="id_nivel_instruccion"
                        value={formData.id_nivel_instruccion || ''}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        className={inputClasses}
                        required // Misión: Validación. Campo obligatorio.
                    >
                        <option value="">Seleccione Nivel</option>
                        {nivelesEducacion.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
                    </select>
                </div>
                
                {/* --- CAMPO: OCUPACIÓN --- */}
                <div className="col-span-2">
                     <label className={labelClasses}>
                        Ocupación (CIUO) {requiredStar}
                    </label>
                    <input
                        type="text"
                        name="ocupacion"
                        value={formData.ocupacion || ''}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        placeholder="Ej: Agricultor, Docente, etc."
                        className={inputClasses}
                        required
                    />
                </div>

                {/* --- CAMPO: SEGURO DE SALUD --- */}
                <div className="col-span-2">
                    <label className={labelClasses}>
                        Seguro de Salud {requiredStar}
                    </label>
                    <select
                        name="id_seguro_salud"
                        value={formData.id_seguro_salud || ''}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        className={inputClasses}
                        required
                    >
                        <option value="">Seleccione Seguro</option>
                        {segurosSalud.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                </div>

                {/* --- OTROS CAMPOS --- */}
                <div className="col-span-2">
                    <label className={labelClasses}>Tipo de Empresa</label>
                    <input
                        type="text"
                        name="tipo_empresa"
                        value={formData.tipo_empresa || ''}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        className={inputClasses}
                        placeholder="Pública, Privada, Propia..."
                    />
                </div>
            </div>
        </div>
    );
};

export default SeccionDatosAdicionales;

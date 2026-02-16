import React, { useEffect } from 'react';
import { Search } from 'lucide-react';
// import { generarCodigoNormativoIdentificacion } from '../../utils/generador_codigo'; // Centralizado en padre

const SeccionIdentidad = ({ formData, handleChange, handleBusquedaPaciente, catalogos, formHabilitado, errors = {} }) => {
    // La lógica de generación automática del código se ha centralizado en el componente padre (FormularioAdmisionMaestra)
    // para evitar duplicidad de efectos y condiciones de carrera.

    // Estilos de compactación visual extrema
    const inputClasses = "w-full rounded border-gray-400 bg-white text-[11px] py-1 px-1.5 focus:border-blue-600 focus:outline-none font-medium h-7 border-2 shadow-sm transition-colors disabled:bg-gray-50 disabled:text-gray-500";
    const labelClasses = "block text-[10px] font-bold text-gray-700 mb-0.5 uppercase truncate";
    const containerClasses = "space-y-0.5";

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {/* Fila 1: Identificación */}
                <div className={containerClasses}>
                    <label className={labelClasses}>
                        Tipo Id. <span className="text-red-500">*</span>
                    </label>
                    <select
                        tabIndex="101"
                        name="id_tipo_identificacion"
                        value={formData.id_tipo_identificacion}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    >
                        <option value="">Seleccione</option>
                        {(catalogos.tiposIdentificacion || []).map(t => (
                            <option key={t.id} value={t.id}>{t.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className={containerClasses}>
                    <label className={labelClasses}>
                        Nº Identificación <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        {(() => {
                            const tipoSeleccionado = catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion);
                            const esNoIdentificado = tipoSeleccionado?.nombre?.toUpperCase() === 'NO IDENTIFICADO';
                            
                            return (
                                <input
                                    tabIndex="102"
                                    type="text"
                                    name="numero_documento"
                                    value={formData.numero_documento}
                                    onChange={(e) => {
                                        const tipoSeleccionado = catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion);
                                        const esCedula = tipoSeleccionado?.nombre?.toUpperCase() === 'CÉDULA DE IDENTIDAD' || tipoSeleccionado?.nombre?.toUpperCase() === 'CEDULA';
                                        
                                        if (esCedula) {
                                            const val = e.target.value;
                                            if (val && !/^\d+$/.test(val)) return;
                                            if (val.length > 10) return;
                                        }
                                        handleChange(e);
                                    }}
                                    onBlur={!esNoIdentificado ? (e) => handleBusquedaPaciente(e.target.value) : undefined}
                                    placeholder={esNoIdentificado ? "" : "Ej: 1712345678"}
                                    readOnly={esNoIdentificado}
                                    className={`${inputClasses} pr-6 font-bold ${
                                        esNoIdentificado
                                        ? 'bg-gray-200 text-blue-900 text-xs border-gray-400 cursor-not-allowed'
                                        : 'bg-white'
                                    }`}
                                    required
                                />
                            );
                        })()}
                        <Search className="absolute right-1 top-1.5 h-3.5 w-3.5 text-gray-400" />
                    </div>
                    {errors.numero_documento && <p className="text-red-500 text-xs mt-1">{errors.numero_documento}</p>}
                </div>

                {/* Fila 2: Apellidos */}
                {(() => {
                    const tipoSeleccionado = catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion);
                    const forceEnabled = (tipoSeleccionado?.nombre?.toUpperCase() === 'NO IDENTIFICADO') || formHabilitado;

                    return (
                        <>
                            <div className={containerClasses}>
                                <label className={labelClasses}>
                                    Primer Apellido <span className="text-red-500">*</span>
                                </label>
                                <input
                                    tabIndex="103"
                                    type="text"
                                    name="primer_apellido"
                                    value={formData.primer_apellido}
                                    onChange={handleChange}
                                    disabled={!forceEnabled}
                                    className={`${inputClasses} uppercase font-bold`}
                                    required
                                />
                                {errors.primer_apellido && <p className="text-red-500 text-xs mt-1">{errors.primer_apellido}</p>}
                            </div>
                            <div className={containerClasses}>
                                <label className={labelClasses}>
                                    Segundo Apellido
                                </label>
                                <input
                                    tabIndex="104"
                                    type="text"
                                    name="segundo_apellido"
                                    value={formData.segundo_apellido}
                                    onChange={handleChange}
                                    disabled={!forceEnabled}
                                    className={`${inputClasses} uppercase font-bold`}
                                />
                            </div>

                            {/* Fila 3: Nombres */}
                            <div className={containerClasses}>
                                <label className={labelClasses}>
                                    Primer Nombre <span className="text-red-500">*</span>
                                </label>
                                <input
                                    tabIndex="105"
                                    type="text"
                                    name="primer_nombre"
                                    value={formData.primer_nombre}
                                    onChange={handleChange}
                                    disabled={!forceEnabled}
                                    className={`${inputClasses} uppercase font-bold`}
                                    required
                                />
                                {errors.primer_nombre && <p className="text-red-500 text-xs mt-1">{errors.primer_nombre}</p>}
                            </div>
                            <div className={containerClasses}>
                                <label className={labelClasses}>
                                    Segundo Nombre
                                </label>
                                <input
                                    tabIndex="106"
                                    type="text"
                                    name="segundo_nombre"
                                    value={formData.segundo_nombre}
                                    onChange={handleChange}
                                    disabled={!forceEnabled}
                                    className={`${inputClasses} uppercase font-bold`}
                                />
                            </div>

                            {/* Fila 4: Bio-Civiles (Reorganizado: Sin Género) */}
                            <div className="col-span-2 grid grid-cols-2 gap-6">
                                <div className={containerClasses}>
                                    <label className={labelClasses}>
                                        Sexo <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        tabIndex="107"
                                        name="id_sexo"
                                        value={formData.id_sexo}
                                        onChange={handleChange}
                                        disabled={!forceEnabled}
                                        className={`${inputClasses} bg-white`}
                                        required
                                    >
                                        <option value="">Seleccione</option>
                                        {catalogos.sexos.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                    </select>
                                </div>
                                <div className={containerClasses}>
                                    <label className={labelClasses}>
                                        Estado Civil <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        tabIndex="109"
                                        name="id_estado_civil"
                                        value={formData.id_estado_civil}
                                        onChange={handleChange}
                                        disabled={!forceEnabled}
                                        className={`${inputClasses} bg-white`}
                                        required
                                    >
                                        <option value="">Seleccione</option>
                                        {catalogos.estadosCiviles.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Fila 5: Contacto */}
                            <div className={containerClasses}>
                                <label className={labelClasses}>
                                    Celular <span className="text-red-500">*</span>
                                </label>
                                <input
                                    tabIndex="110"
                                    type="text"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    disabled={!forceEnabled}
                                    className={`${inputClasses} font-bold bg-white`}
                                    placeholder="09XXXXXXXX"
                                    required
                                />
                            </div>
                            <div className={containerClasses}>
                                <label className={labelClasses}>
                                    Correo Electrónico
                                </label>
                                <input
                                    tabIndex="111"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!forceEnabled}
                                    className={`${inputClasses} bg-white`}
                                    placeholder="PACIENTE@EJEMPLO.COM"
                                />
                            </div>
                        </>
                    );
                })()}
            </div>
        </div>
    );
};

export default SeccionIdentidad;

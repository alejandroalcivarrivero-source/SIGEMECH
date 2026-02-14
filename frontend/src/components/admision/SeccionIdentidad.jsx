import React, { useEffect } from 'react';
import { Search } from 'lucide-react';
import { generarCodigoTemporal } from '../../utils/pacienteUtils';

const SeccionIdentidad = ({ formData, handleChange, handleBusquedaPaciente, catalogos, formHabilitado }) => {
    // Lógica para Generación Automática del Código de 17 caracteres (Normativa MSP)
    useEffect(() => {
        const tipoSeleccionado = catalogos.tiposIdentificacion?.find(t => t.id == formData.tipoIdentificacion);
        const esNoIdentificado = tipoSeleccionado?.nombre?.toUpperCase() === 'NO IDENTIFICADO';

        if (esNoIdentificado) {
            const nuevoCodigo = generarCodigoTemporal(formData, catalogos.provincias);
            if (nuevoCodigo !== formData.cedula) {
                handleChange({
                    target: {
                        name: 'cedula',
                        value: nuevoCodigo
                    }
                });
            }
        }
    }, [
        formData.tipoIdentificacion,
        formData.primerNombre,
        formData.segundoNombre,
        formData.primerApellido,
        formData.segundoApellido,
        formData.fechaNacimiento,
        formData.provinciaNacimiento,
        catalogos.provincias,
        catalogos.tiposIdentificacion
    ]);

    // Estilos de compactación visual extrema
    const inputClasses = "w-full rounded border-gray-400 bg-white text-[11px] py-1 px-1.5 focus:border-blue-600 focus:outline-none font-medium h-7 border-2 shadow-sm transition-colors disabled:bg-gray-50 disabled:text-gray-500";
    const labelClasses = "block text-[10px] font-bold text-gray-700 mb-0.5 uppercase truncate";
    const containerClasses = "space-y-0.5";

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-blue-900 border-b border-blue-200 pb-0.5 mb-2 uppercase tracking-tight">
                1. Identificación y Datos Personales
            </h3>
            
            <div className="grid grid-cols-4 gap-x-2 gap-y-2">
                {/* Fila 1: Identificación Crítica */}
                <div className={containerClasses}>
                    <label className={labelClasses}>
                        Tipo Id. <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="tipoIdentificacion"
                        value={formData.tipoIdentificacion}
                        onChange={(e) => {
                            // 1. Disparo del cambio via props (limpieza y reset ya ocurren en el padre)
                            handleChange(e);
                        }}
                        className={inputClasses}
                        required
                    >
                        <option value="">Seleccione</option>
                        {(catalogos.tiposIdentificacion || []).map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                    </select>
                </div>

                <div className={containerClasses}>
                    <label className={labelClasses}>
                        Nº Identificación <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        {(() => {
                            const tipoSeleccionado = catalogos.tiposIdentificacion?.find(t => t.id == formData.tipoIdentificacion);
                            const esNoIdentificado = tipoSeleccionado?.nombre?.toUpperCase() === 'NO IDENTIFICADO';
                            
                            return (
                                <input
                                    type="text"
                                    name="cedula"
                                    value={formData.cedula}
                                    onChange={(e) => {
                                        const tipoSeleccionado = catalogos.tiposIdentificacion?.find(t => t.id == formData.tipoIdentificacion);
                                        const esCedula = tipoSeleccionado?.nombre?.toUpperCase() === 'CÉDULA DE IDENTIDAD' || tipoSeleccionado?.nombre?.toUpperCase() === 'CEDULA';
                                        
                                        if (esCedula) {
                                            // Bloqueo de entrada no numérica para Cédula
                                            const val = e.target.value;
                                            if (val && !/^\d+$/.test(val)) return;
                                            if (val.length > 10) return;
                                        }
                                        handleChange(e);
                                    }}
                                    onBlur={!esNoIdentificado ? (e) => handleBusquedaPaciente(e.target.value) : undefined}
                                    placeholder={esNoIdentificado ? "GENERANDO CÓDIGO..." : "Ej: 1712345678"}
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
                </div>

                <div className={containerClasses}>
                    <label className={labelClasses}>
                        Estado Civil <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="estadoCivil"
                        value={formData.estadoCivil}
                        onChange={handleChange}
                        disabled={!(formHabilitado || (catalogos.tiposIdentificacion?.find(t => t.id == formData.tipoIdentificacion)?.nombre?.toUpperCase() === 'NO IDENTIFICADO'))}
                        className={`${inputClasses} bg-white`}
                        required
                    >
                        <option value="">Seleccione</option>
                        {catalogos.estadosCiviles.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                    </select>
                </div>

                <div className={containerClasses}>
                    <label className={labelClasses}>
                        Sexo <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="sexo"
                        value={formData.sexo}
                        onChange={handleChange}
                        disabled={!(formHabilitado || (catalogos.tiposIdentificacion?.find(t => t.id == formData.tipoIdentificacion)?.nombre?.toUpperCase() === 'NO IDENTIFICADO'))}
                        className={`${inputClasses} bg-white`}
                        required
                    >
                        <option value="">Seleccione</option>
                        {catalogos.sexos.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                </div>

                {/* Fila 2: Apellidos (Compactados en 1 columna cada uno dentro del grid 4x4) */}
                {(() => {
                    const tipoSeleccionado = catalogos.tiposIdentificacion?.find(t => t.id == formData.tipoIdentificacion);
                    const esNoIdentificado = tipoSeleccionado?.nombre?.toUpperCase() === 'NO IDENTIFICADO';
                    const forceEnabled = esNoIdentificado || formHabilitado;

                    return (
                        <>
                            <div className={`${containerClasses} col-span-1`}>
                                <label className={labelClasses}>
                                    Primer Apellido <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="primerApellido"
                                    value={formData.primerApellido}
                                    onChange={handleChange}
                                    disabled={!forceEnabled}
                                    className={`${inputClasses} uppercase font-bold`}
                                    required
                                />
                            </div>
                            <div className={`${containerClasses} col-span-1`}>
                                <label className={labelClasses}>
                                    Segundo Apellido
                                </label>
                                <input
                                    type="text"
                                    name="segundoApellido"
                                    value={formData.segundoApellido}
                                    onChange={handleChange}
                                    disabled={!forceEnabled}
                                    className={`${inputClasses} uppercase font-bold`}
                                />
                            </div>

                            {/* Fila 2 cont: Nombres */}
                            <div className={`${containerClasses} col-span-1`}>
                                <label className={labelClasses}>
                                    Primer Nombre <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="primerNombre"
                                    value={formData.primerNombre}
                                    onChange={handleChange}
                                    disabled={!forceEnabled}
                                    className={`${inputClasses} uppercase font-bold`}
                                    required
                                />
                            </div>
                            <div className={`${containerClasses} col-span-1`}>
                                <label className={labelClasses}>
                                    Segundo Nombre
                                </label>
                                <input
                                    type="text"
                                    name="segundoNombre"
                                    value={formData.segundoNombre}
                                    onChange={handleChange}
                                    disabled={!forceEnabled}
                                    className={`${inputClasses} uppercase font-bold`}
                                />
                            </div>
                        </>
                    );
                })()}

                {/* Fila 3: Contacto */}
                {/* Campos de Contacto que también se habilitan si es No Identificado */}
                {(() => {
                    const tipoSeleccionado = catalogos.tiposIdentificacion?.find(t => t.id == formData.tipoIdentificacion);
                    const esNoIdentificado = tipoSeleccionado?.nombre?.toUpperCase() === 'NO IDENTIFICADO';
                    const forceEnabled = esNoIdentificado || formHabilitado;

                    return (
                        <>
                            <div className={containerClasses}>
                                <label className={labelClasses}>Teléf. Fijo</label>
                                <input
                                    type="text"
                                    name="telefonoFijo"
                                    value={formData.telefonoFijo}
                                    onChange={handleChange}
                                    disabled={!forceEnabled}
                                    className={`${inputClasses} bg-white`}
                                    placeholder="02-XXXXXXX"
                                />
                            </div>
                            <div className={containerClasses}>
                                <label className={labelClasses}>
                                    Celular <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="telefonoCelular"
                                    value={formData.telefonoCelular}
                                    onChange={handleChange}
                                    disabled={!forceEnabled}
                                    className={`${inputClasses} font-bold bg-white`}
                                    placeholder="09XXXXXXXX"
                                    required
                                />
                            </div>
                            <div className={`${containerClasses} col-span-2`}>
                                <label className={labelClasses}>
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!forceEnabled}
                                    className={`${inputClasses} bg-white`}
                                    placeholder="paciente@ejemplo.com"
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

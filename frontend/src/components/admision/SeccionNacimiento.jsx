import React, { useEffect, useRef, useState, useMemo } from 'react';
import catalogService from '../../api/catalogService';
import { generarCodigoTemporal } from '../../utils/pacienteUtils';
import SeccionRepresentante from './SeccionRepresentante';
import pacienteService from '../../api/pacienteService';

const SeccionNacimiento = ({ formData, handleChange, handleBlur, catalogos, formHabilitado, edadInfo, setFormData }) => {
    const focusRef = useRef(null);
    const [cantones, setCantones] = useState([]);
    const [parroquias, setParroquias] = useState([]);

    // Definición de isNeonato para condicionar visibilidad de campos de nacimiento
    // Se considera neonato si tiene menos de 28 días O si la bandera isNeonato viene en true (cálculo por horas)
    // Tarea 3: Usar banderas de negocio inyectadas desde FormularioAdmisionMaestra
    const isNeonato = edadInfo?.isNeonato;
    const mostrarFlujoNeonatal = edadInfo?.mostrarFlujoNeonatal;
    const esPartoReciente = edadInfo?.esPartoReciente;

    const idNacionalidadEcuatoriana = catalogos.nacionalidades?.find(n => n.nombre?.trim().toUpperCase() === 'ECUATORIANA')?.id;

    const [establecimientosSalud, setEstablecimientosSalud] = useState([]);

    useEffect(() => {
        if (focusRef.current) {
            focusRef.current.focus();
        }
    }, []);

    // Cargar establecimientos si no están en catálogos o para asegurar sincronización
    const [loadingCatalogoParto, setLoadingCatalogoParto] = useState(false);
    useEffect(() => {
        if (catalogos.establecimientos) {
            setEstablecimientosSalud(catalogos.establecimientos);
        }
    }, [catalogos.establecimientos]);

    // 1. Filtrado de Cantones
    useEffect(() => {
        const cargarCantones = async () => {
            if (formData.provinciaNacimiento && formData.nacionalidad == idNacionalidadEcuatoriana) {
                try {
                    const data = await catalogService.getCantones(formData.provinciaNacimiento);
                    setCantones(data);
                } catch (error) {
                    console.error("Error al cargar cantones:", error);
                    setCantones([]);
                }
            } else {
                setCantones([]);
            }
        };
        cargarCantones();
    }, [formData.provinciaNacimiento, formData.nacionalidad, idNacionalidadEcuatoriana]);

    // 2. Filtrado de Parroquias
    useEffect(() => {
        const cargarParroquias = async () => {
            if (formData.cantonNacimiento && formData.nacionalidad == idNacionalidadEcuatoriana) {
                try {
                    const data = await catalogService.getParroquias(formData.cantonNacimiento);
                    setParroquias(data);
                } catch (error) {
                    console.error("Error al cargar parroquias:", error);
                    setParroquias([]);
                }
            } else {
                setParroquias([]);
            }
        };
        cargarParroquias();
    }, [formData.cantonNacimiento, formData.nacionalidad, idNacionalidadEcuatoriana]);

    // Lógica de Geografía Condicional (Nacionalidad)
    useEffect(() => {
        if (formData.nacionalidad && formData.nacionalidad != idNacionalidadEcuatoriana) {
            const camposGeografia = ['provinciaNacimiento', 'cantonNacimiento', 'parroquiaNacimiento'];
            let huboCambios = false;
            camposGeografia.forEach(campo => {
                if (formData[campo]) huboCambios = true;
            });

            if (huboCambios) {
                camposGeografia.forEach(campo => {
                    handleChange({ target: { name: campo, value: '' } });
                });
            }
        }
    }, [formData.nacionalidad, idNacionalidadEcuatoriana, handleChange]);

    // 5. Autogeneración del ID Temporal
    useEffect(() => {
        if (formData.fechaNacimiento && formData.provinciaNacimiento) {
            // Solo si es 'NO IDENTIFICADO' o si el ID está vacío y debe generarse
            const tipoIdent = catalogos.tiposIdentificacion?.find(t => t.id == formData.tipoIdentificacion);
            if (tipoIdent?.nombre?.toUpperCase() === 'NO IDENTIFICADO' || !formData.numeroIdentificacion) {
                const nuevoCodigo = generarCodigoTemporal(formData, catalogos.provincias);
                if (nuevoCodigo !== formData.numeroIdentificacion) {
                    handleChange({
                        target: {
                            name: 'numeroIdentificacion',
                            value: nuevoCodigo
                        }
                    });
                }
            }
        }
    }, [formData.fechaNacimiento, formData.provinciaNacimiento, formData.primerNombre, formData.segundoNombre, formData.primerApellido, formData.segundoApellido]);

    const inputClasses = "w-full rounded border-gray-400 bg-white text-[11px] py-1 px-1.5 focus:border-blue-600 focus:outline-none font-medium h-7 border-2 shadow-sm transition-colors disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";
    const inputReadOnlyClasses = "w-full rounded border-gray-400 bg-gray-100 text-[11px] py-1 px-1.5 focus:outline-none font-bold h-7 border-2 shadow-sm text-blue-700 cursor-not-allowed";
    const labelClasses = "block text-[10px] font-bold text-gray-600 mb-0.5 uppercase truncate";

    // Estado para controlar la visibilidad y obligatoriedad de "Cédula Madre"
    const [requiereCedulaMadre, setRequiereCedulaMadre] = useState(false);

    // Efecto para determinar si se requiere cédula de madre según lugar de parto
    useEffect(() => {
        const ESTABLECIMIENTO_LOCAL_NOMBRE = "CENTRO DE SALUD TIPO C CHONE";
        const establecimientoSeleccionado = catalogos.establecimientos?.find(e => e.id == formData.id_lugar_parto);
        
        // Es local si coincide el nombre O si no se ha seleccionado nada (asumimos local por defecto/seguridad)
        // Ojo: Si id_lugar_parto está vacío, establecimientoSeleccionado es undefined.
        // Asumiremos que si está vacío, NO mostramos/validamos hasta que seleccione.
        // Pero si selecciona "Otro" o "Externo", la lógica cambia.
        
        // Requerimiento Tarea 3:
        // Ocultar/Mostrar 'Cédula Madre' basado en `lugar_parto`
        // Si es LOCAL -> Mostrar Cédula Madre
        // Si es EXTERNO -> Ocultar Cédula Madre (y no validar)
        
        // Necesitamos saber qué establecimientos son "Externos".
        // Asumiremos que SOLO el local requiere validación estricta de madre ingresada.
        // Los partos externos (en taxi, casa, otro hospital) NO requieren que la madre tenga admisión local.
        
        const esLocal = establecimientoSeleccionado?.nombre?.toUpperCase() === ESTABLECIMIENTO_LOCAL_NOMBRE;
        setRequiereCedulaMadre(esLocal);

        // Si cambia a externo, limpiar cédula madre si se desea, o mantenerla opcional.
        // Por ahora solo controlamos el flag.
    }, [formData.id_lugar_parto, catalogos.establecimientos]);


    // Lógica Condicional para Validación de Madre (REQUERIMIENTO OFICIAL)
    const manejarBusquedaMadre = async (cedula) => {
        if (!cedula || cedula.length < 10) return;

        // Validar si el parto fue en el establecimiento local
        const ESTABLECIMIENTO_LOCAL_NOMBRE = "CENTRO DE SALUD TIPO C CHONE";
        // Buscamos coincidencia parcial o exacta más robusta
        const establecimientoSeleccionado = catalogos.establecimientos?.find(e => e.id == formData.id_lugar_parto);
        const nombreEstablecimiento = establecimientoSeleccionado?.nombre?.toUpperCase() || "";
        const esEstablecimientoLocal = nombreEstablecimiento.includes("TIPO C") && nombreEstablecimiento.includes("CHONE");

        try {
            const data = await pacienteService.getPacienteByCedula(cedula);
            
            if (data) {
                // SI el establecimiento es LOCAL y es parto reciente (<= 2 días): Validar estricto
                if (esEstablecimientoLocal && esPartoReciente) {
                    // 1. Validar Sexo (Femenino)
                    const idSexoFemenino = catalogos.sexos?.find(s => s.nombre?.toUpperCase() === 'MUJER' || s.nombre?.toUpperCase() === 'FEMENINO')?.id;
                    if (data.genderId != idSexoFemenino && data.sexo_id != idSexoFemenino) {
                        alert("Error: La cédula ingresada no corresponde a una persona de sexo femenino.");
                        return;
                    }

                    // 2. Validar Atención Previa (Últimas 48 horas)
                    const tieneAdmisionReciente = await pacienteService.verificarAdmisionReciente(data.id, 48);
                    if (!tieneAdmisionReciente) {
                        alert("Error: No se encontró una admisión para la madre en las últimas 48 horas. Para partos locales, la madre debe estar ingresada.");
                        return;
                    }
                }

                // Sincronizar automáticamente con campos de Representante (Común para Local y Externo si encuentra paciente)
                const updates = {
                    madre_id: data.id,
                    tipoDocRepresentante: data.tipo_identificacion_id || data.tipo_identificacion,
                    cedulaRepresentante: data.numero_identificacion,
                    repPrimerApellido: data.primer_apellido,
                    repSegundoApellido: data.segundo_apellido,
                    repPrimerNombre: data.primer_nombre,
                    repSegundoNombre: data.segundo_nombre,
                    parentescoRepresentante: catalogos.parentescos?.find(p => p.nombre?.toUpperCase() === 'MADRE')?.id || ''
                };
                
                if (typeof setFormData === 'function') {
                    setFormData(prev => ({
                        ...prev,
                        ...updates
                    }));
                } else {
                    Object.entries(updates).forEach(([name, value]) => {
                        handleChange({ target: { name, value } });
                    });
                }
            } else {
                if (esEstablecimientoLocal) {
                    alert("Error: La madre no está registrada en el sistema. Para partos locales, la madre debe tener historia clínica.");
                } else {
                    // SI es EXTERNO y no existe en DB local, NO SE PUEDE autocompletar,
                    // pero NO BLOQUEAMOS. El usuario llenará representante manualmente.
                    console.log("Madre externa no encontrada en local, llenado manual requerido.");
                }
            }
        } catch (error) {
            console.error("Error al buscar madre:", error);
        }
    };

    // Lógica de limpieza de Representante Legal (REQUERIMIENTO OFICIAL)
    // Lógica de limpieza de Representante Legal (REQUERIMIENTO OFICIAL)
    useEffect(() => {
        const mostrarRep = formData.fechaNacimiento && (edadInfo.anios < 2);
        if (!mostrarRep) {
            // Campos de paciente_representantes en el estado del formulario
            const camposAResetear = [
                'tipoDocRepresentante',
                'cedulaRepresentante',
                'parentescoRepresentante',
                'repPrimerApellido',
                'repSegundoApellido',
                'repPrimerNombre',
                'repSegundoNombre'
            ];
            
            let huboCambios = false;
            camposAResetear.forEach(campo => {
                if (formData[campo]) {
                    huboCambios = true;
                }
            });

            if (huboCambios) {
                // Notificamos al padre para limpiar los campos
                camposAResetear.forEach(campo => {
                    handleChange({ target: { name: campo, value: '' } });
                });
            }
        }
    }, [formData.fechaNacimiento, edadInfo.anios, handleChange]);
    
    return (
        <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-blue-900 border-b border-blue-200 pb-0.5 mb-2 uppercase tracking-tight">
                2. NACIMIENTO
            </h3>
            
            {/* Grid dinámico: 5 columnas si hay horas (neonatos < 28 días), 4 columnas si es estándar */}
            <div className={`grid ${isNeonato ? 'grid-cols-5' : 'grid-cols-4'} gap-x-2 gap-y-2`}>
                {/* Fila 1: Nacionalidad y Lugar - Span completo o ajustado según columnas */}
                <div className="col-span-1">
                    <label className={labelClasses}>
                        Nacionalidad <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="nacionalidad"
                        value={formData.nacionalidad || ''}
                        onChange={handleChange}
                        disabled={!(formHabilitado || (catalogos.tiposIdentificacion?.find(t => t.id == formData.tipoIdentificacion)?.nombre?.toUpperCase() === 'NO IDENTIFICADO'))}
                        className={inputClasses}
                        required
                    >
                        <option value="">Seleccione</option>
                        {catalogos.nacionalidades.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
                    </select>
                </div>

                <div className="col-span-1">
                    <label className={labelClasses}>Provincia Nacimiento <span className="text-red-500">*</span></label>
                    <select
                        ref={focusRef}
                        name="provinciaNacimiento"
                        value={formData.provinciaNacimiento || ''}
                        onChange={handleChange}
                        disabled={formData.nacionalidad != idNacionalidadEcuatoriana || !(formHabilitado || (catalogos.tiposIdentificacion?.find(t => t.id == formData.tipoIdentificacion)?.nombre?.toUpperCase() === 'NO IDENTIFICADO'))}
                        className={inputClasses}
                        required={formData.nacionalidad == idNacionalidadEcuatoriana}
                    >
                        <option value="">Seleccione</option>
                        {catalogos.provincias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                </div>

                <div className="col-span-1">
                    <label className={labelClasses}>Cantón Nacimiento</label>
                    <select
                        name="cantonNacimiento"
                        value={formData.cantonNacimiento || ''}
                        onChange={handleChange}
                        disabled={formData.nacionalidad != idNacionalidadEcuatoriana || !formData.provinciaNacimiento || !(formHabilitado || (catalogos.tiposIdentificacion?.find(t => t.id == formData.tipoIdentificacion)?.nombre?.toUpperCase() === 'NO IDENTIFICADO'))}
                        className={inputClasses}
                    >
                        <option value="">Seleccione</option>
                        {cantones.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                </div>

                <div className="col-span-1">
                    <label className={labelClasses}>Parroquia Nacimiento</label>
                    <select
                        name="parroquiaNacimiento"
                        value={formData.parroquiaNacimiento || ''}
                        onChange={handleChange}
                        disabled={formData.nacionalidad != idNacionalidadEcuatoriana || !formData.cantonNacimiento || !(formHabilitado || (catalogos.tiposIdentificacion?.find(t => t.id == formData.tipoIdentificacion)?.nombre?.toUpperCase() === 'NO IDENTIFICADO'))}
                        className={inputClasses}
                    >
                        <option value="">Seleccione</option>
                        {parroquias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                </div>

                {/* Fila 2: Fecha y Edad Compactada */}
                <div className="col-span-1">
                    <label className={labelClasses}>
                        Fecha Nacimiento <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="fechaNacimiento"
                        value={formData.fechaNacimiento || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        max={new Date().toISOString().split("T")[0]}
                        disabled={!(formHabilitado || (catalogos.tiposIdentificacion?.find(t => t.id == formData.tipoIdentificacion)?.nombre?.toUpperCase() === 'NO IDENTIFICADO'))}
                        className={`${inputClasses} font-bold ${edadInfo.isLess24h ? 'bg-yellow-50 border-yellow-400' : ''}`}
                        required
                    />
                </div>

                {/* Grid Anidado para el Desglose de Edad (Ajuste perfecto al espacio restante) */}
                <div className={`col-span-3 grid ${isNeonato ? 'grid-cols-4' : 'grid-cols-3'} gap-2`}>
                    <div className="col-span-1">
                        <label className={labelClasses}>Años</label>
                        <input
                            type="text"
                            name="anios"
                            value={edadInfo?.anios ?? 0}
                            readOnly
                            className={inputReadOnlyClasses}
                        />
                    </div>

                    <div className="col-span-1">
                        <label className={labelClasses}>Meses</label>
                        <input
                            type="text"
                            name="meses"
                            value={edadInfo?.meses ?? 0}
                            readOnly
                            className={inputReadOnlyClasses}
                        />
                    </div>

                    <div className="col-span-1">
                        <label className={labelClasses}>Días</label>
                        <input
                            type="text"
                            name="dias"
                            value={edadInfo?.dias ?? 0}
                            readOnly
                            className={inputReadOnlyClasses}
                        />
                    </div>

                    {/* Columna Horas: Solo visible si es neonato < 28 días */}
                    {isNeonato && (
                        <div className="col-span-1">
                            <label className={labelClasses}>Horas</label>
                            <input
                                type="text"
                                name="horas"
                                value={edadInfo?.horas ?? 0}
                                readOnly
                                className={`${inputReadOnlyClasses} bg-yellow-100 text-yellow-800 border-yellow-300`}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Datos de Nacimiento para Libro de Parto (REQUERIMIENTO RPIS/MSP) - SOLO NEONATOS < 28 DÍAS */}
            {/* Tarea 3: Visibilidad controlada por mostrarFlujoNeonatal */}
            {formData.fechaNacimiento && mostrarFlujoNeonatal && (
                <div className="mt-4 p-3 border-2 border-blue-400 bg-blue-50 rounded-lg shadow-inner">
                    <h4 className="text-[11px] font-extrabold text-blue-800 mb-3 border-b border-blue-300 pb-1 flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded mr-2">RPIS</span>
                            DATOS DE NACIMIENTO (LIBRO DE PARTO)
                        </div>
                        <span className="text-[9px] text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-200">REQUERIMIENTO OBLIGATORIO NEONATAL</span>
                    </h4>
                    
                    <div className="grid grid-cols-4 gap-x-2 gap-y-3">
                        
                        <div className="col-span-2">
                            <label className={labelClasses}>Lugar del Parto (Establecimiento RPIS)</label>
                            <div className="relative">
                                <select
                                    name="id_lugar_parto"
                                    value={formData.id_lugar_parto || ''}
                                    onChange={handleChange}
                                    disabled={!formHabilitado || establecimientosSalud.length === 0}
                                    className={`${inputClasses} bg-white ${establecimientosSalud.length === 0 ? 'animate-pulse' : ''}`}
                                >
                                    <option value="">{establecimientosSalud.length === 0 ? 'Cargando catálogos...' : 'Seleccione Establecimiento...'}</option>
                                    {establecimientosSalud.map(e => (
                                        <option key={e.id} value={e.id}>{e.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Renderizado Condicional de Cédula Madre basado en Lugar de Parto y Edad */}
                        {/* Tarea 3: Solo mostrar si lugar_parto es Local Y es parto reciente (<= 2 días) */}
                        {(() => {
                            const est = establecimientosSalud.find(e => e.id == formData.id_lugar_parto);
                            const nombreEst = est?.nombre?.toUpperCase() || "";
                            const esLocal = nombreEst.includes("TIPO C") && nombreEst.includes("CHONE");
                            
                            // Solo exigimos validación materna si es local Y es muy reciente
                            if (esLocal && esPartoReciente) {
                                return (
                                    <div className="col-span-1 animate-in fade-in slide-in-from-left-2 duration-300">
                                        <label className={labelClasses}>Cédula Madre <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="cedula_madre"
                                            value={formData.cedula_madre || ''}
                                            onChange={handleChange}
                                            onBlur={(e) => manejarBusquedaMadre(e.target.value)}
                                            disabled={!formHabilitado}
                                            required={true}
                                            placeholder="Ej: 1312345678"
                                            className={`${inputClasses} border-blue-500 bg-white`}
                                        />
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        <div className="col-span-1">
                            <label className={labelClasses}>HORA DEL PARTO/NACIMIENTO</label>
                            <input
                                type="time"
                                name="hora_parto"
                                value={formData.hora_parto || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={!formHabilitado}
                                className={`${inputClasses} font-bold text-blue-800 bg-white`}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Renderizado Condicional: Datos del Representante (ESTRICTAMENTE REACTIVO) */}
            {formData.fechaNacimiento && edadInfo.anios < 2 && (
                <SeccionRepresentante
                    formData={formData}
                    handleChange={handleChange}
                    catalogos={catalogos}
                    formHabilitado={formHabilitado}
                    esSubcomponente={true}
                    edadInfo={edadInfo}
                    manejarBusquedaMadre={manejarBusquedaMadre}
                />
            )}
        </div>
    );
};

export default SeccionNacimiento;

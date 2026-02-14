import React, { useEffect, useRef, useState, useMemo } from 'react';
import catalogService from '../../api/catalogService';
import { generarCodigoTemporal } from '../../utils/pacienteUtils';
import SeccionRepresentante from './SeccionRepresentante';
import pacienteService from '../../api/pacienteService';

const SeccionNacimiento = ({ formData, handleChange, handleBlur, catalogos, formHabilitado, edadInfo, setFormData, setModalConfig, setNavegacionBloqueada }) => {
    const focusRef = useRef(null);
    const horaRef = useRef(null);
    const establecimientoRef = useRef(null);
    const [cantones, setCantones] = useState([]);
    const [parroquias, setParroquias] = useState([]);
    const [contadorErroresHora, setContadorErroresHora] = useState(0);

    // Misión: Unificar validación a reloj atómico. [cite: 2026-02-14]
    const esMenorA24HorasReales = useMemo(() => {
        if (!formData.fecha_nacimiento) return false;
        
        // Si no hay hora, se calcula contra el inicio del día.
        // Si hay hora, se calcula contra el momento exacto.
        const hora = formData.hora_parto || '00:00:00';
        const timestampNacimiento = new Date(`${formData.fecha_nacimiento}T${hora}`).getTime();

        if (isNaN(timestampNacimiento)) return false;
        
        // Cálculo Atómico: (Date.now() - timestampNacimiento) < 86400000
        return (Date.now() - timestampNacimiento) < 86400000;
    }, [formData.fecha_nacimiento, formData.hora_parto]);


    const esHoyOAnteriores24h = useMemo(() => {
        if (!formData.fecha_nacimiento) return false;
        const hoy = new Date();
        const ayer = new Date(hoy);
        ayer.setDate(ayer.getDate() - 1);

        const fechaSeleccionada = new Date(`${formData.fecha_nacimiento}T00:00:00`);
        
        const esMismoDia = (d1, d2) =>
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();

        // Forzar Campo Hora: visible y obligatorio por defecto si es hoy o ayer.
        return esMismoDia(fechaSeleccionada, hoy) || esMismoDia(fechaSeleccionada, ayer) || esMenorA24HorasReales;
    }, [formData.fecha_nacimiento, esMenorA24HorasReales]);
    
    // Bloqueo de Navegación: Inhabilita SIGUIENTE si la fecha es < 24h y la hora está vacía.
    useEffect(() => {
        const debeBloquear = esMenorA24HorasReales && !formData.hora_parto;
        if (setNavegacionBloqueada) {
            setNavegacionBloqueada(debeBloquear);
        }
    }, [esMenorA24HorasReales, formData.hora_parto, setNavegacionBloqueada]);


    const esRegistroValido = useMemo(() => {
        if (!formData.fecha_nacimiento) return false;
        if (esMenorA24HorasReales && !formData.hora_parto) return false;
        
        if (formData.hora_parto) {
            const timestampNacimiento = new Date(`${formData.fecha_nacimiento}T${formData.hora_parto}`).getTime();
            if (isNaN(timestampNacimiento)) return false;
            
            // No puede ser futura (margen 5 min)
            if (timestampNacimiento > (Date.now() + 5 * 60 * 1000)) return false;

            // Si con la hora ya pasaron más de 24h, invalidar si tiene seleccionado el Tipo C Chone
            if (!esMenorA24HorasReales) {
                const est = catalogos.establecimientos?.find(e => e.id == formData.id_lugar_parto);
                if (est?.nombre?.toUpperCase().includes('CENTRO DE SALUD TIPO C CHONE')) return false;
            }
        }
        return true;
    }, [formData.fecha_nacimiento, formData.hora_parto, esMenorA24HorasReales, formData.id_lugar_parto, catalogos.establecimientos]);

    const isNeonato = edadInfo?.isNeonato;
    const mostrarFlujoNeonatal = edadInfo?.mostrarFlujoNeonatal;
    const esPartoReciente = edadInfo?.esPartoReciente;

    const idNacionalidadEcuatoriana = catalogos.nacionalidades?.find(n => n.nombre?.trim().toUpperCase() === 'ECUATORIANA')?.id;

    const [establecimientosSalud, setEstablecimientosSalud] = useState(catalogos.establecimientos || []);

    useEffect(() => {
        if (focusRef.current) {
            focusRef.current.focus();
        }
    }, []);

    useEffect(() => {
        const NOMBRE_RESTRINGIDO = 'CENTRO DE SALUD TIPO C CHONE';
        const establecimientoChone = catalogos.establecimientos?.find(e => e.nombre.toUpperCase().includes(NOMBRE_RESTRINGIDO));
    
        if (esMenorA24HorasReales && establecimientoChone) {
            // Inserta 'Centro de Salud Tipo C Chone' al principio si no está ya.
            setEstablecimientosSalud(prev => {
                const yaExiste = prev.some(e => e.id === establecimientoChone.id);
                if (yaExiste) {
                    // Mover al principio
                    return [establecimientoChone, ...prev.filter(e => e.id !== establecimientoChone.id)];
                } else {
                    return [establecimientoChone, ...prev];
                }
            });
        } else {
            // Filtra 'Centro de Salud Tipo C Chone' si la condición no se cumple.
            setEstablecimientosSalud(prev => prev.filter(e => !e.nombre.toUpperCase().includes(NOMBRE_RESTRINGIDO)));

            // Si estaba seleccionado, se deselecciona.
            const estSeleccionado = catalogos.establecimientos?.find(e => e.id == formData.id_lugar_parto);
            if (estSeleccionado?.nombre?.toUpperCase().includes(NOMBRE_RESTRINGIDO)) {
                handleChange({ target: { name: 'id_lugar_parto', value: '' } });
            }
        }
    }, [esMenorA24HorasReales, catalogos.establecimientos, formData.id_lugar_parto]);

    useEffect(() => {
        if (catalogos.establecimientos) {
            setEstablecimientosSalud(catalogos.establecimientos);
        }
    }, [catalogos.establecimientos]);

    useEffect(() => {
        const cargarCantones = async () => {
            if (formData.provinciaNacimiento && formData.id_nacionalidad == idNacionalidadEcuatoriana) {
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
    }, [formData.provinciaNacimiento, formData.id_nacionalidad, idNacionalidadEcuatoriana]);

    useEffect(() => {
        const cargarParroquias = async () => {
            if (formData.cantonNacimiento && formData.id_nacionalidad == idNacionalidadEcuatoriana) {
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
    }, [formData.cantonNacimiento, formData.id_nacionalidad, idNacionalidadEcuatoriana]);

    useEffect(() => {
        if (formData.id_nacionalidad && formData.id_nacionalidad != idNacionalidadEcuatoriana) {
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
    }, [formData.id_nacionalidad, idNacionalidadEcuatoriana, handleChange]);

    useEffect(() => {
        if (formData.fecha_nacimiento && formData.provinciaNacimiento) {
            const tipoIdent = catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion);
            if (tipoIdent?.nombre?.toUpperCase() === 'NO IDENTIFICADO' || !formData.numero_documento) {
                const nuevoCodigo = generarCodigoTemporal(formData, catalogos.provincias);
                if (nuevoCodigo !== formData.numero_documento) {
                    handleChange({
                        target: {
                            name: 'numero_documento',
                            value: nuevoCodigo
                        }
                    });
                }
            }
        }
    }, [formData.fecha_nacimiento, formData.provinciaNacimiento, formData.primer_nombre, formData.segundo_nombre, formData.primer_apellido, formData.segundo_apellido]);

    const inputClasses = "w-full rounded border-gray-400 bg-white text-[11px] py-1 px-1.5 focus:border-blue-600 focus:outline-none font-medium h-7 border-2 shadow-sm transition-colors disabled:bg-100 disabled:text-gray-500 disabled:cursor-not-allowed";
    const inputReadOnlyClasses = "w-full rounded border-gray-400 bg-gray-100 text-[11px] py-1 px-1.5 focus:outline-none font-bold h-7 border-2 shadow-sm text-blue-700 cursor-not-allowed";
    const labelClasses = "block text-[10px] font-bold text-gray-600 mb-0.5 uppercase truncate";

    const [requiereCedulaMadre, setRequiereCedulaMadre] = useState(false);

    useEffect(() => {
        const ESTABLECIMIENTO_LOCAL_NOMBRE = "CENTRO DE SALUD TIPO C CHONE";
        const establecimientoSeleccionado = catalogos.establecimientos?.find(e => e.id == formData.id_lugar_parto);
        const nombreEst = establecimientoSeleccionado?.nombre?.toUpperCase() || "";
        const esLocal = nombreEst.includes("TIPO C") && nombreEst.includes("CHONE");
        setRequiereCedulaMadre(esLocal);
    }, [formData.id_lugar_parto, catalogos.establecimientos]);


    const manejarBusquedaMadre = async (cedula) => {
        if (!cedula || cedula.length < 10) return;

        const ESTABLECIMIENTO_LOCAL_NOMBRE = "CENTRO DE SALUD TIPO C CHONE";
        const establecimientoSeleccionado = catalogos.establecimientos?.find(e => e.id == formData.id_lugar_parto);
        const nombreEstablecimiento = establecimientoSeleccionado?.nombre?.toUpperCase() || "";
        const esEstablecimientoLocal = nombreEstablecimiento.includes("TIPO C") && nombreEstablecimiento.includes("CHONE");

        try {
            const data = await pacienteService.getPacienteByCedula(cedula);
            
            if (data) {
                if (esEstablecimientoLocal && esPartoReciente) {
                    const idSexoFemenino = catalogos.sexos?.find(s => s.nombre?.toUpperCase() === 'MUJER' || s.nombre?.toUpperCase() === 'FEMENINO')?.id;
                    if (data.id_sexo != idSexoFemenino) {
                        setModalConfig({
                            show: true,
                            type: 'error',
                            title: 'Inconsistencia de Datos',
                            message: 'La cédula ingresada no corresponde a una persona de sexo femenino conforme al Registro Civil.'
                        });
                        return;
                    }

                    const tieneAdmisionReciente = await pacienteService.verificarAdmisionReciente(data.id, 48);
                    if (!tieneAdmisionReciente) {
                        setModalConfig({
                            show: true,
                            type: 'advertencia',
                            title: 'Validación de Flujo Materno',
                            message: 'No se encontró una admisión activa para la madre en las últimas 48 horas. Para partos institucionales, la madre debe estar ingresada en este establecimiento.'
                        });
                        return;
                    }
                }

                const updates = {
                    madre_id: data.id,
                    id_tipo_doc_representante: data.id_tipo_identificacion,
                    documento_representante: data.numero_documento,
                    nombre_representante: `${data.primer_nombre} ${data.segundo_nombre || ''} ${data.primer_apellido} ${data.segundo_apellido || ''}`.trim(),
                    direccion_representante: data.direccion || '',
                    id_parentesco_representante: catalogos.parentescos?.find(p => p.nombre?.toUpperCase() === 'MADRE')?.id || ''
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
                    setModalConfig({
                        show: true,
                        type: 'error',
                        title: 'Madre No Encontrada',
                        message: 'La madre no registra historial clínico en este sistema. Para partos institucionales es obligatorio el registro previo de la gestante.'
                    });
                }
            }
        } catch (error) {
            console.error("Error al buscar madre:", error);
        }
    };

    useEffect(() => {
        const mostrarRep = formData.fecha_nacimiento && (edadInfo.anios < 2);
        if (!mostrarRep) {
            const camposAResetear = [
                'id_tipo_doc_representante',
                'documento_representante',
                'id_parentesco_representante',
                'nombre_representante'
            ];
            
            let huboCambios = false;
            camposAResetear.forEach(campo => {
                if (formData[campo]) {
                    huboCambios = true;
                }
            });

            if (huboCambios) {
                camposAResetear.forEach(campo => {
                    handleChange({ target: { name: campo, value: '' } });
                });
            }
        }
    }, [formData.fecha_nacimiento, edadInfo.anios, handleChange]);
    
    return (
        <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-blue-900 border-b border-blue-200 pb-0.5 mb-2 uppercase tracking-tight">
                2. NACIMIENTO
            </h3>
            
            <div className={`grid ${isNeonato ? 'grid-cols-5' : 'grid-cols-4'} gap-x-2 gap-y-2`}>
                <div className="col-span-1">
                    <label className={labelClasses}>
                        Nacionalidad <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="id_nacionalidad"
                        value={formData.id_nacionalidad || ''}
                        onChange={handleChange}
                        disabled={!(formHabilitado || (catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion)?.nombre?.toUpperCase() === 'NO IDENTIFICADO'))}
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
                        disabled={formData.id_nacionalidad != idNacionalidadEcuatoriana || !(formHabilitado || (catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion)?.nombre?.toUpperCase() === 'NO IDENTIFICADO'))}
                        className={inputClasses}
                        required={formData.id_nacionalidad == idNacionalidadEcuatoriana}
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
                        disabled={formData.id_nacionalidad != idNacionalidadEcuatoriana || !formData.provinciaNacimiento || !(formHabilitado || (catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion)?.nombre?.toUpperCase() === 'NO IDENTIFICADO'))}
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
                        disabled={formData.id_nacionalidad != idNacionalidadEcuatoriana || !formData.cantonNacimiento || !(formHabilitado || (catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion)?.nombre?.toUpperCase() === 'NO IDENTIFICADO'))}
                        className={inputClasses}
                    >
                        <option value="">Seleccione</option>
                        {parroquias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                </div>

                <div className="col-span-1">
                    <label className={labelClasses}>
                        Fecha Nacimiento <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="fecha_nacimiento"
                        value={formData.fecha_nacimiento || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        max={new Date().toISOString().split("T")[0]}
                        disabled={!(formHabilitado || (catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion)?.nombre?.toUpperCase() === 'NO IDENTIFICADO'))}
                        className={`${inputClasses} font-bold ${edadInfo.isLess24h ? 'bg-yellow-50 border-yellow-400' : ''}`}
                        required
                    />
                </div>

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

            {formData.fecha_nacimiento && mostrarFlujoNeonatal && (
                <div className="mt-4 p-3 border-2 border-blue-400 bg-blue-50 rounded-lg shadow-inner">
                    <h4 className="text-[11px] font-extrabold text-blue-800 mb-3 border-b border-blue-300 pb-1 flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded mr-2">RPIS</span>
                            DATOS DE NACIMIENTO (LIBRO DE PARTO)
                        </div>
                        <span className="text-[9px] text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-200">REQUERIMIENTO OBLIGATORIO NEONATAL</span>
                    </h4>
                    
                    <div className="grid grid-cols-4 gap-x-2 gap-y-3">
              
                        {esHoyOAnteriores24h && (
                            <div className="col-span-1 animate-in fade-in zoom-in duration-300">
                                <label className={labelClasses}>HORA DEL PARTO/NACIMIENTO <span className="text-red-500">*</span></label>
                                <input
                                    ref={horaRef}
                                    type="time"
                                    name="hora_parto"
                                    value={formData.hora_parto || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (!val) {
                                            handleChange(e);
                                            return;
                                        }
              
                                        const now = new Date();
                                        const inputDateTime = new Date(`${formData.fecha_nacimiento}T${val}`);
                                        const margenMs = 5 * 60 * 1000;
              
                                        if (inputDateTime.getTime() > (now.getTime() + margenMs)) {
                                            setContadorErroresHora(prev => {
                                                const nuevoContador = prev + 1;
                                                const mensajeBase = 'La hora de nacimiento no puede ser posterior a la actual (margen 5 min).';
                                                const mensajeExtra = nuevoContador >= 2 ? ' ¿Desea reingresar la fecha completa para evitar confusión?' : '';
                                                
                                                setModalConfig({
                                                    show: true,
                                                    type: 'error',
                                                    title: 'Validación de Hora Bloqueante',
                                                    message: mensajeBase + mensajeExtra,
                                                    confirmAction: nuevoContador >= 2 ? () => {
                                                        setFormData(prevData => ({ ...prevData, fecha_nacimiento: '', hora_parto: '' }));
                                                        setContadorErroresHora(0);
                                                        setModalConfig(m => ({ ...m, show: false }));
                                                    } : null,
                                                    onClose: () => {
                                                        setFormData(prevData => ({ ...prevData, hora_parto: '' }));
                                                        setModalConfig(m => ({ ...m, show: false }));
                                                        setTimeout(() => horaRef.current?.focus(), 150);
                                                    }
                                                });
                                                return nuevoContador;
                                            });
                                        } else {
                                            handleChange(e);
                                        }
                                    }}
                                    onBlur={handleBlur}
                                    disabled={!formHabilitado}
                                    required={true}
                                    className={`${inputClasses} font-bold text-blue-800 bg-white border-blue-400 ${!formData.hora_parto ? 'ring-2 ring-red-200' : ''}`}
                                />
                            </div>
                        )}
                        
                        <div className="col-span-2">
                            <label className={labelClasses}>Lugar del Parto (Establecimiento RPIS)</label>
                            <div className="relative">
                                <select
                                    ref={establecimientoRef}
                                    name="id_lugar_parto"
                                    value={formData.id_lugar_parto || ''}
                                    onChange={handleChange}
                                    className={`${inputClasses} bg-white ${establecimientosSalud.length === 0 ? 'animate-pulse' : ''} ${(esMenorA24HorasReales && !formData.hora_parto) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                                    disabled={!formHabilitado || establecimientosSalud.length === 0 || (esMenorA24HorasReales && !formData.hora_parto)}
                                >
                                    <option value="">{(esMenorA24HorasReales && !formData.hora_parto) ? '--- INGRESE HORA PRIMERO ---' : 'Seleccione Establecimiento...'}</option>
                                    {establecimientosSalud.map(e => (
                                        <option key={e.id} value={e.id}>{e.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
              
                        {(() => {
                            const est = establecimientosSalud.find(e => e.id == formData.id_lugar_parto);
                            const nombreEst = est?.nombre?.toUpperCase() || "";
                            const esLocal = nombreEst.includes("TIPO C") && nombreEst.includes("CHONE");
                            
                            if (esLocal) {
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
                    </div>
                </div>
            )}

            {formData.fecha_nacimiento && edadInfo.anios < 2 && (
                <div className={!esRegistroValido ? "opacity-50 pointer-events-none grayscale select-none" : ""}>
                    <SeccionRepresentante
                        formData={formData}
                        handleChange={handleChange}
                        catalogos={catalogos}
                        formHabilitado={formHabilitado}
                        esSubcomponente={true}
                        edadInfo={edadInfo}
                        manejarBusquedaMadre={manejarBusquedaMadre}
                    />
                </div>
            )}
        </div>
    );
};

export default SeccionNacimiento;

import React, { useEffect, useRef, useState, useMemo } from 'react';
import catalogService from '../../api/catalogService';
import { generarCodigoTemporal } from '../../utils/pacienteUtils';
import SeccionRepresentante from './SeccionRepresentante';
import pacienteService from '../../api/pacienteService';

const SeccionNacimiento = ({ formData, handleChange, handleBlur, catalogos, formHabilitado, edadInfo, setFormData, setModalConfig, errors = {}, fechaRef }) => {
    const focusRef = useRef(null);
    const horaRef = useRef(null);
    const establecimientoRef = useRef(null);
    const [cantones, setCantones] = useState([]);
    const [parroquias, setParroquias] = useState([]);
    const [contadorErroresHora, setContadorErroresHora] = useState(0);

    // Misión: Unificar validación a reloj atómico. [cite: 2026-02-14]
    // CORRECCIÓN: Asegurar que el cálculo considere correctamente la zona horaria y no falle por milisegundos.
    const esMenorA24HorasReales = useMemo(() => {
        if (!formData.datosNacimiento?.fecha_nacimiento) return false;
        
        // Obtenemos la fecha seleccionada
        const fechaNac = formData.datosNacimiento.fecha_nacimiento;
        
        // Si no hay hora, asumimos las 00:00 del día seleccionado para la comparación inicial
        // PERO para la lógica de "requiere hora", si la fecha es HOY o AYER, necesitamos precisión.
        const hora = formData.datosNacimiento?.hora_parto || '00:00:00';
        
        // Construir timestamp local
        const fechaHoraString = `${fechaNac}T${hora}`;
        const fechaNacimientoObj = new Date(fechaHoraString);
        const timestampNacimiento = fechaNacimientoObj.getTime();
        const ahora = Date.now();

        if (isNaN(timestampNacimiento)) return false;
        
        // Diferencia en milisegundos
        const diferencia = ahora - timestampNacimiento;
        
        // 24 horas en milisegundos = 86,400,000
        // Es menor a 24 horas si la diferencia es positiva (pasado) y menor al límite
        // O si es futuro inmediato (margen de error)
        return diferencia < 86400000 && diferencia > -600000; // Margen de 10 min al futuro por si acaso reloj desincronizado
    }, [formData.datosNacimiento?.fecha_nacimiento, formData.datosNacimiento?.hora_parto]);

    // EFECTO DE RESTAURACIÓN DE VALIDACIÓN < 24 HORAS
    // Si se cumple la condición de < 24h, habilitamos la exigencia de hora y establecimiento.
    // Esto se maneja visualmente con 'esHoyOAnteriores24h', pero aseguramos la consistencia de datos aquí.


    const esHoyOAnteriores24h = useMemo(() => {
        // La validación de 24 horas depende de la edad calculada.
        // Si edadInfo ya nos dice que es < 24h (isLess24h), confiamos en ello.
        // Sin embargo, para la UI inicial antes de poner la hora, necesitamos saber si la FECHA es "potencialmente" < 24h.
        
        if (!formData.datosNacimiento?.fecha_nacimiento) return false;
        
        // Ajuste de zona horaria: Trabajamos con componentes locales para evitar desfases UTC
        const hoy = new Date();
        const ayer = new Date(hoy);
        ayer.setDate(ayer.getDate() - 1);

        // Parsear fecha input (YYYY-MM-DD) as local time
        const [year, month, day] = formData.datosNacimiento.fecha_nacimiento.split('-').map(Number);
        const fechaSeleccionada = new Date(year, month - 1, day); // Mes 0-indexado
        
        const esMismoDia = (d1, d2) =>
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();

        // Si es HOY o AYER, consideramos relevante la hora para validación de <24h
        // Si ya tenemos hora definida, usamos el cálculo preciso de edadInfo.
        if (formData.datosNacimiento?.hora_parto && edadInfo) {
            return edadInfo.isLess24h;
        }

        // Si NO hay hora, asumimos que "podría" ser < 24h si es hoy o ayer, forzando la entrada de hora.
        return esMismoDia(fechaSeleccionada, hoy) || esMismoDia(fechaSeleccionada, ayer);
    }, [formData.datosNacimiento?.fecha_nacimiento, formData.datosNacimiento?.hora_parto, edadInfo]);
    
    // Bloqueo de Navegación: Inhabilita SIGUIENTE si la fecha es < 24h y la hora está vacía.
    const esRegistroValido = useMemo(() => {
        if (!formData.datosNacimiento?.fecha_nacimiento) return false;
        
        // Si estamos en ventana de <24h potencial (Hoy/Ayer) y NO hay hora, no es válido aún
        if (esHoyOAnteriores24h && !formData.datosNacimiento?.hora_parto) return false;
        
        if (formData.datosNacimiento?.hora_parto) {
            // Si hay hora, validamos consistencia
            const timestampNacimiento = new Date(`${formData.datosNacimiento.fecha_nacimiento}T${formData.datosNacimiento.hora_parto}`).getTime();
            if (isNaN(timestampNacimiento)) return false;
            
            // No puede ser futura (margen 5 min)
            if (timestampNacimiento > (Date.now() + 5 * 60 * 1000)) return false;

            // Si con la hora calculada resulta que NO es menor a 24h (ej. ayer temprano),
            // entonces validamos reglas de establecimientos normales si aplica.
        }
        return true;
    }, [formData.datosNacimiento?.fecha_nacimiento, formData.datosNacimiento?.hora_parto, esHoyOAnteriores24h]);

    const isNeonato = edadInfo?.isNeonato;
    const mostrarFlujoNeonatal = edadInfo?.mostrarFlujoNeonatal;
    const esPartoReciente = edadInfo?.esPartoReciente;

    // Lógica Robustecida para Nacionalidad
    const idNacionalidadEcuatoriana = useMemo(() => {
        const ecuador = catalogos.nacionalidades?.find(n =>
            n.nombre?.trim().toUpperCase() === 'ECUATORIANA' ||
            n.gentilicio?.trim().toUpperCase() === 'ECUATORIANA'
        );
        return ecuador ? ecuador.id : 1; // Fallback seguro a ID 1 si no se encuentra
    }, [catalogos.nacionalidades]);

    // Calcular si habilitamos campos de ubicación
    const camposUbicacionHabilitados = useMemo(() => {
        // Tarea 2: Blindaje de Nacionalidad (Extranjeros)
        // Implementa un bloqueo estricto: SI nacionalidad !== 'ECUATORIANA', los selectores de Provincia, Cantón y Parroquia deben ponerse en disabled y resetearse a "Seleccione".
        // La excepción es 'NO IDENTIFICADO', pero la instrucción pide bloqueo estricto si nacionalidad !== 'ECUATORIANA'.
        
        const esEcuatoriano = formData.datosNacimiento?.id_nacionalidad == idNacionalidadEcuatoriana;
        return esEcuatoriano;
    }, [formData.datosNacimiento?.id_nacionalidad, idNacionalidadEcuatoriana]);

    // Soberanía Lingüística: Habilitación de Fecha para NN
    const habilitarFechaNacimiento = useMemo(() => {
        const tipoIdent = catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion);
        const esNoIdentificado = tipoIdent?.nombre?.toUpperCase()?.includes('NO IDENTIFICADO');
        return formHabilitado || esNoIdentificado;
    }, [formHabilitado, formData.id_tipo_identificacion, catalogos.tiposIdentificacion]);

    // FASE 2: Unificación de Pestaña 2 (Simetría Total)
    const mostrarFlujoNeonatalUnificado = useMemo(() => {
        if (!formData.datosNacimiento?.fecha_nacimiento) return false;

        // Regla de Oro (Actualizada): La sección se habilita si es Neonato (< 24h),
        // independientemente del tipo de ID (Cédula o No Identificado/17 dígitos).
        // Esto garantiza acceso universal a RPIS para ingresos críticos de neonatos.
        return esHoyOAnteriores24h;
    }, [formData.datosNacimiento?.fecha_nacimiento, esHoyOAnteriores24h]);

    // Calcular edad cuando cambie la fecha
    useEffect(() => {
        if (formData.datosNacimiento?.fecha_nacimiento && setFormData) {
            // Este efecto es crítico para actualizar el objeto edadInfo en el padre
            // pero en SeccionNacimiento, edadInfo viene como prop.
            // Si necesitamos disparar el cálculo, debemos asegurarnos que FormularioAdmisionMaestra
            // lo esté haciendo al recibir el cambio en handleChange.
        }
    }, [formData.datosNacimiento?.fecha_nacimiento]);

    const [establecimientosSalud, setEstablecimientosSalud] = useState(catalogos.establecimientos || []);

    useEffect(() => {
        if (focusRef.current) {
            focusRef.current.focus();
        }
    }, []);

    useEffect(() => {
        if (!catalogos.establecimientos) return;

        const ID_CANTON_CHONE = 1303;
        const CODIGO_PRIORITARIO = '001248';

        // 1. PASO 1: FILTRO TÉCNICO ESTRICTO
        // Filtra 'catalogos.establecimientos' para que SOLO se incluyan registros donde:
        // (e.tiene_sala_parto === 1 || e.tiene_quirofano === 1).
        let filtrados = catalogos.establecimientos.filter(e =>
            Number(e.tiene_quirofano) === 1 || Number(e.tiene_sala_parto) === 1
        );

        // 3. PASO 3: REGLA DE SEGURIDAD (24H)
        // si 'esMenorA24HorasReales' es FALSE, oculta específicamente el código '001248'
        if (!esMenorA24HorasReales) {
            filtrados = filtrados.filter(e => e.codigo_unico !== CODIGO_PRIORITARIO);
        }

        // 2. PASO 2: ORDENAMIENTO JERÁRQUICO (ID_CANTON 1303)
        // Aplica un .sort() con esta jerarquía exacta:
        // A) Si e.codigo_unico === '001248', va al inicio (Prioridad Máxima).
        // B) Si e.id_canton === 1303, va después (Resto de Chone).
        // C) El resto de establecimientos (otros cantones) van al final.
        // Dentro de cada grupo (B y C), ordena alfabéticamente por NOMBRE.
        filtrados.sort((a, b) => {
            // A) Prioridad Máxima
            if (a.codigo_unico === CODIGO_PRIORITARIO) return -1;
            if (b.codigo_unico === CODIGO_PRIORITARIO) return 1;

            // B) Resto de Chone
            const esChoneA = a.id_canton === ID_CANTON_CHONE;
            const esChoneB = b.id_canton === ID_CANTON_CHONE;
            
            if (esChoneA && !esChoneB) return -1;
            if (!esChoneA && esChoneB) return 1;

            // C) El resto y orden alfabético por NOMBRE
            return (a.nombre || '').toString().localeCompare((b.nombre || '').toString());
        });

        setEstablecimientosSalud(filtrados);

        // Validación de selección actual: Asegurar que el establecimiento seleccionado sigue siendo válido
        if (formData.datosNacimiento?.id_lugar_parto) {
            const sigueSiendoValido = filtrados.some(e => e.id == formData.datosNacimiento.id_lugar_parto);
            if (!sigueSiendoValido) {
                handleChange({ target: { name: 'datosNacimiento.id_lugar_parto', value: '' } });
            }
        }
    }, [catalogos.establecimientos, formData.datosNacimiento?.id_lugar_parto, esMenorA24HorasReales]);

    useEffect(() => {
        if (catalogos.establecimientos) {
            setEstablecimientosSalud(catalogos.establecimientos);
        }
    }, [catalogos.establecimientos]);

    // Estado para manejo de carga
    const [loadingCantones, setLoadingCantones] = useState(false);
    const [loadingParroquias, setLoadingParroquias] = useState(false);

    // Carga de Cantones (Reactividad por Provincia)
    useEffect(() => {
        const cargarCantonesPorProvincia = async () => {
            const idProvincia = formData.datosNacimiento?.provincia_nacimiento_id;
            
            if (idProvincia && camposUbicacionHabilitados) {
                setLoadingCantones(true);
                try {
                    const listaCantonesFiltrados = await catalogService.getCantones(idProvincia);
                    setCantones(listaCantonesFiltrados);
                } catch (errorCargaCatalogo) {
                    console.error("Error al cargar cantones:", errorCargaCatalogo);
                    setCantones([]);
                } finally {
                    setLoadingCantones(false);
                }
            } else {
                setCantones([]);
            }
        };
        cargarCantonesPorProvincia();
    }, [formData.datosNacimiento?.provincia_nacimiento_id, camposUbicacionHabilitados]);

    // Carga de Parroquias (Reactividad por Cantón)
    useEffect(() => {
        const cargarParroquiasPorCanton = async () => {
            const idCanton = formData.datosNacimiento?.canton_nacimiento_id;

            if (idCanton && camposUbicacionHabilitados) {
                setLoadingParroquias(true);
                try {
                    const listaParroquiasFiltradas = await catalogService.getParroquias(idCanton);
                    setParroquias(listaParroquiasFiltradas);
                } catch (errorCargaCatalogo) {
                    console.error("Error al cargar parroquias:", errorCargaCatalogo);
                    setParroquias([]);
                } finally {
                    setLoadingParroquias(false);
                }
            } else {
                setParroquias([]);
            }
        };
        cargarParroquiasPorCanton();
    }, [formData.datosNacimiento?.canton_nacimiento_id, camposUbicacionHabilitados]);

    // Referencia previa para detección de cambios de nacionalidad
    const prevNacionalidadRef = useRef(formData.datosNacimiento?.id_nacionalidad);

    // Lógica Unificada de Limpieza Geográfica - RESTAURADA
    useEffect(() => {
        const currentNacionalidad = formData.datosNacimiento?.id_nacionalidad;

        // Tarea 2: Blindaje de Nacionalidad (Extranjeros)
        // SI nacionalidad !== 'ECUATORIANA', los selectores deben resetearse a "Seleccione".
        if (currentNacionalidad && currentNacionalidad != idNacionalidadEcuatoriana) {
            if (formData.datosNacimiento?.provincia_nacimiento_id ||
                formData.datosNacimiento?.canton_nacimiento_id ||
                formData.datosNacimiento?.parroquia_nacimiento_id) {
                
                setFormData(prev => ({
                    ...prev,
                    datosNacimiento: {
                        ...prev.datosNacimiento,
                        provincia_nacimiento_id: '',
                        canton_nacimiento_id: '',
                        parroquia_nacimiento_id: ''
                    }
                }));
            }
        }
    }, [formData.datosNacimiento?.id_nacionalidad, idNacionalidadEcuatoriana]);

    // Vínculo Reactivo (ID -> Banner) - Soberanía Lingüística
    // ELIMINADO: La lógica de generación de código se ha centralizado completamente en FormularioAdmisionMaestra.jsx
    // para evitar condiciones de carrera y bucles infinitos.
    // Se mantiene solo la actualización de datosNacimiento aquí.

    const inputClasses = "w-full rounded border-gray-400 bg-white text-[11px] py-1 px-1.5 focus:border-blue-600 focus:outline-none font-medium h-7 border-2 shadow-sm transition-colors disabled:bg-100 disabled:text-gray-500 disabled:cursor-not-allowed";
    const inputReadOnlyClasses = "w-full rounded border-gray-400 bg-gray-100 text-[11px] py-1 px-1.5 focus:outline-none font-bold h-7 border-2 shadow-sm text-blue-700 cursor-not-allowed";
    const labelClasses = "block text-[10px] font-bold text-gray-600 mb-0.5 uppercase truncate";

    const [requiereCedulaMadre, setRequiereCedulaMadre] = useState(false);

    useEffect(() => {
        const ESTABLECIMIENTO_LOCAL_NOMBRE = "CENTRO DE SALUD TIPO C CHONE";
        const establecimientoSeleccionado = catalogos.establecimientos?.find(e => e.id == formData.datosNacimiento?.id_lugar_parto);
        const nombreEst = establecimientoSeleccionado?.nombre?.toUpperCase() || "";
        const esLocal = nombreEst.includes("TIPO C") && nombreEst.includes("CHONE");
        setRequiereCedulaMadre(esLocal);
    }, [formData.datosNacimiento?.id_lugar_parto, catalogos.establecimientos]);


    const manejarBusquedaMadre = async (cedula) => {
        if (!cedula || cedula.length < 10) return;

        const ESTABLECIMIENTO_LOCAL_NOMBRE = "CENTRO DE SALUD TIPO C CHONE";
        const establecimientoSeleccionado = catalogos.establecimientos?.find(e => e.id == formData.datosNacimiento?.id_lugar_parto);
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
                
                // NOTA IMPORTANTE: En la versión original se intentaba setFormData pero no estaba claro si se pasaba.
                // Aquí usamos handleChange iterativo como fallback seguro.
                Object.entries(updates).forEach(([name, value]) => {
                    handleChange({ target: { name, value } });
                });

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
        const mostrarRep = formData.datosNacimiento?.fecha_nacimiento && (edadInfo.anios < 2);
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
    }, [formData.datosNacimiento?.fecha_nacimiento, edadInfo.anios]);
    
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
                        tabIndex="201"
                        name="datosNacimiento.id_nacionalidad"
                        value={formData.datosNacimiento?.id_nacionalidad || ''}
                        onChange={(e) => {
                            // Reparación del Selector de Nacionalidad:
                            // Aseguramos captura numérica y eliminamos bloqueos.
                            handleChange({
                                target: {
                                    name: 'datosNacimiento.id_nacionalidad',
                                    value: Number(e.target.value)
                                }
                            });
                        }}
                        className={inputClasses}
                        required
                    >
                        <option value="">Seleccione</option>
                        {catalogos.nacionalidades.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
                    </select>
                </div>

                <div className="col-span-1">
                    <label className={labelClasses}>Provincia Nacimiento {camposUbicacionHabilitados && <span className="text-red-500">*</span>}</label>
                    <select
                        tabIndex="202"
                        ref={focusRef}
                        name="datosNacimiento.provincia_nacimiento_id"
                        value={formData.datosNacimiento?.provincia_nacimiento_id || ''}
                        onChange={(e) => {
                            // Al cambiar provincia, limpiamos cantón y parroquia para forzar selección válida
                            handleChange(e);
                            handleChange({ target: { name: 'datosNacimiento.canton_nacimiento_id', value: '' } });
                            handleChange({ target: { name: 'datosNacimiento.parroquia_nacimiento_id', value: '' } });
                        }}
                        disabled={!camposUbicacionHabilitados}
                        className={`${inputClasses} ${!camposUbicacionHabilitados ? 'bg-gray-100 text-gray-400' : ''}`}
                        required={camposUbicacionHabilitados}
                    >
                        <option value="">Seleccione</option>
                        {catalogos.provincias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                </div>

                <div className="col-span-1">
                    <label className={labelClasses}>
                        Cantón Nacimiento {loadingCantones && <span className="text-blue-500 animate-pulse text-[9px] ml-1">(Cargando...)</span>}
                        {camposUbicacionHabilitados && <span className="text-red-500">*</span>}
                    </label>
                    <select
                        tabIndex="203"
                        name="datosNacimiento.canton_nacimiento_id"
                        value={formData.datosNacimiento?.canton_nacimiento_id || ''}
                        onChange={(e) => {
                            // Al cambiar cantón, limpiamos parroquia explícitamente para UX inmediata
                            handleChange(e);
                            handleChange({ target: { name: 'datosNacimiento.parroquia_nacimiento_id', value: '' } });
                        }}
                        disabled={!camposUbicacionHabilitados || !formData.datosNacimiento?.provincia_nacimiento_id || loadingCantones}
                        className={`${inputClasses} ${(!camposUbicacionHabilitados) ? 'bg-gray-100 text-gray-400' : ''}`}
                        required={camposUbicacionHabilitados}
                    >
                        <option value="">Seleccione</option>
                        {cantones.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                </div>

                <div className="col-span-1">
                    <label className={labelClasses}>
                        Parroquia Nacimiento {loadingParroquias && <span className="text-blue-500 animate-pulse text-[9px] ml-1">(Cargando...)</span>}
                        {camposUbicacionHabilitados && <span className="text-red-500">*</span>}
                    </label>
                    <select
                        tabIndex="204"
                        name="datosNacimiento.parroquia_nacimiento_id"
                        value={formData.datosNacimiento?.parroquia_nacimiento_id || ''}
                        onChange={handleChange}
                        disabled={!camposUbicacionHabilitados || !formData.datosNacimiento?.canton_nacimiento_id || loadingParroquias}
                        className={`${inputClasses} ${(!camposUbicacionHabilitados) ? 'bg-gray-100 text-gray-400' : ''}`}
                        required={camposUbicacionHabilitados}
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
                        tabIndex="205"
                        ref={fechaRef}
                        type="date"
                        name="datosNacimiento.fecha_nacimiento"
                        value={formData.datosNacimiento?.fecha_nacimiento || ''}
                        onChange={(e) => {
                            handleChange(e);
                        }}
                        onBlur={handleBlur}
                        max={new Date().toISOString().split("T")[0]}
                        disabled={!habilitarFechaNacimiento}
                        className={`${inputClasses} font-bold ${edadInfo?.isLess24h ? 'bg-yellow-50 border-yellow-400' : ''}`}
                        onKeyDown={(e) => {
                            if (e.key === 'Tab' && !e.shiftKey && esHoyOAnteriores24h) {
                                e.preventDefault();
                                horaRef.current?.focus();
                            }
                        }}
                        required
                    />
                    {errors.fecha_nacimiento && <p className="text-red-500 text-xs mt-1">{errors.fecha_nacimiento}</p>}
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

            {formData.datosNacimiento?.fecha_nacimiento && mostrarFlujoNeonatalUnificado && (
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
                                    tabIndex="206"
                                    ref={horaRef}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Tab' && !e.shiftKey) {
                                            e.preventDefault();
                                            establecimientoRef.current?.focus();
                                        }
                                    }}
                                    type="time"
                                    name="datosNacimiento.hora_parto"
                                    value={formData.datosNacimiento?.hora_parto || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (!val) {
                                            handleChange(e);
                                            return;
                                        }
              
                                        const now = new Date();
                                        // Usar fecha nacimiento seleccionada para validar
                                        const inputDateTime = new Date(`${formData.datosNacimiento?.fecha_nacimiento}T${val}`);
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
                                                        handleChange({ target: { name: 'datosNacimiento.fecha_nacimiento', value: '' } });
                                                        handleChange({ target: { name: 'datosNacimiento.hora_parto', value: '' } });
                                                        setContadorErroresHora(0);
                                                        setModalConfig(m => ({ ...m, show: false }));
                                                    } : null,
                                                    onClose: () => {
                                                        handleChange({ target: { name: 'datosNacimiento.hora_parto', value: '' } });
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
                                    disabled={false} // Siempre editable para neonatos críticos
                                    required={true}
                                    className={`${inputClasses} font-bold text-blue-800 bg-white border-blue-400 ${!formData.datosNacimiento?.hora_parto ? 'ring-2 ring-red-200' : ''}`}
                                />
                            </div>
                        )}
                        
                        <div className="col-span-2">
                            <label className={labelClasses}>Lugar del Parto (Establecimiento RPIS)</label>
                            <div className="relative">
                                <select
                                    tabIndex="207"
                                    ref={establecimientoRef}
                                    name="datosNacimiento.id_lugar_parto"
                                    value={formData.datosNacimiento?.id_lugar_parto || ''}
                                    onChange={handleChange}
                                    className={`${inputClasses} bg-white ${establecimientosSalud.length === 0 ? 'animate-pulse' : ''} ${(esHoyOAnteriores24h && !formData.datosNacimiento?.hora_parto) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                                    disabled={(esHoyOAnteriores24h && !formData.datosNacimiento?.hora_parto)}
                                >
                                    <option value="">{(esHoyOAnteriores24h && !formData.datosNacimiento?.hora_parto) ? '--- INGRESE HORA PRIMERO ---' : 'SELECCIONE ESTABLECIMIENTO...'}</option>
                                    {establecimientosSalud.map(e => (
                                        <option key={e.id} value={e.id}>
                                            {`${e.codigo_unico} - ${e.nombre}`.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
              
                        {(() => {
                            const est = establecimientosSalud.find(e => e.id == formData.datosNacimiento?.id_lugar_parto);
                            const nombreEst = est?.nombre?.toUpperCase() || "";
                            const esLocal = nombreEst.includes("TIPO C") && nombreEst.includes("CHONE");
                            
                            if (esLocal) {
                                return (
                                    <div className="col-span-1 animate-in fade-in slide-in-from-left-2 duration-300">
                                        <label className={labelClasses}>Cédula Madre <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            tabIndex="208"
                                            name="datosNacimiento.cedula_madre"
                                            value={formData.datosNacimiento?.cedula_madre || ''}
                                            onChange={handleChange}
                                            onBlur={(e) => manejarBusquedaMadre(e.target.value)}
                                            disabled={!(formHabilitado || (catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion)?.nombre?.toUpperCase() === 'NO IDENTIFICADO'))}
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

            {formData.datosNacimiento?.fecha_nacimiento && edadInfo.anios < 2 && (
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

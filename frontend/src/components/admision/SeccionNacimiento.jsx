import React, { useEffect, useRef, useState, useMemo } from 'react';
import catalogService from '../../api/catalogService';
import { generarCodigoTemporal } from '../../utils/pacienteUtils';
import SeccionRepresentante from './SeccionRepresentante';
import pacienteService from '../../api/pacienteService';

const SeccionNacimiento = ({ formData, handleChange, handleBlur, catalogos, formHabilitado, edadInfo, setFormData, setModalConfig, errors = {} }) => {
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
        return esMismoDia(fechaSeleccionada, hoy) || esMismoDia(fechaSeleccionada, ayer);
    }, [formData.datosNacimiento?.fecha_nacimiento]);
    
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
        const NOMBRE_RESTRINGIDO = 'CENTRO DE SALUD TIPO C CHONE';
        const establecimientoChone = catalogos.establecimientos?.find(e => e.nombre.toUpperCase().includes(NOMBRE_RESTRINGIDO));
    
        // Lógica restaurada de validación de 24 horas para establecimiento
        if (esMenorA24HorasReales && establecimientoChone) {
            // Si es menor a 24 horas, MOSTRAR Chone y priorizarlo
            setEstablecimientosSalud(prev => {
                const yaExiste = prev.some(e => e.id === establecimientoChone.id);
                if (yaExiste) {
                    return [establecimientoChone, ...prev.filter(e => e.id !== establecimientoChone.id)];
                } else {
                    return [establecimientoChone, ...prev];
                }
            });
        } else {
            // Si NO es menor a 24 horas, OCULTAR Chone (Regla de negocio estricta restaurada)
            // Se debe derivar a otro nivel si han pasado más de 24 horas del parto fuera de la unidad.
             if (!esMenorA24HorasReales) {
                setEstablecimientosSalud(prev => prev.filter(e => !e.nombre.toUpperCase().includes(NOMBRE_RESTRINGIDO)));
             }
             
            // Si estaba seleccionado y ya no es válido (pasaron 24h), se limpia.
            const estSeleccionado = catalogos.establecimientos?.find(e => e.id == formData.datosNacimiento?.id_lugar_parto);
            if (estSeleccionado?.nombre?.toUpperCase().includes(NOMBRE_RESTRINGIDO) && !esMenorA24HorasReales) {
                 handleChange({ target: { name: 'datosNacimiento.id_lugar_parto', value: '' } });
            }
        }
    }, [esMenorA24HorasReales, catalogos.establecimientos, formData.datosNacimiento?.id_lugar_parto]);

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
            
            // Soberanía Lingüística: Permitir carga para Ecuatorianos O No Identificados (que requieren lugar de nacimiento para ID)
            const tipoIdent = catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion);
            const esNoIdentificado = tipoIdent?.nombre?.toUpperCase() === 'NO IDENTIFICADO';
            const permitirSeleccionGeografica = (formData.datosNacimiento?.id_nacionalidad == idNacionalidadEcuatoriana) || esNoIdentificado;

            if (idProvincia && permitirSeleccionGeografica) {
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
    }, [formData.datosNacimiento?.provincia_nacimiento_id, formData.datosNacimiento?.id_nacionalidad, idNacionalidadEcuatoriana, formData.id_tipo_identificacion, catalogos.tiposIdentificacion]);

    // Carga de Parroquias (Reactividad por Cantón)
    useEffect(() => {
        const cargarParroquiasPorCanton = async () => {
            const idCanton = formData.datosNacimiento?.canton_nacimiento_id;

            // Soberanía Lingüística: Permitir carga para Ecuatorianos O No Identificados
            const tipoIdent = catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion);
            const esNoIdentificado = tipoIdent?.nombre?.toUpperCase() === 'NO IDENTIFICADO';
            const permitirSeleccionGeografica = (formData.datosNacimiento?.id_nacionalidad == idNacionalidadEcuatoriana) || esNoIdentificado;

            if (idCanton && permitirSeleccionGeografica) {
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
    }, [formData.datosNacimiento?.canton_nacimiento_id, formData.datosNacimiento?.id_nacionalidad, idNacionalidadEcuatoriana, formData.id_tipo_identificacion, catalogos.tiposIdentificacion]);

    // Referencia previa para detección de cambios de nacionalidad
    const prevNacionalidadRef = useRef(formData.datosNacimiento?.id_nacionalidad);

    // Lógica Unificada de Limpieza Geográfica - RESTAURADA
    useEffect(() => {
        const prevNacionalidad = prevNacionalidadRef.current;
        const currentNacionalidad = formData.datosNacimiento?.id_nacionalidad;

        // Si la nacionalidad cambia
        if (prevNacionalidad !== currentNacionalidad) {
            prevNacionalidadRef.current = currentNacionalidad;

            // CASO: Cambia a NO Ecuatoriana
            if (currentNacionalidad && currentNacionalidad != idNacionalidadEcuatoriana) {
                // Verificar si hay datos que limpiar para evitar renders innecesarios
                if (formData.datosNacimiento?.provincia_nacimiento_id ||
                    formData.datosNacimiento?.canton_nacimiento_id ||
                    formData.datosNacimiento?.parroquia_nacimiento_id) {
                    
                    // Limpieza segura
                    handleChange({ target: { name: 'datosNacimiento.provincia_nacimiento_id', value: '' } });
                    handleChange({ target: { name: 'datosNacimiento.canton_nacimiento_id', value: '' } });
                    handleChange({ target: { name: 'datosNacimiento.parroquia_nacimiento_id', value: '' } });
                }
            }
        }
    }, [formData.datosNacimiento?.id_nacionalidad, idNacionalidadEcuatoriana]);

    // Vínculo Reactivo (ID -> Banner) - Soberanía Lingüística
    useEffect(() => {
        const idProvinciaNacimiento = formData.datosNacimiento?.provincia_nacimiento_id;

        // Solo actuar si hay provincia seleccionada
        if (!idProvinciaNacimiento) return;

        // Verificar si necesitamos generar código (NO IDENTIFICADO o Código 99)
        const tipoIdent = catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion);
        const esNoIdentificado = tipoIdent?.nombre?.toUpperCase() === 'NO IDENTIFICADO';
        const esCodigoEmergencia = formData.numero_documento === '99';
        const validacionIntermedia = !formData.numero_documento || esNoIdentificado || esCodigoEmergencia;

        if (validacionIntermedia && formData.datosNacimiento?.fecha_nacimiento) {
            // Buscar la provincia para obtener el código oficial de 2 dígitos
            const provinciaObj = catalogos.provincias?.find(p => p.id == idProvinciaNacimiento);
            
            // Usamos el ID como base para el código provincial (ej. '17')
            const codigoProvincia = String(idProvinciaNacimiento).padStart(2, '0');

            // Preparar datos para el generador
            const datosParaCodigo = {
                ...formData,
                datosNacimiento: {
                    ...formData.datosNacimiento,
                    provincia_codigo: codigoProvincia
                }
            };

            // Invocar utilitario de generación
            const nuevoCodigo = generarCodigoTemporal(datosParaCodigo, catalogos.provincias);

            // Actualización instantánea si difiere
            if (nuevoCodigo && nuevoCodigo !== formData.numero_documento) {
                handleChange({
                    target: {
                        name: 'numero_documento',
                        value: nuevoCodigo
                    }
                });
            }
        }
    }, [
        formData.datosNacimiento?.provincia_nacimiento_id,
        formData.datosNacimiento?.fecha_nacimiento,
        formData.id_tipo_identificacion,
        formData.numero_documento,
        formData.primer_nombre,
        formData.primer_apellido,
    ]);

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
                    <label className={labelClasses}>Provincia Nacimiento {formData.datosNacimiento?.id_nacionalidad == idNacionalidadEcuatoriana && <span className="text-red-500">*</span>}</label>
                    <select
                        ref={focusRef}
                        name="datosNacimiento.provincia_nacimiento_id"
                        value={formData.datosNacimiento?.provincia_nacimiento_id || ''}
                        onChange={(e) => {
                            // Al cambiar provincia, limpiamos cantón y parroquia para forzar selección válida
                            handleChange(e);
                            handleChange({ target: { name: 'datosNacimiento.canton_nacimiento_id', value: '' } });
                            handleChange({ target: { name: 'datosNacimiento.parroquia_nacimiento_id', value: '' } });
                        }}
                        disabled={!formHabilitado || (!formData.datosNacimiento?.id_nacionalidad && !catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion)?.nombre?.toUpperCase() === 'NO IDENTIFICADO') || (formData.datosNacimiento?.id_nacionalidad != idNacionalidadEcuatoriana && catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion)?.nombre?.toUpperCase() !== 'NO IDENTIFICADO')}
                        className={`${inputClasses} ${formData.datosNacimiento?.id_nacionalidad != idNacionalidadEcuatoriana && catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion)?.nombre?.toUpperCase() !== 'NO IDENTIFICADO' ? 'bg-gray-100 text-gray-400' : ''}`}
                        required={formData.datosNacimiento?.id_nacionalidad == idNacionalidadEcuatoriana}
                    >
                        <option value="">Seleccione</option>
                        {catalogos.provincias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                </div>

                <div className="col-span-1">
                    <label className={labelClasses}>
                        Cantón Nacimiento {loadingCantones && <span className="text-blue-500 animate-pulse text-[9px] ml-1">(Cargando...)</span>}
                        {formData.datosNacimiento?.id_nacionalidad == idNacionalidadEcuatoriana && <span className="text-red-500">*</span>}
                    </label>
                    <select
                        name="datosNacimiento.canton_nacimiento_id"
                        value={formData.datosNacimiento?.canton_nacimiento_id || ''}
                        onChange={(e) => {
                            // Al cambiar cantón, limpiamos parroquia explícitamente para UX inmediata
                            handleChange(e);
                            handleChange({ target: { name: 'datosNacimiento.parroquia_nacimiento_id', value: '' } });
                        }}
                        disabled={!formHabilitado || !formData.datosNacimiento?.provincia_nacimiento_id || (formData.datosNacimiento?.id_nacionalidad != idNacionalidadEcuatoriana && catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion)?.nombre?.toUpperCase() !== 'NO IDENTIFICADO') || loadingCantones}
                        className={`${inputClasses} ${formData.datosNacimiento?.id_nacionalidad != idNacionalidadEcuatoriana && catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion)?.nombre?.toUpperCase() !== 'NO IDENTIFICADO' ? 'bg-gray-100 text-gray-400' : ''}`}
                        required={formData.datosNacimiento?.id_nacionalidad == idNacionalidadEcuatoriana}
                    >
                        <option value="">Seleccione</option>
                        {cantones.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                </div>

                <div className="col-span-1">
                    <label className={labelClasses}>
                        Parroquia Nacimiento {loadingParroquias && <span className="text-blue-500 animate-pulse text-[9px] ml-1">(Cargando...)</span>}
                        {formData.datosNacimiento?.id_nacionalidad == idNacionalidadEcuatoriana && <span className="text-red-500">*</span>}
                    </label>
                    <select
                        name="datosNacimiento.parroquia_nacimiento_id"
                        value={formData.datosNacimiento?.parroquia_nacimiento_id || ''}
                        onChange={handleChange}
                        disabled={!formHabilitado || !formData.datosNacimiento?.canton_nacimiento_id || (formData.datosNacimiento?.id_nacionalidad != idNacionalidadEcuatoriana && catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion)?.nombre?.toUpperCase() !== 'NO IDENTIFICADO') || loadingParroquias}
                        className={`${inputClasses} ${formData.datosNacimiento?.id_nacionalidad != idNacionalidadEcuatoriana && catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion)?.nombre?.toUpperCase() !== 'NO IDENTIFICADO' ? 'bg-gray-100 text-gray-400' : ''}`}
                        required={formData.datosNacimiento?.id_nacionalidad == idNacionalidadEcuatoriana}
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
                        name="datosNacimiento.fecha_nacimiento"
                        value={formData.datosNacimiento?.fecha_nacimiento || ''}
                        onChange={(e) => {
                            handleChange(e);
                        }}
                        onBlur={handleBlur}
                        max={new Date().toISOString().split("T")[0]}
                        disabled={!formHabilitado}
                        className={`${inputClasses} font-bold ${edadInfo.isLess24h ? 'bg-yellow-50 border-yellow-400' : ''}`}
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

            {formData.datosNacimiento?.fecha_nacimiento && mostrarFlujoNeonatal && (
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
                                    disabled={!formHabilitado}
                                    required={true}
                                    className={`${inputClasses} font-bold text-blue-800 bg-white border-blue-400 ${!formData.datosNacimiento?.hora_parto ? 'ring-2 ring-red-200' : ''}`}
                                />
                            </div>
                        )}
                        
                        <div className="col-span-2">
                            <label className={labelClasses}>Lugar del Parto (Establecimiento RPIS)</label>
                            <div className="relative">
                                <select
                                    ref={establecimientoRef}
                                    name="datosNacimiento.id_lugar_parto"
                                    value={formData.datosNacimiento?.id_lugar_parto || ''}
                                    onChange={handleChange}
                                    className={`${inputClasses} bg-white ${establecimientosSalud.length === 0 ? 'animate-pulse' : ''} ${(esHoyOAnteriores24h && !formData.datosNacimiento?.hora_parto) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                                    disabled={!formHabilitado || establecimientosSalud.length === 0 || (esHoyOAnteriores24h && !formData.datosNacimiento?.hora_parto)}
                                >
                                    <option value="">{(esHoyOAnteriores24h && !formData.datosNacimiento?.hora_parto) ? '--- INGRESE HORA PRIMERO ---' : 'Seleccione Establecimiento...'}</option>
                                    {establecimientosSalud.map(e => (
                                        <option key={e.id} value={e.id}>{e.nombre}</option>
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
                                            name="datosNacimiento.cedula_madre"
                                            value={formData.datosNacimiento?.cedula_madre || ''}
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

            {formData.datosNacimiento?.fecha_nacimiento && edadInfo.anios < 2 && (
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

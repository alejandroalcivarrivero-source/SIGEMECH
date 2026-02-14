import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    User, MapPin, Baby, FileText, Users,
    ClipboardList, Save, ShieldCheck, HeartPulse
} from 'lucide-react';
import { validarAdmisionCompleta } from '../../utils/validaciones_admision';
import { useNavigate } from 'react-router-dom';
import pacienteService from '../../api/pacienteService';
import catalogService from '../../api/catalogService';
import ModalFeedback from '../ModalFeedback';

// Sub-componentes modulares refactorizados
import SeccionIdentidad from './SeccionIdentidad';
import SeccionNacimiento from './SeccionNacimiento';
import SeccionResidencia from './SeccionResidencia';
import { generarCodigoTemporal } from '../../utils/pacienteUtils';
import { generarCodigoNormativo } from '../../utils/generador_codigo';
import SeccionDatosAdicionales from './SeccionDatosAdicionales';
import SeccionContactoEmergencia from './SeccionContactoEmergencia';
import SeccionLlegadaMotivo from './SeccionLlegadaMotivo';

const FormularioAdmisionMaestra = () => {
    const navigate = useNavigate();
    
    const [catalogos, setCatalogos] = useState({
        provincias: [], cantones: [], parroquias: [], nacionalidades: [],
        etnias: [], nivelesEducacion: [], segurosSalud: [], sexos: [],
        estadosCiviles: [], generos: [], parentescos: [], formasLlegada: [],
        fuentesInformacion: [], tiposDocumento: [], condicionesLlegada: [],
        tiposIdentificacion: []
    });

    const [cantonesFiltrados, setCantonesFiltrados] = useState([]);
    const [parroquiasFiltradas, setParroquiasFiltradas] = useState([]);
    const [activeTab, setActiveTab] = useState('personales');
    const [loading, setLoading] = useState(false);
    const [formHabilitado, setFormHabilitado] = useState(false);
    const [formKey, setFormKey] = useState(0);
    const [modalConfig, setModalConfig] = useState({ show: false, type: 'info', title: '', message: '', confirmAction: null });

    const initialFormData = {
        // Pestaña 1
        id_tipo_identificacion: '', numero_documento: '', primer_apellido: '', segundo_apellido: '',
        primer_nombre: '', segundo_nombre: '', id_estado_civil: '', id_sexo: '',
        telefono_fijo: '', telefono: '', email: '',
        
        // Pestaña 2
        id_nacionalidad: '',
        provinciaNacimiento: '', cantonNacimiento: '', parroquiaNacimiento: '',
        fecha_nacimiento: '', id_etnia: '', id_nacionalidad_etnica: '', id_pueblo: '',
        
        // Pestaña 3
        paisResidencia: 'Ecuador', provinciaResidencia: '', cantonResidencia: '',
        id_parroquia: '', barrio: '', callePrincipal: '', calleSecundaria: '',
        numeroCasa: '', referencia_domicilio: '',
        
        // Pestaña 4
        id_instruccion: '', ocupacion: '', id_seguro_salud: '',
        tipo_empresa: '', tiene_discapacidad: false, tipo_discapacidad: '',
        porcentaje_discapacidad: '', carnet_discapacidad: '',
        
        // Pestaña 5
        nombre_representante: '', id_parentesco_representante: '',
        documento_representante: '', direccion_representante: '',
        
        // Pestaña 6
        id_forma_llegada: '', id_fuente_informacion: '', persona_entrega: '', id_condicion_llegada: '',
        fecha_ingreso: new Date().toISOString().split('T')[0],
        establecimiento_origen: '',
        
        // Pestaña 7
        motivo_consulta: '', motivo_detalle: '',
        
        // Otros
        id_tipo_doc_representante: ''
    };

    const [formData, setFormData] = useState(initialFormData);

    // Cálculo de edad detallado (Años, Meses, Días, Horas) - Blindaje Senior
    const edadInfo = useMemo(() => {
        const LIMITE_VALIDACION_MADRE = 2; // Días para exigir validación de admisión materna
        const LIMITE_NEONATO_MSP = 28;    // Días para flujo neonatal y Libro de Parto

        if (!formData.fecha_nacimiento) return { anios: 0, meses: 0, dias: 0, horas: 0, minutos: 0, isLess24h: false, isNeonato: false };
        
        const now = new Date();
        let birthDateStr = formData.fecha_nacimiento;
        if (formData.hora_parto) {
            birthDateStr += `T${formData.hora_parto}`;
        } else {
            birthDateStr += 'T00:00:00';
        }
        
        const birth = new Date(birthDateStr);
        if (birth > now) {
            return { anios: 0, meses: 0, dias: 0, horas: 0, minutos: 0, isLess24h: false, isNeonato: false };
        }

        const diffMs = Math.max(0, now - birth);
        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(totalMinutes / 60);
        const diffMinutes = totalMinutes % 60;
        
        const isLess24h = diffHours < 24;

        let anios = now.getFullYear() - birth.getFullYear();
        let meses = now.getMonth() - birth.getMonth();
        let dias = now.getDate() - birth.getDate();

        if (dias < 0) {
            meses -= 1;
            const ultimoDiaMesAnterior = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
            dias += ultimoDiaMesAnterior;
        }
        if (meses < 0) {
            anios -= 1;
            meses += 12;
        }
        
        anios = Math.max(0, anios);
        meses = Math.max(0, meses);
        
        if (isLess24h) {
            dias = 0;
        } else {
            dias = Math.max(0, dias);
        }

        const isNeonato = anios === 0 && meses === 0 && dias < LIMITE_NEONATO_MSP;
        const esPartoReciente = anios === 0 && meses === 0 && dias <= LIMITE_VALIDACION_MADRE;
        const mostrarFlujoNeonatal = anios === 0 && meses === 0 && dias < LIMITE_NEONATO_MSP;

        return {
            anios,
            meses,
            dias,
            horas: formData.hora_parto ? diffHours : 0,
            minutos: diffMinutes,
            isLess24h,
            isNeonato,
            esPartoReciente,
            mostrarFlujoNeonatal
        };
    }, [formData.fecha_nacimiento, formData.hora_parto]);

    const esMenor = edadInfo.anios < 18;

    const tabs = [
        { id: 'personales', label: '1. Datos Personales', icon: User },
        { id: 'nacimiento', label: '2. NACIMIENTO', icon: Baby },
        { id: 'residencia', label: '3. Residencia', icon: MapPin },
        { id: 'adicionales', label: '4. Datos Adicionales', icon: ShieldCheck },
        { id: 'contacto', label: '5. Contacto Emer.', icon: Users },
        { id: 'llegada', label: '6. Arribo/Condición', icon: ClipboardList },
        { id: 'motivo', label: '7. Motivo Consulta', icon: HeartPulse }
    ];

    useEffect(() => {
        const fetchCatalogs = async () => {
            try {
                const data = await catalogService.getAllCatalogs();
                setCatalogos(data);
            } catch (error) { console.error('Error cargando catálogos'); }
        };
        fetchCatalogs();
    }, []);

    useEffect(() => {
        const fetchCantones = async () => {
            if (formData.provinciaResidencia) {
                const data = await catalogService.getCantones(formData.provinciaResidencia);
                setCantonesFiltrados(data);
            }
        };
        fetchCantones();
    }, [formData.provinciaResidencia]);

    useEffect(() => {
        const fetchParroquias = async () => {
            if (formData.cantonResidencia) {
                const data = await catalogService.getParroquias(formData.cantonResidencia);
                setParroquiasFiltradas(data);
            }
        };
        fetchParroquias();
    }, [formData.cantonResidencia]);

    const limpiarFormularioCompleto = () => {
        setModalConfig({
            show: true,
            type: 'warning',
            title: 'Confirmar Limpieza',
            message: '¿Está seguro de que desea limpiar todo el formulario? Se perderán todos los datos ingresados.',
            confirmAction: () => {
                localStorage.removeItem('sigemech_form_draft');
                sessionStorage.removeItem('sigemech_temp_data');
                
                setFormData(initialFormData);
                setFormHabilitado(false);
                setActiveTab('personales');
                setCantonesFiltrados([]);
                setParroquiasFiltradas([]);
                setFormKey(prev => prev + 1);
                setModalConfig(p => ({ ...p, show: false }));
            }
        });
    };

    const timeoutLongevidad = useRef(null);

    const validarLongevidad = (fechaStr) => {
        if (!fechaStr) return;
        
        // Validación de Longitud y Formato: Solo ejecutar si es un formato AAAA-MM-DD completo
        // El input type="date" suele devolver AAAA-MM-DD
        if (fechaStr.length !== 10) return;

        const selectedDate = new Date(fechaStr);
        if (isNaN(selectedDate.getTime())) return;

        const birthYear = selectedDate.getUTCFullYear();
        if (birthYear < 1906) {
            setModalConfig({
                show: true,
                type: 'error',
                title: 'Límite de Longevidad Excedido',
                message: 'La fecha de nacimiento ingresada indica una edad superior a 120 años. Por favor, verifique el año.'
            });
            setFormData(prev => ({ ...prev, fecha_nacimiento: '' }));
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target || e;

        // Misión: Validación Silenciosa. No disparamos errores en handleChange para campos incompletos.
        // La validación estricta se movió a validarTemporada (onBlur o submit).

        if (activeTab === 'personales' && name === 'id_sexo' && value && formData.primer_apellido && formData.primer_nombre) {
            setTimeout(() => setActiveTab('nacimiento'), 500);
        }
        
        if (name === 'id_tipo_identificacion') {
            const tipoSeleccionado = catalogos.tiposIdentificacion?.find(t => t.id == value);
            const esNoIdentificado = tipoSeleccionado?.nombre?.toUpperCase() === 'NO IDENTIFICADO';
            
            const resetData = {
                ...initialFormData,
                id_tipo_identificacion: value,
                numero_documento: ''
            };
            
            if (esNoIdentificado) {
                resetData.primer_apellido = '';
                resetData.primer_nombre = '';
                resetData.segundo_apellido = '';
                resetData.segundo_nombre = '';
                resetData.motivo_consulta = 'EMERGENCIA';
                
                // Generar código normativo inicial para No Identificado
                const codigoNormativo = generarCodigoNormativo({
                    primer_nombre: '',
                    primer_apellido: '',
                    codigo_provincia: '99',
                    fecha_nacimiento: resetData.fecha_nacimiento || new Date().toISOString().split('T')[0]
                });
                resetData.numero_documento = codigoNormativo;
                
                setFormData(resetData);
                setFormHabilitado(true);
                // Misión 1: Bloqueo de Salto en Pestañas
                // No cambiamos activeTab para que el usuario complete nombres/apellidos
            } else {
                setFormData(resetData);
                setFormHabilitado(false);
                setActiveTab('personales');
            }
            
            setCantonesFiltrados([]);
            setParroquiasFiltradas([]);
            setFormKey(prev => prev + 1);
            return;
        }

        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };

            // Lógica de generación de código normativo en tiempo real para "No Identificado"
            const tipoSeleccionado = catalogos.tiposIdentificacion?.find(t => t.id == newData.id_tipo_identificacion);
            const esNoIdentificado = tipoSeleccionado?.nombre?.toUpperCase() === 'NO IDENTIFICADO';

            if (esNoIdentificado) {
                // Obtener código de provincia del catálogo si está disponible
                const provNac = catalogos.provincias?.find(p => p.id == newData.provinciaNacimiento);
                const codProv = provNac?.codigo_inec || '99';

                const nuevoCodigo = generarCodigoNormativo({
                    primer_nombre: newData.primer_nombre,
                    segundo_nombre: newData.segundo_nombre,
                    primer_apellido: newData.primer_apellido,
                    segundo_apellido: newData.segundo_apellido,
                    codigo_provincia: codProv,
                    fecha_nacimiento: newData.fecha_nacimiento,
                    es_neonato_horas: edadInfo.isLess24h
                });
                newData.numero_documento = nuevoCodigo;
            }

            return newData;
        });
    };

    const validarTemporada = (name, value) => {
        if (!value) return true;

        const now = new Date();
        const margenErrorMs = 5 * 60 * 1000; // Tolerancia Temporal de 5 minutos
        let timestampValidacion;

        if (name === 'fecha_nacimiento') {
            const todayStr = now.toISOString().split('T')[0];
            if (value > todayStr) {
                setModalConfig({
                    show: true,
                    type: 'error',
                    title: 'Error de Validación Temporal',
                    message: 'No se permiten fechas de nacimiento futuras.',
                    onClose: () => {
                        setModalConfig(m => ({ ...m, show: false }));
                        // Devolver foco a fecha_nacimiento
                        document.getElementsByName('fecha_nacimiento')[0]?.focus();
                    }
                });
                setFormData(prev => ({ ...prev, [name]: '' }));
                return false;
            }
            
            if (formData.hora_parto) {
                timestampValidacion = new Date(`${value}T${formData.hora_parto}`);
            } else {
                return true;
            }
        } else if (name === 'hora_parto') {
            if (!formData.fecha_nacimiento) return true;
            timestampValidacion = new Date(`${formData.fecha_nacimiento}T${value}`);
        } else {
            timestampValidacion = new Date(value);
        }

        if (timestampValidacion && !isNaN(timestampValidacion.getTime())) {
            if (timestampValidacion.getTime() > (now.getTime() + margenErrorMs)) {
                setModalConfig({
                    show: true,
                    type: 'error',
                    title: 'Validación de Tiempo Bloqueante',
                    message: 'La fecha y hora de nacimiento no pueden superar el margen de tolerancia (5 min) del tiempo actual.',
                    onClose: () => {
                        setModalConfig(m => ({ ...m, show: false }));
                        if (name === 'hora_parto') {
                            document.getElementsByName('hora_parto')[0]?.focus();
                        } else {
                            document.getElementsByName('fecha_nacimiento')[0]?.focus();
                        }
                    }
                });
                setFormData(prev => ({ ...prev, [name]: '' }));
                return false;
            }
        }
        return true;
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        
        // Validación Silenciosa: Solo disparamos el modal al perder el foco (onBlur)
        if (name === 'fecha_nacimiento' || name === 'hora_parto' || name === 'fecha_hora_parto') {
            if (value) {
                const esValido = validarTemporada(name, value);
                if (esValido && name === 'fecha_nacimiento') {
                    validarLongevidad(value);
                }
            }
        }
    };

    const handleBusquedaPaciente = async (value) => {
        const tipoCedula = catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion);
        const esCedula = tipoCedula?.nombre?.toUpperCase() === 'CÉDULA DE IDENTIDAD' || tipoCedula?.nombre?.toUpperCase() === 'CEDULA';
        
        if (!esCedula || !value || value.length < 10) return;

        const soloNumeros = /^[0-9]+$/.test(value);
        if (!soloNumeros || value.length !== 10) {
            return;
        }

        const { validarCedulaEcuatoriana } = await import('../../utils/pacienteUtils');
        if (!validarCedulaEcuatoriana(formData.numero_documento)) {
            setModalConfig({
                show: true, type: 'error', title: 'Error de Validación',
                message: 'La cédula ingresada no cumple con el algoritmo Módulo 10.'
            });
            return;
        }

        if (!formData.numero_documento) return;

        setLoading(true);
        try {
            const response = await pacienteService.findByCedula(formData.numero_documento);
            if (response.found) {
                setFormData(prev => ({ ...prev, ...response.paciente }));
                setFormHabilitado(true);
                setModalConfig({
                    show: true, type: 'success', title: 'Paciente Encontrado',
                    message: `Se han cargado los datos de ${response.paciente.primer_nombre} ${response.paciente.primer_apellido}.`
                });
            } else {
                setModalConfig({
                    show: true, type: 'warning', title: 'Nuevo Paciente',
                    message: 'Paciente no registrado en el sistema. ¿Desea iniciar un nuevo registro?',
                    confirmAction: () => { setFormHabilitado(true); setModalConfig(p => ({...p, show: false})); }
                });
            }
        } catch (error) {
            console.error('Error al buscar paciente');
            setModalConfig({
                show: true, type: 'error', title: 'Error de Conexión',
                message: 'No se pudo consultar el microservicio de personas.'
            });
        } finally { setLoading(false); }
    };

    const handleFinalize = async (e) => {
        e.preventDefault();

        // Validaciones de Reglas de Negocio (QA Senior)
        const errores = validarAdmisionCompleta({
            ...formData,
            tipo_arribo: catalogos.formasLlegada.find(f => f.id === formData.id_forma_llegada)?.nombre
        });

        if (errores.length > 0) {
            setModalConfig({
                show: true,
                type: 'error',
                title: 'Incumplimiento de Reglas de Negocio',
                message: errores.join(' ')
            });
            return;
        }

        const esNeonato = edadInfo.anios === 0 && edadInfo.meses === 0 && edadInfo.dias < 28;
        if (esNeonato && !formData.cedula_madre) {
            setModalConfig({
                show: true,
                type: 'error',
                title: 'Validación de Neonato',
                message: 'Para pacientes neonatos, es obligatorio ingresar la Cédula de la Madre en la sección de Nacimiento.'
            });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                pacienteData: {
                    id: formData.id,
                    id_tipo_identificacion: formData.id_tipo_identificacion,
                    numero_documento: formData.numero_documento,
                    primer_nombre: formData.primer_nombre,
                    segundo_nombre: formData.segundo_nombre,
                    primer_apellido: formData.primer_apellido,
                    segundo_apellido: formData.segundo_apellido,
                    fecha_nacimiento: formData.fecha_nacimiento,
                    id_sexo: formData.id_sexo,
                    id_estado_civil: formData.id_estado_civil,
                    id_nacionalidad: formData.id_nacionalidad,
                    id_parroquia: formData.id_parroquia,
                    direccion: formData.callePrincipal + ' ' + formData.calleSecundaria,
                    telefono: formData.telefono,
                    email: formData.email,
                    id_etnia: formData.id_etnia,
                    id_nacionalidad_etnica: formData.id_nacionalidad_etnica,
                    id_pueblo: formData.id_pueblo,
                    id_instruccion: formData.id_instruccion,
                    id_seguro_salud: formData.id_seguro_salud,
                    ocupacion: formData.ocupacion,
                    tipo_empresa: formData.tipo_empresa,
                    referencia_domicilio: formData.referencia_domicilio,
                    tiene_discapacidad: formData.tiene_discapacidad,
                    tipo_discapacidad: formData.tipo_discapacidad,
                    porcentaje_discapacidad: formData.porcentaje_discapacidad,
                    carnet_discapacidad: formData.carnet_discapacidad
                },
                admissionData: {
                    motivo_consulta: formData.motivo_consulta,
                    motivo_detalle: formData.motivo_detalle,
                    id_forma_llegada: formData.id_forma_llegada,
                    id_fuente_informacion: formData.id_fuente_informacion,
                    id_condicion_llegada: formData.id_condicion_llegada,
                    persona_entrega: formData.persona_entrega
                },
                representanteData: {
                    nombre_representante: formData.nombre_representante,
                    id_parentesco_representante: formData.id_parentesco_representante,
                    documento_representante: formData.documento_representante,
                    id_tipo_doc_representante: formData.id_tipo_doc_representante
                },
                datos_parto: formData.fecha_hora_parto ? {
                    fecha_hora_parto: formData.fecha_hora_parto,
                    id_lugar_parto: formData.id_lugar_parto,
                    cedula_madre: formData.cedula_madre,
                    madre_id: formData.madre_id
                } : null
            };

            await pacienteService.createEmergencyAdmission(payload);

            setModalConfig({
                show: true,
                type: 'success',
                title: 'Registro Exitoso',
                message: 'La admisión y los datos del paciente se han guardado correctamente.',
                confirmAction: () => {
                    if (formData.motivo_consulta === 'EMERGENCIA' || formData.motivo_consulta === 'TRIAGE' || formData.motivo_consulta === '1') {
                        navigate('/dashboard/triaje-signos');
                    } else {
                        navigate('/dashboard/consultas');
                    }
                }
            });
        } catch (error) {
            console.error('Error al finalizar:', error);
            setModalConfig({
                show: true,
                type: 'error',
                title: 'Error al Guardar',
                message: error.response?.data?.detail || 'No se pudo procesar la admisión.'
            });
        } finally { setLoading(false); }
    };

    const hasTemporalError = useMemo(() => {
        const now = new Date();
        const margenMs = 5 * 60 * 1000;
        
        if (formData.fecha_nacimiento) {
            const [year, month, day] = formData.fecha_nacimiento.split('-').map(Number);
            const fechaInicioDia = new Date(year, month - 1, day, 0, 0, 0);
            
            if (fechaInicioDia.getTime() > (now.getTime() + (24 * 60 * 60 * 1000))) return true;

            // Misión: Forzar Cumplimiento de las 24 Horas Reales [2026-02-14]
            // Bloqueo de Navegación Estricto: disabled si la hora está vacía para registros de < 24 horas
            const enVentana24hAbsoluta = (now.getTime() - fechaInicioDia.getTime()) < (24 * 60 * 60 * 1000);

            if (formData.hora_parto) {
                const [hours, minutes] = formData.hora_parto.split(':').map(Number);
                const birthTime = new Date(year, month - 1, day, hours, minutes);
                
                if (isNaN(birthTime.getTime())) return true;
                if (birthTime.getTime() > (now.getTime() + margenMs)) return true;
                
                // Cálculo de Reaparición/Bloqueo: (Ahora - (Fecha + Hora)) < 24 Horas
                const diffMs = now.getTime() - birthTime.getTime();
                const diffHours = diffMs / (1000 * 60 * 60);
                
                const estSeleccionado = catalogos.establecimientos?.find(e => e.id == formData.id_lugar_parto);
                const esTipoCChone = estSeleccionado?.nombre?.toUpperCase().includes('CENTRO DE SALUD TIPO C CHONE');
                
                // Si es Tipo C Chone, debe tener menos de 24 horas reales
                if (esTipoCChone && diffHours > 24) return true;
            } else if (enVentana24hAbsoluta) {
                // Bloqueo Estricto: Si está en ventana de 24h (1440 min), la HORA es obligatoria para habilitar SIGUIENTE
                return true;
            }
        }
        
        return false;
    }, [formData.fecha_nacimiento, formData.hora_parto, catalogos.establecimientos, formData.id_lugar_parto]);

    const TabButton = ({ tab }) => {
        if (tab.hidden) return null;
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        // Bloqueo de navegación si hay error temporal o falta info crítica
        const isBlocked = (tab.id !== 'personales' && tab.id !== 'nacimiento') && hasTemporalError;

        return (
            <button
                type="button"
                onClick={() => {
                    if (isBlocked) {
                        setModalConfig({
                            show: true,
                            type: 'error',
                            title: 'Navegación Bloqueada',
                            message: 'Debe corregir la Fecha/Hora de Nacimiento antes de continuar.'
                        });
                        return;
                    }
                    if (formHabilitado || tab.id === 'personales') setActiveTab(tab.id);
                }}
                className={`flex items-center justify-center px-3 transition-all border-b-2 h-full min-w-[100px] ${
                    isActive ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
            >
                <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-[9px] font-black uppercase tracking-tighter truncate">{tab.label}</span>
            </button>
        );
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 bg-slate-100 min-h-screen font-sans antialiased">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-4 text-white flex justify-between items-center border-b-4 border-yellow-400">
                    <div className="flex items-center space-x-4">
                        <div className="bg-white p-1 rounded">
                            <ShieldCheck className="w-8 h-8 text-blue-900" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight leading-none uppercase">Admisión de Pacientes (008)</h1>
                        </div>
                    </div>
                    <div className="bg-blue-800/50 border border-blue-400 rounded px-4 py-2 text-center animate-pulse">
                        <p className="text-[9px] font-bold text-blue-300 uppercase tracking-tighter">Código Normativo de Identificación</p>
                        <p className="text-2xl font-black tracking-[0.2em] font-mono text-yellow-400">
                            {formData.numero_documento && (catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion)?.nombre?.toUpperCase() === 'NO IDENTIFICADO')
                                ? formData.numero_documento
                                : generarCodigoTemporal(formData, catalogos.provincias)}
                        </p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-bold opacity-80 uppercase">Establecimiento:</p>
                        <p className="text-sm font-black">CENTRO DE SALUD TIPO C - CHONE</p>
                    </div>
                </div>

                <div className="flex bg-white border-b shadow-inner overflow-x-auto scrollbar-hide h-12">
                    {tabs.map(tab => <TabButton key={tab.id} tab={tab} />)}
                </div>

                <form onSubmit={handleFinalize} className="p-4 md:p-5 space-y-4 bg-white min-h-[400px]">
                    <div key={formKey} className="animate-in fade-in slide-in-from-left-4 duration-500">
                        {activeTab === 'personales' && (
                            <SeccionIdentidad
                                formData={formData}
                                handleChange={handleChange}
                                handleBlur={handleBlur}
                                handleBusquedaPaciente={handleBusquedaPaciente}
                                catalogos={catalogos}
                                formHabilitado={formHabilitado}
                            />
                        )}

                        {activeTab === 'nacimiento' && (
                            <SeccionNacimiento
                                formData={formData}
                                handleChange={handleChange}
                                handleBlur={handleBlur}
                                catalogos={catalogos}
                                formHabilitado={formHabilitado}
                                edadInfo={edadInfo}
                                setFormData={setFormData}
                                setModalConfig={setModalConfig}
                            />
                        )}

                        {activeTab === 'residencia' && (
                            <SeccionResidencia
                                formData={formData}
                                handleChange={handleChange}
                                catalogos={catalogos}
                                cantonesFiltrados={cantonesFiltrados}
                                parroquiasFiltradas={parroquiasFiltradas}
                                formHabilitado={formHabilitado}
                            />
                        )}

                        {activeTab === 'adicionales' && (
                            <SeccionDatosAdicionales
                                formData={formData}
                                handleChange={handleChange}
                                catalogos={catalogos}
                                formHabilitado={formHabilitado}
                            />
                        )}

                        {activeTab === 'contacto' && (
                            <SeccionContactoEmergencia
                                formData={formData}
                                handleChange={handleChange}
                                catalogos={catalogos}
                                formHabilitado={formHabilitado}
                            />
                        )}

                        {activeTab === 'llegada' && (
                            <SeccionLlegadaMotivo
                                formData={formData}
                                handleChange={handleChange}
                                catalogos={catalogos}
                                formHabilitado={formHabilitado}
                                soloLlegada={true}
                            />
                        )}

                        {activeTab === 'motivo' && (
                            <SeccionLlegadaMotivo
                                formData={formData}
                                handleChange={handleChange}
                                catalogos={catalogos}
                                formHabilitado={formHabilitado}
                                soloMotivo={true}
                            />
                        )}
                    </div>

                    <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4 border-t pt-8">
                        <div className="text-[10px] text-gray-400 font-bold uppercase">
                            * Los campos marcados son obligatorios para cumplimiento normativo
                        </div>
                        <div className="flex items-center space-x-4">
                            {activeTab !== 'personales' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const currentIndex = tabs.findIndex(t => t.id === activeTab);
                                        setActiveTab(tabs[currentIndex - 1].id);
                                    }}
                                    className="px-6 py-4 font-bold text-gray-500 hover:text-gray-700 uppercase text-xs"
                                >
                                    ANTERIOR
                                </button>
                            )}
                            
                            <button
                                type="button"
                                onClick={limpiarFormularioCompleto}
                                className="px-6 py-4 font-bold text-red-600 hover:text-red-800 hover:bg-red-50 uppercase text-xs border border-red-200 rounded-lg transition-colors"
                            >
                                LIMPIAR TODO
                            </button>

                            {(activeTab === 'personales' || activeTab === 'nacimiento') && (
                                <button
                                    type="button"
                                    disabled={hasTemporalError}
                                    onClick={() => {
                                        const currentIndex = tabs.findIndex(t => t.id === activeTab);
                                        setActiveTab(tabs[currentIndex + 1].id);
                                    }}
                                    className={`px-12 py-4 font-black rounded-lg shadow-lg transition-all transform uppercase text-xs ${
                                        hasTemporalError
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                >
                                    Siguiente
                                </button>
                            )}
                            
                            <button
                                type="submit"
                                disabled={loading || !formHabilitado || !formData.motivo_consulta || hasTemporalError}
                                className={`group flex items-center px-12 py-4 font-black rounded-lg shadow-2xl transition-all transform ${
                                    loading || !formHabilitado || !formData.motivo_consulta || hasTemporalError
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1 active:scale-95 border-b-4 border-blue-800'
                                }`}
                            >
                                <Save className={`w-6 h-6 mr-3 ${loading ? 'animate-spin' : 'group-hover:scale-110'}`} />
                                {loading ? 'PROCESANDO...' : 'FINALIZAR Y DERIVAR'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {modalConfig.show && (
                <ModalFeedback 
                    type={modalConfig.type} 
                    title={modalConfig.title} 
                    message={modalConfig.message} 
                    onClose={() => setModalConfig(p => ({...p, show:false}))} 
                    onConfirm={modalConfig.confirmAction} 
                />
            )}
        </div>
    );
};

export default FormularioAdmisionMaestra;

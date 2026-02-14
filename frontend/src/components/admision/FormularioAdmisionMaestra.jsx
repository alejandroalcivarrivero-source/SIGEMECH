import React, { useState, useEffect, useMemo } from 'react';
import { 
    User, MapPin, Baby, FileText, Users, 
    ClipboardList, Save, ShieldCheck, HeartPulse
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import pacienteService from '../../api/pacienteService';
import catalogService from '../../api/catalogService';
import ModalFeedback from '../ModalFeedback';

// Sub-componentes modulares refactorizados
import SeccionIdentidad from './SeccionIdentidad';
import SeccionNacimiento from './SeccionNacimiento';
import SeccionResidencia from './SeccionResidencia';
import { generarCodigoTemporal } from '../../utils/pacienteUtils';
import SeccionBioSocial from './SeccionBioSocial';
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
        tipoIdentificacion: '', cedula: '', primerApellido: '', segundoApellido: '',
        primerNombre: '', segundoNombre: '', estadoCivil: '', sexo: '',
        telefonoFijo: '', telefonoCelular: '', email: '',
        
        // Pestaña 2
        nacionalidad: '',
        provinciaNacimiento: '', cantonNacimiento: '', parroquiaNacimiento: '',
        fechaNacimiento: '', autoidentificacionEtnica: '', nacionalidadEtnica: '', puebloEtnico: '',
        
        // Pestaña 3
        paisResidencia: 'Ecuador', provinciaResidencia: '', cantonResidencia: '',
        parroquiaResidencia: '', barrio: '', callePrincipal: '', calleSecundaria: '',
        numeroCasa: '', referenciaResidencia: '',
        
        // Pestaña 4
        nivelEducacion: '', ocupacion: '', seguroSaludPrincipal: '',
        tipoBono: '', tieneDiscapacidad: false, tipoDiscapacidad: '',
        porcentajeDiscapacidad: '', carnetDiscapacidad: '',
        
        // Pestaña 5
        contactoEmergenciaNombre: '', contactoEmergenciaParentesco: '',
        contactoEmergenciaTelefono: '', contactoEmergenciaDireccion: '',
        
        // Pestaña 6
        formaLlegada: '', fuenteInformacion: '', personaEntrega: '', condicionLlegada: '',
        
        // Pestaña 7
        motivoAtencion: '', motivoAtencionDetalle: '',
        
        // Otros
    };

    const [formData, setFormData] = useState(initialFormData);

    // Cálculo de edad detallado (Años, Meses, Días, Horas) - Blindaje Senior
    const edadInfo = useMemo(() => {
        // Constantes de Negocio (Tarea 1)
        const LIMITE_VALIDACION_MADRE = 2; // Días para exigir validación de admisión materna
        const LIMITE_NEONATO_MSP = 28;    // Días para flujo neonatal y Libro de Parto

        if (!formData.fechaNacimiento) return { anios: 0, meses: 0, dias: 0, horas: 0, minutos: 0, isLess24h: false, isNeonato: false };
        
        const now = new Date();
        // Construimos fecha base. Si hay hora_parto, la usamos para precisión.
        // Ojo: formData.fecha_hora_parto a veces viene como campo compuesto, pero aquí parece que usamos fechaNacimiento + hora_parto por separado en el form.
        // Revisando SeccionNacimiento, usa 'fechaNacimiento' y 'hora_parto'.
        // Vamos a construir el objeto Date con precisión.
        
        let birthDateStr = formData.fechaNacimiento;
        if (formData.hora_parto) {
            birthDateStr += `T${formData.hora_parto}`;
        } else {
            birthDateStr += 'T00:00:00';
        }
        
        const birth = new Date(birthDateStr);
        
        // Blindaje de Edad: Si la fecha es futura, todo a cero. (NUNCA valores negativos)
        if (birth > now) {
            return { anios: 0, meses: 0, dias: 0, horas: 0, minutos: 0, isLess24h: false, isNeonato: false };
        }

        const diffMs = Math.max(0, now - birth);
        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(totalMinutes / 60); // Horas totales de vida
        const diffMinutes = totalMinutes % 60;
        
        // Un neonato es < 24h si han pasado menos de 24 horas reales
        const isLess24h = diffHours < 24;

        // Cálculo tradicional de calendario
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
        
        // Aseguramos no negativos
        anios = Math.max(0, anios);
        meses = Math.max(0, meses);
        dias = Math.max(0, dias);

        // Definición estricta de Neonato: < 28 días (Usando constante de negocio)
        const isNeonato = anios === 0 && meses === 0 && dias < LIMITE_NEONATO_MSP;

        // Nuevas banderas de negocio (Tarea 2)
        // esPartoReciente: true si la diferencia es <= 2 días
        const esPartoReciente = anios === 0 && meses === 0 && dias <= LIMITE_VALIDACION_MADRE;
        
        // mostrarFlujoNeonatal: true si la diferencia es < 28 días (coincide con isNeonato pero explícito para UI)
        const mostrarFlujoNeonatal = anios === 0 && meses === 0 && dias < LIMITE_NEONATO_MSP;

        // Si es neonato y tenemos hora de parto (precisión), mostramos horas de vida en 'horas'.
        // Si no es neonato, 'horas' puede ser 0 o irrelevante.
        // El requerimiento dice: "si existe hora_parto, calcule la diferencia en horas contra la hora actual y devuelva el valor en la propiedad horas."
        
        // Cálculo de horas para mostrar en la UI (Si es < 24h, es igual a diffHours. Si es más, calculamos horas residuales del día o mostramos horas totales si se requiere precisión absoluta)
        // Interpretación: Para neonatos mostramos horas de vida exactas si es muy reciente, o simplemente el campo horas calculado.
        // Pero el código anterior usaba diffHours globalmente.
        
        // Vamos a devolver diffHours (horas totales de vida) en la propiedad 'horas' si hay hora_parto, para que la UI lo use si quiere.
        // Si no hay hora_parto, diffHours asume 00:00, lo cual puede ser impreciso, pero matemáticamente correcto desde las 00:00.

        return {
            anios,
            meses,
            dias,
            horas: formData.hora_parto ? diffHours : 0, // Solo devolvemos horas si se especificó hora de nacimiento
            minutos: diffMinutes,
            isLess24h,
            isNeonato,
            esPartoReciente,      // Nueva bandera
            mostrarFlujoNeonatal  // Nueva bandera
        };
    }, [formData.fechaNacimiento, formData.hora_parto]);

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
                // Limpieza de persistencia en caché según requerimiento SRE
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target || e;

        // Validación de Fechas (Blindaje Cronológico - Tarea 1.2)
        if ((type === 'date' || type === 'datetime-local' || name === 'fechaNacimiento' || name === 'fecha_hora_parto' || name === 'hora_parto') && value) {
            const now = new Date();
            let selectedDate;

            // Validación combinada de Fecha + Hora
            if (name === 'hora_parto' && formData.fechaNacimiento) {
                selectedDate = new Date(`${formData.fechaNacimiento}T${value}`);
            } else if (name === 'fechaNacimiento' && formData.hora_parto) {
                selectedDate = new Date(`${value}T${formData.hora_parto}`);
            } else if (name === 'fechaNacimiento') {
                selectedDate = new Date(value);
                // Si solo es fecha, comparamos con el final del día actual para permitir el día de hoy,
                // pero si es mayor a la fecha actual (mañana en adelante), error.
                // Ajuste: Date(value) crea fecha en UTC 00:00.
                // Mejor comparamos YYYY-MM-DD strings para fecha simple.
                const todayStr = now.toISOString().split('T')[0];
                if (value > todayStr) {
                    setModalConfig({
                        show: true,
                        type: 'error',
                        title: 'Error de Validación Temporal',
                        message: 'No se permiten fechas de nacimiento futuras'
                    });
                    setFormData(prev => ({ ...prev, [name]: '' }));
                    return;
                }
                // Si la fecha es válida por sí sola, no retornamos aún, dejamos que siga lógica de longevidad
            } else {
                 selectedDate = new Date(value);
            }

            // 1. Impedir fechas futuras (Fecha + Hora específica)
            // Permitimos un pequeño margen de error de 5 minutos por diferencias de reloj cliente/servidor
            const margenErrorMs = 5 * 60 * 1000;
            
            // Construimos el timestamp completo a validar
            let timestampValidacion = selectedDate;
            
            // Si estamos editando fecha y ya hay hora, validamos el conjunto
            if (name === 'fechaNacimiento' && formData.hora_parto) {
                timestampValidacion = new Date(`${value}T${formData.hora_parto}`);
            }
            // Si estamos editando hora y ya hay fecha, validamos el conjunto
            else if (name === 'hora_parto' && formData.fechaNacimiento) {
                 timestampValidacion = new Date(`${formData.fechaNacimiento}T${value}`);
            }
            
            if (timestampValidacion && !isNaN(timestampValidacion.getTime()) && (timestampValidacion.getTime() > (now.getTime() + margenErrorMs))) {
                setModalConfig({
                    show: true,
                    type: 'error',
                    title: 'Error de Validación Temporal',
                    message: 'La fecha y hora de nacimiento no pueden ser posteriores al momento actual.'
                });
                // Limpiamos solo el campo que disparó el error
                setFormData(prev => ({ ...prev, [name]: '' }));
                return;
            }

            // 2. Límite de Longevidad (Evitar edades > 120 años)
            if (name === 'fechaNacimiento') {
                const birthYear = selectedDate.getUTCFullYear();
                if (birthYear < 1906) {
                    setModalConfig({
                        show: true,
                        type: 'error',
                        title: 'Límite de Longevidad Excedido',
                        message: 'La fecha de nacimiento ingresada indica una edad superior a 120 años. Por favor, verifique el año.'
                    });
                    setFormData(prev => ({ ...prev, [name]: '' }));
                    return;
                }
            }
        }

        // Auto-navegación si se llenan campos de Pestaña 1
        if (activeTab === 'personales' && name === 'sexo' && value && formData.primerApellido && formData.primerNombre) {
            setTimeout(() => setActiveTab('nacimiento'), 500);
        }
        
        // Lógica Proactiva: Manejo de Tipo de Identificación
        if (name === 'tipoIdentificacion') {
            const tipoSeleccionado = catalogos.tiposIdentificacion?.find(t => t.id == value);
            const esNoIdentificado = tipoSeleccionado?.nombre?.toUpperCase() === 'NO IDENTIFICADO';
            
            // Reset Incondicional: Limpieza total al cambiar Tipo ID
            const resetData = {
                ...initialFormData,
                tipoIdentificacion: value,
                cedula: '' // Garantizar que el campo ID quede vacío instantáneamente
            };
            
            if (esNoIdentificado) {
                resetData.primerApellido = 'DESCONOCIDO';
                resetData.primerNombre = 'DESCONOCIDO';
                resetData.motivoAtencion = 'EMERGENCIA';
                
                setFormData(resetData);
                setFormHabilitado(true);
                setActiveTab('motivo');
            } else {
                setFormData(resetData);
                setFormHabilitado(false); // Se deshabilita hasta que se valide la búsqueda (si es cédula) o se habilite manualmente
                setActiveTab('personales');
            }
            
            setCantonesFiltrados([]);
            setParroquiasFiltradas([]);
            setFormKey(prev => prev + 1);
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleBusquedaPaciente = async (value) => {
        const tipoCedula = catalogos.tiposIdentificacion?.find(t => t.id == formData.tipoIdentificacion);
        const esCedula = tipoCedula?.nombre?.toUpperCase() === 'CÉDULA DE IDENTIDAD' || tipoCedula?.nombre?.toUpperCase() === 'CEDULA';
        
        // INTERRUPCIÓN: Si no es cédula o no tiene 10 dígitos, no hace NADA
        if (!esCedula || !value || value.length < 10) return;

        // Validación estricta de Cédula antes de proceder
        const soloNumeros = /^[0-9]+$/.test(value);
        if (!soloNumeros || value.length !== 10) {
            return;
        }

        const { validarCedulaEcuatoriana } = await import('../utils/pacienteUtils');
        if (!validarCedulaEcuatoriana(formData.cedula)) {
            setModalConfig({
                show: true, type: 'error', title: 'Error de Validación',
                message: 'La cédula ingresada no cumple con el algoritmo Módulo 10.'
            });
            return;
        }

        if (!formData.cedula) return;

        setLoading(true);
        try {
            const response = await pacienteService.findByCedula(formData.cedula);
            if (response.found) {
                setFormData(prev => ({ ...prev, ...response.paciente }));
                setFormHabilitado(true);
                setModalConfig({
                    show: true, type: 'success', title: 'Paciente Encontrado',
                    message: `Se han cargado los datos de ${response.paciente.primerNombre} ${response.paciente.primerApellido}.`
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

        // VALIDACIÓN DE IDENTIDAD: Escenario 2
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
            // Mapeo de datos para envío atómico
            const payload = {
                pacienteData: {
                    id: formData.id,
                    tipoIdentificacionId: formData.tipoIdentificacion ? formData.tipoIdentificacion.toString() : null,
                    documentNumber: formData.cedula,
                    firstName1: formData.primerNombre,
                    firstName2: formData.segundoNombre,
                    lastName1: formData.primerApellido,
                    lastName2: formData.segundoApellido,
                    birthDate: formData.fechaNacimiento,
                    sexId: formData.sexo ? formData.sexo.toString() : null,
                    estadoCivilId: formData.estadoCivil ? formData.estadoCivil.toString() : null,
                    nacionalidadId: formData.nacionalidad ? formData.nacionalidad.toString() : null,
                    parishId: formData.parroquiaResidencia ? formData.parroquiaResidencia.toString() : null,
                    address: formData.callePrincipal + ' ' + formData.calleSecundaria,
                    phone: formData.telefonoCelular,
                    email: formData.email,
                    ethnicityId: formData.autoidentificacionEtnica,
                    ethnicNationalityId: formData.nacionalidadEtnica,
                    ethnicGroupId: formData.puebloEtnico
                },
                admissionData: {
                    motivo_consulta: formData.motivoAtencion,
                    motivoDetalle: formData.motivoAtencionDetalle,
                    arrivalFormId: formData.formaLlegada,
                    informationSourceId: formData.fuenteInformacion,
                    companionRelationshipId: formData.contactoEmergenciaParentesco,
                    companionName: formData.contactoEmergenciaNombre,
                    companionPhone: formData.contactoEmergenciaTelefono,
                    // Datos de nacimiento para Libro de Parto
                    idLugarParto: formData.id_lugar_parto,
                    fechaHoraParto: formData.fecha_hora_parto,
                    cedulaMadre: formData.cedula_madre,
                    madreId: formData.madre_id
                }
            };

            await pacienteService.createEmergencyAdmission(payload);

            setModalConfig({
                show: true,
                type: 'success',
                title: 'Registro Exitoso',
                message: 'La admisión y los datos del paciente se han guardado correctamente.',
                confirmAction: () => {
                    if (formData.motivoAtencion === 'EMERGENCIA' || formData.motivoAtencion === 'TRIAGE') {
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

    const TabButton = ({ tab }) => {
        if (tab.hidden) return null;
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
            <button
                type="button"
                onClick={() => (formHabilitado || tab.id === 'personales') ? setActiveTab(tab.id) : null}
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
                {/* Header MSP Style */}
                <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-4 text-white flex justify-between items-center border-b-4 border-yellow-400">
                    <div className="flex items-center space-x-4">
                        <div className="bg-white p-1 rounded">
                            <ShieldCheck className="w-8 h-8 text-blue-900" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight leading-none uppercase">Admisión Maestra de Pacientes</h1>
                        </div>
                    </div>
                    
                    {/* Código Normativo de 17 caracteres */}
                    <div className="bg-blue-800/50 border border-blue-400 rounded px-4 py-2 text-center animate-pulse">
                        <p className="text-[9px] font-bold text-blue-300 uppercase tracking-tighter">Código Normativo de Identificación</p>
                        <p className="text-2xl font-black tracking-[0.2em] font-mono text-yellow-400">
                            {generarCodigoTemporal(formData, catalogos.provincias)}
                        </p>
                    </div>

                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-bold opacity-80 uppercase">Establecimiento:</p>
                        <p className="text-sm font-black">CENTRO DE SALUD TIPO C - CHONE</p>
                    </div>
                </div>

                {/* Tabs de Navegación Compactas */}
                <div className="flex bg-white border-b shadow-inner overflow-x-auto scrollbar-hide h-12">
                    {tabs.map(tab => <TabButton key={tab.id} tab={tab} />)}
                </div>

                <form onSubmit={handleFinalize} className="p-4 md:p-5 space-y-4 bg-white min-h-[400px]">
                    <div key={formKey} className="animate-in fade-in slide-in-from-left-4 duration-500">
                        {activeTab === 'personales' && (
                            <SeccionIdentidad
                                formData={formData}
                                handleChange={handleChange}
                                handleBusquedaPaciente={handleBusquedaPaciente}
                                catalogos={catalogos}
                                formHabilitado={formHabilitado}
                            />
                        )}

                        {activeTab === 'nacimiento' && (
                            <SeccionNacimiento
                                formData={formData}
                                handleChange={handleChange}
                                catalogos={catalogos}
                                formHabilitado={formHabilitado}
                                edadInfo={edadInfo}
                                setFormData={setFormData}
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
                            <SeccionBioSocial
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

                    {/* Footer de Acciones */}
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
                            
                            <button
                                type="submit"
                                disabled={loading || !formHabilitado || !formData.motivoAtencion}
                                className={`group flex items-center px-12 py-4 font-black rounded-lg shadow-2xl transition-all transform ${
                                    loading || !formHabilitado || !formData.motivoAtencion
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

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
import SeccionRepresentante from './SeccionRepresentante';
import { calcularEdad } from '../../utils/calculosCronologicos';

const FormularioAdmisionMaestra = () => {
    const navigate = useNavigate();
    const fechaRef = useRef(null);
    
    const [catalogos, setCatalogos] = useState({
        provincias: [], cantones: [], parroquias: [], nacionalidades: [],
        etnias: [], nivelesEducacion: [], estadosInstruccion: [], segurosSalud: [], sexos: [],
        estadosCiviles: [], generos: [], parentescos: [], formasLlegada: [],
        fuentesInformacion: [], tiposDocumento: [], condicionesLlegada: [],
        tiposIdentificacion: [], paises: [], tiposDiscapacidad: [], ocupaciones: [], bonos: []
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
        datosNacimiento: {
            id_nacionalidad: '',
            provincia_nacimiento_id: '',
            canton_nacimiento_id: '',
            parroquia_nacimiento_id: '',
            fecha_nacimiento: '',
            hora_parto: '',
            id_lugar_parto: '',
            cedula_madre: ''
        },
        fecha_nacimiento: '', id_etnia: '', id_nacionalidad_etnica: '', id_pueblo: '',
        // Pestaña 3
        paisResidencia: 'Ecuador', provinciaResidencia: '', cantonResidencia: '',
        id_parroquia: '', barrio: '', callePrincipal: '', calleSecundaria: '',
        numeroCasa: '', referencia_domicilio: '',
        
        // Pestaña 4
        id_instruccion: '', id_estado_instruccion: '', id_ocupacion: '', ocupacion_nombre: '', id_seguro_salud: '',
        id_tipo_empresa: '', id_bono: '', tiene_discapacidad: '', id_tipo_discapacidad: '',
        porcentaje_discapacidad: '',
        
        // Pestaña 5
        nombre_representante: '', id_parentesco_representante: '',
        documento_representante: '', direccion_representante: '',
        
        // Pestaña 6
        id_forma_llegada: '', id_fuente_informacion: '', persona_entrega: '', id_condicion_llegada: '',
        fecha_ingreso: new Date().toISOString().split('T')[0],
        establecimiento_origen: '',
        
        // Pestaña 7
        motivo_consulta: '', motivo_detalle: '', enfermedad_actual: '', id_sintoma: '', sintoma_categoria: '',
        
        // Otros
        id_tipo_doc_representante: ''
    };

    // Mapeo inverso de datos del backend al formulario
    // Asegura que cuando se carga un paciente, los campos se llenen correctamente
    // Utilizando estrictamente snake_case acorde a la base de datos MariaDB
    const mapBackendToFrontend = (backendData) => {
        if (!backendData) return initialFormData;
        
        return {
            ...initialFormData,
            ...backendData, // Base: copiar todo lo que coincida por nombre (snake_case)
            
            // Mapeos explícitos para asegurar compatibilidad con campos calculados o estructuras anidadas
            id_tipo_identificacion: backendData.id_tipo_identificacion,
            numero_documento: backendData.numero_documento,
            primer_nombre: backendData.primer_nombre,
            segundo_nombre: backendData.segundo_nombre,
            primer_apellido: backendData.primer_apellido,
            segundo_apellido: backendData.segundo_apellido,
            fecha_nacimiento: backendData.fecha_nacimiento ? backendData.fecha_nacimiento.split('T')[0] : '',
            id_sexo: backendData.id_sexo,
            id_estado_civil: backendData.id_estado_civil,
            id_nacionalidad: backendData.id_nacionalidad,
            id_etnia: backendData.id_etnia,
            id_nacionalidad_etnica: backendData.id_nacionalidad_etnica,
            id_pueblo: backendData.id_pueblo,
            
            // Datos de Nacimiento anidados (Reconstrucción para la UI)
            datosNacimiento: {
                id_nacionalidad: backendData.id_nacionalidad,
                provincia_nacimiento_id: backendData.provincia_nacimiento_id,
                canton_nacimiento_id: backendData.canton_nacimiento_id,
                parroquia_nacimiento_id: backendData.parroquia_nacimiento_id,
                fecha_nacimiento: backendData.fecha_nacimiento ? backendData.fecha_nacimiento.split('T')[0] : '',
                hora_parto: backendData.hora_nacimiento || '',
                id_lugar_parto: backendData.id_lugar_parto,
                cedula_madre: backendData.cedula_madre
            },
            
            // Datos de Residencia (Requieren lógica de extracción si vienen populados)
            provinciaResidencia: backendData.parroquia?.canton?.provincia_id || '',
            cantonResidencia: backendData.parroquia?.canton_id || '',
            id_parroquia: backendData.id_parroquia,
            direccion: backendData.direccion,
            referencia_domicilio: backendData.referencia_domicilio,
            
            // Contacto
            telefono: backendData.telefono,
            email: backendData.email,
            
            // Datos Adicionales (Mapeo directo snake_case)
            id_instruccion: backendData.id_instruccion,
            id_estado_instruccion: backendData.id_estado_instruccion,
            id_ocupacion: backendData.id_ocupacion,
            id_tipo_empresa: backendData.id_tipo_empresa,
            id_seguro_salud: backendData.id_seguro_salud,
            id_bono: backendData.id_bono,
            tiene_discapacidad: backendData.tiene_discapacidad ? 'SI' : 'NO',
            id_tipo_discapacidad: backendData.id_tipo_discapacidad,
            porcentaje_discapacidad: backendData.porcentaje_discapacidad
        };
    };

    const [formData, setFormData] = useState(initialFormData);
    const [formErrors, setFormErrors] = useState({});
    const [validacionTransitoria, setValidacionTransitoria] = useState(false); // Estado para manejar la validación transitoria del código 99
    const [estaCargandoCodigo, setEstaCargandoCodigo] = useState(false); // Soberanía Lingüística: estado de carga para UI

     // Cálculo de edad detallado (Años, Meses, Días, Horas) - Centralizado
     const edadInfo = useMemo(() => {
        // Aseguramos que se use la fecha y hora correctas desde el anidamiento datosNacimiento
        // O fallback a nivel superior si existiera, pero la estructura principal es formData.datosNacimiento
        const fecha = formData.datosNacimiento?.fecha_nacimiento || formData.fecha_nacimiento;
        const hora = formData.datosNacimiento?.hora_parto || formData.hora_parto || '00:00';
        return calcularEdad(fecha, hora);
    }, [formData.datosNacimiento?.fecha_nacimiento, formData.fecha_nacimiento, formData.datosNacimiento?.hora_parto, formData.hora_parto]);

    const esMenor = edadInfo.anios < 18;

    const fechaNacimientoValida = useMemo(() => {
        if (!formData.fecha_nacimiento) return false;
        const selectedDate = new Date(formData.fecha_nacimiento);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return selectedDate <= now;
    }, [formData.fecha_nacimiento]);

    const tabs = [
        { id: 'personales', label: '1. Personales', icon: User },
        { id: 'nacimiento', label: '2. Nacimiento', icon: Baby },
        { id: 'residencia', label: '3. Residencia', icon: MapPin },
        { id: 'adicionales', label: '4. Adicionales', icon: ShieldCheck },
        { id: 'contacto', label: '5. Contacto Emergencia', icon: Users },
        { id: 'llegada', label: '6. Arribo/Condición', icon: ClipboardList },
        { id: 'motivo', label: '7. Motivo Consulta', icon: HeartPulse },
        { id: 'representante', label: 'Rep. Legal', icon: FileText, hidden: !fechaNacimientoValida }
    ];

    useEffect(() => {
        const fetchCatalogs = async () => {
            try {
                const data = await catalogService.getAllCatalogs();
                const ocupaciones = await catalogService.getOcupaciones();
                // Aseguramos que tiposIdentificacion use cat_tipos_identificacion (id, nombre en minúsculas)
                setCatalogos({
                    ...data,
                    tiposIdentificacion: data.tiposIdentificacion || [],
                    ocupaciones: ocupaciones || []
                });
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
        // Este efecto ya no es necesario, la lógica fue centralizada en el nuevo useEffect.
    }, [
        // formData.idProvinciaNacimiento, // Dependencia eliminada
        formData.id_tipo_identificacion,
        formData.primer_nombre,
        formData.segundo_nombre,
        formData.primer_apellido,
        formData.segundo_apellido,
        formData.fecha_nacimiento,
        edadInfo.isLess24h,
        catalogos.tiposIdentificacion
    ]);

    // Lógica Centralizada de Generación de Código Normativo MSP
    useEffect(() => {
        const tipoSeleccionado = catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion);
        const esNoIdentificado = tipoSeleccionado?.nombre?.toUpperCase()?.includes('NO IDENTIFICADO');
        
        // Obtenemos el ID de la provincia de nacimiento
        const idProvinciaNacimiento = formData.datosNacimiento?.provincia_nacimiento_id;
        
        // Necesitamos el código INEC de la provincia para generar el código correctamente
        // Usamos el ID como fallback si no hay código INEC explícito en el objeto, asumiendo que el ID coincide o se mapeará.
        // En un escenario real, deberíamos asegurar que el backend envíe 'codigo_inec'.
        const provinciaObj = catalogos.provincias?.find(p => p.id == idProvinciaNacimiento);
        // Prioridad: 1. codigo_inec (si existe), 2. id (formateado), 3. null
        // Si no hay provincia (ej. NN en etapa temprana), enviamos '00' para permitir generación parcial
        const codigoProvinciaInec = provinciaObj
            ? (provinciaObj.codigo_inec || String(provinciaObj.id).padStart(2, '0'))
            : '00';
        
        const nombreProvincia = provinciaObj ? provinciaObj.nombre : '';

        // Determinar si es extranjero para asignar código '99'
        const nacionalidadObj = catalogos.nacionalidades?.find(n => n.id == formData.datosNacimiento.id_nacionalidad);
        const esExtranjero = nacionalidadObj && !nacionalidadObj.nombre?.toUpperCase().includes('ECUATORIANA');

        let debeGenerarCodigo = false;

        // Caso 1: Es "NO IDENTIFICADO"
        // La generación debe ocurrir dinámicamente siempre que tengamos fecha de nacimiento.
        // La fecha es crítica para las posiciones 9-16 y el dígito década.
        const fechaNacimientoReal = formData.datosNacimiento?.fecha_nacimiento || formData.fecha_nacimiento;

        if (esNoIdentificado && fechaNacimientoReal) {
            debeGenerarCodigo = true;
        }
        // Caso 2: Transición desde código '99' (Emergencia temporal)
        else if (formData.numero_documento === '99' && validacionTransitoria && (idProvinciaNacimiento || esExtranjero)) {
            debeGenerarCodigo = true;
        }
        // Caso 3: Reconexión explícita si el documento actual es un código generado previamente y cambia la fecha
        else if (formData.numero_documento && formData.numero_documento.length > 10 && esNoIdentificado) {
             debeGenerarCodigo = true;
        }

        if (debeGenerarCodigo) {
            setEstaCargandoCodigo(true);
            
            // Generamos el código usando la utilidad centralizada
            // Aseguramos el uso de la fecha correcta desde datosNacimiento
            const fechaNacimientoReal = formData.datosNacimiento?.fecha_nacimiento || formData.fecha_nacimiento;
            
            const codigoGenerado = generarCodigoNormativo({
                primer_nombre: formData.primer_nombre,
                segundo_nombre: formData.segundo_nombre,
                primer_apellido: formData.primer_apellido,
                segundo_apellido: formData.segundo_apellido,
                codigo_provincia: codigoProvinciaInec,
                nombre_provincia: nombreProvincia,
                es_extranjero: esExtranjero,
                fecha_nacimiento: fechaNacimientoReal,
                es_neonato_horas: edadInfo.isLess24h,
                sexo_id: formData.id_sexo // Incluir sexo para mayor precisión si el generador lo soporta
            });

            // Solo actualizamos si el código es diferente y válido
            if (codigoGenerado && formData.numero_documento !== codigoGenerado) {
                setFormData(prev => ({ ...prev, numero_documento: codigoGenerado }));
                
                // Si se generó el código de 17 dígitos, habilitamos el formulario automáticamente
                if (codigoGenerado.length === 17) {
                    setFormHabilitado(true);
                }

                // Si veníamos de una validación transitoria (código 99), la limpiamos una vez generado un código válido más completo
                if (validacionTransitoria && codigoGenerado.length > 10) {
                    setValidacionTransitoria(false);
                }
            }
            setEstaCargandoCodigo(false);
        } else {
             setEstaCargandoCodigo(false);
        }
        
    }, [
        // Dependencias críticas para la regeneración del código
        formData.id_tipo_identificacion,
        formData.primer_nombre,
        formData.segundo_nombre,
        formData.primer_apellido,
        formData.segundo_apellido,
        formData.fecha_nacimiento,
        formData.datosNacimiento?.fecha_nacimiento, // CRÍTICO: Cambio de fecha en datosNacimiento dispara actualización dígito década
        formData.datosNacimiento?.hora_parto, // También si cambia la hora (por si influye en el cálculo de neonato)
        formData.datosNacimiento?.provincia_nacimiento_id,
        formData.datosNacimiento?.id_nacionalidad,
        formData.id_sexo,
        catalogos.provincias,
        catalogos.nacionalidades,
        catalogos.tiposIdentificacion,
        validacionTransitoria,
        edadInfo.isLess24h
    ]);


    useEffect(() => {
        const fetchParroquias = async () => {
            if (formData.cantonResidencia) {
                const data = await catalogService.getParroquias(formData.cantonResidencia);
                setParroquiasFiltradas(data);
            }
        };
        fetchParroquias();
    }, [formData.cantonResidencia]);

   const idNacionalidadEcuatoriana = useMemo(() => {
       // Asumiendo que el ID de ECUATORIANA es 1, basado en la estructura de la DB
       // y la falta de un seeder específico. Esta es una suposición informada.
       const nacionalidad = catalogos.nacionalidades?.find(n => n.nombre?.toUpperCase().includes('ECUATORIANA'));
       return nacionalidad ? nacionalidad.id : 1;
   }, [catalogos.nacionalidades]);



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
        let { name, value, type, checked } = e.target || e;
        
        // Aplicar toUpperCase a todos los campos de texto y textarea (Soberanía de Datos)
        if (type === 'text' || type === 'email' || e.target?.tagName === 'INPUT' || e.target?.tagName === 'TEXTAREA') {
            if (typeof value === 'string') {
                value = value.toUpperCase();
            }
        }

        const isDatosNacimiento = name.startsWith('datosNacimiento.');
        const fieldName = isDatosNacimiento ? name.split('.')[1] : name;
    
        // Limpieza de errores para el campo que está cambiando
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
        if (isDatosNacimiento && formErrors[fieldName]) {
            setFormErrors(prev => ({ ...prev, [fieldName]: null }));
        }
    
        if (fieldName === 'fecha_nacimiento' && value) {
            const selectedDate = new Date(value);
            const now = new Date();
            now.setHours(0, 0, 0, 0);
    
            if (selectedDate > now) {
                setModalConfig({
                    show: true, type: 'error', title: 'Error de Validación',
                    message: 'Error: La fecha de nacimiento no puede ser posterior a la fecha actual.',
                    onClose: () => {
                        setFormData(prev => ({ ...prev, datosNacimiento: { ...prev.datosNacimiento, fecha_nacimiento: '' } }));
                        setModalConfig(p => ({ ...p, show: false }));
                        // Mantener foco en el campo de fecha tras presionar ENTER para corrección rápida
                        setTimeout(() => {
                            const el = document.getElementsByName('datosNacimiento.fecha_nacimiento')[0];
                            if (el) el.focus();
                        }, 150);
                    }
                });
                return;
            }
        }
    
        if (activeTab === 'personales' && name === 'id_sexo' && value && formData.primer_apellido && formData.primer_nombre) {
            setTimeout(() => setActiveTab('nacimiento'), 500);
        }
    
        setFormData(prev => {
            const newData = { ...prev };
    
            if (isDatosNacimiento) {
                // Captura de Valor Numérico con parseInt para ID de nacionalidad y otros IDs
                const valorProcesado = (fieldName.includes('id') || fieldName.includes('Id')) && value !== '' ? parseInt(value, 10) : value;
                const newDatosNacimiento = { ...prev.datosNacimiento, [fieldName]: valorProcesado };
    
                if (fieldName === 'id_nacionalidad') {
                    // No bloqueamos nada, simplemente aseguramos que el ID sea numérico.
                    // La habilitación de campos de provincia se maneja en SeccionNacimiento y useEffects.
                }
                
                // Si cambia la fecha de nacimiento en datosNacimiento, asegurar que el foco pueda fluir
                if (fieldName === 'fecha_nacimiento' && value) {
                     // El efecto de foco está en SeccionNacimiento vía onKeyDown Tab
                }
                newData.datosNacimiento = newDatosNacimiento;
    
            } else {
                newData[name] = type === 'checkbox' ? checked : value;
            }

            // Lógica para validacionTransitoria
            if (name === 'numero_documento') {
                if (value === '99') {
                    setValidacionTransitoria(true);
                } else {
                    setValidacionTransitoria(false);
                }
            }
    
            const tipoSeleccionado = catalogos.tiposIdentificacion?.find(t => t.id == newData.id_tipo_identificacion);
            const esNoIdentificado = tipoSeleccionado?.nombre?.toUpperCase() === 'NO IDENTIFICADO';
    
            // Eliminamos la generación manual aquí dentro del handleChange
            // para delegar completamente la responsabilidad al useEffect centralizado.
            // Esto evita que se genere el código dos veces o con estados desactualizados.
    
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
                        // Devolver foco a fecha_nacimiento usando ref o selector
                        setTimeout(() => {
                            const el = document.getElementsByName('datosNacimiento.fecha_nacimiento')[0];
                            if (el) el.focus();
                        }, 100);
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
            
            // Verificación robusta de respuesta
            if (response && response.found && response.paciente) {
                // Usamos el mapeador para asegurar compatibilidad total con la estructura snake_case del backend
                const datosMapeados = mapBackendToFrontend(response.paciente);
                
                // Mantenemos los datos que ya se hayan ingresado en el formulario y que no vengan del backend (merge seguro)
                setFormData(prev => ({
                    ...prev,
                    ...datosMapeados,
                    // Preservar datos de admisión actual que no son del paciente histórico
                    motivo_consulta: prev.motivo_consulta,
                    motivo_detalle: prev.motivo_detalle,
                    enfermedad_actual: prev.enfermedad_actual,
                    id_sintoma: prev.id_sintoma,
                    sintoma_categoria: prev.sintoma_categoria
                }));
                
                setFormHabilitado(true);
                setModalConfig({
                    show: true, type: 'success', title: 'Paciente Encontrado',
                    message: `Se han cargado los datos de ${response.paciente.primer_nombre} ${response.paciente.primer_apellido}.`
                });
            } else {
                // Caso: Paciente no encontrado (404 lógico) -> Limpiar formulario para nuevo registro
                // No mostramos error, sino que habilitamos el formulario para registro limpio
                
                // Guardamos el número de documento y tipo para no perder lo que escribió
                const documentoActual = formData.numero_documento;
                const tipoIdActual = formData.id_tipo_identificacion;

                // Limpiar campos de pestañas 2 a 6, manteniendo pestañas 1 y identificadores
                setFormData(prev => ({
                    ...initialFormData, // Reset total
                    numero_documento: documentoActual, // Restaurar documento
                    id_tipo_identificacion: tipoIdActual, // Restaurar tipo
                    
                    // Mantener nombres si el usuario ya los había escrito antes de buscar (casos raros pero posibles)
                    primer_nombre: prev.primer_nombre,
                    segundo_nombre: prev.segundo_nombre,
                    primer_apellido: prev.primer_apellido,
                    segundo_apellido: prev.segundo_apellido,
                }));

                setFormHabilitado(true); // Habilitar para edición
                
                // Feedback claro para el usuario
                console.log('Paciente no encontrado, formulario limpio para registro.');
                
                 setModalConfig({
                    show: true, type: 'info', title: 'Paciente Nuevo',
                    message: 'El número de documento no se encuentra registrado. El formulario ha sido habilitado para ingresar un paciente nuevo.',
                    confirmAction: () => setModalConfig(p => ({...p, show: false}))
                });
            }
        } catch (error) {
            console.error('Error al buscar paciente:', error);
            // Si es un error real de red o 500
            setModalConfig({
                show: true, type: 'error', title: 'Error de Conexión',
                message: 'No se pudo consultar el microservicio de personas.'
            });
        } finally { setLoading(false); }
    };
 
     const validateTab = (tabId, isFinalValidation = false) => {
         const newErrors = {};
         if (tabId === 'personales') {
             if (!formData.numero_documento) newErrors.numero_documento = 'El número de documento es obligatorio.';
             if (!formData.primer_nombre) newErrors.primer_nombre = 'El primer nombre es obligatorio.';
             if (!formData.primer_apellido) newErrors.primer_apellido = 'El primer apellido es obligatorio.';

             // Validación para el código 99, solo si no es la validación final
             if (!isFinalValidation && formData.numero_documento === '99' && !validacionTransitoria) {
                 // No se agrega error aquí, solo se permite el tránsito
             }
         }
         
         if (tabId === 'nacimiento') {
             if (!formData.fecha_nacimiento) {
                 newErrors.fecha_nacimiento = 'La fecha de nacimiento es obligatoria.';
             } else if (!fechaNacimientoValida) {
                 newErrors.fecha_nacimiento = 'La fecha de nacimiento no puede ser futura.';
             }
         }
 
         setFormErrors(prev => ({ ...prev, ...newErrors }));
         return Object.keys(newErrors).length === 0;
     };
 
     const handleNext = () => {
         let isValid = true;
         if (activeTab === 'personales') {
             // Flexibilización de Navegación:
             // Pestaña 1 solo valida filiación inmediata.
             const newErrors = {};
             
             const tipoSeleccionado = catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion);
             const esNoIdentificado = tipoSeleccionado?.nombre?.toUpperCase() === 'NO IDENTIFICADO';
             
             // Validación condicional: Si es "NO IDENTIFICADO", el número de documento se genera automáticamente
             // y puede estar vacío inicialmente si falta la provincia. No bloqueamos por numero_documento en este caso
             // si tenemos los nombres, para permitir avanzar a llenar datos de nacimiento.
             if (!esNoIdentificado && !formData.numero_documento) {
                 newErrors.numero_documento = 'El número de documento es obligatorio.';
             }
             
             if (!formData.primer_nombre) newErrors.primer_nombre = 'El primer nombre es obligatorio.';
             if (!formData.primer_apellido) newErrors.primer_apellido = 'El primer apellido es obligatorio.';
             setFormErrors(prev => ({ ...prev, ...newErrors }));
             
             // Permitir paso si no hay errores básicos.
             // Si el código es '99', se permite avanzar explícitamente siempre que haya nombres.
             const esCodigoEmergencia = formData.numero_documento === '99';
             const tieneNombres = formData.primer_nombre && formData.primer_apellido;
             
             isValid = Object.keys(newErrors).length === 0;
 
             // Excepción explícita para código 99 con nombres completos
             if (esCodigoEmergencia && tieneNombres) {
                 isValid = true;
                 setValidacionTransitoria(true);
             }
             
             // Excepción explícita para "NO IDENTIFICADO" que va a la pestaña de nacimiento para completar datos
             if (esNoIdentificado && tieneNombres) {
                 isValid = true;
             }
         } else {
             isValid = validateTab(activeTab);
         }
 
         if (isValid) {
             const currentIndex = tabs.findIndex(t => t.id === activeTab);
             if (currentIndex < tabs.length - 1) {
                 setActiveTab(tabs[currentIndex + 1].id);
             }
         }
     };
 
     const handleFinalize = async (e) => {
         e.preventDefault();
 
         const allTabsValid = tabs.every(tab => validateTab(tab.id, true));
         if (!allTabsValid) {
             setModalConfig({
                 show: true,
                 type: 'error',
                 title: 'Formulario Incompleto',
                 message: 'Existen errores en el formulario. Por favor, revise todas las pestañas.'
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
 
         // Validación TAREA 3.1: Porcentaje de discapacidad mínimo 30
         if (formData.tiene_discapacidad === 'SI' && formData.porcentaje_discapacidad && parseInt(formData.porcentaje_discapacidad, 10) < 30) {
             setModalConfig({
                 show: true,
                 type: 'error',
                 title: 'VALIDACIÓN NORMATIVA',
                 message: 'El porcentaje de discapacidad debe ser igual o mayor al 30% según la normativa legal.'
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
                     id_estado_instruccion: formData.id_estado_instruccion,
                     id_seguro_salud: formData.id_seguro_salud,
                     id_ocupacion: formData.id_ocupacion,
                     id_tipo_empresa: formData.id_tipo_empresa,
                     id_bono: formData.id_bono,
                     referencia_domicilio: formData.referencia_domicilio,
                     tiene_discapacidad: formData.tiene_discapacidad === 'SI',
                     id_tipo_discapacidad: formData.id_tipo_discapacidad,
                     porcentaje_discapacidad: formData.porcentaje_discapacidad,
                 },
                admissionData: {
                    motivo_consulta: formData.motivo_consulta,
                    enfermedad_actual: formData.enfermedad_actual,
                    id_sintoma: formData.id_sintoma,
                    sintoma_categoria: formData.sintoma_categoria,
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
                    const cat = formData.sintoma_categoria || '';
                    if (cat === 'PROCEDIMIENTOS - EMERGENCIA' || cat === 'VACUNATORIO - EMERGENCIA') {
                        navigate('/dashboard/procedimientos');
                    } else {
                        navigate('/dashboard/triaje-signos');
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
 
     useEffect(() => {
         // Limpia los errores cuando se cambia de pestaña
         setFormErrors({});
     }, [activeTab]);
 
     const TabButton = ({ tab }) => {
         if (tab.hidden) return null;
         const Icon = tab.icon;
         const isActive = activeTab === tab.id;
 
         return (
             <button
                 type="button"
                 onClick={() => {
                     // Lógica de desbloqueo en cascada para "Identificado" (Cédula o Código NN de 17 dígitos)
                     const tipoSeleccionado = catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion);
                     const esNoIdentificado = tipoSeleccionado?.nombre?.toUpperCase()?.includes('NO IDENTIFICADO');
                     
                     const esIdentificado = formHabilitado || (formData.numero_documento && formData.numero_documento.length === 17);
                     
                     // Habilitación total para NN: pestañas 3 a 7
                     const esPestañaNNPermitida = esNoIdentificado && ['residencia', 'adicionales', 'contacto', 'llegada', 'motivo', 'representante'].includes(tab.id);

                     // Permitir navegación a personales, nacimiento o si está identificado
                     const puedeNavegar = tab.id === 'personales' || tab.id === 'nacimiento' || esIdentificado || esPestañaNNPermitida;
 
                     if (puedeNavegar) {
                         setActiveTab(tab.id);
                     }
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
        <div className="w-full max-w-7xl mx-auto p-0 sm:p-2 bg-slate-100 font-sans antialiased mt-6">
            <div className="bg-white shadow-xl overflow-hidden border-x border-b border-gray-200">
                <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-4 text-white flex justify-between items-center border-b-4 border-yellow-400">
                    <div className="flex items-center space-x-4">
                        <div className="bg-white p-1 rounded">
                            <ShieldCheck className="w-8 h-8 text-blue-900" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight leading-none uppercase">ADMISION DE PACIENTES</h1>
                            <p className="text-[10px] md:text-xs font-medium opacity-90 text-blue-100 mt-1">
                                Registro completo de filiación según Formulario 001 MSP.
                            </p>
                        </div>
                    </div>
                    <div className="bg-blue-800/50 border border-blue-400 rounded px-4 py-2 text-center">
                        <p className="text-[9px] font-bold text-blue-300 uppercase tracking-tighter">Código Normativo de Identificación</p>
                        <p className="text-2xl font-black tracking-[0.2em] font-mono text-yellow-400">
                            {formData.numero_documento || '...'}
                        </p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-bold opacity-80 uppercase">Establecimiento:</p>
                        <p className="text-sm font-black">CENTRO DE SALUD CHONE TIPO C</p>
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
                                errors={formErrors}
                                setFormData={setFormData}
                            />
                        )}

                        {activeTab === 'nacimiento' && (
                            <SeccionNacimiento
                                formData={formData}
                                handleChange={handleChange}
                                handleBlur={handleBlur}
                                fechaRef={fechaRef}
                                catalogos={catalogos}
                                formHabilitado={formHabilitado}
                                edadInfo={edadInfo}
                                setFormData={setFormData}
                                setModalConfig={setModalConfig}
                                errors={formErrors}
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
                                setFormData={setFormData}
                            />
                        )}

                        {activeTab === 'adicionales' && (
                            <SeccionDatosAdicionales
                                formData={formData}
                                handleChange={handleChange}
                                catalogos={catalogos}
                                formHabilitado={formHabilitado}
                                setFormData={setFormData}
                                setModalConfig={setModalConfig}
                            />
                        )}

                        {activeTab === 'representante' && fechaNacimientoValida && (
                            <SeccionRepresentante
                                formData={formData}
                                handleChange={handleChange}
                                catalogos={catalogos}
                                formHabilitado={formHabilitado}
                                edadInfo={edadInfo}
                                setFormData={setFormData}
                            />
                        )}

                        {activeTab === 'contacto' && (
                            <SeccionContactoEmergencia
                                formData={formData}
                                handleChange={handleChange}
                                catalogos={catalogos}
                                formHabilitado={formHabilitado}
                                setFormData={setFormData}
                            />
                        )}

                        {activeTab === 'llegada' && (
                            <SeccionLlegadaMotivo
                                formData={formData}
                                handleChange={handleChange}
                                catalogos={catalogos}
                                formHabilitado={formHabilitado}
                                soloLlegada={true}
                                setFormData={setFormData}
                            />
                        )}

                        {activeTab === 'motivo' && (
                            <SeccionLlegadaMotivo
                                formData={formData}
                                handleChange={handleChange}
                                catalogos={catalogos}
                                formHabilitado={formHabilitado}
                                soloMotivo={true}
                                setFormData={setFormData}
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

                            {activeTab !== 'motivo' && (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="px-12 py-4 font-black rounded-lg shadow-lg transition-all transform uppercase text-xs bg-green-600 text-white hover:bg-green-700"
                                >
                                    Siguiente
                                </button>
                            )}
                            
                            <button
                                type="submit"
                                disabled={loading || !formHabilitado || !formData.motivo_detalle}
                                className={`group flex items-center px-12 py-4 font-black rounded-lg shadow-2xl transition-all transform ${
                                    loading || !formHabilitado || !formData.motivo_detalle
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

import React, { useState, useEffect, useMemo } from 'react';
import { 
    User, MapPin, Baby, HeartPulse, Users, 
    ClipboardList, Save, ShieldCheck 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import pacienteService from '../api/pacienteService';
import catalogService from '../api/catalogService';
import ModalFeedback from './ModalFeedback';

// Sub-componentes modulares
import SeccionIdentidad from './admision/SeccionIdentidad';
import SeccionBioSocial from './admision/SeccionBioSocial';
import SeccionNacimiento from './admision/SeccionNacimiento';
import SeccionResidencia from './admision/SeccionResidencia';
import SeccionLlegadaMotivo from './admision/SeccionLlegadaMotivo';
import SeccionContactoEmergencia from './admision/SeccionContactoEmergencia';

const FormularioAdmisionMaestra = () => {
    const navigate = useNavigate();
    const [formIteration, setFormIteration] = useState(0);
    
    const [catalogos, setCatalogos] = useState({
        provincias: [], cantones: [], parroquias: [], nacionalidades: [],
        etnias: [], nivelesEducacion: [], segurosSalud: [], sexos: [],
        estadosCiviles: [], generos: [], parentescos: [], formasLlegada: [],
        fuentesInformacion: [], tiposDocumento: [], condicionesLlegada: []
    });

    const [cantonesFiltrados, setCantonesFiltrados] = useState([]);
    const [parroquiasFiltradas, setParroquiasFiltradas] = useState([]);
    const [activeTab, setActiveTab] = useState('personales');
    const [loading, setLoading] = useState(false);
    const [formHabilitado, setFormHabilitado] = useState(false);
    const [modalConfig, setModalConfig] = useState({ show: false, type: 'info', title: '', message: '', confirmAction: null });

    const [formData, setFormData] = useState({
        datosIdentidad: {
            id_tipo_identificacion: null,
            numero_documento: '',
            primer_apellido: '',
            segundo_apellido: '',
            primer_nombre: '',
            segundo_nombre: '',
            nombre_social: '',
        },
        datosNacimiento: {
            provincia_nacimiento_id: null,
            canton_nacimiento_id: null,
            parroquia_nacimiento_id: null,
            id_nacionalidad: null,
            fecha_nacimiento: '',
            hora_parto: '',
            id_lugar_parto: null,
            cedula_madre: '',
        },
        datosResidencia: {
            pais_id: 'EC',
            provincia_id: null,
            canton_id: null,
            parroquia_id: null,
            barrio: '',
            calle_principal: '',
            calle_secundaria: '',
            numero_casa: '',
            referencia: '',
        },
        datosAdicionales: {
            id_instruccion: null,
            id_etnia: null,
            id_pueblo: null,
            id_seguro_salud: null,
            ocupacion: '',
            tipo_bono: '',
            tiene_discapacidad: false,
            id_tipo_discapacidad: null,
            porcentaje_discapacidad: '',
        },
        datosContacto: {
            nombre_completo: '',
            id_parentesco: null,
            telefono: '',
            direccion: '',
        },
        datosLlegada: {
            id_forma_llegada: null,
            id_fuente_informacion: null,
            persona_entrega: '',
            id_condicion_llegada: null,
        },
        datosMotivo: {
            motivo_atencion: '',
            detalle: '',
        }
    });

    // Cálculo de edad (Años/Meses/Días)
    const edadInfo = useMemo(() => {
        if (!formData.datosNacimiento.fecha_nacimiento) return { anios: 0, meses: 0, dias: 0 };
        const birth = new Date(formData.datosNacimiento.fecha_nacimiento + 'T00:00:00');
        const now = new Date();
        
        let anios = now.getFullYear() - birth.getFullYear();
        let meses = now.getMonth() - birth.getMonth();
        let dias = now.getDate() - birth.getDate();

        if (dias < 0) {
            meses -= 1;
            const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            dias += lastMonth.getDate();
        }
        if (meses < 0) {
            anios -= 1;
            meses += 12;
        }
        return { anios, meses, dias };
    }, [formData.datosNacimiento.fecha_nacimiento]);

    const esMenor = edadInfo.anios < 18;

    const tabs = [
        { id: 'personales', label: '1. Datos Personales', icon: User },
        { id: 'nacimiento', label: '2. Nacimiento y Etnia', icon: Baby },
        { id: 'residencia', label: '3. Residencia', icon: MapPin },
        { id: 'adicionales', label: '4. Datos Adicionales', icon: ShieldCheck },
        { id: 'contacto', label: '5. Contacto Emergencia', icon: Users },
        { id: 'llegada', label: '6. Llegada y Condición', icon: ClipboardList },
        { id: 'motivo', label: '7. Motivo de Consulta', icon: HeartPulse }
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
            if (formData.datosResidencia.provincia_id) {
                const data = await catalogService.getCantones(formData.datosResidencia.provincia_id);
                setCantonesFiltrados(data);
            }
        };
        fetchCantones();
    }, [formData.datosResidencia.provincia_id]);

    useEffect(() => {
        const fetchParroquias = async () => {
            if (formData.datosResidencia.canton_id) {
                const data = await catalogService.getParroquias(formData.datosResidencia.canton_id);
                setParroquiasFiltradas(data);
            }
        };
        fetchParroquias();
    }, [formData.datosResidencia.canton_id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // Transformar texto a MAYÚSCULAS si no es un tipo especial (como fecha o email si hubiera)
        // y si el valor es un string
        let valorFinal = value;
        if (type === 'text' || type === 'textarea') {
            valorFinal = value ? value.toUpperCase() : value;
        }

        const [seccion, campo] = name.split('.');

        if (seccion === 'datosNacimiento' && campo === 'fecha_nacimiento') {
            if (value && value.length === 10) {
                const selectedDate = new Date(value);
                const now = new Date();
                
                if (!isNaN(selectedDate.getTime())) {
                    // Límite Superior: Fechas futuras (Bloqueo inmediato)
                    if (selectedDate > now) {
                        setModalConfig({
                            show: true,
                            type: 'warning',
                            title: 'Fecha Inválida',
                            message: 'No se permiten fechas futuras',
                            confirmAction: null
                        });
                        setFormData(prev => ({ ...prev, [name]: '' }));
                        return;
                    }
                }
            }
        }
        
        // This logic is incorrect for the new state structure. It will be removed.
        // if (name === 'datosIdentidad.id_tipo_identificacion') {
        // ...
        // }

        setFormData(prev => {
            const keys = name.split('.');
            if (keys.length === 2) {
                return {
                    ...prev,
                    [keys[0]]: {
                        ...prev[keys[0]],
                        [keys[1]]: type === 'checkbox' ? checked : valorFinal
                    }
                };
            }
            return { ...prev, [name]: type === 'checkbox' ? checked : valorFinal };
        });
    };

    const handleBlur = (e) => {
        const { name, value } = e.target || e;

        // Validación onBlur: Rango de 120 años (bloqueo al salir)
        if (name === 'fechaNacimiento' || name === 'fecha_hora_parto') {
            if (value && value.length === 10) {
                const selectedDate = new Date(value);
                const now = new Date();
                
                if (!isNaN(selectedDate.getTime())) {
                    // Límite Inferior Dinámico: Máximo 120 años
                    const minYear = now.getFullYear() - 120;
                    const minDate = new Date(minYear, now.getMonth(), now.getDate());

                    if (selectedDate < minDate) {
                        setModalConfig({
                            show: true,
                            type: 'warning',
                            title: 'Fecha Inválida',
                            message: 'Fecha fuera de rango permitido (Máximo 120 años). Por favor, verifique el año ingresado.',
                            confirmAction: null
                        });
                        setFormData(prev => ({ ...prev, [name]: '' }));
                    }
                }
            }
        }
    };

    const handleBusquedaPaciente = async () => {
        if (!formData.datosIdentidad.numero_documento || formData.datosIdentidad.numero_documento.length < 10) return;
        setLoading(true);
        try {
            const response = await pacienteService.findByCedula(formData.datosIdentidad.numero_documento);
            if (response.found) {
                setFormData(prev => ({ ...prev, ...response.paciente }));
                setFormHabilitado(true);
            } else {
                setModalConfig({
                    show: true, type: 'warning', title: 'Nuevo Paciente',
                    message: 'Paciente no registrado en el sistema. ¿Desea iniciar un nuevo registro?',
                    confirmAction: () => { setFormHabilitado(true); setModalConfig(p => ({...p, show: false})); }
                });
            }
        } catch (error) { console.error('Error al buscar paciente'); } finally { setLoading(false); }
    };

    const codigoNormativo = useMemo(() => {
        const UCE = "102114"; // Fijo: CS TIPO C CHONE
        const anio = new Date().getFullYear().toString().slice(-2);
        const secuencial = Date.now().toString().slice(-7).padStart(7, '0');
        
        const codigoProvinciaIdentidad = formData.datosNacimiento.provincia_nacimiento_id
            ? String(formData.datosNacimiento.provincia_nacimiento_id).padStart(2, '0')
            : '99';

        return `${UCE}${codigoProvinciaIdentidad}${anio}${secuencial}`;
    }, [formData.datosNacimiento.provincia_nacimiento_id]);

    const handleFinalize = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        console.log("Código Normativo Generado:", codigoNormativo);

        // Aquí iría la lógica para guardar la admisión junto con el código
        // await pacienteService.guardarAdmision({ ...formData, codigoNormativo });

        try {
            if (formData.datosMotivo.motivo_atencion === 'EMERGENCIA' || formData.datosMotivo.motivo_atencion === 'TRIAGE') {
                navigate('/dashboard/triaje-signos');
            } else {
                navigate('/dashboard/consultas');
            }
        } catch (error) { console.error('Error al finalizar'); } finally { setLoading(false); }
    };

    const TabButton = ({ tab }) => {
        if (tab.hidden) return null;
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
            <button
                type="button"
                onClick={() => (formHabilitado || tab.id === 'personales') ? setActiveTab(tab.id) : null}
                className={`flex flex-col items-center justify-center px-4 py-3 min-w-[110px] transition-all border-b-4 ${
                    isActive ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
            >
                <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-[10px] font-black uppercase tracking-tighter leading-tight text-center">{tab.label}</span>
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
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-bold opacity-70">CÓDIGO NORMATIVO DE IDENTIFICACIÓN</span>
                        <div className="bg-black bg-opacity-20 px-3 py-1 rounded">
                            <p className="text-lg font-mono font-black tracking-widest text-yellow-300">{codigoNormativo}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs de Navegación */}
                <div className="flex bg-white border-b shadow-inner overflow-x-auto scrollbar-hide">
                    {tabs.map(tab => <TabButton key={tab.id} tab={tab} />)}
                </div>

                <form onSubmit={handleFinalize} className="p-6 md:p-8 space-y-8 bg-white min-h-[500px]">
                    <div key={formIteration} className="animate-in fade-in slide-in-from-left-4 duration-500">
                        {activeTab === 'personales' && (
                            <SeccionIdentidad
                                formData={formData.datosIdentidad}
                                handleChange={handleChange}
                                handleBusquedaPaciente={handleBusquedaPaciente}
                                catalogos={catalogos}
                                formHabilitado={formHabilitado}
                            />
                        )}

                        {activeTab === 'nacimiento' && (
                            <SeccionNacimiento
                                formData={formData.datosNacimiento}
                                handleChange={handleChange}
                                handleBlur={handleBlur}
                                catalogos={catalogos}
                                formHabilitado={formHabilitado}
                                edadInfo={edadInfo}
                                setFormData={setFormData}
                            />
                        )}

                        {activeTab === 'residencia' && (
                            <SeccionResidencia
                                formData={formData.datosResidencia}
                                handleChange={handleChange}
                                catalogos={catalogos}
                                cantonesFiltrados={cantonesFiltrados}
                                parroquiasFiltradas={parroquiasFiltradas}
                                formHabilitado={formHabilitado}
                            />
                        )}

                        {activeTab === 'adicionales' && (
                            <SeccionBioSocial
                                formData={formData.datosAdicionales}
                                handleChange={handleChange}
                                catalogos={catalogos}
                                formHabilitado={formHabilitado}
                            />
                        )}

                        {activeTab === 'contacto' && (
                            <SeccionContactoEmergencia
                                formData={formData.datosContacto}
                                handleChange={handleChange}
                                catalogos={catalogos}
                                formHabilitado={formHabilitado}
                            />
                        )}

                        {activeTab === 'llegada' && (
                            <SeccionLlegadaMotivo
                                formData={formData.datosLlegada}
                                handleChange={handleChange}
                                catalogos={catalogos}
                                formHabilitado={formHabilitado}
                                soloLlegada={true}
                            />
                        )}

                        {activeTab === 'motivo' && (
                            <SeccionLlegadaMotivo
                                formData={formData.datosMotivo}
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
                            Campos marcados con (*) son obligatorios según norma MSP 001
                        </div>
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setFormIteration(prev => prev + 1);
                                    setFormData({
                                        tipoIdentificacion: '', cedula: '', primerApellido: '', segundoApellido: '',
                                        primerNombre: '', segundoNombre: '', estadoCivil: '', sexo: '',
                                        telefonoFijo: '', telefonoCelular: '', email: '',
                                        nacionalidad: '', provinciaNacimiento: '', cantonNacimiento: '', parroquiaNacimiento: '',
                                        fechaNacimiento: '', autoidentificacionEtnica: '', puebloEtnico: '',
                                        paisResidencia: 'Ecuador', provinciaResidencia: '', cantonResidencia: '',
                                        parroquiaResidencia: '', barrio: '', callePrincipal: '', calleSecundaria: '',
                                        numeroCasa: '', referenciaResidencia: '',
                                        nivelEducacion: '', ocupacion: '', seguroSaludPrincipal: '',
                                        tipoBono: '', tieneDiscapacidad: false, tipoDiscapacidad: '',
                                        porcentajeDiscapacidad: '', carnetDiscapacidad: '',
                                        contactoEmergenciaNombre: '', contactoEmergenciaParentesco: '',
                                        contactoEmergenciaTelefono: '', contactoEmergenciaDireccion: '',
                                        formaLlegada: '', fuenteInformacion: '', personaEntrega: '', condicionLlegada: '',
                                        motivoAtencion: '', motivoAtencionDetalle: ''
                                    });
                                    setFormHabilitado(false);
                                    setActiveTab('personales');
                                }}
                                className="px-6 py-4 font-bold text-red-500 hover:text-red-700 uppercase text-xs border border-red-200 rounded-lg hover:bg-red-50 mr-2"
                            >
                                Limpiar Todo
                            </button>

                            {activeTab !== 'personales' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const currentIndex = tabs.findIndex(t => t.id === activeTab);
                                        setActiveTab(tabs[currentIndex - 1].id);
                                    }}
                                    className="px-6 py-4 font-bold text-gray-500 hover:text-gray-700 uppercase text-xs"
                                >
                                    Anterior
                                </button>
                            )}
                            
                            <button
                                type="submit" 
                                disabled={loading || !formHabilitado || !formData.datosMotivo.motivo_atencion}
                                className={`group flex items-center px-12 py-4 font-black rounded-lg shadow-2xl transition-all transform ${
                                    loading || !formHabilitado || !formData.datosMotivo.motivo_atencion
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

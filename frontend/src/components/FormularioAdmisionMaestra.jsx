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
        // Pestaña 1: Datos Personales
        tipoIdentificacion: '', cedula: '', primerApellido: '', segundoApellido: '',
        primerNombre: '', segundoNombre: '', estadoCivil: '', sexo: '',
        telefonoFijo: '', telefonoCelular: '', email: '',
        
        // Pestaña 2: Nacimiento y Etnia
        nacionalidad: '', provinciaNacimiento: '', cantonNacimiento: '', parroquiaNacimiento: '',
        fechaNacimiento: '', autoidentificacionEtnica: '', puebloEtnico: '',
        
        // Pestaña 3: Residencia
        paisResidencia: 'Ecuador', provinciaResidencia: '', cantonResidencia: '',
        parroquiaResidencia: '', barrio: '', callePrincipal: '', calleSecundaria: '',
        numeroCasa: '', referenciaResidencia: '',
        
        // Pestaña 4: Datos Adicionales
        nivelEducacion: '', ocupacion: '', seguroSaludPrincipal: '', 
        tipoBono: '', tieneDiscapacidad: false, tipoDiscapacidad: '',
        porcentajeDiscapacidad: '', carnetDiscapacidad: '',
        
        // Pestaña 5: Datos de Contacto
        contactoEmergenciaNombre: '', contactoEmergenciaParentesco: '', 
        contactoEmergenciaTelefono: '', contactoEmergenciaDireccion: '',
        
        // Pestaña 6: Forma y Condición de Llegada
        formaLlegada: '', fuenteInformacion: '', personaEntrega: '', condicionLlegada: '',
        
        // Pestaña 7: Motivo de Consulta
        motivoAtencion: '', motivoAtencionDetalle: '',

        // Otros
    });

    // Cálculo de edad (Años/Meses/Días)
    const edadInfo = useMemo(() => {
        if (!formData.fechaNacimiento) return { anios: 0, meses: 0, dias: 0 };
        const birth = new Date(formData.fechaNacimiento + 'T00:00:00');
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
    }, [formData.fechaNacimiento]);

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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target || e;

        // Validación onChange: Solo fechas futuras (bloqueo inmediato)
        if (name === 'fechaNacimiento' || name === 'fecha_hora_parto') {
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
        
        if (name === 'tipoIdentificacion') {
            setFormIteration(prev => prev + 1);
            localStorage.removeItem('sigemech_form_draft');
            
            // Simulación de reset() ya que no usamos react-hook-form actualmente
            setFormData({
                tipoIdentificacion: value,
                cedula: '', primerApellido: '', segundoApellido: '',
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
            return;
        }

        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
        if (!formData.cedula || formData.cedula.length < 10) return;
        setLoading(true);
        try {
            const response = await pacienteService.findByCedula(formData.cedula);
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

    const handleFinalize = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (formData.motivoAtencion === 'EMERGENCIA' || formData.motivoAtencion === 'TRIAGE') {
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
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-bold opacity-80 uppercase">Establecimiento:</p>
                        <p className="text-sm font-black">CENTRO DE SALUD TIPO C - CHONE</p>
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
                                handleBlur={handleBlur}
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

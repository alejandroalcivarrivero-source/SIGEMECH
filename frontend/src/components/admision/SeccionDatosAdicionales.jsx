import React, { useState, useEffect, useRef } from 'react';
import catalogService from '../../api/catalogService';

/**
 * SeccionDatosAdicionales
 * Pestaña 4: Datos Adicionales (Socio-Económicos e Inclusión)
 */
const SeccionDatosAdicionales = ({ formData, handleChange, catalogos, formHabilitado, setFormData, setModalConfig }) => {
    // 1. DECLARACIÓN DE HOOKS (SIEMPRE AL INICIO)
    const [nacionalidadesEtnicas, setNacionalidadesEtnicas] = useState([]);
    const [pueblosEtnicos, setPueblosEtnicos] = useState([]);
    const [cargandoNacionalidades, setCargandoNacionalidades] = useState(false);
    const [cargandoPueblos, setCargandoPueblos] = useState(false);

    const prevEtniaRef = useRef(formData.id_etnia);
    const prevNacEtnicaRef = useRef(formData.id_nacionalidad_etnica);

    // 2. EFECTOS (Soberanía de Hooks)
    
    // Vigilancia de Etnia (Nivel 1)
    useEffect(() => {
        const manejarCambioEtnia = async () => {
            if (!formData.id_etnia) {
                setNacionalidadesEtnicas([]);
                setPueblosEtnicos([]);
                return;
            }

            const etnias = catalogos?.etnias || [];
            const etniaSeleccionada = etnias.find(e => Number(e.id) === Number(formData.id_etnia));
            const nombreEtnia = etniaSeleccionada?.nombre?.toUpperCase() || '';
            const esIndigena = Number(formData.id_etnia) === 1;
            const requiereCascada = esIndigena || ["INDÍGENA", "MONTUBIO", "INDIGENA"].some(tipo => nombreEtnia.includes(tipo));

            if (requiereCascada) {
                try {
                    setCargandoNacionalidades(true);
                    const data = await catalogService.getEthnicNationalities(formData.id_etnia);
                    setNacionalidadesEtnicas(data || []);
                } catch (error) {
                    console.error("Error cargando nacionalidades étnicas:", error);
                } finally {
                    setCargandoNacionalidades(false);
                }
            } else {
                setNacionalidadesEtnicas([]);
                setPueblosEtnicos([]);
            }
        };
        
        manejarCambioEtnia();
    }, [formData.id_etnia, catalogos?.etnias]);

    // Vigilancia de Nacionalidad (Nivel 2)
    useEffect(() => {
        const manejarCambioNacionalidad = async () => {
            if (!formData.id_nacionalidad_etnica) {
                setPueblosEtnicos([]);
                return;
            }

            try {
                setCargandoPueblos(true);
                const data = await catalogService.getEthnicTowns(formData.id_nacionalidad_etnica);
                setPueblosEtnicos(data || []);
            } catch (error) {
                console.error("Error cargando pueblos étnicos:", error);
            } finally {
                setCargandoPueblos(false);
            }
        };
        
        manejarCambioNacionalidad();
    }, [formData.id_nacionalidad_etnica]);

    // Reseteo jerárquico por cambios en Etnia
    useEffect(() => {
        if (prevEtniaRef.current !== formData.id_etnia) {
            setFormData(prev => ({
                ...prev,
                id_nacionalidad_etnica: '',
                id_pueblo: ''
            }));
            prevEtniaRef.current = formData.id_etnia;
        }
    }, [formData.id_etnia, setFormData]);

    // Reseteo jerárquico por cambios en Nacionalidad Étnica
    useEffect(() => {
        if (prevNacEtnicaRef.current !== formData.id_nacionalidad_etnica) {
            setFormData(prev => ({
                ...prev,
                id_pueblo: ''
            }));
            prevNacEtnicaRef.current = formData.id_nacionalidad_etnica;
        }
    }, [formData.id_nacionalidad_etnica, setFormData]);

    // 3. LÓGICA DE DERIVACIÓN (FUERA DE HOOKS)
    const tipoSeleccionado = catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion);
    const esNoIdentificado = tipoSeleccionado?.nombre?.toUpperCase()?.includes('NO IDENTIFICADO');
    const habilitadoParaNN = formHabilitado || esNoIdentificado;

    const etnias = catalogos?.etnias || [];
    const nivelesEducacion = catalogos?.nivelesEducacion || [];
    const estadosInstruccion = catalogos?.estadosInstruccion || [];
    const segurosSalud = catalogos?.segurosSalud || [];
    const tiposEmpresa = catalogos?.tiposEmpresa || [];
    const tiposDiscapacidad = catalogos?.tiposDiscapacidad || [];
    const ocupaciones = catalogos?.ocupaciones || [];
    const cat_bonos = catalogos?.bonos || [];

    // 4. FUNCIONES DE APOYO
    const validarPorcentaje = (valor) => {
        const num = parseInt(valor, 10);
        if (num > 0 && num < 30) {
            setModalConfig({
                show: true,
                type: 'warning',
                title: 'VALIDACIÓN DE DISCAPACIDAD',
                message: 'NORMATIVA LEGAL: REGISTRO DESDE EL 30%',
                onClose: () => {
                    setFormData(prev => ({ ...prev, porcentaje_discapacidad: '' }));
                    setModalConfig(p => ({ ...p, show: false }));
                }
            });
        }
    };

    // Estilos
    const inputClasses = "w-full rounded border-gray-400 bg-white text-[11px] py-1 px-1.5 focus:border-blue-600 focus:outline-none font-medium h-7 border-2 shadow-sm transition-colors disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed";
    const labelClasses = "block text-[10px] font-bold text-gray-600 mb-0.5 uppercase truncate";
    const requiredStar = <span className="text-yellow-500 font-bold">*</span>;

    return (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
            <h3 className="text-xs font-extrabold text-blue-900 border-b-2 border-yellow-400 pb-1 mb-3 uppercase tracking-tight">
                4. Datos Adicionales y de Inclusión
            </h3>
            
            <div className="grid grid-cols-6 gap-x-2 gap-y-2">
                {/* --- TRIDENTE ÉTNICO --- */}
                <div className="col-span-2">
                    <label className={labelClasses}>
                        Autoidentificación {requiredStar}
                    </label>
                    <select
                        tabIndex="401"
                        name="id_etnia"
                        value={formData.id_etnia || ''}
                        onChange={handleChange}
                        disabled={!habilitadoParaNN}
                        className={inputClasses}
                        required
                    >
                        <option value="">SELECCIONE ETNIA</option>
                        {etnias.map(e => <option key={e.id} value={e.id}>{e.nombre.toUpperCase()}</option>)}
                    </select>
                </div>

                <div className="col-span-2">
                    <label className={labelClasses}>Nacionalidad Étnica</label>
                    <select
                        tabIndex="401-1"
                        name="id_nacionalidad_etnica"
                        value={formData.id_nacionalidad_etnica || ''}
                        onChange={(e) => {
                            handleChange(e);
                            setFormData(prev => ({ ...prev, id_pueblo: '' }));
                        }}
                        disabled={
                            !habilitadoParaNN ||
                            !formData.id_etnia ||
                            cargandoNacionalidades ||
                            (["MESTIZO", "MESTIZO/A", "BLANCO", "BLANCO/A"].some(e => (etnias.find(et => Number(et.id) === Number(formData.id_etnia))?.nombre || '').toUpperCase().includes(e)))
                        }
                        className={`${inputClasses} ${cargandoNacionalidades ? 'animate-pulse' : ''}`}
                    >
                        <option value="">
                            {cargandoNacionalidades
                                ? "Cargando..."
                                : !formData.id_etnia
                                    ? "Seleccione Etnia primero"
                                    : (["MESTIZO", "MESTIZO/A", "BLANCO", "BLANCO/A"].some(e => (etnias.find(et => Number(et.id) === Number(formData.id_etnia))?.nombre || '').toUpperCase().includes(e))
                                        ? "No Aplica (N/A)"
                                        : (nacionalidadesEtnicas.length > 0 ? "Seleccione Nacionalidad" : "N/A"))}
                        </option>
                        {nacionalidadesEtnicas.map(n => <option key={n.id} value={n.id}>{n.nombre.toUpperCase()}</option>)}
                    </select>
                </div>

                <div className="col-span-2">
                    <label className={labelClasses}>Pueblo</label>
                    <select
                        tabIndex="401-2"
                        name="id_pueblo"
                        value={formData.id_pueblo || ''}
                        onChange={handleChange}
                        disabled={
                            !habilitadoParaNN ||
                            !formData.id_nacionalidad_etnica ||
                            cargandoPueblos ||
                            (["MESTIZO", "MESTIZO/A", "BLANCO", "BLANCO/A"].some(e => (etnias.find(et => Number(et.id) === Number(formData.id_etnia))?.nombre || '').toUpperCase().includes(e)))
                        }
                        className={`${inputClasses} ${cargandoPueblos ? 'animate-pulse' : ''}`}
                    >
                        <option value="">
                            {cargandoPueblos
                                ? "Cargando..."
                                : !formData.id_etnia
                                    ? "Seleccione Etnia primero"
                                    : (!formData.id_nacionalidad_etnica
                                        ? (["MESTIZO", "MESTIZO/A", "BLANCO", "BLANCO/A"].some(e => (etnias.find(et => Number(et.id) === Number(formData.id_etnia))?.nombre || '').toUpperCase().includes(e))
                                            ? "No Aplica (N/A)"
                                            : "Seleccione Nacionalidad primero")
                                        : (pueblosEtnicos.length > 0 ? "Seleccione Pueblo" : "N/A"))}
                        </option>
                        {pueblosEtnicos.map(p => <option key={p.id} value={p.id}>{p.nombre.toUpperCase()}</option>)}
                    </select>
                </div>

                {/* --- RENGLÓN 2: INSTRUCCIÓN Y OCUPACIÓN --- */}
                <div className="col-span-6 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                        <label className={labelClasses}>Nivel de Instrucción {requiredStar}</label>
                        <select
                            tabIndex="402"
                            name="id_instruccion"
                            value={formData.id_instruccion || ''}
                            onChange={handleChange}
                            disabled={!habilitadoParaNN}
                            className={inputClasses}
                            required
                        >
                            <option value="">SELECCIONE NIVEL</option>
                            {nivelesEducacion.map(n => <option key={n.id} value={n.id}>{n.nombre.toUpperCase()}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className={labelClasses}>Estado de Instrucción {requiredStar}</label>
                        <select
                            tabIndex="402-1"
                            name="id_estado_instruccion"
                            value={formData.id_estado_instruccion || ''}
                            onChange={handleChange}
                            disabled={!habilitadoParaNN}
                            className={inputClasses}
                            required
                        >
                            <option value="">SELECCIONE ESTADO</option>
                            {estadosInstruccion.map(e => <option key={e.id} value={e.id}>{e.nombre.toUpperCase()}</option>)}
                        </select>
                    </div>
                    
                    <div>
                        <label className={labelClasses}>Ocupación (CIUO) {requiredStar}</label>
                        <select
                            tabIndex="403"
                            name="id_ocupacion"
                            value={formData.id_ocupacion || ''}
                            onChange={handleChange}
                            disabled={!habilitadoParaNN}
                            className={inputClasses}
                            required
                        >
                            <option value="">SELECCIONE OCUPACIÓN</option>
                            {ocupaciones.map(o => <option key={o.id} value={o.id}>{o.nombre.toUpperCase()}</option>)}
                        </select>
                    </div>
                </div>

                {/* --- RENGLÓN 3: SEGURO, EMPRESA Y BONO (GRID 3 COLUMNAS FIJO) --- */}
                <div className="col-span-6 grid grid-cols-3 gap-2">
                    <div>
                        <label className={labelClasses}>SEGURO DE SALUD {requiredStar}</label>
                        <select
                            tabIndex="404"
                            name="id_seguro_salud"
                            value={formData.id_seguro_salud || ''}
                            onChange={handleChange}
                            disabled={!habilitadoParaNN}
                            className={inputClasses}
                            required
                        >
                            <option value="">SELECCIONE SEGURO</option>
                            {segurosSalud.map(s => <option key={s.id} value={s.id}>{s.nombre.toUpperCase()}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className={labelClasses}>TIPO DE EMPRESA</label>
                        <select
                            tabIndex="405"
                            name="id_tipo_empresa"
                            value={formData.id_tipo_empresa || ''}
                            onChange={handleChange}
                            disabled={!habilitadoParaNN}
                            className={inputClasses}
                        >
                            <option value="">SELECCIONE TIPO DE EMPRESA</option>
                            {tiposEmpresa.map(t => (
                                <option key={t.id} value={t.id}>
                                    {t.nombre.toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClasses}>BONO DEL ESTADO</label>
                        <select
                            tabIndex="406"
                            name="id_bono"
                            value={formData.id_bono || ''}
                            onChange={handleChange}
                            disabled={!habilitadoParaNN}
                            className={inputClasses}
                        >
                            <option value="">SELECCIONE BONO</option>
                            {cat_bonos.map(b => (
                                <option key={b.id} value={b.id}>{b.nombre.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* --- RENGLÓN 4: DISCAPACIDAD (GRID 3 COLUMNAS FIJO) --- */}
                <div className="col-span-6 grid grid-cols-3 gap-2">
                    <div>
                        <label className={`${labelClasses} text-blue-900 font-black`}>
                            ¿PRESENTA DISCAPACIDAD? {requiredStar}
                        </label>
                        <select
                            tabIndex="407"
                            name="tiene_discapacidad"
                            value={formData.tiene_discapacidad || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                handleChange(e);
                                if (val === 'NO') {
                                    setFormData(prev => ({
                                        ...prev,
                                        id_tipo_discapacidad: '',
                                        porcentaje_discapacidad: ''
                                    }));
                                }
                            }}
                            disabled={!habilitadoParaNN}
                            className={inputClasses}
                            required
                        >
                            <option value="">SELECCIONE</option>
                            <option value="SI">SI</option>
                            <option value="NO">NO</option>
                        </select>
                    </div>

                    <div className="min-h-[45px]">
                        {formData.tiene_discapacidad === 'SI' && (
                            <>
                                <label className={labelClasses}>TIPO DE DISCAPACIDAD {requiredStar}</label>
                                <select
                                    tabIndex="408"
                                    name="id_tipo_discapacidad"
                                    value={formData.id_tipo_discapacidad || ''}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    required={formData.tiene_discapacidad === 'SI'}
                                >
                                    <option value="">SELECCIONE TIPO</option>
                                    {tiposDiscapacidad.map(t => (
                                        <option key={t.id} value={t.id}>{t.nombre.toUpperCase()}</option>
                                    ))}
                                </select>
                            </>
                        )}
                    </div>

                    <div className="min-h-[45px]">
                        {formData.tiene_discapacidad === 'SI' && (
                            <>
                                <label className={labelClasses}>PORCENTAJE (%) {requiredStar}</label>
                                <input
                                    tabIndex="409"
                                    type="number"
                                    name="porcentaje_discapacidad"
                                    value={formData.porcentaje_discapacidad || ''}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value, 10);
                                        if (isNaN(val) || (val >= 0 && val <= 100)) {
                                            handleChange(e);
                                        }
                                    }}
                                    onBlur={(e) => validarPorcentaje(e.target.value)}
                                    className={inputClasses}
                                    min="30" max="100"
                                    required={formData.tiene_discapacidad === 'SI'}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeccionDatosAdicionales;

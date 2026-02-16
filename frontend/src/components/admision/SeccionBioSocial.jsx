import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Briefcase, HeartPulse, Building2, Accessibility } from 'lucide-react';
import catalogService from '../../api/catalogService';

const SeccionBioSocial = ({ formData, handleChange, catalogos, formHabilitado, setFormData, setModalConfig }) => {
    const [nacionalidadesEtnicas, setNacionalidadesEtnicas] = useState([]);
    const [pueblosEtnicos, setPueblosEtnicos] = useState([]);
    

    const etniaSeleccionada = catalogos.etnias?.find(e => String(e.id) === String(formData.id_etnia));
    const nombreEtnia = etniaSeleccionada?.nombre?.trim().toUpperCase();
    
    const aplicaCascadaEtnica = nombreEtnia === 'INDÍGENA' || nombreEtnia === 'MONTUBIO';

    const cargarNacionalidades = useCallback(async (etniaId) => {
        try {
            const data = await catalogService.getEthnicNationalities(etniaId);
            setNacionalidadesEtnicas(data || []);
        } catch (error) {
            console.error("Error al cargar nacionalidades étnicas:", error);
            setNacionalidadesEtnicas([]);
        }
    }, []);

    const cargarPueblos = useCallback(async (nacionalidadId) => {
        try {
            const data = await catalogService.getEthnicTowns(nacionalidadId);
            setPueblosEtnicos(data || []);
        } catch (error) {
            console.error("Error al cargar pueblos étnicos:", error);
            setPueblosEtnicos([]);
        }
    }, []);

    useEffect(() => {
        if (aplicaCascadaEtnica && formData.id_etnia) {
            cargarNacionalidades(formData.id_etnia);
        } else {
            setNacionalidadesEtnicas([]);
            if (formData.id_nacionalidad_etnica) {
                handleChange({ target: { name: 'id_nacionalidad_etnica', value: null, type: 'text' } });
            }
            if (formData.id_pueblo) {
                handleChange({ target: { name: 'id_pueblo', value: null, type: 'text' } });
            }
        }
    }, [formData.id_etnia, aplicaCascadaEtnica, cargarNacionalidades]);

    useEffect(() => {
        if (formData.id_nacionalidad_etnica) {
            cargarPueblos(formData.id_nacionalidad_etnica);
        } else {
            setPueblosEtnicos([]);
            if (formData.id_pueblo) {
                handleChange({ target: { name: 'id_pueblo', value: null, type: 'text' } });
            }
        }
    }, [formData.id_nacionalidad_etnica, cargarPueblos]);


    const inputClasses = "w-full rounded border-gray-400 bg-white text-[11px] py-1 px-1.5 focus:border-blue-600 focus:outline-none font-medium h-8 border-2 shadow-sm transition-colors uppercase";
    const labelClasses = "block text-[10px] font-bold text-gray-600 mb-0.5 uppercase truncate";
    const containerClasses = "bg-white p-3 rounded-lg border border-gray-200 shadow-sm space-y-4";

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center space-x-2 border-b-2 border-blue-900 pb-2 mb-4">
                <Briefcase className="w-5 h-5 text-blue-900" />
                <h3 className="text-sm font-black text-blue-900 uppercase tracking-tighter">
                    4. DATOS ADICIONALES (SOCIO-ECONÓMICOS)
                </h3>
            </div>
            
            <div className={containerClasses}>
                {/* Renglón 1: Autoidentificación */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <label className={labelClasses}>AUTOIDENTIFICACIÓN <span className="text-red-500">*</span></label>
                        <select
                            name="id_etnia"
                            value={formData.id_etnia || ''}
                            onChange={handleChange}
                            disabled={!formHabilitado}
                            className={inputClasses}
                            required
                        >
                            <option value="">SELECCIONE</option>
                            {catalogos.etnias?.map(e => (
                                <option key={e.id} value={e.id}>{e.nombre.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-1">
                        <label className={labelClasses}>NACIONALIDAD ÉTNICA</label>
                        <select
                            name="id_nacionalidad_etnica"
                            value={formData.id_nacionalidad_etnica || ''}
                            onChange={handleChange}
                            disabled={!aplicaCascadaEtnica || !formHabilitado}
                            className={`${inputClasses} ${!aplicaCascadaEtnica ? 'bg-gray-100 italic text-gray-500' : ''}`}
                        >
                            <option value="">{aplicaCascadaEtnica ? 'SELECCIONE' : 'NO APLICA'}</option>
                            {nacionalidadesEtnicas.map(n => (
                                <option key={n.id} value={n.id}>{n.nombre.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-1">
                        <label className={labelClasses}>PUEBLO / CENTRO</label>
                        <select
                            name="id_pueblo"
                            value={formData.id_pueblo || ''}
                            onChange={handleChange}
                            disabled={!aplicaCascadaEtnica || !formData.id_nacionalidad_etnica || !formHabilitado}
                            className={`${inputClasses} ${!aplicaCascadaEtnica ? 'bg-gray-100 italic text-gray-500' : ''}`}
                        >
                            <option value="">{aplicaCascadaEtnica ? 'SELECCIONE' : 'NO APLICA'}</option>
                            {pueblosEtnicos.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Renglón 2: Instrucción y Ocupación */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <label className={labelClasses}>INSTRUCCIÓN <span className="text-red-500">*</span></label>
                        <select
                            name="id_instruccion"
                            value={formData.id_instruccion || ''}
                            onChange={handleChange}
                            disabled={!formHabilitado}
                            className={inputClasses}
                            required
                        >
                            <option value="">SELECCIONE</option>
                            {catalogos.nivelesEducacion?.map(n => (
                                <option key={n.id} value={n.id}>{n.nombre.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label className={labelClasses}>ESTADO <span className="text-red-500">*</span></label>
                        <select
                            name="id_estado_instruccion"
                            value={formData.id_estado_instruccion || ''}
                            onChange={handleChange}
                            disabled={!formHabilitado}
                            className={inputClasses}
                            required
                        >
                            <option value="">SELECCIONE</option>
                            {catalogos.estadosInstruccion?.map(n => (
                                <option key={n.id} value={n.id}>{n.nombre.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-1">
                        <label className={labelClasses}>OCUPACIÓN (CIUO) <span className="text-red-500">*</span></label>
                        <select
                            name="id_ocupacion"
                            value={formData.id_ocupacion || ''}
                            onChange={(e) => {
                                const selectedId = e.target.value;
                                const ocu = catalogos.ocupaciones?.find(o => String(o.id) === String(selectedId));
                                setFormData(prev => ({
                                    ...prev,
                                    id_ocupacion: selectedId,
                                    ocupacion_nombre: ocu ? ocu.nombre.toUpperCase() : ''
                                }));
                            }}
                            disabled={!formHabilitado}
                            className={inputClasses}
                            required
                        >
                            <option value="">SELECCIONE</option>
                            {catalogos.ocupaciones?.map(o => (
                                <option key={o.id} value={o.id}>{o.nombre.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Renglón 3: SIMETRÍA TOTAL (Seguro, Empresa, Discapacidad) */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col">
                        <label className={labelClasses}>SEGURO DE SALUD <span className="text-red-500">*</span></label>
                        <select
                            name="id_seguro_salud"
                            value={formData.id_seguro_salud || ''}
                            onChange={handleChange}
                            disabled={!formHabilitado}
                            className={inputClasses}
                            required
                        >
                            <option value="">SELECCIONE</option>
                            {catalogos.segurosSalud?.map(s => (
                                <option key={s.id} value={s.id}>{s.nombre.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className={labelClasses}>TIPO DE EMPRESA <span className="text-red-500">*</span></label>
                        <select
                            name="tipo_empresa"
                            value={formData.tipo_empresa || ''}
                            onChange={handleChange}
                            disabled={!formHabilitado}
                            className={inputClasses}
                            required
                        >
                            <option value="">SELECCIONE</option>
                            {catalogos.tiposEmpresa?.map(t => (
                                <option key={t.id} value={t.nombre.toUpperCase()}>{t.nombre.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className={labelClasses}>¿PRESENTA DISCAPACIDAD? <span className="text-red-500">*</span></label>
                        <select
                            name="tiene_discapacidad"
                            value={formData.tiene_discapacidad || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'NO') {
                                    setFormData(prev => ({
                                        ...prev,
                                        tiene_discapacidad: 'NO',
                                        id_tipo_discapacidad: '',
                                        porcentaje_discapacidad: ''
                                    }));
                                } else if (val === 'SI') {
                                    setFormData(prev => ({
                                        ...prev,
                                        tiene_discapacidad: 'SI'
                                    }));
                                } else {
                                    handleChange(e);
                                }
                            }}
                            disabled={!formHabilitado}
                            className={`${inputClasses} ${formData.tiene_discapacidad === 'SI' ? 'border-yellow-500 bg-yellow-50' : ''}`}
                            required
                        >
                            <option value="">SELECCIONE</option>
                            <option value="SI">SÍ</option>
                            <option value="NO">NO</option>
                        </select>
                    </div>
                </div>

                {/* Renglón Condicional: Detalles de Discapacidad */}
                {formData.tiene_discapacidad === 'SI' && (
                    <div className="grid grid-cols-3 gap-4 p-3 bg-yellow-50 rounded border-2 border-yellow-200 animate-in slide-in-from-top-2 duration-300">
                        <div>
                            <label className={labelClasses}>TIPO DE DISCAPACIDAD <span className="text-red-500">*</span></label>
                            <select
                                name="id_tipo_discapacidad"
                                value={formData.id_tipo_discapacidad || ''}
                                onChange={handleChange}
                                className={inputClasses}
                                required
                            >
                                <option value="">SELECCIONE</option>
                                {catalogos.tiposDiscapacidad?.map(t => (
                                    <option key={t.id} value={t.id}>{t.nombre.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>PORCENTAJE (%) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                name="porcentaje_discapacidad"
                                value={formData.porcentaje_discapacidad || ''}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    handleChange(e);
                                }}
                                className={inputClasses}
                                min="30" max="100"
                                required
                                onBlur={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    if (val > 0 && val < 30) {
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
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeccionBioSocial;

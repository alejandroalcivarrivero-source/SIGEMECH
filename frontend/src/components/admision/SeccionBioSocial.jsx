import React, { useState, useEffect } from 'react';
import catalogService from '../../api/catalogService';

const SeccionBioSocial = ({ formData, handleChange, catalogos, formHabilitado }) => {
    const [nacionalidadesEtnicas, setNacionalidadesEtnicas] = useState([]);
    const [pueblosEtnicos, setPueblosEtnicos] = useState([]);

    const idIndigena = catalogos.etnias?.find(e => e.nombre?.trim().toUpperCase() === 'INDÍGENA')?.id || 1;
    const idKichwa = nacionalidadesEtnicas?.find(n => n.nombre?.trim().toUpperCase() === 'KICHWA')?.id;

    useEffect(() => {
        const cargarNacionalidadesEtnicas = async () => {
            if (formData.id_etnia == idIndigena) {
                try {
                    const data = await catalogService.getEthnicNationalities(formData.id_etnia);
                    setNacionalidadesEtnicas(data);
                } catch (error) {
                    console.error("Error al cargar nacionalidades étnicas:", error);
                    setNacionalidadesEtnicas([]);
                }
            } else {
                setNacionalidadesEtnicas([]);
                if (formData.id_nacionalidad_etnica || formData.id_pueblo) {
                    handleChange({ target: { name: 'id_nacionalidad_etnica', value: '' } });
                    handleChange({ target: { name: 'id_pueblo', value: '' } });
                }
            }
        };
        cargarNacionalidadesEtnicas();
    }, [formData.id_etnia, idIndigena]);

    useEffect(() => {
        const cargarPueblosEtnicos = async () => {
            if (formData.id_nacionalidad_etnica && formData.id_nacionalidad_etnica == idKichwa) {
                try {
                    const data = await catalogService.getEthnicGroups(formData.id_nacionalidad_etnica);
                    setPueblosEtnicos(data);
                } catch (error) {
                    console.error("Error al cargar pueblos étnicos:", error);
                    setPueblosEtnicos([]);
                }
            } else {
                setPueblosEtnicos([]);
                if (formData.id_pueblo) {
                    handleChange({ target: { name: 'id_pueblo', value: '' } });
                }
            }
        };
        cargarPueblosEtnicos();
    }, [formData.id_nacionalidad_etnica, idKichwa]);

    const inputClasses = "w-full rounded border-gray-400 bg-white text-[11px] py-1 px-1.5 focus:border-blue-600 focus:outline-none font-medium h-7 border-2 shadow-sm transition-colors";
    const labelClasses = "block text-[10px] font-bold text-gray-600 mb-0.5 uppercase truncate";

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-blue-900 border-b border-blue-200 pb-0.5 mb-2 uppercase tracking-tight">
                4. Datos Adicionales (Socio-Económicos)
            </h3>
            
            <div className="grid grid-cols-4 gap-x-2 gap-y-2">
                <div className="col-span-1">
                    <label className={labelClasses}>
                        Autoidentificación <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="id_etnia"
                        value={formData.id_etnia || ''}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        className={inputClasses}
                        required
                    >
                        <option value="">Seleccione</option>
                        {catalogos.etnias?.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                    </select>
                </div>

                <div className="col-span-1">
                    <label className={labelClasses}>
                        Nacionalidad Étnica
                    </label>
                    <select
                        name="id_nacionalidad_etnica"
                        value={formData.id_nacionalidad_etnica || ''}
                        onChange={handleChange}
                        disabled={formData.id_etnia != idIndigena || !formHabilitado}
                        className={inputClasses}
                    >
                        <option value="">Seleccione</option>
                        {nacionalidadesEtnicas.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
                    </select>
                </div>

                <div className="col-span-2">
                    <label className={labelClasses}>
                        Pueblo / Centro
                    </label>
                    <select
                        name="id_pueblo"
                        value={formData.id_pueblo || ''}
                        onChange={handleChange}
                        disabled={formData.id_nacionalidad_etnica != idKichwa || !formHabilitado}
                        className={inputClasses}
                    >
                        <option value="">Seleccione</option>
                        {pueblosEtnicos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                </div>

                <div className="col-span-2">
                    <label className={labelClasses}>
                        Nivel de Educación <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="id_instruccion"
                        value={formData.id_instruccion}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        className={inputClasses}
                        required
                    >
                        <option value="">Seleccione</option>
                        {catalogos.nivelesEducacion.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
                    </select>
                </div>

                <div className="col-span-2">
                    <label className={labelClasses}>
                        Ocupación (CIUO) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="ocupacion"
                        value={formData.ocupacion}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        placeholder="Buscar ocupación..."
                        className={inputClasses}
                        required
                    />
                </div>

                <div className="col-span-2">
                    <label className={labelClasses}>
                        Seguro Salud <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="id_seguro_salud"
                        value={formData.id_seguro_salud}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        className={inputClasses}
                        required
                    >
                        <option value="">Seleccione</option>
                        {catalogos.segurosSalud.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                </div>

                <div className="col-span-2">
                    <label className={labelClasses}>Tipo de Empresa</label>
                    <input
                        type="text"
                        name="tipo_empresa"
                        value={formData.tipo_empresa || ''}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        className={inputClasses}
                        placeholder="Pública, Privada, etc."
                    />
                </div>

                <div className="col-span-4 p-2 bg-slate-50 rounded border border-slate-200">
                    <div className="flex items-center mb-2">
                        <input
                            type="checkbox"
                            name="tiene_discapacidad"
                            id="tiene_discapacidad"
                            checked={formData.tiene_discapacidad}
                            onChange={handleChange}
                            disabled={!formHabilitado}
                            className="w-3.5 h-3.5 rounded border-gray-400 text-blue-600 focus:ring-blue-500 border-2"
                        />
                        <label htmlFor="tiene_discapacidad" className="ml-2 text-[10px] font-bold text-gray-700 uppercase">
                            ¿Tiene Discapacidad?
                        </label>
                    </div>
                    
                    {formData.tiene_discapacidad && (
                        <div className="grid grid-cols-3 gap-2 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className={labelClasses}>Tipo</label>
                                <select
                                    name="tipo_discapacidad"
                                    value={formData.tipo_discapacidad}
                                    onChange={handleChange}
                                    className={inputClasses}
                                >
                                    <option value="">Seleccione</option>
                                    <option value="FISICA">Física</option>
                                    <option value="INTELECTUAL">Intelectual</option>
                                    <option value="AUDITIVA">Auditiva</option>
                                    <option value="VISUAL">Visual</option>
                                    <option value="PSICOSOCIAL">Psicosocial</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>%</label>
                                <input
                                    type="number"
                                    name="porcentaje_discapacidad"
                                    value={formData.porcentaje_discapacidad}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    min="0" max="100"
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Nro. Carnet</label>
                                <input
                                    type="text"
                                    name="carnet_discapacidad"
                                    value={formData.carnet_discapacidad}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SeccionBioSocial;

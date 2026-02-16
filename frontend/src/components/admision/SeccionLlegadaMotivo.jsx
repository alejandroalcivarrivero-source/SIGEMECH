import React, { useEffect, useMemo } from 'react';

const SeccionLlegadaMotivo = ({ formData, handleChange, catalogos, formHabilitado, soloLlegada = false, soloMotivo = false, setFormData }) => {
    const tipoSeleccionado = catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion);
    const esNoIdentificado = tipoSeleccionado?.nombre?.toUpperCase()?.includes('NO IDENTIFICADO');
    const habilitadoParaNN = formHabilitado || esNoIdentificado;

    const inputClasses = "w-full rounded border-gray-400 bg-white text-[11px] py-1 px-1.5 focus:border-blue-600 focus:outline-none font-medium h-7 border-2 shadow-sm transition-colors";
    const labelClasses = "block text-[10px] font-bold text-gray-700 mb-0.5 uppercase truncate";
    const selectClasses = "w-full rounded border-blue-800 bg-white text-[11px] py-1 px-1.5 focus:ring-2 focus:ring-yellow-400 focus:outline-none font-bold h-7 border-2 shadow-sm transition-colors text-blue-900";

    // Lógica de herencia y protocolo
    useEffect(() => {
        if (!formData.id_forma_llegada) return;

        const formaLlegada = catalogos.formasLlegada?.find(f => f.id == formData.id_forma_llegada);
        if (!formaLlegada) return;

        const nombreForma = formaLlegada.nombre.toUpperCase();

        if (nombreForma === 'AMBULATORIO') {
            // fuente_informacion = "DIRECTA"
            const fuenteDirecta = catalogos.fuentesInformacion?.find(f => f.nombre.toUpperCase() === 'DIRECTA');
            
            const personaCalculada = `${formData.primer_apellido || ''} ${formData.primer_nombre || ''}`.trim().toUpperCase();
            const telefonoCalculado = formData.celular || formData.telefono || '';
            const idFuente = fuenteDirecta ? fuenteDirecta.id : formData.id_fuente_informacion;

            if (formData.id_fuente_informacion !== idFuente ||
                formData.persona_entrega !== personaCalculada ||
                formData.telefono_entrega !== telefonoCalculado) {
                
                setFormData(prev => ({
                    ...prev,
                    id_fuente_informacion: idFuente,
                    persona_entrega: personaCalculada,
                    telefono_entrega: telefonoCalculado
                }));
            }
        } else if (nombreForma.includes('AMBULANCIA') || nombreForma === 'OTRO') {
            const fuenteIndirecta = catalogos.fuentesInformacion?.find(f => f.nombre.toUpperCase() === 'INDIRECTA');
            
            // Solo limpiar si no es AMBULATORIO (para evitar bucles o sobreescritura incorrecta)
            setFormData(prev => {
                if (prev.id_fuente_informacion === (fuenteIndirecta?.id || prev.id_fuente_informacion) &&
                    prev.persona_entrega === '' && prev.telefono_entrega === '') return prev;

                return {
                    ...prev,
                    id_fuente_informacion: fuenteIndirecta ? fuenteIndirecta.id : prev.id_fuente_informacion,
                    persona_entrega: '',
                    telefono_entrega: ''
                };
            });
        }
    }, [formData.id_forma_llegada, catalogos.fuentesInformacion, catalogos.formasLlegada, setFormData, formData.primer_apellido, formData.primer_nombre, formData.celular, formData.telefono]);

    const nombreFormaActual = catalogos.formasLlegada?.find(f => f.id == formData.id_forma_llegada)?.nombre?.toUpperCase() || '';
    const esAmbulatorio = nombreFormaActual === 'AMBULATORIO';
    const esAmbulancia = nombreFormaActual.includes('AMBULANCIA');
    const esReferido = nombreFormaActual === 'REFERIDO' || nombreFormaActual.includes('REFERENCIA');

    // Filtrado dinámico de establecimientos por capacidad técnica
    const establecimientosFiltrados = useMemo(() => {
        let lista = catalogos.establecimientos || [];
        if (esAmbulancia) {
            // Filtrar solo los que tienen ambulancia (tiene_ambulancia === 1)
            return lista.filter(e => e.tiene_ambulancia === 1);
        }
        return lista;
    }, [catalogos.establecimientos, esAmbulancia]);

    const handleInputChangeUpperCase = (e) => {
        const { name, value } = e.target;
        handleChange({
            target: {
                name,
                value: value.toUpperCase()
            }
        });
    };

    return (
        <>
        <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-blue-900 border-b border-blue-200 pb-0.5 mb-2 uppercase tracking-tight">
                {soloLlegada ? '6. FORMA Y CONDICIÓN DE LLEGADA' : soloMotivo ? '7. MOTIVO DE CONSULTA Y DESTINO' : '6/7. LOGÍSTICA Y MOTIVO'}
            </h3>
            
            <div className="space-y-4">
                {soloLlegada && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* RENGLÓN 1: [FORMA DE LLEGADA] [FUENTE DE INFORMACIÓN] [ESTABLECIMIENTO DE ORIGEN] */}
                        <div className="col-span-1">
                            <label className={labelClasses}>FORMA DE LLEGADA <span className="text-red-500">*</span></label>
                            <select
                                tabIndex="601"
                                name="id_forma_llegada"
                                value={formData.id_forma_llegada}
                                onChange={handleChange}
                                disabled={!habilitadoParaNN}
                                className={selectClasses}
                                required
                            >
                                <option value="">SELECCIONE</option>
                                {catalogos.formasLlegada.map(f => <option key={f.id} value={f.id}>{f.nombre.toUpperCase()}</option>)}
                            </select>
                        </div>

                        <div className="col-span-1">
                            <label className={labelClasses}>FUENTE DE INFORMACIÓN <span className="text-red-500">*</span></label>
                            <select
                                tabIndex="602"
                                name="id_fuente_informacion"
                                value={formData.id_fuente_informacion}
                                onChange={handleChange}
                                disabled={!habilitadoParaNN || esAmbulatorio}
                                className={`${selectClasses} ${esAmbulatorio ? 'bg-gray-200 cursor-not-allowed opacity-80' : ''}`}
                                required
                            >
                                <option value="">SELECCIONE</option>
                                {catalogos.fuentesInformacion.map(f => <option key={f.id} value={f.id}>{f.nombre.toUpperCase()}</option>)}
                            </select>
                        </div>

                        <div className="col-span-1">
                            <div className="flex justify-between items-center mb-0.5">
                                <label className={labelClasses}>ESTABLECIMIENTO DE ORIGEN {esReferido && <span className="text-red-500">*</span>}</label>
                                {esReferido && formData.id_establecimiento_origen && (
                                    (() => {
                                        const est = catalogos.establecimientos?.find(e => e.id == formData.id_establecimiento_origen);
                                        const nivel = est?.nivel_complejidad || est?.nivel;
                                        if (!nivel) return null;
                                        return (
                                            <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                                                Nivel {nivel}
                                            </span>
                                        );
                                    })()
                                )}
                            </div>
                            <select
                                tabIndex="603"
                                name="id_establecimiento_origen"
                                value={formData.id_establecimiento_origen || ''}
                                onChange={handleChange}
                                disabled={!habilitadoParaNN}
                                className={selectClasses}
                                required={esReferido}
                            >
                                <option value="">SELECCIONE ESTABLECIMIENTO</option>
                                {establecimientosFiltrados.map(e => (
                                    <option key={e.id} value={e.id}>
                                        {e.nombre.toUpperCase()} {e.tiene_ambulancia === 1 ? '🚑' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* RENGLÓN 2: [INSTITUCIÓN O PERSONA QUE ENTREGA] [N° TELÉFONO DEL ENTREGADOR] [CONDICIÓN DE LLEGADA] */}
                        <div className="col-span-1">
                            <label className={labelClasses}>INSTITUCIÓN O PERSONA QUE ENTREGA <span className="text-red-500">*</span></label>
                            <input
                                tabIndex="604"
                                type="text"
                                name="persona_entrega"
                                value={formData.persona_entrega || ''}
                                onChange={handleInputChangeUpperCase}
                                disabled={!habilitadoParaNN || esAmbulatorio}
                                placeholder="NOMBRE COMPLETO"
                                className={`${inputClasses} uppercase ${esAmbulatorio ? 'bg-gray-200 cursor-not-allowed opacity-80' : ''}`}
                                required
                            />
                        </div>

                        <div className="col-span-1">
                            <label className={labelClasses}>N° TELÉFONO DEL ENTREGADOR <span className="text-red-500">*</span></label>
                            <input
                                tabIndex="605"
                                type="text"
                                name="telefono_entrega"
                                value={formData.telefono_entrega || ''}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    handleChange({ target: { name: 'telefono_entrega', value } });
                                }}
                                disabled={!habilitadoParaNN || esAmbulatorio}
                                placeholder="SOLO NÚMEROS"
                                maxLength="10"
                                className={`${inputClasses} ${esAmbulatorio ? 'bg-gray-200 cursor-not-allowed opacity-80' : ''}`}
                                required
                            />
                        </div>

                        <div className="col-span-1">
                            <label className={labelClasses}>CONDICIÓN DE LLEGADA <span className="text-red-500">*</span></label>
                            <select
                                tabIndex="606"
                                name="id_condicion_llegada"
                                value={formData.id_condicion_llegada}
                                onChange={handleChange}
                                disabled={!habilitadoParaNN}
                                className={selectClasses}
                                required
                            >
                                <option value="">SELECCIONE</option>
                                {catalogos.condicionesLlegada.map(c => <option key={c.id} value={c.id}>{c.nombre.toUpperCase()}</option>)}
                            </select>
                        </div>

                        {/* RENGLÓN 3: [ACOMPAÑANTE] [PARENTESCO] [TELÉFONO ACOMPAÑANTE] */}
                        <div className="col-span-1">
                            <label className={labelClasses}>Acompañante</label>
                            <input
                                tabIndex="607"
                                type="text"
                                name="acompanante_nombre"
                                value={formData.acompanante_nombre || ''}
                                onChange={handleInputChangeUpperCase}
                                disabled={!habilitadoParaNN}
                                placeholder="NOMBRE DEL ACOMPAÑANTE"
                                className={`${inputClasses} uppercase`}
                            />
                        </div>

                        <div className="col-span-1">
                            <label className={labelClasses}>Parentesco</label>
                            <input
                                tabIndex="608"
                                type="text"
                                name="acompanante_parentesco"
                                value={formData.acompanante_parentesco || ''}
                                onChange={handleInputChangeUpperCase}
                                disabled={!habilitadoParaNN}
                                placeholder="PARENTESCO"
                                className={`${inputClasses} uppercase`}
                            />
                        </div>

                        <div className="col-span-1">
                            <label className={labelClasses}>Teléfono Acompañante</label>
                            <input
                                tabIndex="609"
                                type="text"
                                name="acompanante_telefono"
                                value={formData.acompanante_telefono || ''}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    handleChange({ target: { name: 'acompanante_telefono', value } });
                                }}
                                disabled={!habilitadoParaNN}
                                placeholder="SOLO NÚMEROS"
                                maxLength="10"
                                className={inputClasses}
                            />
                        </div>
                    </div>
                )}

                {soloMotivo && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="col-span-1 md:col-span-3">
                            <label className={labelClasses}>
                                MOTIVO PRINCIPAL <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                tabIndex="701"
                                name="motivo_detalle"
                                value={formData.motivo_detalle || ''}
                                onChange={handleInputChangeUpperCase}
                                disabled={!habilitadoParaNN}
                                rows="3"
                                placeholder="DESCRIBA EL SÍNTOMA PRINCIPAL..."
                                className="w-full rounded border-gray-400 bg-white text-[11px] py-1 px-1.5 focus:border-blue-600 focus:outline-none font-medium border-2 shadow-sm transition-colors uppercase"
                                required
                            ></textarea>
                        </div>

                        <div className="col-span-1 md:col-span-3 mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                            <label className="block text-[10px] font-black text-blue-900 mb-2 uppercase text-center">
                                DESTINO INICIAL <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'EMERGENCIA', label: 'EMERGENCIA', color: 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100' },
                                    { id: 'TRIAGE', label: 'TRIAGE', color: 'bg-yellow-50 text-yellow-700 border-yellow-100 hover:bg-yellow-100' },
                                    { id: 'CONSULTA', label: 'CONSULTA', color: 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' }
                                ].map(destino => (
                                    <label
                                        key={destino.id}
                                        className={`flex items-center justify-center p-2 rounded border cursor-pointer transition-all ${
                                            formData.motivo_consulta === destino.id
                                            ? 'border-blue-600 bg-blue-600 text-white'
                                            : destino.color
                                        }`}
                                    >
                                        <input
                                            tabIndex="702"
                                            type="radio"
                                            name="motivo_consulta"
                                            value={destino.id}
                                            checked={formData.motivo_consulta === destino.id}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <span className="text-[10px] font-black tracking-tighter">{destino.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </>
    );
};

export default SeccionLlegadaMotivo;

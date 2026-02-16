import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Info } from 'lucide-react';
import ModalFeedback from '../ModalFeedback';

const SeccionLlegadaMotivo = ({ formData, handleChange, catalogos, formHabilitado, soloLlegada = false, soloMotivo = false, setFormData }) => {
    const inputPersonaEntregaRef = useRef(null);
    const [showFuenteWarning, setShowFuenteWarning] = useState(false);
    const tipoSeleccionado = catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion);
    const esNoIdentificado = tipoSeleccionado?.nombre?.toUpperCase()?.includes('NO IDENTIFICADO');
    const habilitadoParaNN = formHabilitado || esNoIdentificado;

    const inputClasses = "w-full rounded border-gray-400 bg-white text-[11px] py-1 px-1.5 focus:border-blue-600 focus:outline-none font-medium h-7 border-2 shadow-sm transition-colors";
    const labelClasses = "block text-[10px] font-bold text-gray-700 mb-0.5 uppercase truncate";
    const selectClasses = "w-full rounded border-blue-800 bg-white text-[11px] py-1 px-1.5 focus:ring-2 focus:ring-yellow-400 focus:outline-none font-bold h-7 border-2 shadow-sm transition-colors text-blue-900";

    // TAREA: Limpieza Reactiva y Autollenado
    useEffect(() => {
        // TAREA: Limpieza Reactiva y Reset Total al cambiar forma de llegada
        const formaLlegadaObj = catalogos.formasLlegada?.find(f => f.id == formData.id_forma_llegada);
        const nombreForma = formaLlegadaObj?.nombre?.toUpperCase() || '';

        // Reset base para garantizar datos limpios en la pestaña
        // Se incluye id_condicion_llegada: '' para forzar el estado 'SELECCIONE'
        const resetCampos = {
            persona_entrega: '',
            telefono_entrega: '',
            id_establecimiento_origen: '',
            id_fuente_informacion: '',
            id_entidad_traslada: '',
            unidad_transporte: '',
            id_condicion_llegada: '',
            medio_transporte_referencia: nombreForma.includes('REFER') ? formData.medio_transporte_referencia : ''
        };

        // Si cambia la forma_llegada, siempre limpiamos la condición de llegada
        if (formData.id_forma_llegada) {
            if (nombreForma === 'AMBULATORIO') {
                const personaCalculada = `${formData.primer_apellido || ''} ${formData.segundo_apellido || ''} ${formData.primer_nombre || ''} ${formData.segundo_nombre || ''}`.replace(/\s+/g, ' ').trim().toUpperCase();
                const telefonoCalculado = formData.telefono || formData.telefono_fijo || '';
                const fuenteDirecta = catalogos.fuentesInformacion?.find(f => f.nombre.toUpperCase() === 'DIRECTA');

                setFormData(prev => ({
                    ...prev,
                    ...resetCampos,
                    persona_entrega: personaCalculada,
                    telefono_entrega: telefonoCalculado,
                    id_fuente_informacion: fuenteDirecta ? fuenteDirecta.id : prev.id_fuente_informacion,
                    id_establecimiento_origen: null
                }));
            } else if (nombreForma.includes('AMBULANCIA')) {
                const fuenteIndirecta = catalogos.fuentesInformacion?.find(f => f.nombre.toUpperCase() === 'INDIRECTA');
                setFormData(prev => ({
                    ...prev,
                    ...resetCampos,
                    id_fuente_informacion: fuenteIndirecta ? fuenteIndirecta.id : prev.id_fuente_informacion,
                    id_establecimiento_origen: null // LÓGICA AMBULANCIA: Origen null
                }));
            } else if (nombreForma.includes('REFERENCIA') || nombreForma.includes('REFERIDO')) {
                const fuenteIndirecta = catalogos.fuentesInformacion?.find(f => f.nombre.toUpperCase() === 'INDIRECTA');
                setFormData(prev => ({
                    ...prev,
                    ...resetCampos,
                    id_fuente_informacion: fuenteIndirecta ? fuenteIndirecta.id : prev.id_fuente_informacion
                }));
            } else {
                setFormData(prev => ({ ...prev, ...resetCampos }));
            }
        } else {
            setFormData(prev => ({ ...prev, ...resetCampos }));
        }

    }, [formData.id_forma_llegada]);

    const nombreFormaActual = catalogos.formasLlegada?.find(f => f.id == formData.id_forma_llegada)?.nombre?.toUpperCase() || '';
    const esAmbulatorio = nombreFormaActual === 'AMBULATORIO';
    const esAmbulancia = nombreFormaActual.includes('AMBULANCIA');
    const esReferido = nombreFormaActual === 'REFERIDO' || nombreFormaActual.includes('REFERENCIA');

    // Filtrado y ordenamiento dinámico de establecimientos
    const establecimientosFiltrados = useMemo(() => {
        let lista = [...(catalogos.establecimientos || [])];
        
        if (esAmbulatorio) {
            return []; // El selector estará deshabilitado
        }

        if (esReferido) {
            // 1. Filtrar solo establecimientos PÚBLICOS para REFERENCIA y EXCLUIR prefijos SOC- y PRI-
            lista = lista.filter(e => {
                const esPublico = e.tipo_gestion?.toUpperCase() === 'PÚBLICO';
                const codigo = e.codigo_unico?.toUpperCase() || '';
                const esExcluido = codigo.startsWith('SOC-') || codigo.startsWith('PRI-');
                return esPublico && !esExcluido;
            });

            // 2. Ordenamiento jerárquico
            lista.sort((a, b) => {
                const cantonPrioritario = 1303; // CHONE
                
                // Prioridad 1: id_canton === 1303 AND id_nivel === 1
                const p1a = (a.id_canton == cantonPrioritario && (a.id_nivel == 1 || a.nivel == 1));
                const p1b = (b.id_canton == cantonPrioritario && (b.id_nivel == 1 || b.nivel == 1));
                if (p1a && !p1b) return -1;
                if (!p1a && p1b) return 1;

                // Prioridad 2: id_canton === 1303 AND id_nivel === 2
                const p2a = (a.id_canton == cantonPrioritario && (a.id_nivel == 2 || a.nivel == 2));
                const p2b = (b.id_canton == cantonPrioritario && (b.id_nivel == 2 || b.nivel == 2));
                if (p2a && !p2b) return -1;
                if (!p2a && p2b) return 1;

                // Prioridad 3: Resto de la red pública por nivel de complejidad (id_nivel)
                const nivelA = parseInt(a.id_nivel || a.nivel || 99);
                const nivelB = parseInt(b.id_nivel || b.nivel || 99);
                if (nivelA !== nivelB) return nivelA - nivelB;

                return a.nombre.localeCompare(b.nombre);
            });
        }

        return lista;
    }, [catalogos.establecimientos, esReferido, esAmbulatorio]);

    // Filtrado y ordenamiento de ENTIDAD QUE TRASLADA (Doble Catálogo)
    const entidadesTrasladoFiltradas = useMemo(() => {
        let lista = (catalogos.establecimientos || []).filter(e => e.tiene_ambulancia == 1);
        
        lista.sort((a, b) => {
            const cantonPrioritario = 1303; // CHONE (Socorro Local)
            const isAPrioritario = a.id_canton == cantonPrioritario;
            const isBPrioritario = b.id_canton == cantonPrioritario;
            
            if (isAPrioritario && !isBPrioritario) return -1;
            if (!isAPrioritario && isBPrioritario) return 1;
            
            return a.nombre.localeCompare(b.nombre);
        });

        return lista;
    }, [catalogos.establecimientos]);

    const handleInputChangeUpperCase = (e) => {
        const { name, value } = e.target;
        handleChange({
            target: {
                name,
                value: value.toUpperCase()
            }
        });
    };

    const handleTransporteReferencia = (tipo) => {
        const value = tipo.toUpperCase();
        setFormData(prev => ({ ...prev, medio_transporte_referencia: value }));
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
                            {/* MENSAJES DE AYUDA (HELPTEXT) SIGEMECH */}
                            {esAmbulancia && (
                                <p className="mt-1 text-[9px] font-bold text-[#003366] flex items-center gap-1 uppercase">
                                    <Info size={10} className="text-[#FFD700]" />
                                    SISTEMA MOSTRARÁ SOLO UNIDADES CON AMBULANCIA ACTIVA
                                </p>
                            )}
                            {esReferido && (
                                <div className="mt-1 space-y-1">
                                    {formData.medio_transporte_referencia === 'PARTICULAR/TAXI' ? (
                                        <p className="text-[9px] font-bold text-[#003366] flex items-start gap-1 uppercase leading-tight">
                                            <Info size={10} className="text-[#FFD700] mt-0.5 flex-shrink-0" />
                                            <span>⚠️ PACIENTE LLEGA CON HOJA DE REFERENCIA PERO POR SUS PROPIOS MEDIOS. ASEGÚRESE DE PORTAR EL FORMULARIO DE ORIGINAL</span>
                                        </p>
                                    ) : (
                                        <p className="text-[9px] font-bold text-[#003366] flex items-center gap-1 uppercase">
                                            <Info size={10} className="text-[#FFD700]" />
                                            SISTEMA MOSTRARÁ SOLO RED PÚBLICA (NIVEL 1 Y 2)
                                        </p>
                                    )}
                                </div>
                            )}
                            {esAmbulatorio && (
                                <p className="mt-1 text-[9px] font-bold text-[#003366] flex items-center gap-1 uppercase">
                                    <Info size={10} className="text-[#FFD700]" />
                                    ORIGEN DESHABILITADO POR ARRIBO VOLUNTARIO
                                </p>
                            )}
                            {esAmbulancia && (
                                <p className="mt-1 text-[9px] font-bold text-[#003366] flex items-center gap-1 uppercase">
                                    <Info size={10} className="text-[#FFD700]" />
                                    <span className="text-blue-900">⚠️ ORIGEN DESHABILITADO PARA EMERGENCIAS PREHOSPITALARIAS</span>
                                </p>
                            )}
                        </div>

                        {esReferido && (
                            <div className="col-span-1 md:col-span-3 bg-blue-50 p-2 rounded border border-blue-200">
                                <label className="block text-[10px] font-black text-[#003366] mb-2 uppercase">
                                    MEDIO DE TRANSPORTE DE LA REFERENCIA
                                </label>
                                <div className="flex gap-2">
                                    {['AMBULANCIA', 'PARTICULAR/TAXI'].map((tipo) => (
                                        <button
                                            key={tipo}
                                            type="button"
                                            onClick={() => handleTransporteReferencia(tipo)}
                                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border-2 ${
                                                formData.medio_transporte_referencia === tipo
                                                    ? 'bg-[#003366] text-white border-[#003366]'
                                                    : 'bg-white text-[#003366] border-[#003366] hover:bg-blue-100'
                                            } uppercase`}
                                        >
                                            {tipo}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="col-span-1">
                            <label className={labelClasses}>FUENTE DE INFORMACIÓN <span className="text-red-500">*</span></label>
                            <select
                                tabIndex="602"
                                name="id_fuente_informacion"
                                value={formData.id_fuente_informacion}
                                onChange={(e) => {
                                    if (esReferido) {
                                        setShowFuenteWarning(true);
                                    } else {
                                        handleChange(e);
                                    }
                                }}
                                disabled={!habilitadoParaNN || !formData.id_forma_llegada || esAmbulatorio || esAmbulancia || esReferido}
                                className={`${selectClasses} ${(!formData.id_forma_llegada || esAmbulatorio || esAmbulancia || esReferido) ? 'bg-gray-200 cursor-not-allowed opacity-80' : ''}`}
                                required
                            >
                                <option value="">SELECCIONE</option>
                                {catalogos.fuentesInformacion.map(f => <option key={f.id} value={f.id}>{f.nombre.toUpperCase()}</option>)}
                            </select>
                        </div>

                        <div className="col-span-1">
                            <div className="flex justify-between items-center mb-0.5">
                                <label className={labelClasses}>ESTABLECIMIENTO QUE REFIERE {esReferido && <span className="text-red-500">*</span>}</label>
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
                                value={(esAmbulatorio || esAmbulancia) ? 'NO APLICA' : (formData.id_establecimiento_origen || '')}
                                onChange={handleChange}
                                disabled={!habilitadoParaNN || !formData.id_forma_llegada || esAmbulatorio || esAmbulancia}
                                className={`${selectClasses} ${(!formData.id_forma_llegada || esAmbulatorio || esAmbulancia) ? 'bg-gray-200 cursor-not-allowed opacity-80' : ''}`}
                                placeholder="BUSQUE EL HOSPITAL O CENTRO DE SALUD"
                                required={esReferido}
                            >
                                {(esAmbulatorio || esAmbulancia) ? (
                                    <option value="NO APLICA">NO APLICA</option>
                                ) : (
                                    <>
                                        <option value="">SELECCIONE ESTABLECIMIENTO</option>
                                        {establecimientosFiltrados.map(e => (
                                            <option key={e.id} value={e.id}>
                                                {`${e.codigo_unico || 'S/C'} - ${e.nombre}`.toUpperCase()} {e.tiene_ambulancia === 1 ? '🚑' : ''}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                        </div>

                        {/* NUEVO CAMPO: ENTIDAD QUE TRASLADA (Doble Catálogo) */}
                        {(esAmbulancia || (esReferido && formData.medio_transporte_referencia === 'AMBULANCIA')) && (
                            <>
                                <div className="col-span-1">
                                    <label className={labelClasses}>ENTIDAD QUE TRASLADA <span className="text-red-500">*</span></label>
                                    <select
                                        tabIndex="604"
                                        name="id_entidad_traslada"
                                        value={formData.id_entidad_traslada || ''}
                                        onChange={handleChange}
                                        disabled={!habilitadoParaNN}
                                        className={selectClasses}
                                        required
                                    >
                                        <option value="">SELECCIONE ENTIDAD</option>
                                        {entidadesTrasladoFiltradas.map(e => (
                                            <option key={e.id} value={e.id}>
                                                {`${e.nombre}`.toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-span-1">
                                    <label className={labelClasses}>CÓDIGO/PLACA DE UNIDAD <span className="text-red-500">*</span></label>
                                    <input
                                        tabIndex="604b"
                                        type="text"
                                        name="unidad_transporte"
                                        value={formData.unidad_transporte || ''}
                                        onChange={handleInputChangeUpperCase}
                                        disabled={!habilitadoParaNN || !formData.id_entidad_traslada}
                                        placeholder="EJ: ALFA-1"
                                        className={`${inputClasses} uppercase ${!formData.id_entidad_traslada ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                        required
                                    />
                                </div>
                            </>
                        )}

                        {/* RENGLÓN 2: [INSTITUCIÓN O PERSONA QUE ENTREGA] [N° TELÉFONO DEL ENTREGADOR] [CONDICIÓN DE LLEGADA] */}
                        <div className="col-span-1">
                            <label className={labelClasses}>INSTITUCIÓN O PERSONA QUE ENTREGA <span className="text-red-500">*</span></label>
                            <input
                                ref={inputPersonaEntregaRef}
                                tabIndex="605"
                                type="text"
                                name="persona_entrega"
                                value={formData.persona_entrega || ''}
                                onChange={handleInputChangeUpperCase}
                                disabled={!habilitadoParaNN || !formData.id_forma_llegada || esAmbulatorio ||
                                    (esReferido && (!formData.id_establecimiento_origen || (formData.medio_transporte_referencia === 'AMBULANCIA' && !formData.id_entidad_traslada))) ||
                                    (esAmbulancia && !formData.id_entidad_traslada)
                                }
                                placeholder="NOMBRE COMPLETO"
                                className={`${inputClasses} uppercase ${(esAmbulatorio) ? 'bg-gray-200 cursor-not-allowed opacity-80' : ''}`}
                                required
                            />
                        </div>

                        <div className="col-span-1">
                            <label className={labelClasses}>N° TELÉFONO DEL ENTREGADOR <span className="text-red-500">*</span></label>
                            <input
                                tabIndex="606"
                                type="text"
                                name="telefono_entrega"
                                value={formData.telefono_entrega || ''}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    handleChange({ target: { name: 'telefono_entrega', value } });
                                }}
                                disabled={!habilitadoParaNN || !formData.id_forma_llegada || esAmbulatorio}
                                placeholder="SOLO NÚMEROS"
                                maxLength="10"
                                className={`${inputClasses} ${(!formData.id_forma_llegada || esAmbulatorio) ? 'bg-gray-200 cursor-not-allowed opacity-80' : ''}`}
                                required
                            />
                        </div>

                        <div className="col-span-1">
                            <label className={labelClasses}>CONDICIÓN DE LLEGADA <span className="text-red-500">*</span></label>
                            <select
                                tabIndex="607"
                                name="id_condicion_llegada"
                                value={formData.id_condicion_llegada}
                                onChange={handleChange}
                                disabled={!habilitadoParaNN || !formData.id_forma_llegada}
                                className={`${selectClasses} ${!formData.id_forma_llegada ? 'bg-gray-200 cursor-not-allowed opacity-80' : ''}`}
                                required
                            >
                                <option value="">SELECCIONE</option>
                                {catalogos.condicionesLlegada.map(c => <option key={c.id} value={c.id}>{c.nombre.toUpperCase()}</option>)}
                            </select>
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
        {showFuenteWarning && (
            <ModalFeedback
                type="advertencia"
                title="RESTRICCIÓN DE NORMATIVA"
                message="LA FUENTE SE SETEA COMO INDIRECTA POR NORMATIVA DE REFERENCIAS"
                onClose={() => setShowFuenteWarning(false)}
            />
        )}
        </>
    );
};

export default SeccionLlegadaMotivo;

import React, { useState, useEffect } from 'react';
import { getPaises } from '../../api/catalogService';

const SeccionResidencia = ({
    formData,
    handleChange,
    catalogos,
    cantonesFiltrados,
    parroquiasFiltradas,
    formHabilitado,
    setFormData
}) => {
    const [paises, setPaises] = useState([]);
    
    // Asumimos ID 1 para Ecuador, pero lo validamos con el nombre si es posible
    const idEc = catalogos.paises?.find(p => p.nombre?.toUpperCase().includes('ECUADOR'))?.id || 1;
    const esEcuador = Number(formData.pais_id) === idEc;

    useEffect(() => {
        const cargarPaises = async () => {
            try {
                const paisesData = await getPaises();
                setPaises(paisesData);
            } catch (error) {
                console.error("Error al cargar países:", error);
            }
        };
        if (catalogos.paises) {
            setPaises(catalogos.paises);
        } else {
            cargarPaises();
        }
    }, [catalogos.paises]);

    useEffect(() => {
        if (formData.pais_id && !esEcuador) {
            // Solo resetear si los campos tienen valor para evitar bucles
            if (formData.provinciaResidencia || formData.cantonResidencia || formData.id_parroquia) {
                // Usar setImmediate o setTimeout para evitar error de renderizado
                const timer = setTimeout(() => {
                    setFormData(prev => ({
                        ...prev,
                        provinciaResidencia: '',
                        cantonResidencia: '',
                        id_parroquia: ''
                    }));
                }, 0);
                return () => clearTimeout(timer);
            }
        }
    }, [esEcuador, formData.pais_id, setFormData, formData.provinciaResidencia, formData.cantonResidencia, formData.id_parroquia]);

    const inputClasses = "w-full rounded border-gray-400 bg-white text-[11px] py-1 px-1.5 focus:border-blue-600 focus:outline-none font-medium h-7 border-2 shadow-sm transition-colors disabled:bg-gray-100";
    const labelClasses = "block text-[10px] font-bold text-gray-600 mb-0.5 uppercase truncate";

    const tipoSeleccionado = catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_identificacion);
    const esNoIdentificado = tipoSeleccionado?.nombre?.toUpperCase()?.includes('NO IDENTIFICADO');
    const habilitadoParaNN = formHabilitado || esNoIdentificado;

    return (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
            <h3 className="text-xs font-extrabold text-blue-900 border-b-2 border-yellow-400 pb-1 mb-3 uppercase tracking-tight">
                3. Residencia Habitual
            </h3>
            
            <div className="grid grid-cols-4 gap-x-2 gap-y-2">
                {/* --- CAMPO: PAÍS --- */}
                <div className="col-span-1">
                    <label className={labelClasses}>
                        País <span className="text-yellow-500 font-bold">*</span>
                    </label>
                    <select
                        tabIndex="301"
                        name="pais_id"
                        value={formData.pais_id || ''}
                        onChange={handleChange}
                        disabled={!habilitadoParaNN}
                        className={inputClasses}
                        required
                    >
                        <option value="">Seleccione país</option>
                        {paises.length > 0 ? (
                            paises.map(pais => (
                                <option key={pais.id} value={pais.id}>{pais.nombre}</option>
                            ))
                        ) : (
                            <option value="1">Ecuador</option>
                        )}
                    </select>
                </div>

                {/* --- CAMPO: PROVINCIA --- */}
                <div className="col-span-1">
                    <label className={labelClasses}>
                        Provincia {esEcuador && <span className="text-yellow-500 font-bold">*</span>}
                    </label>
                    <select
                        tabIndex="302"
                        name="provinciaResidencia"
                        value={formData.provinciaResidencia || ''}
                        onChange={handleChange}
                        disabled={!habilitadoParaNN || !esEcuador}
                        className={inputClasses}
                        required={esEcuador}
                    >
                        <option value="">Seleccione</option>
                        {(catalogos.provincias || []).map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                </div>

                {/* --- CAMPO: CANTÓN --- */}
                <div className="col-span-1">
                    <label className={labelClasses}>
                        Cantón {esEcuador && <span className="text-yellow-500 font-bold">*</span>}
                    </label>
                    <select
                        tabIndex="303"
                        name="cantonResidencia"
                        value={formData.cantonResidencia || ''}
                        onChange={handleChange}
                        disabled={!habilitadoParaNN || !formData.provinciaResidencia || !esEcuador}
                        className={inputClasses}
                        required={esEcuador}
                    >
                        <option value="">Seleccione</option>
                        {(cantonesFiltrados || []).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                </div>

                {/* --- CAMPO: PARROQUIA --- */}
                <div className="col-span-1">
                    <label className={labelClasses}>
                        Parroquia {esEcuador && <span className="text-yellow-500 font-bold">*</span>}
                    </label>
                    <select
                        tabIndex="304"
                        name="id_parroquia"
                        value={formData.id_parroquia || ''}
                        onChange={handleChange}
                        disabled={!habilitadoParaNN || !formData.cantonResidencia || !esEcuador}
                        className={inputClasses}
                        required={esEcuador}
                    >
                        <option value="">Seleccione</option>
                        {(parroquiasFiltradas || []).map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                </div>

                {/* --- CAMPO: CALLE PRINCIPAL --- */}
                <div className="col-span-2">
                    <label className={labelClasses}>
                        Calle Principal {esEcuador && <span className="text-yellow-500 font-bold">*</span>}
                    </label>
                    <input
                        type="text"
                        tabIndex="305"
                        name="callePrincipal"
                        value={formData.callePrincipal || ''}
                        onChange={handleChange}
                        disabled={!habilitadoParaNN}
                        placeholder="Vía principal"
                        className={inputClasses}
                        required={esEcuador}
                    />
                </div>

                {/* --- CAMPO: NÚMERO --- */}
                <div className="col-span-1">
                    <label className={labelClasses}>Número</label>
                    <input
                        type="text"
                        tabIndex="306"
                        name="numeroCasa"
                        value={formData.numeroCasa || ''}
                        onChange={handleChange}
                        disabled={!habilitadoParaNN}
                        placeholder="Ej: S/N"
                        className={inputClasses}
                    />
                </div>

                {/* --- CAMPO: CALLE SECUNDARIA --- */}
                <div className="col-span-1">
                    <label className={labelClasses}>Calle Sec.</label>
                    <input
                        type="text"
                        tabIndex="307"
                        name="calleSecundaria"
                        value={formData.calleSecundaria || ''}
                        onChange={handleChange}
                        disabled={!habilitadoParaNN}
                        placeholder="Transversal"
                        className={inputClasses}
                    />
                </div>

                {/* --- CAMPO: BARRIO --- */}
                <div className="col-span-1">
                    <label className={labelClasses}>
                        Barrio {esEcuador && <span className="text-yellow-500 font-bold">*</span>}
                    </label>
                    <input
                        type="text"
                        tabIndex="308"
                        name="barrio"
                        value={formData.barrio || ''}
                        onChange={handleChange}
                        disabled={!habilitadoParaNN}
                        placeholder="Sector"
                        className={inputClasses}
                        required={esEcuador}
                    />
                </div>

                {/* --- CAMPO: REFERENCIA --- */}
                <div className="col-span-3">
                    <label className={labelClasses}>
                        Referencia {esEcuador && <span className="text-yellow-500 font-bold">*</span>}
                    </label>
                    <input
                        type="text"
                        tabIndex="309"
                        name="referencia_domicilio"
                        value={formData.referencia_domicilio || ''}
                        onChange={handleChange}
                        disabled={!habilitadoParaNN}
                        className={inputClasses}
                        placeholder="Color de casa, hitos cercanos..."
                        required={esEcuador}
                    />
                </div>
            </div>
        </div>
    );
};

/**
 * Lógica de Blindaje de Nacionalidad (Extranjeros) y Estabilidad de Renderizado
 * Trasladada a un subcomponente o manejada aquí para asegurar que no haya
 * actualizaciones durante el renderizado.
 */
export default SeccionResidencia;

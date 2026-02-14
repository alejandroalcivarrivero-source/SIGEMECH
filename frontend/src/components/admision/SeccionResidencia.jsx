import React, { useState, useEffect } from 'react';
import { getPaises } from '../../api/catalogService';

const SeccionResidencia = ({
    formData,
    paciente,
    handleChange,
    catalogos,
    cantonesFiltrados,
    parroquiasFiltradas,
    formHabilitado,
    setFormData
}) => {
    if (!paciente) {
        return <div>Cargando datos del paciente...</div>;
    }
    const [paises, setPaises] = useState([]);
    const esEcuador = paciente?.pais_id === 1;

    useEffect(() => {
        const cargarPaises = async () => {
            try {
                const paisesData = await getPaises();
                setPaises(paisesData);
            } catch (error) {
                console.error("Error al cargar países:", error);
            }
        };
        cargarPaises();
    }, []);

    useEffect(() => {
        if (!esEcuador) {
            setFormData(prev => ({
                ...prev,
                provincia_id: '',
                canton_id: '',
                parroquia_id: ''
            }));
        }
    }, [esEcuador, setFormData]);

    const inputClasses = "w-full rounded border-gray-400 bg-white text-[11px] py-1 px-1.5 focus:border-blue-600 focus:outline-none font-medium h-7 border-2 shadow-sm transition-colors";
    const labelClasses = "block text-[10px] font-bold text-gray-600 mb-0.5 uppercase truncate";

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-blue-900 border-b border-blue-200 pb-0.5 mb-2 uppercase tracking-tight">
                3. Residencia Habitual
            </h3>
            
            <div className="grid grid-cols-4 gap-x-2 gap-y-2">
                <div className="col-span-1">
                    <label className={labelClasses}>
                        País <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="pais_id"
                        value={formData.pais_id}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        className={inputClasses}
                        required
                    >
                        <option value="">Seleccione un país</option>
                        {paises.map(pais => (
                            <option key={pais.id} value={pais.id}>{pais.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className="col-span-1">
                    <label className={labelClasses}>
                        Provincia {esEcuador && <span className="text-red-500">*</span>}
                    </label>
                    <select
                        name="provincia_id"
                        value={formData.provincia_id}
                        onChange={handleChange}
                        disabled={!formHabilitado || !esEcuador}
                        className={inputClasses}
                        required={esEcuador}
                    >
                        <option value="">Seleccione</option>
                        {catalogos.provincias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                </div>

                <div className="col-span-1">
                    <label className={labelClasses}>
                        Cantón {esEcuador && <span className="text-red-500">*</span>}
                    </label>
                    <select
                        name="canton_id"
                        value={formData.canton_id}
                        onChange={handleChange}
                        disabled={!formHabilitado || !paciente.provincia_id || !esEcuador}
                        className={inputClasses}
                        required={esEcuador}
                    >
                        <option value="">Seleccione</option>
                        {cantonesFiltrados.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                </div>

                <div className="col-span-1">
                    <label className={labelClasses}>
                        Parroquia {esEcuador && <span className="text-red-500">*</span>}
                    </label>
                    <select
                        name="parroquia_id"
                        value={formData.parroquia_id}
                        onChange={handleChange}
                        disabled={!formHabilitado || !paciente.canton_id || !esEcuador}
                        className={inputClasses}
                        required={esEcuador}
                    >
                        <option value="">Seleccione</option>
                        {parroquiasFiltradas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                </div>

                <div className="col-span-2">
                    <label className={labelClasses}>
                        Calle Principal {esEcuador && <span className="text-red-500">*</span>}
                    </label>
                    <input
                        type="text"
                        name="callePrincipal"
                        value={formData.callePrincipal}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        placeholder="Vía principal"
                        className={inputClasses}
                        required={esEcuador}
                    />
                </div>

                <div className="col-span-1">
                    <label className={labelClasses}>Número</label>
                    <input
                        type="text"
                        name="numeroCasa"
                        value={formData.numeroCasa}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        placeholder="Ej: S/N"
                        className={inputClasses}
                    />
                </div>

                <div className="col-span-1">
                    <label className={labelClasses}>Calle Sec.</label>
                    <input
                        type="text"
                        name="calleSecundaria"
                        value={formData.calleSecundaria}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        placeholder="Transversal"
                        className={inputClasses}
                    />
                </div>

                <div className="col-span-1">
                    <label className={labelClasses}>
                        Barrio {esEcuador && <span className="text-red-500">*</span>}
                    </label>
                    <input
                        type="text"
                        name="barrio"
                        value={formData.barrio}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        placeholder="Sector"
                        className={inputClasses}
                        required={esEcuador}
                    />
                </div>

                <div className="col-span-3">
                    <label className={labelClasses}>
                        Referencia {esEcuador && <span className="text-red-500">*</span>}
                    </label>
                    <input
                        type="text"
                        name="referencia_domicilio"
                        value={formData.referencia_domicilio}
                        onChange={handleChange}
                        disabled={!formHabilitado}
                        className={inputClasses}
                        placeholder="Color de casa, hitos cercanos..."
                        required={esEcuador}
                    />
                </div>
            </div>
        </div>
    );
};

export default SeccionResidencia;

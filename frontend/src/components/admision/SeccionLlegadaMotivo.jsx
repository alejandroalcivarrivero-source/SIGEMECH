import React from 'react';

const SeccionLlegadaMotivo = ({ formData, handleChange, catalogos, formHabilitado, soloLlegada = false, soloMotivo = false }) => {
    const inputClasses = "w-full rounded border-gray-400 bg-white text-[11px] py-1 px-1.5 focus:border-blue-600 focus:outline-none font-medium h-7 border-2 shadow-sm transition-colors";
    const labelClasses = "block text-[10px] font-bold text-gray-700 mb-0.5 uppercase truncate";

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-blue-900 border-b border-blue-200 pb-0.5 mb-2 uppercase tracking-tight">
                {soloLlegada ? '6. Modalidad de Arribo' : soloMotivo ? '7. Motivo de Atención' : '6/7. Logística y Motivo'}
            </h3>
            
            <div className="grid grid-cols-4 gap-x-2 gap-y-2">
                {soloLlegada && (
                    <>
                        <div className="col-span-1">
                            <label className={labelClasses}>Fecha Ingreso <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                name="fecha_ingreso"
                                value={formData.fecha_ingreso || ''}
                                onChange={handleChange}
                                disabled={!formHabilitado}
                                className={inputClasses}
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className={labelClasses}>Establ. Origen {formData.id_modalidad_arribo && catalogos.formasLlegada.find(f => f.id === formData.id_modalidad_arribo)?.nombre === 'Referido' && <span className="text-red-500">*</span>}</label>
                            <input
                                type="text"
                                name="establecimiento_origen"
                                value={formData.establecimiento_origen || ''}
                                onChange={handleChange}
                                disabled={!formHabilitado}
                                placeholder="Especifique si es referido"
                                className={`${inputClasses} uppercase`}
                            />
                        </div>

                        <div className="col-span-1">
                            <label className={labelClasses}>Acompañante</label>
                            <input
                                type="text"
                                name="persona_entrega"
                                value={formData.persona_entrega || ''}
                                onChange={handleChange}
                                disabled={!formHabilitado}
                                placeholder="Nombre"
                                className={`${inputClasses} uppercase`}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className={labelClasses}>
                                Fuente Info. <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="id_fuente_informacion"
                                value={formData.id_fuente_informacion}
                                onChange={handleChange}
                                disabled={!formHabilitado}
                                className={inputClasses}
                                required
                            >
                                <option value="">Seleccione</option>
                                {catalogos.fuentesInformacion.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                            </select>
                        </div>

                        <div className="col-span-4 mt-1 p-2 bg-amber-50 rounded border border-amber-200 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[9px] font-black text-amber-900 mb-1 uppercase">
                                    Forma Llegada <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-1">
                                    {catalogos.formasLlegada.map(f => (
                                        <button
                                            key={f.id}
                                            type="button"
                                            onClick={() => handleChange({ target: { name: 'id_modalidad_arribo', value: f.id } })}
                                            className={`px-1 py-1 text-[9px] font-bold rounded border transition-all ${
                                                formData.id_modalidad_arribo === f.id
                                                ? 'bg-amber-600 border-amber-700 text-white'
                                                : 'bg-white border-amber-200 text-amber-800 hover:bg-amber-100'
                                            }`}
                                        >
                                            {f.nombre}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[9px] font-black text-amber-900 mb-1 uppercase">
                                    Condición <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-1">
                                    {catalogos.condicionesLlegada.map(c => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => handleChange({ target: { name: 'id_condicion_llegada', value: c.id } })}
                                            className={`px-1 py-1 text-[9px] font-bold rounded border transition-all ${
                                                formData.id_condicion_llegada === c.id
                                                ? 'bg-red-600 border-red-700 text-white'
                                                : 'bg-white border-red-100 text-red-800 hover:bg-red-50'
                                            }`}
                                        >
                                            {c.nombre}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {soloMotivo && (
                    <>
                        <div className="col-span-4">
                            <label className={labelClasses}>
                                Motivo Principal <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="motivo_detalle"
                                value={formData.motivo_detalle || ''}
                                onChange={handleChange}
                                disabled={!formHabilitado}
                                rows="3"
                                placeholder="Describa el síntoma principal..."
                                className="w-full rounded border-gray-400 bg-white text-[11px] py-1 px-1.5 focus:border-blue-600 focus:outline-none font-medium border-2 shadow-sm transition-colors"
                                required
                            ></textarea>
                        </div>

                        <div className="col-span-4 mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                            <label className="block text-[10px] font-black text-blue-900 mb-2 uppercase text-center">
                                Destino Inicial <span className="text-red-500">*</span>
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
                                            formData.descripcion_motivo_atencion === destino.id
                                            ? 'border-blue-600 bg-blue-600 text-white'
                                            : destino.color
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="descripcion_motivo_atencion"
                                            value={destino.id}
                                            checked={formData.descripcion_motivo_atencion === destino.id}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <span className="text-[10px] font-black tracking-tighter">{destino.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SeccionLlegadaMotivo;

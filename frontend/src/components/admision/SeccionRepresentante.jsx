import React, { useEffect, useState } from 'react';
import { validarCedulaEcuatoriana } from '../../utils/pacienteUtils';

const SeccionRepresentante = ({ formData, handleChange, catalogos, formHabilitado, esSubcomponente = false, edadInfo, manejarBusquedaMadre }) => {
    const [errorCedula, setErrorCedula] = useState('');

    const inputClasses = "w-full rounded border-gray-400 bg-white text-[11px] py-1 px-1.5 focus:border-blue-600 focus:outline-none font-medium h-7 border-2 shadow-sm transition-colors disabled:bg-gray-100";
    const labelClasses = "block text-[10px] font-bold text-gray-700 mb-0.5 uppercase truncate";

    const handleIdentificacionChange = (e) => {
        const { value } = e.target;
        handleChange(e);

        const tipoSeleccionado = catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_doc_representante);
        const esCedula = tipoSeleccionado?.nombre?.toUpperCase().includes('CÉDULA');

        if (esCedula && value.length === 10) {
            if (!validarCedulaEcuatoriana(value)) {
                setErrorCedula('Cédula inválida (Módulo 10)');
            } else {
                setErrorCedula('');
            }
        } else {
            setErrorCedula('');
        }
    };

    const handleBlurIdentificacion = (e) => {
        const { value } = e.target;
        const isNeonato = edadInfo?.isNeonato;
        
        const parentescoMadreId = catalogos.parentescos?.find(p => p.nombre?.toUpperCase() === 'MADRE')?.id;
        
        if (isNeonato && formData.id_parentesco_representante == parentescoMadreId && value && value.length >= 10 && manejarBusquedaMadre) {
            manejarBusquedaMadre(value);
        }
    };

    const esNoIdentificado = catalogos.tiposIdentificacion?.find(t => t.id == formData.id_tipo_doc_representante)?.nombre?.toUpperCase().includes('NO IDENTIFICADO');
    
    const isNeonato = edadInfo?.isNeonato;
    const parentescoMadreId = catalogos.parentescos?.find(p => p.nombre?.toUpperCase() === 'MADRE')?.id;
    const bloqueoMadre = isNeonato && formData.id_parentesco_representante == parentescoMadreId && formData.cedula_madre;

    // CANDADO DE REPRESENTANTE LEGAL:
    // REGLA: Si (edadDias < 28), el bloque de Representante Legal debe estar 'disabled'.
    // HABILITACIÓN: Solo se activa si 'id_lugar_parto' y 'hora_parto' tienen datos.
    // Si (edadDias >= 28 y < 2 años), el bloque se habilita normalmente.
    const edadDias = edadInfo?.horas / 24; // Usamos horas para precisión
    const esMenor28Dias = isNeonato; // Basado en la lógica de calculosCronologicos.js
    
    const tieneDatosParto = formData.datosNacimiento?.id_lugar_parto && formData.datosNacimiento?.hora_parto;
    
    const representanteBloqueado = esMenor28Dias ? !tieneDatosParto : false;

    return (
        <div className={`space-y-3 ${esSubcomponente ? 'mt-6 pt-4 border-t-2 border-dashed border-blue-200' : ''} ${representanteBloqueado ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
            <h3 className="text-xs font-extrabold text-blue-900 border-b border-blue-200 pb-0.5 mb-2 uppercase tracking-tight">
                Datos del Representante Legal
            </h3>
            
            <div className="grid grid-cols-4 gap-x-2 gap-y-2">
                <div className="col-span-1">
                    <label className={labelClasses}>Tipo ID <span className="text-red-500">*</span></label>
                    <select
                        name="id_tipo_doc_representante"
                        value={formData.id_tipo_doc_representante}
                        onChange={handleChange}
                        disabled={!formHabilitado || bloqueoMadre || representanteBloqueado}
                        className={inputClasses}
                        required
                    >
                        <option value="">Seleccione</option>
                        {catalogos.tiposIdentificacion.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                    </select>
                </div>

                <div className="col-span-1">
                    <label className={labelClasses}>
                        Identificación <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="documento_representante"
                        value={formData.documento_representante}
                        onChange={handleIdentificacionChange}
                        onBlur={handleBlurIdentificacion}
                        disabled={!formHabilitado || bloqueoMadre || representanteBloqueado}
                        maxLength={esNoIdentificado ? 17 : 10}
                        className={`${inputClasses} font-bold ${errorCedula ? 'border-red-500' : ''}`}
                        required
                    />
                    {errorCedula && <span className="text-[8px] text-red-600 font-bold">{errorCedula}</span>}
                </div>

                <div className="col-span-1">
                    <label className={labelClasses}>
                        Parentesco <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="id_parentesco_representante"
                        value={formData.id_parentesco_representante}
                        onChange={handleChange}
                        disabled={!formHabilitado || bloqueoMadre || representanteBloqueado}
                        className={inputClasses}
                        required
                    >
                        <option value="">Seleccione</option>
                        {catalogos.parentescos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                </div>

                <div className="col-span-1"></div>

                <div className="col-span-2">
                    <label className={labelClasses}>Nombre Completo <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="nombre_representante"
                        value={formData.nombre_representante || ''}
                        onChange={handleChange}
                        disabled={!formHabilitado || bloqueoMadre || representanteBloqueado}
                        className={`${inputClasses} uppercase font-bold`}
                        required
                    />
                </div>
                
                <div className="col-span-2">
                    <label className={labelClasses}>Dirección <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="direccion_representante"
                        value={formData.direccion_representante || ''}
                        onChange={handleChange}
                        disabled={!formHabilitado || representanteBloqueado}
                        className={`${inputClasses} uppercase`}
                        required
                    />
                </div>
            </div>
        </div>
    );
};

export default SeccionRepresentante;

/**
 * Reglas de Negocio para el Proceso de Admisión.
 * Especialista en Procesos Clínicos y QA Senior.
 */

/**
 * Valida que una fecha no sea posterior a la fecha y hora actual.
 * @param {string|Date} fecha - La fecha a validar.
 * @returns {boolean} True si la fecha es válida (pasada o presente).
 */
export const validarFechaNoFutura = (fecha) => {
    if (!fecha) return true; // Si no hay fecha, la validación de "requerido" se encarga en otro lugar
    const fechaSeleccionada = new Date(fecha);
    const ahora = new Date();
    return fechaSeleccionada <= ahora;
};

/**
 * Valida la consistencia de los campos de referencia según el tipo de arribo.
 * @param {string} tipoArribo - El tipo de arribo seleccionado.
 * @param {string} establecimientoOrigen - El establecimiento de origen ingresado.
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validarReferenciaArribo = (tipoArribo, establecimientoOrigen) => {
    if (tipoArribo === 'Referido') {
        if (!establecimientoOrigen || establecimientoOrigen.trim() === '') {
            return {
                isValid: false,
                message: 'Para pacientes con Tipo de Arribo "Referido", el campo "Establecimiento de Origen" es obligatorio.'
            };
        }
    }
    return { isValid: true, message: '' };
};

/**
 * Valida el conjunto de datos de admisión antes del envío.
 * @param {Object} datos - Objeto con los datos del formulario.
 * @returns {string[]} Lista de errores encontrados.
 */
export const validarAdmisionCompleta = (datos) => {
    const errores = [];

    // Validación de Fecha de Ingreso
    if (datos.fecha_ingreso && !validarFechaNoFutura(datos.fecha_ingreso)) {
        errores.push('La fecha de ingreso no puede ser una fecha futura.');
    }

    // Validación de Referencia
    const validacionRef = validarReferenciaArribo(datos.tipo_arribo, datos.establecimiento_origen);
    if (!validacionRef.isValid) {
        errores.push(validacionRef.message);
    }

    // Otras validaciones técnicas pueden ser añadidas aquí

    // Validación de campos de residencia según el país
    if (datos.pais_residencia_habitual === 'Ecuador' || datos.pais_residencia_habitual == '1') {
        if (!datos.provinciaResidencia) errores.push('Provincia de residencia es obligatoria para Ecuador.');
        if (!datos.cantonResidencia) errores.push('Cantón de residencia es obligatorio para Ecuador.');
        if (!datos.id_parroquia) errores.push('Parroquia de residencia es obligatoria para Ecuador.');
    } else {
        // Para el extranjero, ciertos campos son obligatorios
        if (!datos.callePrincipal || datos.callePrincipal.trim() === '') {
            errores.push('Calle Principal es obligatoria.');
        }
        if (!datos.barrio || datos.barrio.trim() === '') {
            errores.push('Barrio es obligatorio.');
        }
        if (!datos.referencia_domicilio || datos.referencia_domicilio.trim() === '') {
            errores.push('Referencia de domicilio es obligatoria.');
        }
    }
    
    return errores;
};

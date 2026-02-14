/**
 * Helpers para validaciones comunes en el frontend.
 */

/**
 * Valida una cédula ecuatoriana usando el algoritmo de Módulo 10.
 * @param {string} cedula - El número de cédula a validar.
 * @returns {boolean} True si es válida, false en caso contrario.
 */
export const isValidEcuadorianId = (cedula) => {
    if (typeof cedula !== 'string' || cedula.length !== 10 || !/^\d+$/.test(cedula)) {
        return false;
    }

    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 1 || (provincia > 24 && provincia !== 30)) {
        return false;
    }

    const tercerDigito = parseInt(cedula.substring(2, 3), 10);
    if (tercerDigito > 5) {
        return false;
    }

    const digitos = cedula.split('').map(Number);
    const verificador = digitos.pop();
    
    const suma = digitos.reduce((acc, curr, index) => {
        let valor = (index % 2 === 0) ? curr * 2 : curr;
        if (valor > 9) valor -= 9;
        return acc + valor;
    }, 0);

    const residuo = suma % 10;
    const resultado = residuo === 0 ? 0 : 10 - residuo;

    return resultado === verificador;
};

/**
 * Valida si un string contiene solo números.
 * @param {string} value 
 * @returns {boolean}
 */
export const isNumeric = (value) => /^\d*$/.test(value);

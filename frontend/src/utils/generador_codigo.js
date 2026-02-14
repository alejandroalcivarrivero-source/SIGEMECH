/**
 * Generador de Código Normativo de Identificación (MSP Ecuador)
 * 
 * Implementa la lógica para generar un código de 17 caracteres para pacientes
 * no identificados o en situaciones donde la normativa MSP lo requiera.
 * 
 * @param {Object} datos - Objeto con los datos del paciente
 * @param {string} datos.primer_nombre
 * @param {string} [datos.segundo_nombre]
 * @param {string} datos.primer_apellido
 * @param {string} [datos.segundo_apellido]
 * @param {string} datos.codigo_provincia - Código INEC (2 dígitos) o 99 para extranjeros
 * @param {string} datos.fecha_nacimiento - Formato YYYY-MM-DD
 * @param {boolean} [datos.es_neonato_horas] - Indicador para neonatos < 24h
 * @returns {string} Código de 17 caracteres
 */
export const generarCodigoNormativo = (datos) => {
    const {
        primer_nombre = '',
        segundo_nombre = '',
        primer_apellido = '',
        segundo_apellido = '',
        codigo_provincia = '99',
        fecha_nacimiento = '',
        es_neonato_horas = false
    } = datos;

    // Función auxiliar para limpiar tildes y convertir a mayúsculas
    const limpiarTexto = (texto) => {
        if (!texto) return '';
        return texto
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase()
            .trim();
    };

    const pNombre = limpiarTexto(primer_nombre);
    const sNombre = limpiarTexto(segundo_nombre);
    const pApellido = limpiarTexto(primer_apellido);
    const sApellido = limpiarTexto(segundo_apellido);

    // Bloque 1: Siglas de Identidad (Posiciones 1-6)
    const b1_1_2 = (pNombre.substring(0, 2) || '00').padEnd(2, '0');
    const b1_3 = sNombre ? sNombre.charAt(0) : '0';
    const b1_4_5 = (pApellido.substring(0, 2) || '00').padEnd(2, '0');
    const b1_6 = sApellido ? sApellido.charAt(0) : '0';
    
    const bloque1 = `${b1_1_2}${b1_3}${b1_4_5}${b1_6}`;

    // Bloque 2: Código de Provincia (Posiciones 7-8)
    const bloque2 = (codigo_provincia || '99').toString().padStart(2, '0').substring(0, 2);

    // Bloque 3: Fecha de Nacimiento (Posiciones 9-16)
    // Esperamos AAAA-MM-DD
    let bloque3 = '00000000';
    let decada = '0';

    if (fecha_nacimiento && fecha_nacimiento.includes('-')) {
        const [anio, mes, dia] = fecha_nacimiento.split('-');
        if (anio && mes && dia) {
            if (es_neonato_horas) {
                bloque3 = `${anio}${mes.padStart(2, '0')}00`; // Día se reemplaza por 00
            } else {
                bloque3 = `${anio}${mes.padStart(2, '0')}${dia.padStart(2, '0')}`;
            }
            // Bloque 4: Dígito de Control de Década (Posición 17)
            decada = anio.length >= 3 ? anio.charAt(2) : '0';
        }
    }

    return `${bloque1}${bloque2}${bloque3}${decada}`;
};

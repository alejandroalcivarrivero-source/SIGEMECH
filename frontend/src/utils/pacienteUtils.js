/**
 * Genera un código temporal MSP basado en los datos del paciente.
 * 
 * @param {Object} datos - Objeto con la información del paciente
 * @param {string} [datos.primerApellido] - Primer apellido
 * @param {string} [datos.segundoApellido] - Segundo apellido
 * @param {string} [datos.primerNombre] - Primer nombre
 * @param {string} [datos.segundoNombre] - Segundo nombre (opcional)
 * @param {string} [datos.provinciaNacimiento] - ID o código de la provincia
 * @param {string} [datos.fechaNacimiento] - Fecha en formato AAAA-MM-DD
 * @param {Array} [provincias] - Lista de provincias para buscar el código
 * @returns {string} Código temporal generado (17 caracteres)
 */
/**
 * Genera un código temporal MSP basado en los datos del paciente.
 * Sigue la regla: Nombres(3) + Apellidos(3) + Provincia(2) + Fecha(8) + Década(1) = 17 caracteres.
 */
export const generarCodigoTemporal = (datos, provincias = []) => {
    const {
        primer_apellido = '',
        segundo_apellido = '',
        primer_nombre = '',
        segundo_nombre = '',
        provinciaNacimiento, // Este viene de la lógica de negocio como ID
        fecha_nacimiento
    } = datos;

    const limpiarTexto = (texto) => {
        if (!texto) return 'X';
        return texto
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase()
            .replace(/[^A-Z]/g, "");
    };

    // 1. Nombres (3): 2 letras primer nombre + 1 letra segundo nombre (o '0').
    const n1 = limpiarTexto(primer_nombre).substring(0, 2).padEnd(2, 'A');
    const n2 = primer_nombre && !segundo_nombre ? 'A' : (limpiarTexto(segundo_nombre).substring(0, 1) || 'A');

    // 2. Apellidos (3): 2 letras primer apellido + 1 letra segundo apellido (o '0').
    const a1 = limpiarTexto(primer_apellido).substring(0, 2).padEnd(2, 'A');
    const a2 = primer_apellido && !segundo_apellido ? 'A' : (limpiarTexto(segundo_apellido).substring(0, 1) || 'A');

    // 3. Provincia (2)
    let codProvincia = '99';
    if (provinciaNacimiento) {
        if (provincias.length > 0) {
            const provincia = provincias.find(p => p.id == provinciaNacimiento || p.codigo == provinciaNacimiento);
            codProvincia = provincia?.codigo || (provincia?.id?.toString().padStart(2, '0')) || '99';
        } else {
            codProvincia = String(provinciaNacimiento).padStart(2, '0');
        }
        if (codProvincia.length > 2) codProvincia = codProvincia.slice(-2);
        codProvincia = codProvincia.padStart(2, '0');
    }

    // 4. Fecha (8): AAAAMMDD
    let fechaStr = '00000000';
    let anio = '0000';
    if (fecha_nacimiento) {
        // Normalizar fecha para evitar problemas de zona horaria
        const f = new Date(fecha_nacimiento.includes('T') ? fecha_nacimiento : `${fecha_nacimiento}T12:00:00Z`);
        if (!isNaN(f.getTime())) {
            anio = f.getUTCFullYear().toString();
            const mes = (f.getUTCMonth() + 1).toString().padStart(2, '0');
            const dia = f.getUTCDate().toString().padStart(2, '0');
            fechaStr = `${anio}${mes}${dia}`;
        }
    }

    // 5. Década (1): El dígito que representa la década del año de nacimiento (ej: para 1994 es 9).
    const decada = anio.length === 4 ? anio.charAt(2) : '9';

    const baseID = `${n1}${n2}${a1}${a2}${codProvincia}${fechaStr}${decada}`;

    return baseID.substring(0, 17);
};

/**
 * Valida una cédula ecuatoriana usando el algoritmo de Módulo 10.
 *
 * @param {string} cedula - El número de cédula a validar.
 * @returns {boolean} True si es válida, false en caso contrario.
 */
export const validarCedulaEcuatoriana = (cedula) => {
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

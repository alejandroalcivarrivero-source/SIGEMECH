/**
 * Utilidades de validación para SIGEMECH
 * Especializado en algoritmos oficiales de Ecuador
 */

/**
 * Valida una cédula de identidad ecuatoriana usando el algoritmo de Módulo 10.
 * 
 * El algoritmo consiste en:
 * 1. Verificar que tenga 10 dígitos.
 * 2. Verificar que el código de provincia (primeros 2 dígitos) esté entre 01 y 24, o sea 30.
 * 3. Aplicar el algoritmo de coeficientes (2.1.2.1...) a los primeros 9 dígitos.
 * 4. El resultado se resta de la decena inmediata superior para obtener el dígito verificador.
 * 
 * @param {string} cedula - El número de cédula a validar
 * @returns {boolean} - True si es válida, false de lo contrario
 */
const validarCedula = (cedula) => {
    // 1. Validar que sea una cadena de 10 dígitos numéricos
    if (!/^\d{10}$/.test(cedula)) {
        return false;
    }

    // 2. Validar código de provincia (primeros 2 dígitos)
    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (!((provincia >= 1 && provincia <= 24) || provincia === 30)) {
        return false;
    }

    // 3. Validar el tercer dígito (debe ser menor a 6 para personas naturales)
    const tercerDigito = parseInt(cedula.charAt(2), 10);
    if (tercerDigito >= 6) {
        return false;
    }

    // 4. Algoritmo de Módulo 10
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    const verificador = parseInt(cedula.charAt(9), 10);
    let suma = 0;

    for (let i = 0; i < 9; i++) {
        let valor = parseInt(cedula.charAt(i), 10) * coeficientes[i];
        if (valor >= 10) {
            valor -= 9;
        }
        suma += valor;
    }

    const totalCalculado = (suma % 10 === 0) ? 0 : 10 - (suma % 10);
    
        return totalCalculado === verificador;
    };
    
    /**
     * Genera un Código Temporal de Historia Clínica según normativa del MSP Ecuador.
     * Estructura: Letras(6) + Provincia(2) + Fecha(8) + Dígito Control(1)
     *
     * @param {Object} datos - Datos del paciente
     * @param {string} datos.primerNombre
     * @param {string} datos.segundoNombre
     * @param {string} datos.primerApellido
     * @param {string} datos.segundoApellido
     * @param {string} datos.fechaNacimiento - Formato YYYY-MM-DD
     * @param {string} datos.codigoProvincia - Código INEC (01-24) o '99'
     * @returns {string} - Código Temporal generado
     */
    /**
     * Genera un Código de Identidad de 17 caracteres según normativa MSP Ecuador.
     * Estructura:
     * - Nombres (3): 2 letras primer nombre + 1 letra segundo nombre.
     * - Apellidos (3): 2 letras primer apellido + 1 letra segundo apellido.
     * - Provincia (2): Código INEC (01-24) o '99'.
     * - Fecha (8): AAAAMMDD.
     * - Década (1): Tercer dígito del año de nacimiento.
     * Total: 17 caracteres.
     */
    const generarCodigoTemporalMSP = (datos) => {
        const {
            primerNombre = '',
            segundoNombre = '',
            primerApellido = '',
            segundoApellido = '',
            fechaNacimiento, // Formato YYYY-MM-DD o ISO
            codigoProvincia = '99'
        } = datos;

        const limpiarTexto = (texto) => {
            if (!texto) return 'X';
            return texto
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toUpperCase()
                .replace(/[^A-Z]/g, "");
        };

        // 1. Nombres (3)
        const n1 = limpiarTexto(primerNombre).substring(0, 2).padEnd(2, 'X');
        const n2 = (limpiarTexto(segundoNombre) || 'X').substring(0, 1);
        
        // 2. Apellidos (3)
        const a1 = limpiarTexto(primerApellido).substring(0, 2).padEnd(2, 'X');
        const a2 = (limpiarTexto(segundoApellido) || 'X').substring(0, 1);

        // 3. Provincia (2)
        const provincia = String(codigoProvincia).substring(0, 2).padStart(2, '0');

        // 4. Fecha (8)
        const f = new Date(fechaNacimiento);
        // Usar UTC para evitar desfases de zona horaria si la fecha viene solo como YYYY-MM-DD
        const anio = f.getUTCFullYear().toString();
        const mes = (f.getUTCMonth() + 1).toString().padStart(2, '0');
        const dia = f.getUTCDate().toString().padStart(2, '0');
        const fechaStr = `${anio}${mes}${dia}`;

        // 5. Década (1)
        const decada = anio.charAt(2);

        const codigo = `${n1}${n2}${a1}${a2}${provincia}${fechaStr}${decada}`;
        return codigo.substring(0, 17);
    };
    
    /**
     * Genera un número de historia clínica temporal de 17 caracteres
     * Basado en la norma técnica del MSP para pacientes sin identificación.
     * Formato: AAAAMMDD + HHMM + Código Centro (5)
     * Total: 8 + 4 + 5 = 17 caracteres
     *
     * @param {string} codigoCentro - El código único de la unidad operativa (5 caracteres)
     * @returns {string} - El ID temporal de 17 caracteres
     */
    const generarIdTemporal = (codigoCentro = '99999') => {
        const ahora = new Date();
        
        const anio = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, '0');
        const dia = String(ahora.getDate()).padStart(2, '0');
        
        const hora = String(ahora.getHours()).padStart(2, '0');
        const minuto = String(ahora.getMinutes()).padStart(2, '0');
        
        // Asegurar que el código del centro tenga exactamente 5 caracteres
        const centroPadded = String(codigoCentro).substring(0, 5).padStart(5, '0');
        
        return `${anio}${mes}${dia}${hora}${minuto}${centroPadded}`;
    };
    
    module.exports = {
        validarCedula,
        generarCodigoTemporalMSP,
        generarIdTemporal
    };

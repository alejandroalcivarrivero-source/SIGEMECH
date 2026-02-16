export const generarCodigoNormativoIdentificacion = ({
    primer_nombre = '',
    segundo_nombre = '',
    primer_apellido = '',
    segundo_apellido = '',
    codigo_provincia = null,
    es_extranjero = false,
    fecha_nacimiento = ''
}) => {
    // 1. Normalización de textos
    const limpiar = (txt) => (txt || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    
    const pNombre = limpiar(primer_nombre);
    const sNombre = limpiar(segundo_nombre);
    const pApellido = limpiar(primer_apellido);
    const sApellido = limpiar(segundo_apellido);

    // 2. Generación de SIGLAS (6 caracteres)
    // Formato: 2 letras P.Nombre + 1 letra S.Nombre + 2 letras P.Apellido + 1 letra S.Apellido
    const s1 = (pNombre.length >= 2) ? pNombre.substring(0, 2) : pNombre.padEnd(2, 'X');
    const s2 = (sNombre.length > 0) ? sNombre.substring(0, 1) : 'A'; // Si no tiene segundo nombre, se usa 'A' por defecto (ajuste MSP)
    const s3 = (pApellido.length >= 2) ? pApellido.substring(0, 2) : pApellido.padEnd(2, 'X');
    const s4 = (sApellido.length > 0) ? sApellido.substring(0, 1) : 'A'; // Si no tiene segundo apellido, se usa 'A' por defecto
    
    const siglas = `${s1}${s2}${s3}${s4}`;

    // Tarea 2: Blindaje de Nacionalidad (Extranjeros)
    // En este caso, el Generador de Código debe recibir automáticamente el valor '99' para la posición del código INEC, sin importar qué provincia estuviera marcada antes.

    // 3. CÓDIGO DE LUGAR DE NACIMIENTO (2 caracteres)
    let codigoLugar = '99'; // Default para casos no mapeados o extranjeros no explícitos

    if (es_extranjero) {
        codigoLugar = '99';
    } else if (codigo_provincia && codigo_provincia !== '99') {
        // Si viene un código explícito y no es el genérico 99 (a menos que sea intencional)
        codigoLugar = codigo_provincia.toString().padStart(2, '0');
    }

    // 4. FECHA (8 caracteres: AAAAMMDD)
    let fechaStr = '00000000';
    let anioFull = '0000';
    
    if (fecha_nacimiento) {
        const parts = fecha_nacimiento.split('-');
        if (parts.length === 3) {
            anioFull = parts[0];
            fechaStr = parts.join('');
        }
    }

    // 5. CONTROL (1 caracter) - DÉCADA (Posición 17)
    // Usamos el tercer dígito del año como control de década (Estándar MSP).
    // Ej: 1994 -> '9', 2023 -> '2'
    const controlDecada = anioFull.length === 4 ? anioFull.charAt(2) : '0';

    // Generamos el código base (17 caracteres)
    const codigoBase = `${siglas}${codigoLugar}${fechaStr}${controlDecada}`;
    
    // Devolvemos el código (17 caracteres)
    return codigoBase;
};

export const generarCodigoNormativo = (datos) => {
    return generarCodigoNormativoIdentificacion(datos);
};

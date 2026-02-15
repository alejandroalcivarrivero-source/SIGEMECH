// Mapa de códigos INEC por nombre de provincia (para respaldo/fallback)
const CODIGOS_INEC_PROVINCIAS = {
    'AZUAY': '01',
    'BOLIVAR': '02',
    'CAÑAR': '03',
    'CARCHI': '04',
    'COTOPAXI': '05',
    'CHIMBORAZO': '06',
    'EL ORO': '07',
    'ESMERALDAS': '08',
    'GUAYAS': '09',
    'IMBABURA': '10',
    'LOJA': '11',
    'LOS RIOS': '12',
    'MANABI': '13',
    'MORONA SANTIAGO': '14',
    'NAPO': '15',
    'PASTAZA': '16',
    'PICHINCHA': '17',
    'TUNGURAHUA': '18',
    'ZAMORA CHINCHIPE': '19',
    'GALAPAGOS': '20',
    'SUCUMBIOS': '21',
    'ORELLANA': '22',
    'SANTO DOMINGO DE LOS TSACHILAS': '23',
    'SANTA ELENA': '24',
    'ZONA NO DELIMITADA': '90'
};

export const generarCodigoNormativoIdentificacion = ({
    primer_nombre = '',
    segundo_nombre = '',
    primer_apellido = '',
    segundo_apellido = '',
    codigo_provincia = null, // Ahora esperamos el código explícito o el nombre si es necesario
    nombre_provincia = '',   // Nuevo: para buscar en el mapa si no viene el código
    es_extranjero = false,   // Nuevo: bandera explícita
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

    // 3. CÓDIGO DE LUGAR DE NACIMIENTO (2 caracteres)
    let codigoLugar = '99'; // Default para casos no mapeados o extranjeros no explícitos

    if (es_extranjero) {
        codigoLugar = '99';
    } else if (codigo_provincia && codigo_provincia !== '99') {
        // Si viene un código explícito y no es el genérico 99 (a menos que sea intencional)
        codigoLugar = codigo_provincia.toString().padStart(2, '0');
    } else {
        // Intento de búsqueda por nombre si no hay código o es inválido
        if (nombre_provincia) {
            const nombreNorm = limpiar(nombre_provincia);
            // Buscar coincidencia parcial o exacta
            const key = Object.keys(CODIGOS_INEC_PROVINCIAS).find(k => nombreNorm.includes(k) || k.includes(nombreNorm));
            if (key) {
                codigoLugar = CODIGOS_INEC_PROVINCIAS[key];
            }
        }
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

    // 5. CONTROL (1 caracter) - DÉCADA
    // Usamos el tercer dígito del año como control de década (Estándar MSP).
    // Ej: 1994 -> '9', 2023 -> '2'
    // Restauramos la lógica de cálculo de dígito de control usando el helper si fuera importado,
    // pero mantenemos la lógica inline para independencia de este módulo utilitario puro.
    const control = anioFull.length === 4 ? anioFull.charAt(2) : '0';

    return `${siglas}${codigoLugar}${fechaStr}${control}`;
};

export const generarCodigoNormativo = (datos) => {
    return generarCodigoNormativoIdentificacion(datos);
};

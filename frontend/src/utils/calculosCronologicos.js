/**
 * Módulo de cálculos cronológicos para SIGEMECH.
 * Centraliza la lógica de cálculo de edad precisa y gestión de fechas.
 */

/**
 * Calcula la edad detallada (años, meses, días, horas) basada en fecha y hora de nacimiento.
 * Fundamental para la clasificación etaria (neonato, pediátrico, adulto, adulto mayor).
 * 
 * @param {string} fechaNacimiento - Fecha en formato 'YYYY-MM-DD'
 * @param {string} horaNacimiento - Hora en formato 'HH:mm' (opcional, default '00:00')
 * @returns {Object} Objeto con desglose de edad y banderas booleanas de clasificación
 */
export const calcularEdad = (fechaNacimiento, horaNacimiento = '00:00') => {
    if (!fechaNacimiento) {
        return {
            anios: 0,
            meses: 0,
            dias: 0,
            horas: 0,
            isNeonato: false,
            esMenorDeUnAnio: false,
            esTerceraEdad: false,
            esPartoReciente: false, // < 48 horas
            mostrarFlujoNeonatal: false
        };
    }

    // Normalización de fecha para cálculo preciso
    const nacimiento = new Date(`${fechaNacimiento}T${horaNacimiento}:00`);
    const ahora = new Date();
    
    // Validación básica de fecha futura
    if (nacimiento > ahora) {
        return {
            anios: 0, meses: 0, dias: 0, horas: 0,
            error: 'Fecha futura'
        };
    }

    // --- LÓGICA DE CÁLCULO DE EDAD PRECISA POR CICLOS DE 24 HORAS ---
    // Refactorización Crítica: Se centraliza el cálculo en milisegundos para evitar
    // inconsistencias por calendario (meses de 28, 30, 31 días).
    
    const diffMilisegundos = ahora - nacimiento;

    // Unidades de tiempo en milisegundos (CONSTANTES DE SOBERANÍA)
    const MS_POR_HORA = 1000 * 60 * 60;
    const MS_POR_DIA = MS_POR_HORA * 24;
    const MS_POR_MES_APROX = MS_POR_DIA * 30.4375; // Promedio para cálculo inicial
    const MS_POR_ANIO_APROX = MS_POR_DIA * 365.25; // Contempla años bisiestos

    // --- CÁLCULO DIRECTO POR CICLOS ---
    const horasTotales = diffMilisegundos / MS_POR_HORA;
    const diasCompletos = Math.floor(diffMilisegundos / MS_POR_DIA);
    
    // REGLA CRÍTICA: Si han pasado menos de 24h, los días son CERO.
    const diasParaMostrar = horasTotales < 24 ? 0 : diasCompletos;

    // Para meses y años, se usa una lógica de calendario más tradicional pero ajustada.
    let anios = ahora.getFullYear() - nacimiento.getFullYear();
    let meses = ahora.getMonth() - nacimiento.getMonth();
    let diasCalendario = ahora.getDate() - nacimiento.getDate();
    let horas = ahora.getHours() - nacimiento.getHours();

    // Ajustes finos de calendario
    if (horas < 0) {
        diasCalendario--;
        horas += 24;
    }
    if (diasCalendario < 0) {
        meses--;
        const ultimoDiaMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0).getDate();
        diasCalendario += ultimoDiaMesAnterior;
    }
    if (meses < 0) {
        anios--;
        meses += 12;
    }
    
    // --- CLASIFICACIÓN NORMATIVA MSP ---
    const esNeonato = diasCompletos <= 28 && anios === 0 && meses === 0;
    const esMenorDeUnAnio = anios === 0;
    const esTerceraEdad = anios >= 65;
    const esPartoReciente = horasTotales < 48; // Menos de 48 horas
    const mostrarFlujoNeonatal = esNeonato || esPartoReciente;

    return {
        anios,
        meses,
        dias: (anios === 0 && meses === 0) ? diasParaMostrar : diasCalendario,
        horas: Math.floor(horasTotales % 24), // Horas dentro del día actual
        isNeonato: esNeonato,
        esMenorDeUnAnio,
        esTerceraEdad,
        esPartoReciente,
        mostrarFlujoNeonatal,
        isLess24h: horasTotales < 24
    };
};

/**
 * Obtiene el dígito verificador de década para el Código Normativo.
 * Regla: Tercer dígito del año de nacimiento.
 * Ej: 1994 -> '9', 2023 -> '2'
 *
 * @param {string} fechaNacimiento - Fecha 'YYYY-MM-DD'
 * @returns {string} Un solo carácter numérico o '0' por defecto
 */
export const obtenerDigitoDecada = (fechaNacimiento) => {
    if (!fechaNacimiento || fechaNacimiento.length < 4) return '0';
    // Asumiendo formato YYYY-MM-DD
    const anio = fechaNacimiento.split('-')[0];
    if (anio.length === 4) {
        return anio.charAt(2);
    }
    return '0';
};

// Exportación por defecto para compatibilidad
export default {
    calcularEdad,
    obtenerDigitoDecada
};

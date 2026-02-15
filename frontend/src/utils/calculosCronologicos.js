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
export const calcularEdadDetallada = (fechaNacimiento, horaNacimiento = '00:00') => {
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

    // Diferencia en milisegundos
    let diff = ahora - nacimiento;

    // Cálculo de unidades
    const msPorHora = 1000 * 60 * 60;
    const msPorDia = msPorHora * 24;
    
    // Cálculo aproximado de años/meses/días usando lógica de calendario
    let anios = ahora.getFullYear() - nacimiento.getFullYear();
    let meses = ahora.getMonth() - nacimiento.getMonth();
    let dias = ahora.getDate() - nacimiento.getDate();

    // Ajuste negativo de meses/días
    if (dias < 0) {
        meses--;
        // Días del mes anterior
        const ultimoDiaMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0).getDate();
        dias += ultimoDiaMesAnterior;
    }

    if (meses < 0) {
        anios--;
        meses += 12;
    }

    // Cálculo de horas (para neonatos)
    // Se calcula la diferencia total en horas
    const horasTotales = Math.floor(diff / msPorHora);
    
    // Clasificaciones Normativas MSP
    const isNeonato = (anios === 0 && meses === 0 && dias <= 28);
    const esMenorDeUnAnio = anios === 0;
    const esTerceraEdad = anios >= 65;
    
    // Parto Reciente: Definido como menos de 48 horas (Normativa de Alta Conjunta)
    const esPartoReciente = horasTotales < 48;

    // Mostrar Flujo Neonatal: Si es neonato o si el parto fue reciente
    const mostrarFlujoNeonatal = isNeonato || esPartoReciente;

    return {
        anios,
        meses,
        dias,
        horas: horasTotales, // Devolvemos horas totales para lógica de < 24h o < 48h
        isNeonato,
        esMenorDeUnAnio,
        esTerceraEdad,
        esPartoReciente,
        mostrarFlujoNeonatal,
        // Helper booleano para UI inmediata
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

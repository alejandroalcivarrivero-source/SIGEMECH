
// Simulación de la lógica de edad de FormularioAdmisionMaestra.jsx
function calcularEdad(fechaNacimiento, fechaHoraParto, now) {
    if (!fechaNacimiento) return { years: 0, months: 0, days: 0, hours: 0, isLess24h: false };
    
    const birthDateOnly = new Date(fechaNacimiento + 'T00:00:00');
    const isToday = birthDateOnly.toDateString() === now.toDateString();
    
    const birthDateStr = fechaHoraParto || (fechaNacimiento + 'T00:00:00');
    const birth = new Date(birthDateStr);
    
    const diffMs = now - birth;
    const effectiveDiffMs = Math.max(0, diffMs);
    const diffHours = Math.floor(effectiveDiffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(effectiveDiffMs / (1000 * 60));
    
    const isLess24h = isToday || (diffHours >= 0 && diffHours < 24);

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
        months -= 1;
        const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += lastMonth.getDate();
    }
    if (months < 0) {
        years -= 1;
        months += 12;
    }

    if (isToday) {
        return { years: 0, months: 0, days: 0, hours: diffHours, minutes: diffMinutes, isLess24h: true };
    }

    return { years, months, days, hours: diffHours, minutes: diffMinutes, isLess24h };
}

const now = new Date('2026-02-13T00:05:00'); // "Hoy" a las 00:05
const ayer = '2026-02-12';
const horaParto = '2026-02-12T23:55:00'; // "Ayer" a las 23:55

const infoEdad = calcularEdad(ayer, horaParto, now);
console.log('RESULTADO SIMULACIÓN TIEMPO CRÍTICO:', JSON.stringify(infoEdad, null, 2));

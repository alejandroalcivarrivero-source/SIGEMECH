import api from './axios';

/**
 * Servicio para la gestión de pacientes en la API.
 * Sincronizado con el Backend (Soberanía Lingüística - Español Técnico)
 */
const pacienteService = {
    /**
     * Busca un paciente por su número de identificación.
     * @param {string} numeroDocumento
     * @returns {Promise<Object|null>}
     */
    async findByCedula(numeroDocumento) {
        // Ruta Backend: GET /api/pacientes/buscar/:cedula
        const response = await api.get(`/pacientes/buscar/${numeroDocumento}`);
        return response.data;
    },

    /**
     * Registra un nuevo paciente o actualiza uno existente.
     * @param {Object} pacienteData
     * @returns {Promise<Object>}
     */
    async savePaciente(pacienteData) {
        // Ruta Backend: POST /api/pacientes (Registro general) o POST /api/pacientes/admision (Registro simplificado)
        const response = await api.post(`/pacientes`, pacienteData);
        return response.data;
    },

    /**
     * Crea un registro de admisión de emergencia (Atómico).
     * Ahora utiliza el endpoint unificado de pacientes que maneja paciente + admisión
     * @param {Object} payload { datosPaciente, ... }
     * @returns {Promise<Object>}
     */
    async createEmergencyAdmission(payload) {
        // Ruta Backend: POST /api/pacientes/admision
        // Nota: El backend espera { datosPaciente } en el body
        const response = await api.post(`/pacientes/admision`, payload);
        return response.data;
    },

    /**
     * Obtiene un paciente por número de documento (usado para validaciones rápidas)
     */
    async getPacienteByCedula(numeroDocumento) {
        const response = await api.get(`/pacientes/buscar/${numeroDocumento}`);
        return response.data.found ? response.data.paciente : null;
    },

    /**
     * Verifica si un paciente tiene admisiones recientes
     */
    async verificarAdmisionReciente(pacienteId, horas) {
        try {
            // Ajustar ruta si es necesario, asumiendo que admissions sigue existiendo para consultas específicas
            // O si se movió a pacientes, ajustar aquí. Por ahora mantenemos admissions si el backend lo soporta.
            // Revisando routes, admissions_routes.js existe.
            const response = await api.get(`/admissions/verificar-reciente/${pacienteId}?horas=${horas}`);
            return response.data.tieneAdmision;
        } catch (error) {
            console.error("Error al verificar admisión reciente:", error);
            return false;
        }
    },

    /**
     * Valida si una cédula corresponde a una paciente materna con admisión reciente.
     */
    async validarMaterna(cedula) {
        const response = await api.post(`/admissions/validar-materna`, { cedula });
        return response.data;
    }
};

export default pacienteService;

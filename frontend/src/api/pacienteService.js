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
        const response = await api.get(`/pacientes/buscar/${numeroDocumento}`);
        return response.data;
    },

    /**
     * Registra un nuevo paciente o actualiza uno existente.
     * @param {Object} pacienteData
     * @returns {Promise<Object>}
     */
    async savePaciente(pacienteData) {
        const response = await api.post(`/pacientes/registrar`, pacienteData);
        return response.data;
    },

    /**
     * Crea un registro de admisión de emergencia (Atómico).
     * @param {Object} payload { pacienteData, admissionData, representanteData, datos_parto }
     * @returns {Promise<Object>}
     */
    async createEmergencyAdmission(payload) {
        const response = await api.post(`/admissions`, payload);
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

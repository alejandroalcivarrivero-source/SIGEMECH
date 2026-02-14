import api from './axios';

/**
 * Servicio para la gestión de pacientes en la API.
 */
const pacienteService = {
    /**
     * Busca un paciente por su número de cédula.
     * @param {string} cedula 
     * @returns {Promise<Object|null>}
     */
    async findByCedula(cedula) {
        const response = await api.get(`/pacientes/buscar/${cedula}`);
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
     * Crea un registro de admisión de emergencia.
     * @param {Object} admissionData 
     * @returns {Promise<Object>}
     */
    async createEmergencyAdmission(admissionData) {
        const response = await api.post(`/admissions`, admissionData);
        return response.data;
    },

    /**
     * Obtiene un paciente por cédula (usado para validaciones rápidas)
     */
    async getPacienteByCedula(cedula) {
        const response = await api.get(`/pacientes/buscar/${cedula}`);
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
    }
};

export default pacienteService;

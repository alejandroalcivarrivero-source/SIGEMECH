import api from './axios';

/**
 * Servicio para obtener catálogos desde la API.
 */
const catalogService = {
    /**
     * Obtiene todos los catálogos necesarios para los formularios.
     * @returns {Promise<Object>}
     */
    async getAllCatalogs() {
        const [
            provincias,
            nacionalidades,
            etnias,
            nivelesEducacion,
            estadosInstruccion,
            segurosSalud,
            sexos,
            estadosCiviles,
            generos,
            parentescos,
            formasLlegada,
            fuentesInformacion,
            tiposDocumento,
            condicionesLlegada,
            tiposIdentificacion,
            establecimientos,
            paises,
            tiposEmpresa,
            tiposDiscapacidad,
            bonos
        ] = await Promise.all([
            api.get('/catalogs/provincias'),
            api.get('/catalogs/nacionalidades'),
            api.get('/catalogs/etnias'),
            api.get('/catalogs/niveles-educacion'),
            api.get('/catalogs/estado-nivel-instruccion'),
            api.get('/catalogs/seguros-salud'),
            api.get('/catalogs/sexos'),
            api.get('/catalogs/estados-civiles'),
            api.get('/catalogs/generos'),
            api.get('/catalogs/parentescos'),
            api.get('/catalogs/formas-llegada'),
            api.get('/catalogs/fuentes-informacion'),
            api.get('/catalogs/tipos-identificacion'),
            api.get('/catalogs/condiciones-llegada'),
            api.get('/catalogs/tipos-identificacion'),
            api.get('/catalogs/establecimientos-salud'),
            api.get('/catalogs/paises'),
            api.get('/catalogs/tipos-empresa'),
            api.get('/catalogs/tipos-discapacidad'),
            api.get('/catalogs/bonos')
        ]);

        return {
            provincias: provincias.data,
            nacionalidades: nacionalidades.data,
            etnias: etnias.data,
            nivelesEducacion: nivelesEducacion.data,
            estadosInstruccion: estadosInstruccion.data,
            segurosSalud: segurosSalud.data,
            sexos: sexos.data,
            estadosCiviles: estadosCiviles.data,
            generos: generos.data,
            parentescos: parentescos.data,
            formasLlegada: formasLlegada.data,
            fuentesInformacion: fuentesInformacion.data,
            tiposDocumento: tiposDocumento.data, // Mantenemos el nombre de la propiedad por compatibilidad con el estado del frontend
            condicionesLlegada: condicionesLlegada.data,
            tiposIdentificacion: tiposIdentificacion.data,
            establecimientos: establecimientos.data,
            paises: paises.data,
            tiposEmpresa: tiposEmpresa.data,
            tiposDiscapacidad: tiposDiscapacidad.data,
            bonos: bonos.data
        };
    },

    /**
     * Obtiene cantones por ID de provincia.
     * @param {number|string} provinciaId 
     */
    async getCantones(provinciaId) {
        const res = await api.get(`/catalogs/cantones/${provinciaId}`);
        return res.data;
    },

    /**
     * Obtiene parroquias por ID de cantón.
     * @param {number|string} cantonId 
     */
    async getParroquias(cantonId) {
        const res = await api.get(`/catalogs/parroquias/${cantonId}`);
        return res.data;
    },

    /**
     * Obtiene nacionalidades étnicas por ID de etnia desde cat_etnias_nacionalidades.
     * @param {number|string} etniaId
     */
    async getEthnicNationalities(etniaId) {
        if (!etniaId) return [];
        // Apuntamos al endpoint que consulta cat_etnias_nacionalidades
        const res = await api.get(`/catalogs/autoidentificaciones-etnicas?etnia_id=${etniaId}`);
        return res.data;
    },

    /**
     * Obtiene pueblos étnicos por ID de nacionalidad étnica.
     * @param {number|string} nacionalidadEtnicaId
     */
    async getEthnicTowns(nacionalidadEtnicaId) {
        if (!nacionalidadEtnicaId) return [];
        // Cumplimos con el requerimiento: GET /api/catalogs/pueblos?nacionalidad_id=1
        const res = await api.get(`/catalogs/pueblos?nacionalidad_id=${nacionalidadEtnicaId}`);
        return res.data;
    },

    /**
     * Obtiene todos los países.
     * @returns {Promise<Array>}
     */
    async getPaises() {
        const res = await api.get('/catalogs/paises');
        return res.data;
    },

    /**
     * Busca ocupaciones dinámicamente.
     * @param {string} term
     */
    async searchOcupaciones(term) {
        const res = await api.get(`/catalogs/ocupaciones?search=${term}`);
        return res.data;
    },

    /**
     * Obtiene todas las ocupaciones.
     */
    async getOcupaciones() {
        const res = await api.get('/catalogs/ocupaciones');
        return res.data;
    },

    /**
     * Busca motivos de consulta/síntomas dinámicamente.
     * @param {string} term
     */
    async searchMotivosConsulta(term) {
        const res = await api.get(`/catalogs/motivos-consulta?search=${term}`);
        return res.data;
    }
};

export const getPaises = async () => {
    const res = await api.get('/catalogs/paises');
    return res.data;
};

export default catalogService;

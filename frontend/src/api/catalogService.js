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
            establecimientos
        ] = await Promise.all([
            api.get('/catalogs/provincias'),
            api.get('/catalogs/nacionalidades'),
            api.get('/catalogs/etnias'),
            api.get('/catalogs/niveles-educacion'),
            api.get('/catalogs/seguros-salud'),
            api.get('/catalogs/sexos'),
            api.get('/catalogs/estados-civiles'),
            api.get('/catalogs/generos'),
            api.get('/catalogs/parentescos'),
            api.get('/catalogs/formas-llegada'),
            api.get('/catalogs/fuentes-informacion'),
            api.get('/catalogs/tipos-documento'),
            api.get('/catalogs/condiciones-llegada'),
            api.get('/catalogs/tipos-identificacion'),
            api.get('/catalogs/establecimientos-salud')
        ]);

        return {
            provincias: provincias.data,
            nacionalidades: nacionalidades.data,
            etnias: etnias.data,
            nivelesEducacion: nivelesEducacion.data,
            segurosSalud: segurosSalud.data,
            sexos: sexos.data,
            estadosCiviles: estadosCiviles.data,
            generos: generos.data,
            parentescos: parentescos.data,
            formasLlegada: formasLlegada.data,
            fuentesInformacion: fuentesInformacion.data,
            tiposDocumento: tiposDocumento.data,
            condicionesLlegada: condicionesLlegada.data,
            tiposIdentificacion: tiposIdentificacion.data,
            establecimientos: establecimientos.data
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
     * Obtiene nacionalidades étnicas por ID de etnia.
     * @param {number|string} etniaId
     */
    async getEthnicNationalities(etniaId) {
        const res = await api.get(`/catalogs/nacionalidades-etnicas/${etniaId}`);
        return res.data;
    },

    /**
     * Obtiene pueblos étnicos por ID de nacionalidad étnica.
     * @param {number|string} nacionalidadEtnicaId
     */
    async getEthnicGroups(nacionalidadEtnicaId) {
        const res = await api.get(`/catalogs/pueblos-etnicos/${nacionalidadEtnicaId}`);
        return res.data;
    },

    /**
     * Obtiene todos los países.
     * @returns {Promise<Array>}
     */
    async getPaises() {
        const res = await api.get('/catalogs/paises');
        return res.data;
    }
};

export const getPaises = async () => {
    const res = await api.get('/catalogs/paises');
    return res.data;
};

export default catalogService;

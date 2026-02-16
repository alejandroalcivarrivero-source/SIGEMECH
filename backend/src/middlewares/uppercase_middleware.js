/**
 * Middleware para normalizar todos los strings del body a MAYÚSCULAS.
 * Esto garantiza la integridad de los datos según la norma de registro clínico SIGEMECH.
 * Implementa Soberanía de Datos: Todo contenido textual debe ser almacenado en MAYÚSCULAS.
 */

const transformarAMayusculas = (objeto) => {
    if (Array.isArray(objeto)) {
        return objeto.map(item => transformarAMayusculas(item));
    } else if (objeto !== null && typeof objeto === 'object') {
        const nuevoObjeto = {};
        for (const llave in objeto) {
            if (Object.prototype.hasOwnProperty.call(objeto, llave)) {
                nuevoObjeto[llave] = transformarAMayusculas(objeto[llave]);
            }
        }
        return nuevoObjeto;
    } else if (typeof objeto === 'string') {
        return objeto.toUpperCase();
    }
    return objeto;
};

const middlewareMayusculas = (req, res, next) => {
    if (req.body && Object.keys(req.body).length > 0) {
        req.body = transformarAMayusculas(req.body);
    }
    next();
};

module.exports = middlewareMayusculas;

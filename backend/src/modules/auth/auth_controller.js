const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validarCedula } = require('../../utils/validators');
const { sequelize } = require('../../config/db');
require('dotenv').config();

/**
 * Controlador de Autenticación
 * Maneja el inicio de sesión sin OTP para agilizar la operatividad en intranet.
 */
const login = async (req, res) => {
    const { cedula, clave } = req.body;

    // Protocolo AIM: Validación de entrada rigorosa
    if (!cedula || !clave) {
        return res.status(400).json({ message: 'Cédula y clave son requeridas.' });
    }
    
    try {
        // Importación tardía (lazy) del modelo para garantizar que esté inicializado
        const { Usuario } = sequelize.models;

        // Verificación de Carga de Modelo
        if (!Usuario) {
            throw new Error("El modelo Usuario no se cargó correctamente. Verifique la inicialización en models_index.js.");
        }

        // 1. Buscar al usuario
            // Aseguramos que traiga nombres y apellidos para el frontend
            const usuario = await Usuario.findOne({
                where: { username: cedula },
                             // Agregamos explicitamente nombres y apellidos para garantizar que se recuperen de la DB
                             attributes: ['id', 'username', 'password_hash', 'estado', 'nombres', 'apellidos']
            });
    
           // --- INICIO DE DEPURACIÓN TEMPORAL ---
           // console.log("Datos de la DB recuperados para el usuario:", JSON.stringify(usuario, null, 2));
           // --- FIN DE DEPURACIÓN TEMPORAL ---

        if (!usuario) {
            // Se usa un mensaje genérico para no revelar si el usuario existe o no
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }

        // 2. Verificar si el usuario está activo
        if (usuario.estado !== 'activo') {
            return res.status(403).json({ message: `El usuario se encuentra en estado '${usuario.estado}'. Por favor, contacte al administrador del sistema.` });
        }

        // 3. Validar la contraseña de forma segura
        const esClaveValida = await bcrypt.compare(clave, usuario.password_hash);
        if (!esClaveValida) {
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }

        // 4. Generar la Ficha de Acceso (JWT)
        const ficha_acceso = jwt.sign(
            {
                id: usuario.id,
                username: usuario.username,
                roles: [] // TODO: Implementar roles reales desde la base de datos
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' } // Duración de la sesión
        );

        // 5. Respuesta de éxito
        // Estandarizamos la respuesta para que coincida con lo que espera AuthContext
        // Asegurando que la estructura sea idéntica a lo que `normalizarUsuario` espera
        const respuestaUsuario = {
             id: usuario.id,
             nombres: usuario.nombres,
             apellidos: usuario.apellidos,
             username: usuario.username,
             role: 'usuario' // Placeholder por ahora
        };

        res.status(200).json({
            mensaje: 'Autenticación exitosa. ¡Bienvenido/a!',
            ficha_acceso,
            usuario: respuestaUsuario
        });

    } catch (error) {
        // Log del error real en el servidor para auditoría y depuración
        console.error('Error crítico en el proceso de login:', error);

        // Respuesta genérica al cliente para no exponer detalles internos
        res.status(500).json({
            message: 'Ocurrió un error inesperado en el servidor. Por favor, intente más tarde.',
            // Opcional: En desarrollo, se puede enviar el mensaje de error
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { login };

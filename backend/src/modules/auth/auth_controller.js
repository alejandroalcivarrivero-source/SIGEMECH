const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validarCedula } = require('../../utils/validators');
const { User } = require('../../models_index');
require('dotenv').config();

/**
 * Controlador de Autenticación
 * Maneja el inicio de sesión sin OTP para agilizar la operatividad en intranet.
 */
const login = async (req, res) => {
    const { cedula, password } = req.body;

    // Protocolo AIM: Validación de entrada rigorosa
    if (!cedula || !password) {
        return res.status(400).json({ message: 'Cédula y contraseña son requeridas.' });
    }

    // Opcional: Validar formato de cédula si es estrictamente numérica de 10 dígitos
    // if (!validarCedula(cedula)) {
    //     return res.status(400).json({ message: 'Formato de cédula inválido.' });
    // }

    try {
        // 1. Buscar al usuario (Usando el modelo User para mayor seguridad y legibilidad)
        const usuario = await User.findOne({
            where: { username: cedula },
            attributes: ['id', 'username', 'password', 'status', 'isActive', 'firstName', 'lastName']
        });

        if (!usuario) {
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }

        // 2. Verificar si el usuario está activo
        if (!usuario.isActive) {
            return res.status(403).json({ message: `El usuario está ${usuario.status}. Contacte al administrador.` });
        }

        // 3. Validar la contraseña con el hash de la DB
        // Usamos el atributo 'password' del modelo que está mapeado a 'password_hash'
        if (!password || !usuario.password) {
            console.error(`Error de autenticación: Faltan datos para usuario ${cedula}.`);
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }

        const esValida = await bcrypt.compare(password, usuario.password);
        if (!esValida) {
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }

        // 4. Generar el Token JWT (Válido por 8 horas)
        const token = jwt.sign(
            {
                id: usuario.id,
                cedula: usuario.username,
                roles: [] // TODO: Implementar roles reales desde usuarios_roles si es necesario
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // 5. Respuesta exitosa
        res.status(200).json({
            message: 'Login exitoso',
            token,
            user: {
                id: usuario.id,
                nombres: usuario.firstName,
                apellidos: usuario.lastName,
                status: usuario.status
            }
        });

    } catch (error) {
        console.error('Error detallado en login:', error);
        res.status(500).json({
            message: 'Error interno del servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { login };
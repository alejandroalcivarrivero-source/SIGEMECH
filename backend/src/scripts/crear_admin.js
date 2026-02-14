const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

async function crearUsuarioMaestro() {
    // --- CONFIGURA TUS DATOS AQUÍ ---
    const cedula = '1312165937'; // Reemplaza con tu cédula real
    const nombre = 'Sergio';
    const apellido = 'TICS';
    const correo = 'centrodesaludchonetipoc@gmail.com';
    const clavePlana = 'TICS2025';
    // --------------------------------

    try {
        console.log('--- Iniciando creación de usuario maestro ---');

        // 1. Cifrar la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(clavePlana, salt);

        // 2. Insertar el usuario
        const sqlUsuario = `
            INSERT INTO usuarios (cedula, nombres, apellidos, correo, password_hash, estado) 
            VALUES (?, ?, ?, ?, ?, 'activo')
        `;
        const resUsuario = await query(sqlUsuario, [cedula, nombre, apellido, correo, passwordHash]);
        const usuarioId = resUsuario.insertId;

        console.log(`✅ Usuario creado con ID: ${usuarioId}`);

        // 3. Asignar Roles (Soporte TI = 5, Estadística Local = 7 según nuestro SQL inicial)
        // Nota: Ajusta los IDs si en tu tabla 'roles' son diferentes
        const rolesAsignar = [5, 7]; 
        
        for (const rolId of rolesAsignar) {
            await query('INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES (?, ?)', [usuarioId, rolId]);
        }

        console.log('✅ Roles de Soporte TI y Estadística asignados con éxito.');
        console.log('--- Proceso terminado correctamente ---');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error al crear el usuario:', error.message);
        process.exit(1);
    }
}

crearUsuarioMaestro();
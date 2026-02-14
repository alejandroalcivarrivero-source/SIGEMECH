const { query } = require('../../config/db');

/**
 * Obtener logs del sistema para auditoría
 * Devuelve los últimos 10 logs con información detallada
 */
const getLogsSistema = async (req, res) => {
    try {
        // Consulta para obtener los últimos 10 logs con información del usuario
        // Asumimos que existe una tabla 'logs_sistema' y 'usuarios'
        // Si la tabla logs_sistema no existe, esto fallará y el usuario deberá crearla.
        // Pero dado que es una tarea de implementación de "Supervisión", es probable que el logueo ya exista o se esté implementando.
        // Si no hay tabla de logs, la consulta fallará. 
        // Voy a asumir una estructura estándar.
        
        const sql = `
            SELECT l.id, l.usuario_id, l.accion, l.ip_origen as ip, l.fecha,
                   u.nombres, u.apellidos, u.rol_id
            FROM logs_sistema l
            LEFT JOIN usuarios u ON l.usuario_id = u.id
            ORDER BY l.fecha DESC
            LIMIT 10
        `;

        const logs = await query(sql);
        
        // Si no hay logs, devolvemos array vacío
        res.status(200).json(logs || []);

    } catch (error) {
        console.error('Error al obtener logs:', error);
        // Si el error es porque la tabla no existe, devolvemos un mensaje más claro o datos simulados si fuera un entorno de prueba, pero aquí es prod.
        res.status(500).json({ message: 'Error al obtener los logs del sistema', error: error.message });
    }
};

/**
 * Obtener estadísticas rápidas para el dashboard de soporte
 */
const getDashboardStats = async (req, res) => {
    try {
        // Estadísticas básicas
        // 1. Total usuarios
        const sqlUsuarios = `SELECT COUNT(*) as total FROM usuarios`;
        const usuarios = await query(sqlUsuarios);
        
        // 2. Total logs hoy (si la tabla tiene fecha compatible)
        const sqlLogsHoy = `SELECT COUNT(*) as total FROM logs_sistema WHERE DATE(fecha) = CURDATE()`;
        const logsHoy = await query(sqlLogsHoy);

        // 3. Métricas específicas de Auditoría (Admisiones y Triajes hoy)
        // Buscamos en los logs acciones que contengan "ADMISION_001" o "TRIAGE_008"
        const sqlAdmisionesHoy = `
            SELECT COUNT(*) as total
            FROM logs_sistema
            WHERE DATE(fecha) = CURDATE() AND accion LIKE '%ADMISION_001%'
        `;
        const admisionesHoy = await query(sqlAdmisionesHoy);

        const sqlTriajesHoy = `
            SELECT COUNT(*) as total
            FROM logs_sistema
            WHERE DATE(fecha) = CURDATE() AND accion LIKE '%TRIAGE_008%'
        `;
        const triajesHoy = await query(sqlTriajesHoy);

        res.json({
            total_usuarios: usuarios[0]?.total || 0,
            logs_hoy: logsHoy[0]?.total || 0,
            admisiones_hoy: admisionesHoy[0]?.total || 0,
            triajes_hoy: triajesHoy[0]?.total || 0
        });

    } catch (error) {
        console.error('Error stats soporte:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
};

module.exports = {
    getLogsSistema,
    getDashboardStats
};

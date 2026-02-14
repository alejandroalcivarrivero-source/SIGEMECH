const axios = require('axios');

async function probarLogin() {
    try {
        console.log('Intentando login con usuario de prueba (Cédula: 1312165937)...');
        const response = await axios.post('http://localhost:3002/api/auth/login', {
            cedula: '1312165937',
            password: 'clave_incorrecta_para_probar' // Primero probamos error
        });
        console.log('❌ Login exitoso inesperado (debería fallar):', response.data);
    } catch (error) {
        if (error.response) {
             console.log('✅ Respuesta de error esperada:', error.response.status, error.response.data);
        } else {
             console.error('❌ Error de conexión:', error.message);
        }
    }

    try {
        console.log('\nIntentando login con credenciales correctas (si existen)...');
        // NOTA: Asumimos que la contraseña es la del script crear_admin.js: 'TICS2025'
        const response = await axios.post('http://localhost:3002/api/auth/login', {
            cedula: '1312165937', 
            password: 'TICS2025'
        });
        console.log('✅ Login exitoso:', response.data);
    } catch (error) {
         if (error.response) {
             console.log('❌ Falló el login correcto:', error.response.status, error.response.data);
        } else {
             console.error('❌ Error de conexión:', error.message);
        }
    }
}

probarLogin();

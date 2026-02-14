@echo off
TITLE SIGEMECH - ORQUESTADOR DE SISTEMAS
COLOR 0B

:: ========================================================
:: PASO 1: LIMPIEZA QUIRÚRGICA DE PUERTOS
:: ========================================================
echo [SISTEMA] Liberando puertos 3002 y 5174...
taskkill /F /IM node.exe /T >nul 2>&1
:: Nota: No se tocan puertos 3001 ni 5173 por respeto a otros proyectos [cite: 2026-02-14].

:: ========================================================
:: PASO 2: VALIDACIÓN Y ARRANQUE DEL BACKEND
:: ========================================================
echo [BACKEND] Verificando dependencias...
cd backend
if not exist node_modules (
    echo [ALERTA] No se detectaron librerias. Instalando NPM en Backend...
    call npm install
)
echo [BACKEND] Iniciando motor en nueva ventana...
start "SIGEMECH - LOGS BACKEND" cmd /k "npm run dev"
cd ..

:: ========================================================
:: PASO 3: PAUSA DE SINCRONIZACIÓN
:: ========================================================
echo [SISTEMA] Esperando inicializacion de base de datos...
timeout /t 5 /nobreak >nul

:: ========================================================
:: PASO 4: VALIDACIÓN Y ARRANQUE DEL FRONTEND
:: ========================================================
echo [FRONTEND] Verificando dependencias...
cd frontend
if not exist node_modules (
    echo [ALERTA] No se detectaron librerias. Instalando NPM en Frontend...
    call npm install
)
echo [FRONTEND] Iniciando interfaz en nueva ventana...
start "SIGEMECH - LOGS FRONTEND" cmd /k "npm run dev"
cd ..

:: ========================================================
:: PASO 5: NOTIFICACIÓN VISUAL FINAL
:: ========================================================
echo [OK] Procesos iniciados correctamente.
powershell -ExecutionPolicy Bypass -Command "[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.MessageBox]::Show('🚀 ¡Sistemas SIGEMECH Listos! Puede iniciar su jornada.', 'SIGEMECH - Notificación', 'OK', 'Information')"

:: Abrir navegador automáticamente
start http://localhost:5174
exit

@echo off
setlocal

echo =======================================================================
echo  SCRIPT DE ORQUESTACION SIGEMECH
echo =======================================================================

REM --- PASO 1: LIMPIEZA SELECTIVA DE PUERTOS ---
echo.
echo [PASO 1] Limpiando puertos 3002 y 5174...
echo.

FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :3002') DO (
    IF "%%a" NEQ "0" (
        echo    - Matando proceso con PID %%a en el puerto 3002 (Backend)
        taskkill /F /PID %%a
    )
)

FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :5174') DO (
    IF "%%a" NEQ "0" (
        echo    - Matando proceso con PID %%a en el puerto 5174 (Frontend)
        taskkill /F /PID %%a
    )
)
echo.
echo    Puertos limpiados.
echo.


REM --- PASO 2: VALIDACION DE ENTORNO ---
echo [PASO 2] Validando entorno...
echo.
IF NOT EXIST "backend\\.env" (
    echo [ERROR] El archivo de configuracion backend\\.env no existe.
    echo         Por favor, cree el archivo antes de continuar.
    pause
    exit /b 1
)
echo    - Archivo backend\\.env encontrado.
echo.

REM --- PASO 3: LANZAMIENTO DEL BACKEND ---
echo [PASO 3] Lanzando el Backend...
echo.
pushd backend
IF NOT EXIST "node_modules" (
    echo    - Detectada primera ejecucion en este entorno. Instalando dependencias necesarias para el Backend...
    npm install
)
start "SIGEMECH - BACKEND" cmd /k "npm run dev"
popd
echo    - Se ha iniciado la ventana del Backend.
echo.

REM --- PASO 4: PAUSA DE CORTESIA ---
echo [PASO 4] Pausa de 5 segundos para inicializacion del Backend...
echo.
timeout /t 5 /nobreak > nul
echo    - Pausa completada.
echo.

REM --- PASO 5: LANZAMIENTO DEL FRONTEND ---
echo [PASO 5] Lanzando el Frontend...
echo.
pushd frontend
IF NOT EXIST "node_modules" (
    echo    - Detectada primera ejecucion en este entorno. Instalando dependencias necesarias para el Frontend...
    npm install
)
start "SIGEMECH - FRONTEND" cmd /k "npm run dev"
popd
echo    - Se ha iniciado la ventana del Frontend.
echo.

REM --- PASO 6: NOTIFICACION DE EXITO ---
echo [PASO 6] Notificando exito...
echo.
powershell -Command "Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show('El entorno de desarrollo de SIGEMECH se ha iniciado correctamente.','Lanzamiento Exitoso','OK','Information')"

echo =======================================================================
echo  Orquestacion finalizada.
echo =======================================================================
echo.

endlocal

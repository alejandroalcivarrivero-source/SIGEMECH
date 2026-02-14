@echo off
chcp 65001 > nul
setlocal

echo ========================================================
echo      SISTEMA DE SINCRONIZACION SEGURA - SIGEMECH
echo ========================================================

:: 1. VERIFICACION DE SEGURIDAD (Blindaje de Infraestructura)
echo [SEGURIDAD] Verificando proteccion de archivos sensibles...

:: Verificar si existe .gitignore en backend (donde esta el .env)
if not exist "backend\.gitignore" (
    echo [CRITICO] No se encontro backend\.gitignore. Creando archivo de proteccion...
    echo .env > backend\.gitignore
    echo node_modules/ >> backend\.gitignore
    echo [OK] Archivo de proteccion creado.
) else (
    :: Verificar si .env está en el .gitignore del backend
    findstr /C:".env" "backend\.gitignore" > nul
    if errorlevel 1 (
        echo [CRITICO] El archivo .env NO esta protegido en backend\.gitignore.
        echo [ACCION] Agregando proteccion automaticamente...
        echo. >> backend\.gitignore
        echo .env >> backend\.gitignore
    )
)

:: Verificacion global de seguridad (doble check)
git check-ignore -q backend/.env
if errorlevel 1 (
    echo [ALERTA] El archivo backend/.env NO esta siendo ignorado por Git.
    echo [RIESGO] Deteniendo sincronizacion para evitar fuga de credenciales.
    echo Por favor, revise manualmente los archivos .gitignore.
    pause
    exit /b 1
) else (
    echo [OK] Archivos sensibles protegidos correctamente.
)

echo.
echo ========================================================
echo      INICIANDO SINCRONIZACION DE RED
echo ========================================================

:: 2. SINCRONIZACION DESCENDENTE (PULL)
echo [RED] Descargando ultimos cambios del repositorio remoto...
git pull
if errorlevel 1 (
    echo [ERROR] Fallo al descargar cambios. Resuelva los conflictos manualmente.
    pause
    exit /b 1
)

:: 3. PREPARACION DE ENTREGABLES (ADD)
echo [SISTEMA] Preparando archivos para envio...
git add .

:: 4. REGISTRO DE CAMBIOS (COMMIT)
set /p commit_msg="[USUARIO] Ingrese descripcion de los cambios (Commit): "
if "%commit_msg%"=="" (
    echo [ERROR] El mensaje de commit es obligatorio por normativa de auditoria.
    pause
    exit /b 1
)

git commit -m "%commit_msg%"

:: 5. SINCRONIZACION ASCENDENTE (PUSH)
echo [RED] Enviando cambios al repositorio central...
git push
if errorlevel 1 (
    echo [ERROR] No se pudo conectar con el repositorio remoto.
    echo [SUGERENCIA] Verifique su conexion a Internet o credenciales.
    pause
    exit /b 1
)

echo.
echo ========================================================
echo      SINCRONIZACION COMPLETADA EXITOSAMENTE
echo ========================================================
echo [ESTATUS] Sistema actualizado y sincronizado.
pause

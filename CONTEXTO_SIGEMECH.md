# Bitácora Maestra de Contexto: SIGEMECH

## 🛡️ Implementación de Tolerancia Temporal y Estabilización de Red (Formulario 008)

### 1. Tolerancia Temporal (Margen de 5 Minutos)
Se implementó un margen de tolerancia de **5 minutos** al futuro en las validaciones de fecha y hora de nacimiento/parto.
- **Motivo**: Evitar bloqueos por ligeros desfases de reloj entre la estación de trabajo del cliente y el servidor backend.
- **Ubicación**: `frontend/src/components/admision/FormularioAdmisionMaestra.jsx` en la función `validarTemporada`.

### 2. Validación Silenciosa (UX Improvement)
Se refactorizó el comportamiento de las alertas de validación temporal:
- **Cambio**: Las validaciones ya no se disparan en el evento `onChange` (mientras el usuario escribe), lo cual interrumpía el flujo.
- **Implementación**: Se utiliza el evento `onBlur` (cuando el campo pierde el foco) para validar y mostrar modales de error, permitiendo una entrada de datos más fluida.

### 3. Estabilización de Red y Reconexión Automática
Se fortaleció el cliente `axios` para manejar fallos de red local de manera proactiva.
- **Detección Dinámica**: El sistema ahora itera sobre las redes disponibles (Local y Tailscale) con un mecanismo de descubrimiento más robusto.
- **Reconexión de Emergencia**: Si una petición falla por error de red, el interceptor de respuesta inicia un diagnóstico de red automático e intenta re-enviar la petición original tras encontrar una ruta válida.
- **Ubicación**: `frontend/src/api/axios.js`.

---

## 🛡️ Reglas de Validación Crítica (Blindaje Temporal - 2026-02-14)

### 1. Validación de Hora Posterior (Bloqueo Total)
Se ha implementado un sistema de blindaje que impide el avance del flujo ante ingresos de horas futuras.
- **Margen de Tolerancia**: 5 minutos para compensar desfases de sincronización de relojes.
- **Acción Bloqueante**: Si el usuario intenta ingresar una hora posterior a la actual (considerando el margen), se dispara un `ModalFeedback` de error.
- **Reset y Foco**: Tras cerrar el error, el campo `hora_parto` se limpia automáticamente y el foco regresa al campo para reintento.

### 2. Bloqueo de Navegación (Candado de Pestañas)
- Mientras exista un error de validación en la fecha u hora, o falte la hora en pacientes con menos de 24h de nacidos:
    - Los botones de navegación "Siguiente" quedan deshabilitados (`disabled`).
    - El acceso a pestañas posteriores (3 a 7) mediante clics directos queda bloqueado con un mensaje de advertencia.

### 3. Opción de Reingreso de Fecha Completa
- Ante errores repetidos de hora (2 o más intentos inválidos), el sistema ofrece proactivamente la opción de limpiar la fecha completa. Esto previene confusión en el cálculo de las 24 horas y asegura la integridad de los datos clínicos.

---

## 🏛️ Soberanía Operativa (Protocolo de Infraestructura Crítica)

### 1. Restricción de Registro Institucional (Regla de las 24h Cronológicas Exactas)
- **Protocolo de Turno**: Se prohíbe el registro de partos realizados en el "Centro de Salud Tipo C Chone" que superen las 24 horas de antigüedad real (Timestamp).
- **Justificación Técnica**: Debido a la arquitectura de intranet y la dependencia del sistema de generador eléctrico del establecimiento, el registro debe ser inmediato y sincronizado con el flujo de admisión materna.
- **Implementación (Actualización 2026-02-14)**:
    - **Cálculo Dinámico (Milisegundos)**: El sistema utiliza milisegundos para definir el cambio de turno y la visibilidad de campos, eliminando la dependencia del día calendario (`(new Date() - fechaSeleccionada) < 24 * 60 * 60 * 1000`).
    - **Persistencia y Obligatoriedad**: Si el paciente tiene < 24h de vida (aunque sea fecha de ayer), el campo HORA es obligatorio y bloqueante. No se permite avanzar a secciones posteriores (Representante) ni finalizar sin este dato.
    - **Restauración RPIS**: Si al ingresar la hora se confirma que el paciente tiene $\leq$ 24 horas de vida, la opción 'Centro de Salud Tipo C Chone' reaparece inmediatamente en el selector RPIS.
    - **Blindaje de Pestañas**: La navegación a "Representante Legal" y el botón "Siguiente" permanecen inhabilitados hasta que la combinación de Fecha + Hora sea validada como válida y no futura.
    - **Flujo de Foco**: El sistema prioriza el salto del cursor a la Hora antes que al establecimiento si la ventana temporal de 24h está vigente.

### 2. Reglas de Control de Turno (Timestamp Absoluto)
- **Validación por Reloj Atómico**: El sistema ignora el calendario convencional para el cierre de turno institucional. La habilitación del "Centro de Salud Tipo C Chone" se basa exclusivamente en el tiempo transcurrido en milisegundos desde el nacimiento.
- **Umbral de Visibilidad**: El campo HORA es obligatorio siempre que `(Date.now() - fechaSeleccionada) < (24 * 60 * 60 * 1000)`.
- **Lógica de Ayer vs Hoy**: Si la fecha es del día anterior, pero han transcurrido menos de 24 horas reales, el sistema exige la hora para determinar si el paciente aún califica para el registro institucional.
- **Actualización de RPIS en Caliente**: En cuanto se digita la hora, el sistema recalcula la ventana de antigüedad. Si el resultado es $\leq$ 24h, el establecimiento institucional reaparece dinámicamente en el selector.

---

## Estado Actual del Sistema
- **Red Virtual:** Activa (Tailscale: `100.64.87.1`).
- **Base de Datos:** Conectividad nativa validada a `100.64.87.1` (MariaDB operativo).
- **Backend API:** Puerto `3002` con endpoint de salud `/api/health` operativo.

## Credenciales de Acceso (Entorno Desarrollo)
- **Usuario:** `administrador`
- **Clave:** `TICS2025`

## Pilares Fundamentales
1. **Soberanía Lingüística:** Todo el código, comentarios y logs deben estar en Español Técnico.
2. **Blindaje Clínico:** Adherencia estricta a normas del MSP Ecuador.
3. **Identidad Azul y Oro:** Interfaz y experiencia de usuario alineada con la identidad institucional.

## Próximos Pasos Prioritarios
1. **Análisis de Hallazgos del Backend:** Revisión de discrepancias y errores reportados.
2. **Normalización de Tablas:** Estandarización de la estructura de base de datos según normativa.
## 🚀 Próximos Pasos (Prioridad Técnica)
- [x] **Fase 1: Refactorización de Modelos:** Migrado `admission_model.js` a Español Técnico (Soberanía Lingüística).
- [x] **Fase 1.1: Refactorización de Pacientes:** Migrado `paciente_model.js` a Español Técnico y unificado con MariaDB (Soberanía de Pacientes).
- [ ] **Fase 2: Limpieza de Controladores:** Eliminar los mapeos "parche" en `admissions_controller.js` y estandarizar DTOs.
- [ ] **Fase 3: Blindaje Clínico:** Sustituir hardcoding de "CENTRO DE SALUD TIPO C CHONE" por IDs o variables de entorno.
- [ ] **Fase 4: Frontend:** Unificar nomenclatura de `formData` en formularios maestros.
## ✅ Hitos Completados (2026-02-14)
- [x] Soberanía de Pacientes: Refactorización de modelo y migración física de tabla `pacientes` completada.
- [x] Validación de conectividad nativa a base de datos (`100.64.87.1`).
- [x] Actualización de configuración de entorno backend.
- [x] **Restauración de Visibilidad de Red:** Implementado endpoint `/api/health` con mensajes en español y configurada IP de Tailscale (`100.64.87.1`) en el frontend para conectividad remota.

## ✅ Hitos Completados (2026-02-13)
- [x] Refactorización total de `EmergencyAdmission` a Español Técnico (Fase 1).
- [x] Sincronización de MariaDB mediante túnel SSH y estrategia no destructiva.
- [x] Validación de Soberanía Lingüística en esquema de tabla `admisiones_emergencia`.

## ✅ Seguridad y DevOps (2026-02-13)
- [x] Blindaje de archivos sensibles (.env) en todo el árbol de directorios.
- [x] Saneamiento de historial Git para prevenir fuga de credenciales.
- [x] Script `sincronizar.bat` validado y operativo bajo estándares de seguridad.

## 🤖 Automatización y Orquestación (DevOps)
- [x] **Control Centralizado:** Implementado `package.json` en la raíz para orquestación de servicios.
- [x] **Arranque Unificado:** Comando `npm run dev` configurado con `concurrently` para lanzar Backend (3002) y Frontend (Vite) simultáneamente.
- [x] **Instalación Recursiva:** Comando `npm run instalar-todo` para mantenimiento rápido de dependencias en todo el monorepo.
- [x] **Limpieza de Puertos y Estabilización:** Normalización de puertos (`3002` para API y `5174` para Frontend) con activación de `strictPort: true` en Vite para garantizar consistencia en el entorno local. (2026-02-14)

## 🌐 Infraestructura y Conectividad
- [x] **Salud del Sistema:** Endpoint `/api/health` verificado (Estado 200) con validación de base de datos.
- [x] **Conmutación Automática de Red (Auto-Discovery):** Se ha implementado una estrategia de conexión híbrida y automática en `frontend/src/api/axios.js`. Al iniciar la aplicación, el sistema realiza un diagnóstico para determinar el nodo de red óptimo, siguiendo un orden de prioridad estricto para garantizar la mejor experiencia de usuario posible según el contexto de conexión:
    1.  **Red Local de Oficina (LAN):** Se intenta una conexión a `172.16.1.248` con un timeout agresivo de 500ms para una detección casi instantánea. Si tiene éxito, se activa el "Modo Oficina".
    2.  **Red Remota Segura (Tailscale):** Si la red de oficina no está disponible, el sistema intenta conectarse a `100.64.87.1` con un timeout extendido de 10 segundos, optimizado para la latencia de conexiones domésticas. Si tiene éxito, se activa el "Modo Casa/Remoto".
    3.  **Nodo Local de Emergencia (Localhost):** Como último recurso, si ninguna de las redes anteriores responde, la aplicación opera contra `127.0.0.1` para permitir pruebas y desarrollo sin conexión. Un banner de advertencia claro notifica al usuario de este modo degradado.
- [x] **Persistencia de Conexión:** Una vez que se establece una conexión exitosa, la `baseURL` se fija para esa sesión, evitando la necesidad de repetir el diagnóstico en cada petición y optimizando el rendimiento.
- [x] **Conectividad Remota:** Archivo `.env` del frontend apuntando a la IP de Tailscale para asegurar acceso fuera de la red local.

## 🔐 Seguridad y Autenticación (Soberanía Lingüística - 2026-02-14)
- [x] **Contexto de Autenticación**: Implementado `AuthContext.jsx` con manejo robusto de errores y estado de carga garantizado (`setLoading(false)` en `finally` o flujo controlado).
- [x] **Validación de Identidad**: Creado endpoint `/api/auth/verificar-identidad` en Backend y vinculado proactivamente en el inicio del Frontend.
- [x] **Redirección de Seguridad**: Implementado `ProtectedRoute` en `App.jsx` para forzar redirección a `/login` ante tokens inválidos o fallos de comunicación con el servidor.
- [x] **Flujo de Acceso Fluido**: Finalizada la integración del `Login` con el `AuthContext`. Tras el éxito de las credenciales, se dispara el `ModalFeedback` de bienvenida, se actualiza el estado global y se ejecuta la redirección automática a `/dashboard` (vía `useNavigate`) después de 1.5s o al cerrar el modal manualmente. (2026-02-14)
- [x] **Flujo de autenticación validado y blindado contra errores de instancia.** El controlador de autenticación y el modelo de usuario están ahora 100% sincronizados con la estructura de la base de datos, garantizando un proceso de login robusto.
- [x] **Módulo de Autenticación 100% Operativo:** Se ha realizado la validación final de credenciales y acceso. El sistema utiliza `bcrypt` para la verificación de contraseñas, la consulta se realiza por `cedula` y se valida que el usuario esté 'activo'.

## 🎨 Experiencia de Usuario (UX) y Calidad (QA) - 2026-02-14
- [x] **Optimización de Validaciones Temporales**: Implementado sistema de validación no intrusivo para la Fecha de Nacimiento en el formulario de Admisión.
    - **Debounce de Longevidad**: La validación de "Límite de Longevidad" (120 años) ahora espera 800ms de inactividad o pérdida de foco (`onBlur`) para evitar interrupciones visuales mientras el usuario escribe.
    - **Optimización de Usabilidad en Fecha (Completada)**: Implementado sistema híbrido de validación para la Fecha de Nacimiento.
        - **Debounce de 800ms**: Evita interrupciones visuales del modal de longevidad mientras el usuario digita el año.
        - **Trigger onBlur**: Asegura la validación final al perder el foco del campo, garantizando consistencia sin interrumpir el flujo de entrada de datos.

## 🔐 Seguridad OWASP y Protección de Datos (2026-02-14)
- [x] **Blindaje de Cabeceras**: Implementado `helmet` en el Backend para mitigar ataques XSS y Clickjacking.
- [x] **Gestión Segura de Sesiones**: Implementado JWT con expiración controlada y validación proactiva de identidad en cada carga del sistema.
- [x] **Saneamiento de Entradas**: Validación de formatos (Cédula algoritmo Módulo 10, Emails, Teléfonos) en el cliente y servidor.

## 🎨 Identidad Visual y UI/UX (2026-02-14)
- [x] **Paleta Institucional**: Implementado sistema de colores "Azul y Oro" alineado a la identidad de salud pública (Blue-900 / Yellow-400).
- [x] **Layout Dinámico y Adaptativo**:
    - **Títulos Sincronizados**: El `Header` actualiza dinámicamente el título según la vista activa (ej: "Admisión de Pacientes (008)").
    - **Contenedor Autoajustable**: Implementado margen dinámico (`md:ml-64`) en el contenido principal vinculado al estado del menú lateral.
    - **Transiciones Fluidas**: Uso de `transition-all duration-300` para cambios suaves de layout.
    - **Identidad Reforzada**: Botones activos en Sidebar con contraste Oro sobre Azul (`bg-blue-700 text-amber-400`).
- [x] **Consistencia de Marca**: Logotipos de MSP y SIGEMECH integrados en el flujo de Login y Dashboard.
- [x] **Interfaz Adaptativa**: Formulario de Admisión segmentado por pestañas funcionales para reducir la carga cognitiva del usuario.

## 🧠 Lógica de Negocio y Normativa (2026-02-14)
- [x] **Generador de Código Normativo de Identificación (MSP)**: Implementado algoritmo de 17 caracteres para pacientes "No Identificados" (Soberanía Lingüística y Cumplimiento Legal).
    - **Bloque 1 (1-6)**: Siglas de Identidad (2 letras 1er Nombre, 1ra letra 2do Nombre [o 0], 2 letras 1er Apellido, 1ra letra 2do Apellido [o 0]). Se utiliza "0" como relleno si los campos están vacíos para mantener la integridad de 17 caracteres.
    - **Bloque 2 (7-8)**: Código de Provincia (INEC) o 99 para extranjeros.
    - **Bloque 3 (9-16)**: Fecha de Nacimiento completa (AAAAMMDD).
    - **Bloque 4 (17)**: Dígito de Control de Década (3er dígito del año de nacimiento).
    - **Integración**: Generación en tiempo real en el Formulario de Admisión con bloqueo de edición (`readOnly`) para el número de identificación cuando se selecciona el tipo "No Identificado".
- [x] **Estabilidad de Navegación y Títulos Dinámicos (2026-02-14)**:
    - **Bloqueo de Salto en Pestañas**: Corregido comportamiento en `FormularioAdmisionMaestra.jsx`. La selección de "No Identificado" ya no dispara el salto automático a la pestaña de "Motivo", manteniendo al usuario en "Datos Personales" para completar la filiación necesaria para el código normativo.
    - **Títulos Dinámicos (Breadcrumbs)**: Implementado hook `useLocation` en el `Header` para detectar la ruta activa.
        - `/dashboard` -> "Panel Principal".
        - `/dashboard/admision` -> "Admisión de Pacientes (008)".
- [x] **Estabilización del Generador Normativo y Eliminación de Valores Predeterminados (2026-02-14)**:
    - **Filiación Limpia**: Se eliminó el uso de la palabra "DESCONOCIDO" como valor por defecto. Al seleccionar "No Identificado", los campos de nombres y apellidos se inicializan como strings vacíos ("") para forzar una entrada de datos consciente.
    - **Generación Dinámica**: El código de 17 caracteres se actualiza en tiempo real mientras el usuario escribe, sin saltos de pestaña automáticos que interrumpan la experiencia de usuario (UX).
- [x] **Arquitectura de Rutas Anidadas y Sincronización (2026-02-14)**:
    - **Rutas Independientes**: Configurado `react-router-dom` con rutas anidadas en `/dashboard/*` (ej: `/dashboard/admision`, `/dashboard/soporte`).
    - **Persistencia de Estado**: Al recargar (F5), el sistema mantiene al usuario en la sección específica gracias a la sincronización con `useLocation`.
- [x] **Seguridad RBAC (Role-Based Access Control) (2026-02-14)**:
    - **Visibilidad Selectiva**: Los ítems del Sidebar se renderizan dinámicamente según el array de permisos/roles del usuario.
    - **Acceso Master (Sergio)**: Implementada regla de acceso total (`['*']`) para perfiles con identidad "Sergio", garantizando visibilidad global de módulos.
    - **Normalización de Permisos**: `AuthContext` ahora propaga `roles` y `permissions` de forma estandarizada.

## 👶 Inteligencia de Registro Neonatal y Matriz de Dependencia (2026-02-14)
- [x] **Lógica Temporal y Salto de Cursor**:
    - **Ventana de 24h**: Si el nacimiento fue hace $\leq$ 24 horas, se habilita y enfoca automáticamente el campo `hora_parto`.
    - **Optimización de Digitado**: Para registros de más de un día, la hora se oculta y el foco salta directamente al selector de establecimiento, ahorrando clics innecesarios.
- [x] **Matriz de Dependencia Madre-Hijo (Candado Institucional)**:
    - **Validación de Origen**: Si el establecimiento es el "Centro de Salud Tipo C Chone", el sistema activa la obligatoriedad de `cedula_madre`.
    - **Validación Clínica (48h)**: Se verifica en tiempo real que la madre tenga una admisión activa en las últimas 48 horas, garantizando que el recién nacido sea institucional.
    - **Excepción Externa**: Para establecimientos fuera del sistema local (ej. Clínica Zambrano), se permite el registro sin cédula materna para trámites externos.
- [x] **Ahorro de Tiempo en Autollonado**:
    - **Inyección de Representante**: Al validar la madre, sus datos (Nombre, Cédula, Dirección) se inyectan automáticamente en la sección de Representante Legal.
    - **UX Flexible**: Los datos inyectados permanecen editables para casos donde el representante sea otra persona, pero se cargan por defecto para el caso más común (madre como representante).
- [x] **Sincronización de Identidad**: El Código Normativo de 17 caracteres se actualiza en tiempo real con cada cambio en los datos de filiación del neonato, asegurando la consistencia legal inmediata.

## 🌍 Lógica de Residencia (Segregación por País - 2026-02-14)
- [x] **Carga de Catálogo de Países**: El selector de país en `SeccionResidencia.jsx` se alimenta dinámicamente desde la base de datos (`/api/catalogs/paises`).
- [x] **Lógica de Dependencia (Ecuador)**:
    - Si `paisResidencia === 'Ecuador'`, los campos de división territorial (Provincia, Cantón, Parroquia) se vuelven obligatorios (`required`).
    - Se activa el filtrado en cascada para estos selectores, asegurando la integridad de los datos geográficos.
- [x] **Lógica de Excepción (Extranjero)**:
    - Si `paisResidencia !== 'Ecuador'`, los campos de división territorial se deshabilitan (`disabled`) y se limpian para prevenir datos inconsistentes.
    - La obligatoriedad se traslada a campos de dirección descriptiva: `Calle Principal`, `Barrio` y `Referencia`.
- [x] **Validación de Formulario**: La lógica del botón "Finalizar" o "Siguiente" ahora considera estas reglas dinámicas. El botón solo se habilita si se cumplen los campos obligatorios correspondientes al país seleccionado, asegurando la completitud de la data según el contexto.

---

## 📋 Pestaña 4: Datos Adicionales (Socio-Económicos) - 2026-02-14
- [x] **Implementación de Pestaña 4 (Datos Adicionales)**: Se ha creado y añadido al flujo del formulario de admisión la pestaña de "Datos Adicionales", responsable de recoger información socio-económica del paciente.
- [x] **Carga de Catálogos**: Los selectores para `cat_etnias` y `cat_instruccion` se cargan dinámicamente utilizando la instancia estabilizada de Axios.
- [x] **Lógica de Renderizado Seguro (Blindaje de Datos)**: Se ha implementado el patrón `paciente?.etnia_id` para evitar errores de renderizado en caso de que los datos del paciente o los catálogos demoren en cargar.
- [x] **Identidad Visual**: La interfaz de la Pestaña 4 sigue el esquema de colores Azul/Oro y se ha asegurado que cualquier mensaje de error utilice el componente centralizado `ModalFeedback`, prohibiendo el uso de `alert()`.
- [x] **Validación de Campos**: Los campos de "Autoidentificación Étnica" y "Nivel de Instrución" han sido marcados como obligatorios (`required`), cumpliendo con la normativa de admisión hospitalaria.

---

## ⚡ Protocolo de Liberación de Puerto de Emergencia (SOP)

En caso de que el puerto `3002` del backend quede bloqueado, impidiendo que el servidor se inicie, seguir el siguiente protocolo estándar de operaciones:

1.  **Identificar el Proceso Bloqueante**: Abrir una terminal de `cmd.exe` y ejecutar el siguiente comando para encontrar el PID (Process ID) que está ocupando el puerto:
    ```bash
    netstat -ano | findstr :3002
    ```
2.  **Terminar el Proceso Forzosamente**: Una vez identificado el PID en la última columna, ejecutar el siguiente comando para liberar el puerto:
    ```bash
    taskkill /PID <PID_DEL_PROCESO> /F
    ```
    *Reemplazar `<PID_DEL_PROCESO>` con el número obtenido en el paso anterior.*

Este procedimiento garantiza una rápida recuperación del entorno de desarrollo en caso de un bloqueo inesperado del puerto. [cite: 2026-02-14]
# Recuperación de Lógica Neonatal y Sesión de Usuario

## Contexto del Problema
Tras una serie de refactorizaciones recientes, se detectaron regresiones críticas en el flujo de admisión de pacientes, específicamente en:
1.  **Validación Neonatal:** La lógica que habilitaba campos obligatorios (Hora de Parto, Establecimiento) para nacidos hace menos de 24 horas estaba inestable o dependiendo incorrectamente de zonas horarias.
2.  **Identificación NN:** El campo de fecha de nacimiento estaba bloqueado incorrectamente para pacientes "No Identificados", impidiendo el registro de neonatos sin identidad formal.
3.  **Generación de Código:** El algoritmo de generación de código temporal (para NN) tenía inconsistencias en el dígito de control de década.

## Soluciones Implementadas

### 1. Sincronización Lógica Neonatal (`SeccionNacimiento.jsx`)
*   **Habilitación de Fecha en NN:** Se modificó la propiedad `disabled` del input de fecha de nacimiento para permitir su edición explícita cuando el tipo de identificación es "NO IDENTIFICADO", independientemente del estado general del formulario.
*   **Validación < 24h (Unificada):** Se robusteció el cálculo de `esMenorA24HorasReales` para usar timestamps y manejar correctamente la comparación con el tiempo actual. Se implementó la **Simetría Total** en la Pestaña 2, asegurando que tanto para "Cédula" como para "No Identificado", el sistema abra los campos de HORA y LUGAR DEL PARTO inmediatamente si la edad detectada es < 24 horas.
*   **Establecimientos:** Se restauró la lógica que prioriza y muestra "CENTRO DE SALUD TIPO C CHONE" solo si el nacimiento fue hace menos de 24 horas, ocultándolo en caso contrario para forzar derivación correcta.

### 2. Escalabilidad de Datos e INEC Dinámico
*   **Migración de Base de Datos:** Se añadió la columna `codigo_inec` (VARCHAR 2, NOT NULL) a la tabla `cat_provincias` y se realizó una migración masiva con códigos oficiales (Azuay='01', Guayas='09', etc.).
*   **Backend:** El microservicio de provincias fue actualizado para devolver el campo `codigo_inec` al frontend.
*   **Generador Dinámico (`generador_codigo.js`):** Se eliminó el mapa constante `CODIGOS_INEC_PROVINCIAS` ("hardcoded"). Ahora la función generadora utiliza exclusivamente el valor `provincia.codigo_inec` proveniente de la base de datos.
*   **Dígito de Control de Década:** Se actualizó la función `generarCodigoNormativoIdentificacion` para incluir el dígito de control de la década en la posición 17 del código generado (tomando el tercer dígito del año).

### 3. UX y Navegación de Alta Productividad
*   **Orden de Tabulación (Secuencial):** Se configuraron los `tabIndex` en la Pestaña 2 para un flujo lógico: Nacionalidad (201) → Provincia (202) → Cantón (203) → Parroquia (204) → Fecha (205) → Hora (206) → Establecimiento (207).
*   **Validación con Refocus (Teclado):** Al detectar una fecha inválida o futura en el evento `onBlur`, el sistema dispara un error visual. Mediante un listener de tecla **ENTER** en el modal de error, el foco vuelve automáticamente al input de fecha para reintentar el ingreso sin necesidad de usar el mouse.

### 4. Flujo Maestro para "No Identificado" (Regla de Oro)
*   Se ha establecido que para el flujo de pacientes "No Identificado", la **fecha de nacimiento actúa como campo maestro habilitado**. Esto garantiza que el sistema pueda generar el ID normativo necesario para desbloquear el resto del formulario de admisión, eliminando bloqueos circulares de validación geográfica.

## Estado Actual
El sistema ahora cumple con los estándares de arquitectura senior:
1.  **Dinamismo Total:** Códigos INEC desde DB, eliminando mantenimiento manual de constantes.
2.  **Simetría UI:** Flujo neonatal unificado para pacientes con o sin cédula.
3.  **Eficiencia Operativa:** Navegación por teclado optimizada para entornos de emergencia (Admisión 008).

## Próximos Pasos Recomendados
*   Extender la lógica de códigos INEC a la validación de residencia si fuera necesario para reportes estadísticos.
*   Auditar que el dígito 17 (década) se refleje correctamente en el módulo de búsqueda histórica.

## Actualización de Seguridad y Flujo de Datos (2026-02-15)
### Blindaje de Nacionalidad Extranjera
*   Se implementó un bloqueo estricto para pacientes cuya nacionalidad no es **ECUATORIANA**. En estos casos, los selectores de Provincia, Cantón y Parroquia de nacimiento se inhabilitan automáticamente y se resetean a su valor inicial ("Seleccione").

## 🏥 Red de Salud de Chone (Actualización 2026-02-15)
Se ha incorporado la **Red Privada y de Socorro de Chone** en la Pestaña 6, optimizando el filtrado por capacidades técnicas:
- **Transporte Sanitario:** Filtrado automático de establecimientos que cuentan con ambulancia (`tiene_ambulancia === 1`) cuando la forma de llegada es terrestre-especializada.
- **Niveles de Resolución:** Implementación de Badges dinámicos para identificar niveles de complejidad (1, 2 o 3) en establecimientos de origen durante procesos de referencia.
- **Normalización de Datos:** Transformación automática a MAYÚSCULAS en todos los campos de texto de logística y motivo para mantener la integridad de la base de datos.

## UI y UX - Estándares de Diseño (Pestaña 4)
- **Simetría Vertical Constante:** Se mantiene una cuadrícula (grid) fija en los formularios, especialmente en la Pestaña 4 (Datos Adicionales). Los campos condicionales (como los detalles de discapacidad) no alteran el layout al aparecer o desaparecer; se utiliza `opacity` e `invisible` para preservar los espacios del grid y garantizar que los renglones mantengan su alineación vertical en todo momento.

## 🛡️ ARQUITECTURA DE SOBERANÍA DE DATOS (NORMALIZACIÓN GLOBAL)

Para garantizar la integridad y soberanía lingüística del sistema, se ha implementado una capa de normalización automática que elimina la necesidad de gestionar mayúsculas de forma manual en cada controlador o disparador de base de datos.

### 1. Capa de Intercepción (Frontend)
- **Ubicación:** [`frontend/src/api/axios.js`](frontend/src/api/axios.js)
- **Mecanismo:** Interceptor de solicitudes (Request Interceptor).
- **Lógica:** Antes de que cualquier payload sea enviado al backend, se recorre de forma recursiva. Si un valor es de tipo `string`, se aplica `.toUpperCase()`.
- **Excepciones:** Se excluyen instancias de `FormData` (archivos/binarios).

### 2. Capa de Middleware (Backend)
- **Ubicación:** [`backend/src/middlewares/uppercase_middleware.js`](backend/src/middlewares/uppercase_middleware.js)
- **Mecanismo:** Middleware global en Express ([`backend/src/app.js`](backend/src/app.js)).
- **Lógica:** Procesa el `req.body` de forma recursiva antes de llegar a los controladores, transformando todos los campos de texto a MAYÚSCULAS.
- **Beneficio:** Doble validación que asegura que incluso peticiones externas (fuera del frontend oficial) cumplan con la norma SIGEMECH.

### 3. Normalización de Catálogos y Pestaña 5
- **Tabla:** `cat_parentescos` (Sincronizada con registros en MAYÚSCULAS).
- **Interfaz:** [`frontend/src/components/admision/SeccionContactoEmergencia.jsx`](frontend/src/components/admision/SeccionContactoEmergencia.jsx) implementa:
    - Validación numérica estricta para teléfonos.
    - Estilo corporativo SIGEMECH (Azul/Oro).
    - Grid de 3 columnas para optimización de espacio.
*   El **Generador de Código Normativo** ahora fuerza automáticamente el valor **'99'** en la posición del código INEC para cualquier paciente extranjero, garantizando el cumplimiento del protocolo MSP sin importar selecciones previas.

## 📋 REFACTORIZACIÓN PESTAÑA 6 (FORMULARIO 008 MSP) - 2026-02-15

Se ha rediseñado la **Pestaña 6 (Logística de Llegada)** para cumplir estrictamente con el estándar del Formulario 008 del MSP y los lineamientos de auditoría de SIGEMECH.

### 1. Eliminación de Fecha Manual
- Se eliminó el campo "FECHA INGRESO" de la interfaz de usuario.
- **Backend:** El [`admissions_controller.js`](backend/src/modules/admissions/admissions_controller.js) ahora captura automáticamente el timestamp del servidor al momento de guardar, garantizando la inalterabilidad de la hora de admisión.

### 2. Reordenamiento Estándar (Regla de 3)
La interfaz se organiza ahora en 3 renglones lógicos para optimizar la velocidad de ingreso:
- **Renglón 1:** Forma de Llegada | Condición de Llegada | Fuente de Información.
- **Renglón 2:** Institución o Persona que Entrega | Teléfono Entregador | Establecimiento de Origen.
- **Renglón 3:** Acompañante | Parentesco | Teléfono Acompañante.

### 3. Lógica de Herencia Dinámica (Protocolo MSP)
- **Modo AMBULATORIO:**
  - `fuente_informacion` se fija en **"DIRECTA"**.
  - `persona_entrega` hereda automáticamente el nombre del paciente.
  - `telefono_entrega` hereda el celular/teléfono del paciente.
  - Estos campos se bloquean (read-only) con fondo gris para evitar errores.
- **Modos AMBULANCIA / OTRO:**
  - `fuente_informacion` se fija en **"INDIRECTA"**.
  - Se limpian y habilitan los campos para ingreso manual obligatorio.

### 4. Estándares UI/UX SIGEMECH
- **Validación:** Se implementó restricción de caracteres no numéricos y límite de 10 dígitos para todos los campos de teléfono.
- **Visual:** Uso de paleta **Azul/Oro**, etiquetas en MAYÚSCULAS y tipografía optimizada para entornos de emergencia.

### 4. Finalización de Pestaña 4 (Datos Adicionales e Inclusión)
- **Layout Simétrico:** Reestructuración en 4 renglones utilizando `grid-cols-3` para mantener la alineación vertical.
- **Lógica de Discapacidad:** Implementación de campos condicionales ([TIPO DE DISCAPACIDAD] [PORCENTAJE (%)]) que se activan solo con valor "SI", pero preservan el espacio de las columnas cuando el valor es "NO" para evitar saltos visuales.
- **Validación de Negocio:** Restricción legal de porcentaje (Rango 30% - 100%) con retroalimentación vía `ModalFeedback`.
- **Persistencia Automática:** El campo `carnet_discapacidad` ahora hereda automáticamente el número de documento del paciente, eliminando redundancia en el ingreso de datos.
- **Soberanía de Datos:** Normalización de todas las opciones de catálogos y etiquetas a MAYÚSCULAS.

### Unificación de Habilitación RPIS (Libro de Parto)
*   **Acceso Universal Neonatal:** Se selló la fuga de lógica para extranjeros y se garantizó la habilitación de la sección azul de **DATOS DE NACIMIENTO (LIBRO DE PARTO)** para cualquier paciente Neonato (Edad < 24h), independientemente de su tipo de identificación (Cédula o "No Identificado").
*   **Editable y Robusto:** Se aseguró que el campo **HORA DEL PARTO/NACIMIENTO** sea siempre editable para neonatos críticos, eliminando bloqueos por validaciones de ID incompleto o código de 17 dígitos en proceso.

### Optimización de Navegación UX (Cronología de Foco)
*   **TabIndex Experto:** Se ajustó la secuencia de navegación para que, tras ingresar la Fecha de Nacimiento (o las Horas de vida), el siguiente **TAB** posicione el cursor exactamente dentro del campo **HORA DEL PARTO/NACIMIENTO**.
*   **Re-enfoque de Corrección Rápida:** Si se dispara un error por fecha inválida o futura, el sistema mantiene automáticamente el foco en el campo de fecha tras presionar **ENTER** en el modal, permitiendo una corrección inmediata sin interrupciones de flujo.

## Actualización de Identificación Maestra y Flujo NN (2026-02-15)

### Unificación de Estado "Identificado"
*   **Soberanía de Identidad:** Se modificó `FormularioAdmisionMaestra.jsx` para que el sistema considere al paciente como plenamente "Identificado" tanto con una **Cédula de 10 dígitos** válida como con un **Código Normativo de 17 dígitos** generado para NN.
*   **Desbloqueo en Cascada:** Al completarse la generación del código de 17 dígitos (tras ingresar fecha y ubicación de nacimiento), se disparó automáticamente la habilitación (`setFormHabilitado(true)`) de todas las secciones del formulario (Residencia, Adicionales, Contacto, etc.), eliminando la disparidad con el flujo de Cédula.

### Persistencia de Lógica Condicional y Simetría
*   **Validaciones Cruzadas:** Se aseguró que validaciones específicas, como la obligatoriedad de "Cédula Madre" al seleccionar el "Centro de Salud Tipo C Chone" y la habilitación de flujos RPIS, funcionen de manera idéntica para ambos tipos de identificación.
*   **Habilitación Universal:** Los campos de frotend ahora detectan `esNoIdentificado || formHabilitado` para garantizar que el operador nunca encuentre bloqueos de edición una vez que el paciente tiene un identificador maestro (real o generado).

## Caracterización Étnica en Cascada (2026-02-15)

### Lógica Reactiva y UX de Bloqueo
*   **Carga Jerárquica:** Se implementó `useEffect` en la **Pestaña 4 (Sección BioSocial)** para automatizar la carga de catálogos filtrados: **Etnia (Autoidentificación) -> Nacionalidad Étnica -> Pueblo**.
*   **Escucha Activa de Etnia:** El sistema ahora detecta inmediatamente si la etnia seleccionada es **INDÍGENA** o **MONTUBIO** para disparar la carga de nacionalidades, reseteando campos dependientes al instante.
*   **Endpoints Dinámicos RESTful:** Se migraron las rutas a una estructura jerárquica: `/api/catalogs/etnias/:etnia_id/nacionalidades` y `/api/catalogs/nacionalidades/:nacionalidad_id/pueblos`, mejorando la semántica de la API.
*   **Blindaje de IDs:** Se aseguró que el mapeo de IDs sea estrictamente numérico (`Number(id)`) para evitar fallos de comparación entre tipos de datos (String vs Integer) al buscar en catálogos.
*   **UI Predictiva:** Los selectores muestran "Cargando..." durante peticiones activas y "N/A" solo cuando la jerarquía no lo requiere (ej. Mestizo), manteniendo una interfaz limpia y profesional.

### Cronología y Navegación Experta
*   **Simetría de Teclado:** Se implementó un esquema de `tabIndex` global (100-700) que abarca todas las secciones:
    *   100s: Identidad y Datos Personales.
    *   200s: Nacimiento y RPIS.
    *   300s: Residencia Habitual.
    *   400s: Datos Socio-Económicos.
    *   500s: Contacto de Emergencia.
    *   600s: Logística de Llegada.

## Finalización de Lógica de Inclusión (2026-02-15)
### Ocupación (CIUO) Dinámica
*   **Selector Dinámico:** Se convirtió el input de búsqueda de ocupación en un selector dinámico que consulta `cat_ocupaciones` vía `catalogService`.
*   **Soberanía de Datos:** El valor seleccionado se guarda como `id_ocupacion` en el estado global, asegurando la integridad referencial.

### Lógica de Discapacidad Obligatoria
*   **Campo Condicional Estricto:** Se refactorizó el checkbox de discapacidad a un selector obligatorio (SI/NO).
*   **Visibilidad y Limpieza:** La respuesta "NO" limpia y oculta automáticamente los campos dependientes.
*   **Autocompletado de Carné:** Al marcar "SI", el campo Nro. Carné se autocompleta con el número de identificación del paciente (cédula o código generado) pero permanece editable para ajustes manuales.
*   **Validación de Porcentaje:** Se implementó una validación estricta para que el porcentaje sea estrictamente numérico entre 0 y 100.

### Estandarización de Texto
*   **Normalización Global:** Se extendió el uso de `.toUpperCase()` a todos los campos de texto y áreas de texto para garantizar la soberanía de datos en toda la aplicación.
    *   700s: Motivo de Consulta.
*   **Flujo sin Ratón:** Este mapeo permite completar el registro de un paciente NN de 17 dígitos usando exclusivamente el teclado, garantizando que el botón "SIGUIENTE" y "FINALIZAR" sean accesibles secuencialmente.

## Reingeniería de Datos Adicionales e Identificación NN (2026-02-15)

### 1. Unificación de Datos Adicionales (Pestaña 4 y 5)
*   **Fusión de Secciones:** Se eliminó la Pestaña 5 (Inclusión) y se integraron sus campos (Discapacidad, Tipo, Porcentaje, Carné) dentro de la **Pestaña 4 (Datos Adicionales)**.
*   **Lógica Condicional:** Los campos de discapacidad ahora están ocultos por defecto y solo se despliegan mediante una transición visual si el usuario marca el selector `tiene_discapacidad`.
*   **Blindaje de Pestañas 1 y 2:** Se preservó intacta la lógica de identificación y el generador de 17 dígitos, cumpliendo con la Regla de Oro de Integridad.

### 2. Desbloqueo de Flujo NN (No Identificado)
*   **Acceso Automatizado:** Se implementó una lógica de desbloqueo inteligente en `FormularioAdmisionMaestra.jsx`. Si el paciente es identificado como **NN**, el sistema habilita automáticamente el acceso a las pestañas **4 (Adicionales)**, **6 (Contacto)** y **7 (Arribo)**, permitiendo su llenado obligatorio sin depender de la cédula.

### 3. Reparación de Residencia (Pestaña 3)
*   **Fluidez de Selectores:** Se eliminó el bloqueo estático de "Cargando datos..." en `SeccionResidencia.jsx`. Los selectores de Provincia, Cantón y Parroquia ahora cargan sus datos desde la base de datos de forma asíncrona y fluida, con validación de existencia para evitar errores de renderizado.

### 4. Conectividad Total de Catálogos
*   **Sincronización de Tablas:** Se vincularon los selectores de Autoidentificación, Nivel de Instrucción y Seguro de Salud a sus tablas maestras (`cat_etnias`, `cat_instruccion`, `cat_seguros_salud`).
*   **Buscador Dinámico CIUO:** El campo **Ocupación** fue transformado en un buscador reactivo que consulta la tabla `cat_ocupaciones` en tiempo real (debounce 300ms), optimizando la precisión de los datos socio-económicos.

## Corrección de Flujo de Props y Refactorización de Pestañas (2026-02-15)

### 1. Corrección de Prop Drifting y UI Crashing
*   **SeccionResidencia.jsx:** Se corrigió el error `TypeError: setFormData is not a function` asegurando la correcta desestructuración de `setFormData` en los props del componente.
*   **FormularioAdmisionMaestra.jsx:** Se vinculó explícitamente `setFormData={setFormData}` al renderizar la sección de residencia, garantizando que el estado sea actualizable tras seleccionar un país.

### 2. Solución al Conflicto de Renderizado (Bad setState)
*   **SeccionNacimiento.jsx:** Se refactorizó la lógica de limpieza geográfica. Las actualizaciones de estado disparadas por cambios en la nacionalidad (blindaje de extranjeros) ahora se ejecutan dentro de un `useEffect` con guardas de valor, evitando el error de React sobre actualizaciones de estado durante el renderizado.

### 3. Reordenamiento Estructural de Pestañas (3 a 7)
Se cumplió con la nueva jerarquía de navegación para la Admisión 008:
1.  **Personales**
2.  **Nacimiento**
3.  **Residencia** (Ubicación habitual, carga dinámica de `cat_paises` y `cat_provincias`).
4.  **Adicionales** (Fusión de datos socio-económicos e inclusión/discapacidad).
5.  **Contacto Emergencia**
6.  **Arribo/Condición**
7.  **Motivo Consulta**

### 4. Blindaje y Estabilidad
*   **Pestañas 1 y 2:** Se mantuvo intacta la lógica de identificación y el generador de 17 dígitos.
*   **Navegación NN:** Se habilitó la navegación hacia la pestaña de "Nacimiento" incluso para pacientes No Identificados para permitir la recolección de datos mínima para el código maestro.

## Normalización de Identificación y Estabilización de Residencia (2026-02-15)

### 1. Restauración de `cat_tipos_identificacion`
*   **Cambio de Origen:** Se redirigió el selector de la Pestaña 1 para utilizar la tabla oficial `cat_tipos_identificacion`, abandonando el uso de `cat_tipos_documento`.
*   **Campos en Minúsculas:** Se normalizó el acceso a los campos `id` y `nombre` en minúsculas en todos los componentes vinculados (`SeccionIdentidad.jsx`, `FormularioAdmisionMaestra.jsx`, `SeccionResidencia.jsx`).
*   **Integridad de Lógica:** Se blindó la lógica de generación de 17 dígitos y validaciones de nacionalidad para que funcionen con el catálogo restaurado.

### 2. Reparación Definitiva de Comunicación (setFormData)
*   **Solución a `setFormData`:** Se corrigió el error `TypeError: setFormData is not a function` en `SeccionResidencia.jsx`. Se aseguró que `FormularioAdmisionMaestra.jsx` pase correctamente los props `formData` y `setFormData` a todas las secciones.
*   **Carga de Catálogos:** Se verificó la carga fluida de catálogos de Provincia, Cantón y Parroquia en la Pestaña 3, evitando pantallas en blanco.

### 3. Normalización de Backend y Soberanía de Datos
*   **Controlador de Admisión:** Se refactorizó `admissions_controller.js` para utilizar nombres de campos en minúsculas (`numero_documento`, `id_paciente`, `id_usuario_admision`), eliminando el camelCase residual.
*   **Estabilidad:** Se preservó intacta la lógica de negocio para los 17 dígitos, validación de nacionalidad y generador de códigos.

## Implementación del Tridente Étnico Jerárquico (2026-02-15)

### 1. Reingeniería de la Pestaña 4 (Datos Adicionales)
*   **Rediseño Grid MSP:** Se reorganizó el primer renglón de la Pestaña 4 en un grid responsivo de 3 columnas (Autoidentificación, Nacionalidad Étnica y Pueblo), alineado al estándar del Formulario 001 MSP.
*   **Lógica de Dependencia (Cascading):**
    *   **Nacionalidad:** El selector se habilita únicamente tras elegir una Etnia y carga dinámicamente las opciones vinculadas (`cat_nacionalidades_etnicas` via `etnia_id`).
    *   **Pueblo:** El selector carga exclusivamente los pueblos vinculados a la nacionalidad elegida (`cat_pueblos_etnicos` via `nacionalidad_id`).
*   **Visibilidad Condicional y Blindaje:** Se implementó una regla de exclusión normativa. Si la etnia seleccionada es **"MESTIZO"**, **"BLANCO/A"**, **"NEGRO/A"** u **"OTRO/A"**, los campos de Nacionalidad y Pueblo se inhabilitan automáticamente (mostrando "N/A") y sus valores se resetean en el estado global para evitar persistencia de datos inconsistentes.

### 2. Estabilización de Servicios y Persistencia
*   **Catalog Service:** Se actualizaron los endpoints en `catalogService.js` para apuntar a las rutas correctas del backend (`/autoidentificaciones-etnicas/:id` y `/pueblos/:id`).
*   **Persistencia de IDs:** Se garantizó que los componentes hijos utilicen `setFormData` (pasado desde el padre) para guardar los IDs correspondientes en el objeto maestro, asegurando que la tabla `pacientes` reciba la jerarquía étnica completa en el guardado final.

## Restauración de Lógica Jerárquica Étnica (2026-02-15)

### 1. Estabilización del Backend (Anti-503)
*   **Validación de Parámetros:** Se modificó `catalogs_controller.js` para interceptar peticiones con `etnia_id` o `nacionalidad_id` como `undefined` o `null`. En lugar de fallar con un Error 503, el sistema ahora responde con un arreglo vacío `[]` y status 200, garantizando la resiliencia del frontend.

### 2. Sincronización Reactiva (Frontend)
*   **Reseteo Automático:** Se implementó un `useEffect` en `SeccionDatosAdicionales.jsx` que reacciona exclusivamente al cambio de `id_etnia`. Al cambiar la etnia, se limpian automáticamente los campos de `id_nacionalidad_etnica` e `id_pueblo` para prevenir inconsistencias de datos.
*   **Servicio Robusto:** Se añadió una guarda en `catalogService.js` para evitar llamadas a la API si el ID proporcionado es nulo, reforzando la comunicación cliente-servidor.

### 3. UI Dinámica y Guía al Usuario
*   **Estados de Carga:** Se integraron mensajes dinámicos en los selectores ("Seleccione Etnia primero", "Cargando...", etc.) para guiar al usuario a través del flujo jerárquico.
*   **Bloqueo de Seguridad:** Los selectores de Nacionalidad y Pueblo se mantienen bloqueados hasta que su predecesor jerárquico tenga un valor válido, manteniendo la integridad visual del tridente étnico.

## Estabilización de Hooks y Jerarquía Étnica (2026-02-15)

### 1. Reparación de Dependencias React (useEffect)
*   **Estabilización de Hooks:** Se corrigió el error crítico `"The final argument passed to useEffect changed size between renders"` en `SeccionDatosAdicionales.jsx`. Se eliminó el objeto dinámico `etnias` del arreglo de dependencias, utilizando únicamente `formData.id_etnia` como disparador atómico.
*   **Regla de Oro de Hooks:** Se implementó `eslint-disable-next-line react-hooks/exhaustive-deps` tras validar que el catálogo de etnias es estático una vez cargado el componente, evitando re-ejecuciones infinitas o errores de tamaño en el arreglo de dependencias.

### 2. Optimización de Asociación Cascada (Etnia -> Nacionalidad)
*   **Reseteo Atómico:** Al cambiar la **Etnia**, el sistema ahora ejecuta un reseteo inmediato y obligatorio de `id_nacionalidad_etnica` e `id_pueblo` en el estado global (`setFormData`), previniendo asociaciones erróneas (ej. un "Mestizo" con pueblo "Shuar").
*   **Gestión de Respuestas Vacías:** Si la etnia seleccionada requiere cascada (Indígena/Montubio) pero el backend no devuelve datos, el selector de Nacionalidad se inicializa con un arreglo vacío, permitiendo que la UI maneje el estado de "No registra" de forma elegante sin romper el flujo.

## Implementación de Cascada Étnica Estricta (2026-02-15)

### 1. Backend: Filtrado por Query String
*   **Controladores Blindados:** Se actualizó `catalogs_controller.js` para que los métodos `getEthnicNationalities` y `getEthnicGroups` acepten parámetros por query string (`etnia_id`, `nacionalidad_id`).
*   **Cascada Estricta:** Se implementó una guardia que devuelve un arreglo vacío `[]` si no se proporciona el ID padre, evitando fugas de datos y garantizando que la jerarquía se respete a nivel de base de datos (WHERE id_padre = ?).

### 2. Frontend: Vigilancia de Dependencias (Hooks)
*   **useEffect de Nivel 1 (Etnia):** Se configuró un observador sobre `formData.id_etnia` que limpia automáticamente `id_nacionalidad_etnica` e `id_pueblo` ante cualquier cambio, disparando la petición `GET /api/catalogs/nacionalidades?etnia_id=X` específicamente cuando el ID es 1 (Indígena) o según reglas de negocio.
*   **useEffect de Nivel 2 (Nacionalidad):** Se implementó un observador sobre `formData.id_nacionalidad_etnica` para limpiar `id_pueblo` y disparar la petición `GET /api/catalogs/pueblos?nacionalidad_id=Y` al seleccionar una nacionalidad (ej. KICHWA).
*   **Integración con catalogService:** Se normalizaron las llamadas en el servicio para usar el formato de query string requerido por la tarea, manteniendo la compatibilidad con los endpoints RESTful.

## Saneamiento de Catálogo Étnico (2026-02-15)

### 1. Corrección de Origen de Datos (Pestaña 4)
*   **Separación de Conceptos:** Se corrigió el error donde el selector de nacionalidad étnica cargaba gentilicios de países (ej. ARGENTINA) desde `cat_nacionalidades`.
*   **Nueva Tabla Maestra:** Se implementó el modelo `NacionalidadEtnica` vinculado a la tabla `cat_etnias_nacionalidades`, asegurando que para etnias indígenas se carguen valores correctos como **KICHWA, SHUAR, ACHUAR**, etc.
*   **Mapeo de Pueblos (Nivel 2):** Se ajustó la relación de la tabla `cat_pueblos` para que su filtro por `nacionalidad_id` apunte a la nueva tabla de nacionalidades étnicas en lugar de la tabla de países.

### 2. Blindaje de Integridad
*   **Regla de Oro:** Se mantuvo intacta la lógica de identificación y generación del código de 17 dígitos en las Pestañas 1 y 2, asegurando que el cambio en el catálogo étnico no afecte la identificación legal del paciente.
*   **Limpieza de UI:** Se validó que al elegir "Indígena", el selector se pueble exclusivamente con nacionalidades étnicas, eliminando la contaminación de datos de países en la sección biosocial.

## Divorcio de Catálogos de Nacionalidades (2026-02-15)

### 1. Desacoplamiento de Origen (Backend)
*   **Segmentación de Tablas:** Se estableció que el selector de "Nacionalidad" en la Pestaña 4 debe consumir ÚNICAMENTE la tabla `cat_etnias_nacionalidades`, separándola definitivamente de `cat_nacionalidades` (que contiene gentilicios de países).
*   **Filtrado Estricto:** Se corrigió el controlador `getEthnicNationalities` para filtrar registros por `etnia_id`, eliminando la dependencia de flags de actividad innecesarios y asegurando la integridad del tridente étnico.

### 2. Sincronización de Servicio (Frontend)
*   **Catalog Service:** Se actualizó `getEthnicNationalities` en `catalogService.js` para apuntar al endpoint `/catalogs/autoidentificaciones-etnicas`, garantizando que la petición llegue a la tabla de etnias y no a la de países.
*   **Cascada de Pueblos:** Se reforzó la lógica en `SeccionBioSocial.jsx` para que el selector de "Pueblo" filtre correctamente la tabla `cat_pueblos` utilizando el ID de la nacionalidad étnica seleccionada (ej. KICHWA -> Pueblos Kichwas).
*   **Gestión de Estados:** Se implementó el uso de `null` for el reseteo de campos dependientes (`id_nacionalidad_etnica`, `id_pueblo`), asegurando una persistencia limpia en la base de datos cuando los campos dejan de aplicar.

### 3. Blindaje de Identificación
*   **Inviolabilidad de Pestañas 1 y 2:** Se preservó intacta la nacionalidad de origen (país) en la Pestaña 1. El sistema ahora distingue correctamente entre la **Nacionalidad Legal** (País de origen) y la **Nacionalidad Étnica** (Identidad cultural), cumpliendo con el protocolo de caracterización biosocial del MSP.

## Refinamiento de Caracterización Étnica y UX (2026-02-15)

### 1. Mejoras en Etiquetas y Mensajería Dinámica
*   **Etiquetas Descriptivas:** Se cambió el label de "NACIONALIDAD" a **"NACIONALIDAD ÉTNICA"** en la Pestaña 4 para evitar confusiones con la nacionalidad legal.
*   **Guía al Usuario:** Se implementaron mensajes dinámicos en los selectores:
    *   Muestra "Seleccione Etnia primero" si no se ha elegido una etnia.
    *   Muestra "Seleccione Nacionalidad primero" en el campo de Pueblo si la nacionalidad étnica está vacía.
    *   Muestra **"No Aplica (N/A)"** explícitamente cuando la etnia seleccionada (Mestizo, Blanco) no requiere caracterización jerárquica.

### 2. Lógica de Estados y Blindaje Visual
*   **Navegación Asistida:** Se implementó un flujo de habilitación secuencial estricto: **Etnia -> Nacionalidad Étnica -> Pueblo**. Cada campo solo se habilita cuando su predecesor tiene un valor válido.
*   **Blindaje de "No Aplica":** Si se selecciona una etnia como "Mestizo/a" o "Blanco/a", los campos de Nacionalidad Étnica y Pueblo permanecen deshabilitados pero con el texto "No Aplica (N/A)".
*   **Estética Profesional:** Se aplicó un estilo CSS (`disabled:bg-gray-200`) para que el fondo de los campos bloqueados se vea gris claro, indicando visualmente que no son interactuables.

## Solución de Renderizado y Consistencia de Datos (2026-02-15)

### 1. Solución al Error de Renderizado (Bad setState)
*   **SeccionNacimiento.jsx:** Se identificó y corrigió un error donde la actualización de campos geográficos (Provincia, Cantón, Parroquia) al cambiar la nacionalidad a extranjera se realizaba durante el ciclo de renderizado.
*   **Refactorización a useEffect:** Se migraron estas limpiezas de estado a un hook `useEffect` con dependencias específicas, garantizando que los cambios de estado ocurran de forma segura fuera del renderizado principal, eliminando el warning crítico de React.

### 2. Implementación de Jerarquía Étnica Exitosa
*   **Flujo Cascada Robusto:** Se consolidó el tridente **Etnia -> Nacionalidad Étnica -> Pueblo**. El sistema ahora maneja correctamente la carga asíncrona de sub-catálogos y el reseteo de campos dependientes.
*   **Integración de Datos:** Se aseguró que los IDs seleccionados persistan correctamente en el estado maestro del `FormularioAdmisionMaestra`, permitiendo su almacenamiento íntegro en la base de datos.

### 3. Normalización a MAYÚSCULAS y Bitácora
*   **Transformación en Frontend:** Se inyectó una lógica de transformación automática en la función `handleChange` global. Todo contenido ingresado en campos de tipo `text` o `textarea` se convierte instantáneamente a **MAYÚSCULAS**, garantizando uniformidad en la base de datos sin esfuerzo adicional del operador.
*   **Blindaje en Backend:** Se implementó `uppercase_middleware.js` y se registró globalmente en `app.js`. Este middleware actúa como una segunda capa de seguridad, normalizando recursivamente todos los strings recibidos en el cuerpo de las peticiones (`req.body`) a mayúsculas antes de llegar a los controladores.

## Simplificación UI y Refactorización Pestaña 1 (2026-02-15)

### 1. Limpieza de Header y Branding
*   **Eliminación de Redundancias:** Se eliminó el bloque de título externo "Admisión de Pacientes (008)" y su descripción para optimizar el espacio vertical.
*   **Navbar Azul:** Se actualizó el título interno a "ADMISION DE PACIENTES" (mayúsculas y sin números normativos).
*   **Identidad Institucional:** Se actualizó el nombre del establecimiento a: **"CENTRO DE SALUD CHONE TIPO C"**.

### 2. Arquitectura de Información Ágil (Pestaña 1)
*   **Reorganización en Grid:** Se implementó un nuevo orden lógico de campos para permitir un llenado fluido de arriba hacia abajo:
    *   **Fila 1:** Identificación (Tipo y Número lado a lado).
    *   **Fila 2:** Apellidos (Primer y Segundo).
    *   **Fila 3:** Nombres (Primer y Segundo).
    *   **Fila 4:** Bio-Civiles (Sexo, Género y Estado Civil en un solo nivel).
    *   **Fila 5:** Contacto (Celular y Correo Electrónico).
*   **Navegación Fluida:** Se recalibraron los `tabIndex` (101-111) para garantizar que el operador pueda navegar todo el formulario usando exclusivamente la tecla TAB sin saltos erráticos.
*   **Estética:** Se estandarizaron los gaps (4 o 6) y se eliminaron los títulos de sección redundantes, logrando una interfaz más compacta y profesional.

## Evolución de Identidad Visual y Limpieza Absoluta (2026-02-15)

### 1. Nueva Identidad Local (Navbar)
*   **Denominación Final:** Se ha actualizado la identidad del sistema en el **Navbar** global a: **"SIGEMECH | SISTEMA GESTION DE EMERGENCIAS CHONE"**.
*   **Limpieza Normativa:** Se eliminó definitivamente el identificador numérico **"(008)"** de la barra superior y de los nombres de los módulos en el menú lateral.
*   En vistas reducidas (móvil), el sistema se identifica como **"SIGEMECH | SGE"**.

### 2. Minimalismo y Optimización de Espacio (Banner Azul)
*   **Reubicación de Descripción:** Se movió el texto "Registro completo de filiación según Formulario 001 MSP." al interior del banner azul, posicionándolo justo debajo del título principal "ADMISION DE PACIENTES" con un estilo refinado (`text-[10px]` / `text-blue-100`).
*   **Limpieza Total Superior:** Se eliminaron definitivamente todas las etiquetas `<h1/h2>` y `<p>` redundantes que renderizaban títulos o descripciones fuera del contenedor principal en `Dashboard.jsx`.
*   **Máximo Espacio Útil:** Se redujo el margen superior (`mt-2`) del contenedor principal para acercar el banner azul a la Navbar, maximizando el área de trabajo disponible para los formularios.

### 3. Refactorización de Establecimientos y Red RPIS (2026-02-16)
*   **Filtrado por Unicódigo:** Se sustituyó la búsqueda manual por nombre literal por una validación estricta usando el **CODIGO_LOCAL ('001248')**.
*   **Regla de Oro de Capacidad Dual:** El selector de establecimientos de transferencia ahora valida dinámicamente según la edad neonatal:
    *   **Si < 24h:** Se permiten centros con **SALA DE PARTO** o **QUIRÓFANO** (habilitando al Centro Local '001248').
    *   **Si > 24h:** Se restringe exclusivamente a centros con **QUIRÓFANO** por seguridad técnica.
*   **Priorización Territorial:** Se implementó un algoritmo de ordenamiento dinámico que posiciona primero al establecimiento local (bajo regla de <24h), seguido de los centros del cantón **CHONE** y finalmente el resto en orden alfabético.
*   **Normalización de Interfaz:** Se actualizó el label del selector al formato normativo `${codigo_unico} - ${nombre}` forzado a **MAYÚSCULAS**.

### 3. Refactorización de Establecimientos y Red RPIS (2026-02-16)
*   **Filtrado por Unicódigo:** Se sustituyó la búsqueda manual por nombre literal por una validación estricta usando el **CODIGO_LOCAL ('001248')**.
*   **Regla de Oro de Capacidad Dual:** El selector de establecimientos de transferencia ahora integra la capacidad de **SALA DE PARTO** para el nivel local:
    *   **Si es < 24h:** Se muestran todos los establecimientos que tengan **SALA DE PARTO** (habilitando al Centro Local '001248' - CHONE).
    *   **Si es > 24h:** Se restringe exclusivamente a centros con **QUIRÓFANO** (ocultando automáticamente a Chone por seguridad técnica).
*   **Priorización Territorial:** Se implementó un algoritmo de ordenamiento dinámico que posiciona primero al establecimiento local (**CHONE**), seguido de los centros del cantón Chone y finalmente el resto en orden alfabético.
*   **Normalización de Interfaz:** Se actualizó la visualización del selector al formato normativo `${codigo_unico} - ${nombre}` forzado a **MAYÚSCULAS**.

## Integración End-to-End de Catálogos (2026-02-15)

### 1. Catálogo de Estado de Nivel de Instrucción
*   **Backend:** Se implementó el endpoint `GET /api/catalogs/estado-nivel-instruccion` en `catalogs_routes.js` y su respectivo controlador en `catalogs_controller.js`.
*   **Modelo de Datos:** Se registró el modelo `EstadoNivelInstruccion` vinculado a la tabla `cat_estado_nivel_instruccion`, permitiendo la recuperación de estados (CURSANDO, COMPLETA, etc.) filtrados por `esta_activo = 1` y ordenados alfabéticamente.
*   **Comunicación Exitosa:** Se verificó la integridad del flujo end-to-end mediante pruebas de consumo directo (CURL), confirmando que el frontend recibe el JSON correctamente para poblar los selectores de la Pestaña 4.

## Sincronización de Catálogo: Tipo de Empresa (2026-02-15)

### 1. Backend: Normalización y Exposición
*   **Modelo de Datos:** Se integró el modelo `TipoEmpresa` vinculado a la tabla `cat_tipos_empresa` en `catalog_models.js`, con soporte para el campo `esta_activo`.
*   **Controlador Fail-Safe:** Se implementó la función `obtenerTiposEmpresa` en `catalogs_controller.js`, utilizando el helper `safeFindAll` para garantizar estabilidad ante modelos no cargados.
*   **Endpoint REST:** Se expuso la ruta `GET /api/catalogs/tipos-empresa` en `catalogs_routes.js`.

### 2. Frontend: Eliminación de Inputs Manuales (Pestaña 4)
*   **Catalog Service:** Se incluyó la llamada al nuevo endpoint dentro de `getAllCatalogs()`, permitiendo la precarga del catálogo al iniciar el formulario de admisión.
*   **UI Dinámica:** En `SeccionDatosAdicionales.jsx`, se reemplazó el campo de texto libre "TIPO DE EMPRESA" por un selector `<select>` vinculado al catálogo oficial.
*   **Persistencia:** El valor seleccionado se mapea y guarda correctamente en la propiedad `formData.id_tipo_empresa`, eliminando definitivamente la entrada manual y garantizando la integridad de los datos socio-económicos.

## Simetría Total en Datos Adicionales e Integración de Ocupación (2026-02-15)

### 1. Reestructuración de Grid (Regla de 3)
- **Simetría Visual:** Se reorganizó el tercer renglón de la **Pestaña 4 (Sección BioSocial)** para que los campos **Seguro de Salud**, **Tipo de Empresa** y la pregunta **"¿Presenta Discapacidad?"** compartan el mismo renglón (`grid-cols-3`).
- **Alineación:** Se estandarizaron las alturas de los inputs y selectores (h-8) para garantizar una alineación visual perfecta.

### 2. Integración de Ocupación (CIUO) con Buscador Filtrable
- **Selector Inteligente:** Se reemplazó el input de texto manual por un componente de búsqueda reactiva que consume el catálogo `cat_ocupaciones`.
- **UX de Alta Productividad:** Implementación de un dropdown filtrable con soporte para búsqueda dinámica (Search-as-you-type) y cierre al hacer clic fuera del componente.
- **Normalización:** Los resultados se muestran y guardan automáticamente en MAYÚSCULAS.

### 3. Lógica de Discapacidad y Carné Automatizado (Regla de 3 Columnas)
- **Selector Obligatorio:** Se transformó el checkbox de discapacidad en un selector `SI/NO` obligatorio integrado en el tercer renglón (Grid 3 columnas).
- **Carga de Identidad:** Al seleccionar "SÍ", el campo **Nro. Carné** se pre-puebla automáticamente con el número de identidad del paciente (cédula o código generado) desde el estado global, permitiendo edición manual si es necesario.
- **Campos Condicionales (Simetría):** Se despliega un renglón adicional con **Tipo de Discapacidad**, **Porcentaje** y **Nro. Carné** alineados en un contenedor `grid-cols-1 md:grid-cols-3 gap-2`.
- **Gestión de Limpieza:** Al seleccionar "NO", el sistema oculta los campos de detalle y limpia los valores de `id_tipo_discapacidad`, `porcentaje_discapacidad` y `carnet_discapacidad` para evitar basura en el payload.

### 4. Estándares UI SIGEMECH y Validación
- **Paleta Azul/Oro:** Se mantiene el esquema institucional con bordes definidos y fondos suaves en secciones condicionales.
- **Soberanía Lingüística:** Se aplica transformación a MAYÚSCULAS en todo ingreso de texto manual.
- **Validación de Rango:** El campo Porcentaje solo acepta valores numéricos entre 0 y 100.

## Validación de Ocupación y Blindaje Normativo de Discapacidad (2026-02-15)

### 1. Consumo de Ocupación (CIUO)
- **Migración a Selector:** Se configuró el componente `<select>` de OCUPACIÓN para consumir directamente el endpoint `/api/catalogs/ocupaciones`.
- **Integridad Referencial:** Los datos se mapean desde `cat_ocupaciones` (id, nombre) y el valor seleccionado se vincula a `formData.id_ocupacion`.

### 2. Blindaje Normativo de Discapacidad (MSP/CONADIS)
- **Rango de Registro:** Se implementó una validación estricta en el campo **PORCENTAJE (%)**. El sistema ahora solo permite registros desde el **30%** hasta el **100%**.
- **Intercepción de Error:** Si el usuario intenta ingresar un valor menor al 30%, se dispara un `ModalFeedback` con el mensaje: *"ERROR NORMATIVO: La discapacidad solo es registrable desde el 30% según MSP/CONADIS"*, y se limpia el campo automáticamente.
- **Autocompletado de Cédula:** Se mantiene la funcionalidad de auto-carga del número de documento en el campo **NRO. CARNET** cuando el usuario selecciona "SÍ" en la pregunta de discapacidad.

### 3. Estética y Soberanía Lingüística
- **Mayúsculas Mandatorias:** Se verificó y aseguró que todos los labels y opciones de los selectores en la sección Bio-Social estén renderizados en MAYÚSCULAS.
- **Simetría Visual:** Se consolidó el diseño de **3 Columnas** en todos los renglones de la sección para mantener la coherencia estética "Azul/Oro" del sistema SIGEMECH.

## Saneamiento Estructural y Simetría de Inclusión (2026-02-15)

### 1. Pestaña 1 (Datos Personales): Eliminación de Género
- **Simplificación Identitaria:** Se ELIMINÓ definitivamente el campo **GÉNERO** de la interfaz y del estado del formulario, siguiendo la directriz de simplificación administrativa.
- **Reorganización Simétrica:** Los campos **SEXO** y **ESTADO CIVIL** han sido reorganizados en un `grid-cols-2` simétrico, eliminando el espacio vacío y optimizando el flujo visual de la primera pestaña.

### 2. Pestaña 4 (Datos Adicionales): Reingeniería de Renglones
- **Renglón 3 (Simétrico):** Se alinearon en tres columnas exactas los campos: **[SEGURO DE SALUD]**, **[TIPO DE EMPRESA]** y el nuevo campo **[¿RECIBE ALGÚN BONO?]**.
- **Renglón 4 (Discapacidad Dinámica):**
    - Se implementó una lógica de visualización simétrica: La columna 1 contiene la pregunta **"¿PRESENTA ALGUNA CONDICIÓN DE DISCAPACIDAD?"**.
    - Si la respuesta es **"SI"**, se habilitan dinámicamente las columnas 2 y 3 para **[TIPO DE DISCAPACIDAD]** y **[PORCENTAJE (%)]**.
    - Si la respuesta es **"NO"**, se mantienen las posiciones 2 y 3 vacías (`invisible`) para asegurar que la alineación vertical con los renglones superiores permanezca intacta.
- **Eliminación de Redundancia:** Se eliminó el campo "NRO. CARNÉ/CONADIS" de la interfaz de usuario.

### 3. Validaciones de Negocio y Persistencia
- **Blindaje Normativo:** Se estableció un rango obligatorio de **[30 - 100]** para el porcentaje de discapacidad. Cualquier valor menor a 30 dispara un `ModalFeedback` con la advertencia: *"NORMATIVA LEGAL: REGISTRO DESDE EL 30%"* y limpia el campo.
- **Persistencia Automática:** Se implementó un `useEffect` de alta prioridad que copia automáticamente el **'numero_documento'** (Cédula/NN) al campo **'carnet_discapacidad'** en el estado global, asegurando la integridad referencial en la base de datos sin intervención del usuario.
- **Catálogo de Ocupaciones:** Se verificó que el selector de Ocupación consuma correctamente el catálogo `cat_ocupaciones` de la base de datos.

### 4. Estándares Visuales y Soberanía
- **Normalización Manual:** Todo ingreso de texto manual en el formulario se transforma automáticamente a **MAYÚSCULAS** mediante el controlador de eventos `handleChange`.
- **Notificaciones:** Se ratifica el uso exclusivo de `ModalFeedback` para toda comunicación con el usuario, quedando prohibido el uso de `alert()` nativo.

## Resolución de Errores Críticos y Estabilización (2026-02-15)

### 1. Backend: Reparación de Consulta Raw de Sequelize (Error 500)
- **Corrección de Metadatos:** Se resolvió el fallo "TypeError: Cannot delete property 'meta'" en el catálogo de bonos (`catalogs_controller.js`).
- **Implementación:** Se integró `{ type: QueryTypes.SELECT }` en todas las consultas raw (`sequelize.query`) para asegurar que Sequelize con MariaDB devuelva un arreglo limpio de resultados, evitando el crash por intento de manipulación de metadatos.

### 2. Frontend: Estabilización de Hooks y Grid Vertical
- **Soberanía de Hooks:** Se refactorizó `SeccionDatosAdicionales.jsx` moviendo **TODOS** los hooks (`useState`, `useEffect`, `useRef`) al inicio del componente, eliminando el error de "changed size between renders".
- **Alineación Vertical Fija:** Se implementó un grid de 3 columnas fijo en el **Renglón 4**. El espacio de los campos de discapacidad se preserva mediante contenedores con `min-h`, garantizando que la alineación vertical no sufra saltos visuales cuando los campos están ocultos.

### 3. Limpieza de Identidad y Base de Datos
- **Eliminación de `carnet_discapacidad`:** Se eliminó definitivamente cualquier referencia, lógica de persistencia o campo relacionado con `carnet_discapacidad` en el modelo de Paciente, Controladores y Formularios, tras confirmarse su eliminación de la estructura de MariaDB. El sistema utiliza ahora el número de documento como identificador único suficiente.
- **Validación Normativa:** Se ratificó la restricción legal para porcentajes de discapacidad (mínimo 30%) con retroalimentación vía `ModalFeedback`.

## 📋 REFACTORIZACIÓN PESTAÑA 6 (FORMULARIO 008 MSP) - 2026-02-15 (ACTUALIZADO)

Se ha completado la refactorización profunda de la **Pestaña 6 (Logística de Llegada)** y **Pestaña 7 (Motivo)** para cumplir estrictamente con el Protocolo 008 del MSP.

### 1. Reparación Crítica y Estabilidad
- **JSX Fix:** Se resolvió el error de sintaxis "Adjacent JSX elements must be wrapped in an enclosing tag" en `SeccionLlegadaMotivo.jsx` mediante el uso correcto de fragmentos y contenedores `div`.
- **Eliminación de Fecha Manual:** Se eliminó definitivamente el campo "FECHA INGRESO". La marca de tiempo se genera automáticamente en el backend como `fecha_ingreso` y `hora_ingreso` para garantizar la integridad de la auditoría.

### 2. Reordenamiento Protocolo 008 (Regla de 3)
La interfaz se organiza en 3 renglones optimizados:
- **Renglón 1:** [FORMA DE LLEGADA] [FUENTE DE INFORMACIÓN] [ESTABLECIMIENTO DE ORIGEN].
- **Renglón 2:** [INSTITUCIÓN O PERSONA QUE ENTREGA] [N° TELÉFONO DEL ENTREGADOR] [CONDICIÓN DE LLEGADA].
- **Renglón 3:** [ACOMPAÑANTE] [PARENTESCO] [TELÉFONO ACOMPAÑANTE].

### 3. Lógica de Herencia Inteligente (Automatización)
- **Modo AMBULATORIO:**
    - **Fuente de Información:** Se fija automáticamente en **"DIRECTA"**.
    - **Persona que entrega:** Hereda automáticamente los nombres completos del paciente de la Pestaña 1.
    - **Teléfono del entregador:** Hereda el celular/teléfono del paciente.
    - **Blindaje:** Estos campos se bloquean (read-only) con fondo gris para evitar redundancia y errores de ingreso.
- **Modo AMBULANCIA/OTRO:**
    - **Fuente de Información:** Se fija en **"INDIRECTA"**.
    - **Limpieza:** Se limpian y habilitan los campos para ingreso manual OBLIGATORIO del personal de salud o paramédicos.

### 4. Estándares UI/UX SIGEMECH
- **Soberanía Lingüística:** Todo texto se transforma automáticamente a **MAYÚSCULAS**.
- **Validación de Teléfonos:** Restricción estricta de solo números y máximo 10 dígitos para todos los campos de contacto.
- **Identidad Visual:** Aplicación de paleta **Azul/Oro** y tipografía de alta legibilidad para entornos de emergencia.

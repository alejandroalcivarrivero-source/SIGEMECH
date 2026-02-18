# Reporte de Auditoría de Soberanía Lingüística y Técnica - SIGEMECH

**Fecha:** 18 de Febrero, 2026
**Auditor:** Senior MariaDB / Arquitecto de Software Senior
**Estado General:** ⚠️ **CRÍTICO - ESQUIZOFRENIA LINGÜÍSTICA DETECTADA**

Este reporte detalla los hallazgos de la auditoría de código fuente, enfocándose en la normalización lingüística (Español Técnico), la consistencia de modelos de datos y la detección de deuda técnica ("cables sueltos").

---

## 1. Escaneo de Modelos (Soberanía de Datos)

**Hallazgo Principal:** Los modelos de Sequelize no reflejan fielmente la estructura de la base de datos o están incompletos, confiando en "magia" o código legacy en inglés.

*   **`backend/src/modules/pacientes/paciente_model.js`**: 🚨 **CABLE SUELTO GRAVE**.
    *   El archivo contiene un comentario `// ... otros campos` en lugar de definir las columnas. Esto significa que la aplicación está funcionando "a ciegas" o hay otro archivo definiendo esto.
    *   **Acción Requerida:** Definir explícitamente todas las columnas (`primer_nombre`, `segundo_nombre`, `cedula`, etc.) eliminando cualquier dependencia implícita.

*   **`backend/src/modules/users/user_model.js`**:
    *   Uso redundante o correctivo de `field:`.
    *   Ejemplo: `field: 'correo'` (¿La propiedad del objeto es `email`?).
    *   **Acción Requerida:** Refactorizar para que la propiedad del modelo sea idéntica a la columna: `usuario.correo` -> columna `correo`. Eliminar `field:` excepto cuando sea estrictamente necesario por palabras reservadas.

*   **`backend/src/modules/admissions/admission_model.js`**:
    *   Se detectó uso de `reasonForConsultation` en el controlador, lo que implica que el modelo tiene propiedades en inglés mapeadas a `motivo_consulta` (o similar) en la BD.

---

## 2. Limpieza de Controladores (Deuda Técnica)

**Hallazgo Principal:** Los controladores actúan como "traductores" de mala calidad, parcheando datos mal nombrados que vienen del frontend o modelos incorrectos.

*   **`backend/src/modules/admissions/admissions_controller.js`**:
    *   **Línea 63 (Adivinanza de Campos):**
        ```javascript
        const motivoConsulta = admissionData.motivoAtencion || admissionData.motivo_consulta || admissionData.reasonForConsultation;
        ```
        *Esto es inaceptable.* El sistema no debe "adivinar" qué campo usar. Debe haber una única verdad (Soberanía).
    *   **Mezcla de Idiomas:**
        *   Uso de `pacienteData.documentNumber` (Inglés) vs `pacienteData.cedula` (Español esperado).
        *   Uso de `firstName1` y `lastName1` en la respuesta de `validarMaterna` (Línea 221), mientras el resto del sistema intenta hablar español.
    *   **Validaciones en Controlador:**
        *   Líneas 48-58: Validación de `parishId`, `canton_id`. Mezcla de `camelCase` y `snake_case`.

---

## 3. Verificación de Catálogos

**Estado:** 🟡 **PARCIALMENTE CUMPLE**

*   **Rutas:** Las rutas están correctamente prefijadas con `/api/catalogos/` (`catalogs_routes.js`).
*   **Funciones:**
    *   ✅ `getProvincias`, `getCantones`, `getParroquias`.
    *   ❌ `getEthnicNationalities` (Inglés).
    *   ❌ `getEthnicGroups` (Inglés).
    *   **Acción Requerida:** Renombrar exportaciones a `getNacionalidadesEtnicas` y `getPueblos`.

---

## 4. Detección de Hardcoding

**Hallazgo:** Se encontró lógica de negocio quemada en el código (Hardcoding) relacionada con la ubicación física.

*   **Archivo:** `frontend/src/components/admision/FormularioAdmisionMaestra.jsx` y `SeccionNacimiento.jsx`.
*   **Cadena Detectada:** `"CENTRO DE SALUD TIPO C CHONE"`.
*   **Impacto:** Si el nombre del centro cambia (e.g., corrección ortográfica o cambio de tipología), la validación de "parto institucional" y las reglas de las 24 horas fallarán silenciosamente.
*   **Propuesta:** Mover este valor a una variable de entorno `VITE_NOMBRE_INSTITUCION_LOCAL` o, idealmente, validarlo contra el `id` de la institución en la base de datos, no por su nombre string.

---

## 5. Sincronización Frontend (FormularioAdmisionMaestra.jsx)

**Hallazgo:** El frontend está haciendo un esfuerzo heroico por enviar datos en estructura, pero el backend los recibe y los "traduce" mal.

*   **Frontend:** Envía `primer_nombre`, `segundo_nombre`, `id_sexo` (Correcto, Snake Case).
*   **Backend (`admissions_controller.js`):**
    *   Recibe `pacienteData`.
    *   Intenta leer `documentNumber` (Inglés) en lugar de `numero_documento` o `cedula`.
    *   Esto obliga al frontend a enviar datos duplicados o al backend a tener lógica condicional sucia.

---

## PLAN DE ACCIÓN INMEDIATO (Siguientes Pasos)

1.  **Refactorización de Modelos (PRIORIDAD 1):**
    *   Reescribir `paciente_model.js` definiendo explícitamente todas las columnas en snake_case.
    *   Eliminar alias en inglés (`reasonForConsultation`) en `admission_model.js`.

2.  **Estandarización de Controlador de Admisiones:**
    *   Eliminar la lógica `||` (OR) para nombres de variables.
    *   Forzar la recepción de `numero_documento` y `motivo_consulta`.

3.  **Limpieza de Catálogos:**
    *   Renombrar funciones del controlador de catálogos al español.

4.  **Externalización de Constantes:**
    *   Crear constante global para el nombre de la institución.

*Esperando validación para proceder con la ejecución de cambios.*

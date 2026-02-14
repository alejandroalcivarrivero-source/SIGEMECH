# Reporte de Auditoría de Calidad y Soberanía Lingüística - SIGEMECH

**Fecha:** 14 de Febrero, 2026
**Auditor:** Roo (AI Assistant)

## Resumen Ejecutivo

Se ha realizado una revisión exhaustiva de los módulos críticos del sistema SIGEMECH (Admisiones, Pacientes y Partos), abarcando tanto el backend (Modelos, Controladores) como el frontend (Formularios). El objetivo principal fue identificar anglicismos, inconsistencias terminológicas respecto a la normativa MSP (Ministerio de Salud Pública), y brechas en la lógica de negocio clínica.

Se han encontrado hallazgos significativos que requieren atención para garantizar la "soberanía lingüística" y la robustez clínica del sistema.

## Hallazgos Principales

### 1. Backend: Modelos de Datos (Soberanía Lingüística)

*   **Inconsistencia de Idioma en `EmergencyAdmission` (`admission_model.js`):**
    *   **Hallazgo:** El modelo `EmergencyAdmission` utiliza casi exclusivamente nombres de campos en inglés tanto en las definiciones del ORM (`reasonForConsultation`, `familyHistory`, `currentIllness`, `physicalExam`, `bloodPressureSystolic`, etc.) como en los mapeos a base de datos (`reason_for_consultation`, `family_history`).
    *   **Impacto:** Esto viola el principio de soberanía lingüística y dificulta la trazabilidad con los formularios oficiales del MSP (Formulario 008), que están estrictamente en español.
    *   **Recomendación:** Refactorizar el modelo para usar terminología MSP (ej: `motivo_consulta` en lugar de `reasonForConsultation`, `presion_arterial_sistolica` en lugar de `bloodPressureSystolic`).

*   **Inconsistencia Híbrida en `Paciente` (`paciente_model.js`):**
    *   **Hallazgo:** El modelo `Paciente` presenta una mezcla confusa. Campos como `firstName1`, `birthDate`, `ethnicityId` conviven con mapeos a campos de base de datos en español (`primer_nombre`, `fecha_nacimiento`, `autoidentificacion_etnica`).
    *   **Impacto:** Dificulta el mantenimiento y la comprensión del código.
    *   **Recomendación:** Unificar todo el modelo a terminología en español para alinearse con la base de datos y la normativa.

*   **Buen Ejemplo en `Parto` (`parto_model.js`):**
    *   **Observación:** El modelo `Parto` utiliza consistentemente terminología en español (`fecha_hora_parto`, `peso_gramos`, `talla_cm`), alineándose correctamente con el Formulario de Nacido Vivo.

### 2. Backend: Controladores y Lógica de Negocio

*   **Lógica de Mapeo "Parche" en `admissions_controller.js`:**
    *   **Hallazgo:** Debido a la discrepancia de idiomas entre el frontend (que envía datos a veces en español o mezclados) y el modelo en inglés, el controlador tiene lógica de "mapeo al vuelo" (ej: `const motivoConsulta = admissionData.motivoAtencion || admissionData.motivo_consulta || admissionData.reasonForConsultation;`).
    *   **Impacto:** Esto es deuda técnica. Aumenta la complejidad ciclomática y el riesgo de errores si se añade un nuevo campo y no se mapea manualmente.
    *   **Recomendación:** Estandarizar el contrato de la API (DTOs) en español y que el controlador mapee directamente a un modelo refactorizado en español.

*   **Validación de Integridad Referencial Manual:**
    *   **Hallazgo:** El controlador realiza validaciones manuales de tipos (`validateStringId`) para campos de ubicación.
    *   **Observación:** Es una buena práctica defensiva, pero sugiere que la validación a nivel de modelo (Sequelize) o middleware (Joi/Zod) podría no ser suficiente.

### 3. Frontend: Componentes de Admisión

*   **Formulario de Admisión Maestra (`FormularioAdmisionMaestra.jsx`):**
    *   **Positivo:** Implementa lógica de negocio clínica avanzada, como el cálculo de edad detallado (Años, Meses, Días, Horas) crucial para neonatología.
    *   **Positivo:** Maneja correctamente la bandera de `isNeonato` (< 28 días) y `esPartoReciente` (< 48 horas) para activar flujos condicionales.
    *   **Hallazgo:** El objeto `initialFormData` y `formData` mezclan nomenclaturas. Hay campos en `camelCase` en español (`primerApellido`, `fechaNacimiento`) y campos mapeados directamente de base de datos (`provinciaNacimiento`).
    *   **Riesgo:** Al enviar los datos en `handleFinalize`, se realiza un mapeo manual masivo hacia la estructura en inglés que espera el backend (`pacienteData`, `admissionData`). Si el backend cambia a español, este frontend deberá actualizarse masivamente.

*   **Sección Nacimiento (`SeccionNacimiento.jsx`):**
    *   **Positivo:** Buena implementación de lógica condicional para mostrar campos del "Libro de Parto" solo si es neonato.
    *   **Positivo:** Validación cruzada de la cédula de la madre si el parto fue en el establecimiento local ("CENTRO DE SALUD TIPO C CHONE").
    *   **Hallazgo:** Hardcoding del nombre del establecimiento (`"CENTRO DE SALUD TIPO C CHONE"`) para validaciones. Esto es frágil si el nombre cambia en base de datos. Se recomienda usar un ID o parámetro de configuración.

### 4. Conclusiones Generales

El sistema SIGEMECH presenta una arquitectura funcional pero sufre de una "esquizofrenia lingüística" entre la capa de datos (híbrida), la capa lógica (inglés/híbrida) y la capa de presentación (español/MSP).

Para cumplir con el objetivo de **Soberanía Lingüística**, se recomienda un plan de refactorización progresiva:
1.  **Fase 1 (Backend Models):** Renombrar campos en modelos Sequelize para usar español (ej: `EmergencyAdmission` -> `AdmisionEmergencia`, `reasonForConsultation` -> `motivo_consulta`).
2.  **Fase 2 (API Contract):** Actualizar controladores para recibir y responder JSONs con claves en español, eliminando los mapeos "parche".
3.  **Fase 3 (Frontend):** Simplificar el envío de formularios, ya que los nombres de campos del frontend coincidirán con los del backend.

No se detectaron fallos críticos de lógica clínica que pongan en riesgo la seguridad del paciente en el flujo auditado, salvo la fragilidad del hardcoding del nombre del centro de salud.

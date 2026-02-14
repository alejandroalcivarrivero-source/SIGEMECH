# Documentación Técnica: Modelo de Admisión de Emergencia (Formulario 008)

## 1. Introducción
El modelo `EmergencyAdmission` representa el evento de admisión inicial de un paciente en el área de emergencias, siguiendo los lineamientos del Formulario 008 del Ministerio de Salud Pública de Ecuador. Este modelo es el eje central para el historial clínico de emergencias, vinculando datos del paciente, triaje y personal médico.

## 2. Definición del Modelo (Sequelize)

### Esquema de la Tabla: `admisiones_emergencia`

| Atributo | Tipo de Dato | Descripción |
| :--- | :--- | :--- |
| `id` | INTEGER | Clave primaria autoincremental. |
| `paciente_id` | INTEGER | FK hacia la tabla `pacientes`. Asegura que cada evento pertenece a un paciente único. |
| `fecha_creacion` | DATETIME | Fecha y hora exacta del ingreso (audit). |
| `fecha_actualizacion` | DATETIME | Fecha y hora de la última modificación (audit). |
| `reason_for_consultation`| TEXT | Motivo de consulta (queja principal del paciente). |
| `personal_history` | TEXT | Antecedentes patológicos personales. |
| `family_history` | TEXT | Antecedentes patológicos familiares. |
| `current_illness` | TEXT | Relato cronológico del padecimiento actual. |
| `temperature` | DECIMAL(4,2) | Temperatura corporal (°C). |
| `blood_pressure_systolic`| INTEGER | Presión arterial sistólica (mmHg). |
| `blood_pressure_diastolic`| INTEGER | Presión arterial diastólica (mmHg). |
| `heart_rate` | INTEGER | Frecuencia cardíaca (lpm). |
| `respiratory_rate` | INTEGER | Frecuencia respiratoria (rpm). |
| `oxygen_saturation` | INTEGER | Saturación de oxígeno (%). |
| `weight` | DECIMAL(5,2) | Peso del paciente (kg). |
| `height` | DECIMAL(4,1) | Talla/Estatura (cm). |
| `physical_exam` | TEXT | Hallazgos del examen físico inicial. |
| `triage_id` | INTEGER | FK hacia `cat_triaje`. |
| `admitted_by` | INTEGER | FK hacia `usuarios`. Usuario que realizó el registro. |
| `attending_physician_id`| INTEGER | FK hacia `usuarios`. Médico asignado. |
| `status_id` | INTEGER | FK hacia `cat_estados_proceso`. |

## 3. Integridad Referencial y Asociaciones

El modelo está integrado en el sistema mediante las siguientes relaciones definidas en `backend/src/models_index.js`:

1.  **Paciente - Admisiones (`1:N`):**
    *   `Paciente.hasMany(EmergencyAdmission)`
    *   Un paciente puede tener múltiples ingresos por emergencia a lo largo del tiempo.

2.  **Usuario (Registrador) - Admisiones (`1:N`):**
    *   `User.hasMany(EmergencyAdmission, { foreignKey: 'admittedBy' })` (Tabla `usuarios`)
    *   Rastrea qué administrativo o enfermero/a realizó el ingreso inicial.

3.  **Usuario (Médico) - Admisiones (`1:N`):**
    *   `User.hasMany(EmergencyAdmission, { foreignKey: 'attendingPhysicianId' })` (Tabla `usuarios`)
    *   Vincula la admisión con el profesional responsable de la atención médica.

## 4. Consideraciones Técnicas
*   **Normalización:** Se utiliza el hook `normalizeStrings` para asegurar la consistencia de los datos de texto (mayúsculas/minúsculas).
*   **Auditabilidad:** El uso de `timestamps: true` en Sequelize añade automáticamente `fecha_creacion` y `fecha_actualizacion`.
*   **Escalabilidad:** El diseño permite añadir modelos satélites para "Prescripciones", "Exámenes de Laboratorio" e "Imagenología" vinculados al `id` de la admisión.

# Bitácora Maestra de Contexto: SIGEMECH

## Estado Actual del Sistema
- **Red Virtual:** Activa (Tailscale: `100.64.87.1`).
- **Base de Datos:** Conectividad nativa validada a `100.64.87.1` (MariaDB operativo).
- **Backend API:** Puerto `3002`.

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
- [ ] **Fase 1.1: Refactorización de Pacientes:** Migrar `paciente_model.js` a Español Técnico.
- [ ] **Fase 2: Limpieza de Controladores:** Eliminar los mapeos "parche" en `admissions_controller.js` y estandarizar DTOs.
- [ ] **Fase 3: Blindaje Clínico:** Sustituir hardcoding de "CENTRO DE SALUD TIPO C CHONE" por IDs o variables de entorno.
- [ ] **Fase 4: Frontend:** Unificar nomenclatura de `formData` en formularios maestros.
## ✅ Hitos Completados (2026-02-14)
- [x] Validación de conectividad nativa a base de datos (`100.64.87.1`).
- [x] Actualización de configuración de entorno backend.

## ✅ Hitos Completados (2026-02-13)
- [x] Refactorización total de `EmergencyAdmission` a Español Técnico (Fase 1).
- [x] Sincronización de MariaDB mediante túnel SSH y estrategia no destructiva.
- [x] Validación de Soberanía Lingüística en esquema de tabla `admisiones_emergencia`.

## ✅ Seguridad y DevOps (2026-02-13)
- [x] Blindaje de archivos sensibles (.env) en todo el árbol de directorios.
- [x] Saneamiento de historial Git para prevenir fuga de credenciales.
- [x] Script `sincronizar.bat` validado y operativo bajo estándares de seguridad.
# CONTEXTO DEL PROYECTO SIGEMECH

## 📜 Protocolo de Despliegue

### 🛡️ Protocolo de Integridad
Para garantizar la estabilidad del sistema antes de cualquier inicio, se ha implementado una **Prueba de Humo de Modelos**.
- **Ejecución Automática:** Se ejecuta automáticamente antes de `npm run dev` mediante el hook `predev`.
- **Alcance:** Verifica la conexión a la base de datos y la sincronización correcta de todos los modelos críticos (Paciente, Admision, Catalogos).
- **Fallo:** Si la prueba de humo falla, el servidor NO iniciará, protegiendo la integridad de los datos.

### 🔮 Seguridad Futura
Para mantener la soberanía y mantenibilidad del proyecto a largo plazo:
1.  **Auditoría de Modelos:** El archivo `backend/src/models_index.js` es la fuente de la verdad para las relaciones. Cualquier nuevo modelo debe registrarse allí en español.
2.  **Hooks de Git:** Se recomienda implementar hooks de pre-commit para validar que no se introduzcan términos en inglés en nombres de tablas o campos.
3.  **Inmutabilidad de Catálogos:** Los catálogos base (nacionalidades, etnias, etc.) deben considerarse inmutables en producción y solo modificarse mediante scripts de migración controlados.

## Estado Actual
- **Fase:** Refactorización y Auditoría de Soberanía Lingüística (Español Técnico).
- **Backend:** Node.js + Express + Sequelize (MariaDB).
- **Frontend:** React + Vite.
- **Base de Datos:** MariaDB (Tablas en `snake_case`, Datos en MAYÚSCULAS).

## Cambios Recientes (Auditoría de Calidad)
- **Eliminación de Alias en Inglés:** Se verificó la inexistencia de términos como `Patient`, `User`, `EmergencyAdmission`, `Birth`, `Representative` en la lógica de negocio (`backend/src/modules`).
- **Validación de Modelos:**
  - Todos los modelos se acceden mediante sus nombres en español (`Paciente`, `Usuario`, `Admision`).
  - Las relaciones (`hasMany`, `belongsTo`) en `models_index.js` están correctamente definidas usando las entidades en español.
- **Prueba de Humo:**
  - Se creó y ejecutó exitosamente el script `backend/src/scripts/prueba_humo_final.js`.
  - El script confirmó la carga correcta de los modelos críticos: `Paciente`, `Admision`, `Parto`, `Representante`, `Usuario` y catálogos de ubicación.
  - Se verificó la integridad de las asociaciones clave (ej. `Paciente` <-> `Admision`).

## Arquitectura de Modelos
- **Ubicación:** `backend/src/modules/**/models.js` y centralizados en `backend/src/models_index.js`.
- **Convención:**
  - Nombres de Clases/Modelos: PascalCase en Español (ej. `Paciente`).
  - Nombres de Tablas: snake_case (ej. `pacientes`, `admisiones`).
  - Claves Foráneas: `id_entidad` (ej. `id_paciente`, `id_provincia_nacimiento`).

## Próximos Pasos Sugeridos
1.  Continuar con la limpieza de código muerto si se detecta.
2.  Reforzar pruebas de integración para flujos completos (ej. creación de admisión).

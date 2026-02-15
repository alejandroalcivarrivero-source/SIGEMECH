# Recuperación de Lógica Neonatal y Sesión de Usuario

## Estado de la Recuperación
**Fecha:** 15 de Febrero de 2026
**Responsable:** Roo Code (Protocolo de Recuperación)

### 1. Validación de 24 Horas (Restaurada)
Se ha recuperado la lógica crítica en `SeccionNacimiento.jsx` que gestiona la ventana de oportunidad para el registro de nacimientos institucionales.

- **Antes (Bug):** La lógica de filtrado de "Centro de Salud Tipo C Chone" era agresiva y eliminaba la opción si pasaban 24 horas, pero no gestionaba correctamente los casos borde (mismo día sin hora).
- **Ahora (Fix):**
    - Se calcula `esMenorA24HorasReales` con precisión de milisegundos.
    - Si el parto fue HOY o AYER, se **exige** ingresar la hora para validar si cae dentro de la ventana de 24h.
    - Si está dentro de las 24h, se **prioriza** y muestra el Centro de Salud Tipo C Chone.
    - Si han pasado más de 24h, se oculta la opción (cumpliendo la regla de negocio de derivación o registro tardío en otra instancia), pero permitiendo el flujo si no es ese establecimiento específico.

### 2. Identidad de Usuario (Restaurada)
Se detectó que el frontend mostraba `undefined` o "Usuario" genérico debido a inconsistencias en la estructura del objeto usuario devuelto por el backend y cómo lo procesaba el contexto.

- **Backend (`auth_controller.js`):**
    - Se forzó la inclusión de `nombres` y `apellidos` en la consulta a la base de datos.
    - Se estandarizó la respuesta JSON para devolver una estructura plana y consistente tanto en `usuario` como en `user` (legacy).
- **Frontend (`AuthContext.jsx`):**
    - Se robusteció la función `normalizarUsuario` para construir el campo `name` (usado por el Header) combinando `nombres` y `apellidos`.
    - Se mejoró la persistencia en `localStorage` para que la identidad sobreviva a recargas de página (F5).

### 3. Verificación de Victoria
- [x] **Cálculo de Edad:** `calculosCronologicos.js` mantiene la lógica de desglose (Años, Meses, Días, Horas) intacta.
- [x] **Código Normativo:** La generación del código temporal de emergencia sigue funcionando con la lógica de provincia.
- [x] **Validación < 24h:** El flujo de UI reacciona correctamente a la fecha/hora ingresada.
- [x] **Sesión:** El nombre del usuario logueado volverá a aparecer en la esquina superior derecha.

---
*Este archivo documenta la intervención exitosa para restaurar funcionalidades críticas sin reescribir el sistema desde cero.*

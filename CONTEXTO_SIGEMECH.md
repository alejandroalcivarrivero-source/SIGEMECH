<<<<<<< Updated upstream
# CONTEXTO DEL PROYECTO SIGEMECH

## 1. Identidad Visual y UX (Soberanía y Estándares MSP)

### Paleta de Colores (Modo Claro Exclusivo - "Blanco Quirúrgico")
- **Fondo Global (Body/Main):** `#FFFFFF` (Blanco Puro) - **Prohibido usar grises (slate-50) en fondos generales.**
- **Contenedores/Tarjetas:** `#FFFFFF` (Sin bordes, sombras sutiles, estilo "Clean").
- **Labels (Etiquetas):** `#1e3a8a` (Azul MSP Extra Bold `font-bold`).
- **Inputs:** Fondo `#FFFFFF`, Borde `#cbd5e1` (Slate-300).
- **Input Focus:** Borde Amarillo Oro `#eab308` (Yellow-500). Sin anillo de enfoque (ring-0).
- **Botones:** Azul MSP (Primario), Blanco con borde (Secundario), Rojo (Peligro).

### Estructura de Formularios (Formulario 001)
- **Diseño:** Limpio, sin "Cajas dentro de cajas". Los campos flotan sobre el lienzo blanco.
- **Validaciones:** Borde rojo en error, mensaje de texto debajo.
- **Mayúsculas:** Textos obligatorios en mayúsculas (vía CSS `uppercase` o JS `toUpperCase()`).

## 2. Arquitectura Frontend (React + Tailwind)
- **Componentes Atómicos:** Secciones divididas por archivos (`SeccionIdentidad.jsx`, `SeccionResidencia.jsx`, etc.) para mantenibilidad.
- **Gestión de Estado:** `react-hook-form` para manejo de formularios complejos.
- **Contextos:** `AuthContext` (Autenticación). **NOTA:** `ThemeContext` eliminado por simplificación (Solo Modo Claro).
- **Enrutamiento:** `react-router-dom` con Layout principal `Dashboard.jsx`.

## 3. Backend (Node.js + Express + MariaDB)
- **Soberanía Lingüística:** Todo en ESPAÑOL (variables, rutas, comentarios).
- **Base de Datos:** Tablas normalizadas `snake_case`. Datos almacenados en MAYÚSCULAS.
- **Controladores:** Lógica de negocio separada de rutas.
- **Modelos:** Consultas SQL directas o vía Query Builder ligero (sin ORM pesado para control total).

## 4. Historial de Cambios Recientes
- **RESET TÉCNICO DE UI:** Eliminación de `ThemeContext` y soporte de Modo Oscuro para simplificar la interfaz.
- **Limpieza de Estilos:** Restauración de `index.css` y `tailwind.config.js` a valores base.
- **Estandarización:** Enfoque total en Modo Claro Institucional (Azul/Blanco/Oro).

## 5. Próximos Pasos (Roadmap)
- Validación exhaustiva de reglas de negocio Formulario 001.
- Optimización de carga de catálogos (caching).
- Implementación de reportes y estadísticas.
=======
# CONTEXTO_SIGEMECH.md

## Estado del Proyecto: FINALIZADO
- **Fecha:** 2026-02-18
- **Hito:** Cierre de Infraestructura, Código Limpio y Soberanía Técnica.
- **Estado:** SISTEMA SIGEMECH 2026: Código Limpio, Datos Soberanos.

## Arquitectura Consolidada
El sistema opera bajo una arquitectura de microservicios modulares en NodeJS (Backend) y React (Frontend), con persistencia en MariaDB.

### Microservicios Activos (Backend):
1.  **Autenticación (`auth`):** Gestión de acceso seguro mediante JWT.
2.  **Pacientes (`pacientes`):** Gestión integral de datos demográficos y clínicos del paciente.
3.  **Admisiones (`admissions` / `/api/admisiones`):** Flujo de ingreso de emergencia (Formulario 008).
4.  **Catálogos (`catalogs` / `/api/catalogos`):** Gestión de terminología médica estandarizada (MSP Ecuador).
5.  **Soporte (`soporte`):** Utilidades de diagnóstico y auditoría del sistema.

### Infraestructura de Datos:
- **Base de Datos:** MariaDB Soberana.
- **IP del Servidor DB:** `100.64.87.1`
- **Protocolo de Normalización:** 
    - Nombres de tablas/campos: `snake_case` (minúsculas).
    - Datos de valores: `MAYÚSCULAS` (estándar clínico).
    - Idioma: 100% Español Técnico.

## Protocolo de Inicio e Integridad
El sistema implementa un **Verificador de Integridad Soberana** (`verificador_sistema.js`) que se ejecuta automáticamente en cada arranque (`npm start`):
1.  **Validación de Conectividad:** Comprueba enlace con MariaDB en `100.64.87.1`.
2.  **Validación de Modelos:** Verifica que todos los modelos esenciales (`Usuario`, `Paciente`, `Admision`, `Catálogos`) estén correctamente mapeados.
3.  **Validación de Tablas:** Confirma la existencia física de las tablas en la base de datos antes de abrir el puerto de escucha.
4.  **Aborto Seguro:** Si falla cualquier prueba de integridad, el sistema se detiene inmediatamente para evitar corrupción de datos.

## Registro de Operaciones Finales
- Eliminación de archivos temporales (`.old`, `.bak`, `.tmp`).
- Remoción de scripts de prueba obsoletos y archivos de texto huérfanos.
- Saneamiento de comentarios técnicos y deuda técnica de lenguaje.
- Sincronización final de payloads para cumplimiento estricto del Formulario 001/008.

---
**[FINALIZADO] Sistema SIGEMECH 2026: Código Limpio, Datos Soberanos.**
>>>>>>> Stashed changes

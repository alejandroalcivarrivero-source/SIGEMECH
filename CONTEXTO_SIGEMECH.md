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

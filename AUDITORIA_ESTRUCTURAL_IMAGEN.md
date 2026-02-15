# Auditoría y Refactorización del Flujo "No Identificado" (MSP)

**Fecha:** 2026-02-15
**Estado:** Implementado
**Responsable:** Roo (Arquitecto de Software)

## Descripción General
Se ha realizado una intervención quirúrgica en el módulo de Admisión de Pacientes para corregir y optimizar el flujo de registro de pacientes "No Identificados" (NN) y de Emergencia (Código 99), alineándose con la normativa del MSP (Ministerio de Salud Pública) y los principios de Soberanía Tecnológica.

## Cambios Realizados

### 1. Centralización de Lógica de Identificación
- **Problema:** Existía duplicidad en la lógica de generación de códigos temporales entre `SeccionIdentidad.jsx` y `FormularioAdmisionMaestra.jsx`, lo que causaba condiciones de carrera y parpadeos en la interfaz.
- **Solución:** Se eliminó la lógica de `useEffect` en `SeccionIdentidad.jsx` y se centralizó completamente en `FormularioAdmisionMaestra.jsx`. Ahora el componente padre controla soberanamente la identidad del paciente.

### 2. Algoritmo de Código Normativo (MSP)
- **Archivo:** `frontend/src/utils/generador_codigo.js`
- **Ajuste:** Se refinó la extracción de siglas para garantizar longitud fija de 6 caracteres.
- **Formato:** `AA B CC D` (2 letras 1er Nombre, 1 letra 2do Nombre, 2 letras 1er Apellido, 1 letra 2do Apellido).
- **Relleno:** Se utiliza 'X' para completar longitud en nombres/apellidos cortos y '0' para segundos nombres/apellidos inexistentes.

### 3. Flexibilización de Validación "No Identificado"
- **Problema:** El formulario bloqueaba el avance a la pestaña "Nacimiento" si no había un número de documento, creando un bloqueo lógico ya que el documento se genera *con* los datos de nacimiento (provincia).
- **Solución:** Se modificó `handleNext` en `FormularioAdmisionMaestra.jsx` para permitir avanzar si el tipo es "NO IDENTIFICADO" y se tienen los nombres, posponiendo la validación estricta del documento hasta tener los datos geográficos.

### 4. Sincronización de Estado y Dependencias
- **Mejora:** El `useEffect` principal de generación de código ahora tiene dependencias explícitas y completas, incluyendo `datosNacimiento.provincia_nacimiento_id`, asegurando que el código se regenere instantáneamente al seleccionar la provincia de nacimiento.

## Verificación
- El flujo permite ingresar nombres -> avanzar -> seleccionar provincia/fecha nacimiento -> ver código generado automáticamente en el banner superior.
- Se mantiene la compatibilidad con el flujo de emergencia (código 99).

## Próximos Pasos Recomendados
- Implementar pruebas unitarias para `generarCodigoNormativoIdentificacion` cubriendo casos de borde (nombres cortos, caracteres especiales).
- Validar visualmente el banner de código en diferentes resoluciones.

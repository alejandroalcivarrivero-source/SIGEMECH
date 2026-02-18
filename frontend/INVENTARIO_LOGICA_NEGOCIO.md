# Inventario de Lógica de Negocio del Frontend (Preservación Pre-Refactorización)

Este documento detalla las reglas de negocio, validaciones y cálculos identificados en el frontend del módulo de Admisión de SIGEMECH. Estas reglas deben ser preservadas o migradas cuidadosamente durante cualquier refactorización.

## 1. Utilidades de Cálculo y Validación

### 1.1. Validación de Documentos (`frontend/src/utils/pacienteUtils.js`, `validationHelper.js`)
- **Cédula Ecuatoriana (Módulo 10):**
  - Se valida longitud de 10 dígitos numéricos.
  - Se valida el código de provincia (01-24, 30).
  - Se valida el tercer dígito (< 6 para personas naturales).
  - Se aplica el algoritmo de Módulo 10 para verificar el último dígito.
  - *Nota:* Existe duplicidad de esta lógica en `pacienteUtils.js` y `validationHelper.js`.

### 1.2. Generación de Códigos Temporales (`frontend/src/utils/pacienteUtils.js`, `generador_codigo.js`)
- **Código Temporal MSP (17 caracteres):**
  - **Formato:** `NNAAAPPFAAAAAAAAD`
    - `NN`: Primeras 2 letras del 1er nombre + 1 letra del 2do nombre.
    - `AAA`: Primeras 2 letras del 1er apellido + 1 letra del 2do apellido.
    - `PP`: Código de provincia de nacimiento (o 99).
    - `FAAAAAAAA`: Fecha de nacimiento (AAAAMMDD).
    - `D`: Dígito de la década del año de nacimiento.
  - **Lógica para "No Identificado":** Se genera automáticamente un código normativo si el paciente es seleccionado como "NO IDENTIFICADO".

### 1.3. Validaciones de Admisión (`frontend/src/utils/validaciones_admision.js`)
- **Fechas Futuras:** Validación genérica para impedir fechas de ingreso posteriores a la actual.
- **Referencia:** Si el Tipo de Arribo es "Referido", el campo "Establecimiento de Origen" es obligatorio.
- **Residencia:**
  - Si País es "Ecuador": Provincia, Cantón y Parroquia son obligatorios.
  - Si País es extranjero: Calle Principal, Barrio y Referencia son obligatorios.

## 2. Lógica de Orquestación (`FormularioAdmisionMaestra.jsx`)

### 2.1. Cálculo de Edad (Complejidad Alta)
- Se calcula Edad en Años, Meses, Días, Horas y Minutos.
- **Neonatos:** Se considera neonato si Edad < 28 días.
- **Menores de 24 Horas:** Lógica específica para calcular si el nacimiento ocurrió hace menos de 24 horas reales.
- **Ajuste de Meses/Días:** Corrección manual para restas de fechas negativas (cuando el día actual es menor al día de nacimiento).

### 2.2. Reglas de Bloqueo de Navegación
- **Validación Temporal (Reloj Atómico):**
  - Se impide avanzar o guardar si la fecha/hora de nacimiento es futura (con tolerancia de 5 minutos).
  - **Regla Estricta 24h:** Si el nacimiento fue hace < 24 horas, el campo HORA es estrictamente obligatorio para habilitar el botón "Siguiente".
- **Longevidad:** Alerta si la edad calculada > 120 años.

### 2.3. Búsqueda de Paciente
- Al perder el foco (onBlur) en el campo de identificación, si es una cédula válida, se consulta al backend.
- Si existe, se precargan los datos y se notifica.
- Si no existe, se ofrece iniciar un nuevo registro.

### 2.4. Finalización de Admisión
- **Validación Neonatal Estricta:** Si es neonato (< 28 días), es obligatorio ingresar la **Cédula de la Madre**.
- Envío de payload estructurado separando `pacienteData`, `admissionData`, `representanteData` y `datos_parto`.

## 3. Lógica Específica por Sección

### 3.1. Identidad (`SeccionIdentidad.jsx`)
- **Generación en Tiempo Real:** Si el tipo de ID es "NO IDENTIFICADO", el campo de número de documento se bloquea y se autogenera en tiempo real basado en los cambios de nombre/fecha.
- **Validación de Input:** Para Cédulas, se restringe la entrada a solo números y máximo 10 caracteres.

### 3.2. Bio-Social e Inclusión (`SeccionBioSocial.jsx`, `SeccionInclusion.jsx`)
- **Cascada Étnica Estricta (Hardcoded Strings):**
  - Se busca el ID de la etnia "INDÍGENA" comparando el string.
  - Si Etnia es "INDÍGENA" -> Se habilita y carga el catálogo de `NacionalidadesEtnicas`.
  - Se busca el ID de la nacionalidad "KICHWA" comparando el string.
  - Si Nacionalidad es "KICHWA" -> Se habilita y carga el catálogo de `PueblosEtnicos`.
  - *Riesgo:* La lógica depende de que los nombres en base de datos sean exactamente "INDÍGENA" y "KICHWA".
- **Discapacidad:**
  - Checkbox "Tiene Discapacidad" controla la visibilidad de los campos: Tipo, Porcentaje y Nro. Carnet.

### 3.3. Nacimiento (`SeccionNacimiento.jsx`)
- **Regla "Centro de Salud Tipo C Chone":**
  - Si el lugar de parto es este centro específico, se aplican reglas más estrictas de validación de 24 horas reales.
  - **Validación de Madre:**
    - Se busca a la madre por cédula.
    - Se valida que el sexo de la madre sea mujer.
    - Se verifica si la madre tiene una **admisión activa en las últimas 48 horas** (requerido para partos institucionales en este centro).
- **Cascada Geográfica:** Al cambiar Provincia, se recargan Cantones; al cambiar Cantón, se recargan Parroquias (solo para nacionalidad Ecuatoriana).
- **Reset por Nacionalidad:** Si se cambia a nacionalidad extranjera, se limpian los campos geográficos de nacimiento ecuatorianos.

### 3.4. Residencia (`SeccionResidencia.jsx`)
- **Comportamiento Dinámico:**
  - Si País != Ecuador: Se ocultan/deshabilitan Provincia, Cantón y Parroquia de residencia, y se hacen obligatorios los campos de dirección texto.
  - Si País == Ecuador: Se exige la jerarquía territorial completa.

### 3.5. Contacto de Emergencia / Representante (`SeccionRepresentante.jsx`)
- **Bloqueo para Neonatos:** Si es neonato y el parentesco es "MADRE", y ya se ingresó la cédula de la madre en la sección de nacimiento, los datos del representante se bloquean y se sincronizan con los de la madre.
- **Validación ID Representante:** Se aplica la misma validación de Módulo 10 para la cédula del representante.

### 3.6. Llegada y Motivo (`SeccionLlegadaMotivo.jsx`)
- **Referidos:** Si Forma de Llegada es "Referido", se fuerza visualmente y por validación el campo "Establecimiento de Origen".
- **Destino Inicial:** Selección visual tipo semáforo (Emergencia/Rojo, Triage/Amarillo, Consulta/Verde) que define el flujo posterior.

## 4. Recomendaciones para Refactorización

1.  **Centralización de Validaciones:** Unificar `pacienteUtils.js` y `validationHelper.js` para evitar código duplicado (DRY).
2.  **Abstracción de Reglas de Negocio:** Mover la lógica de "Centro de Salud Tipo C Chone" a una configuración o función de utilidad para no tener *hardcoded strings* en los componentes.
3.  **Hooks Personalizados:** Extraer la lógica de cálculo de edad (`edadInfo`) a un hook `useEdad` reutilizable.
4.  **Gestión de Formularios:** Considerar usar `react-hook-form` con un esquema de validación (Zod/Yup) que incorpore estas reglas de negocio de forma declarativa, reemplazando la validación manual imperativa actual.

## 5. Otras Reglas Críticas Identificadas

### 5.1. Control de Acceso (`frontend/src/context/AuthContext.jsx`)
- **Regla de Superusuario (Hardcoded):** Si el nombre del usuario autenticado incluye la cadena `'Sergio'`, el sistema asigna automáticamente permisos totales (`*`) y roles totales (`*`).
  - *Riesgo:* Esta regla debe ser eliminada o controlada estrictamente en producción.

### 5.2. Servicios de API (`frontend/src/api/pacienteService.js`)
- **Manejo de Errores Silencioso:** La función `verificarAdmisionReciente` retorna `false` por defecto si ocurre un error en la petición HTTP, lo cual podría ocultar problemas de red y bloquear admisiones válidas de neonatos.

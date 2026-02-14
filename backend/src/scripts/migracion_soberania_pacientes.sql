
-- SCRIPT DE REESTRUCTURACIÓN COMPLETA: SOBERANÍA DE PACIENTES
-- OBJETIVO: Sincronizar la tabla física con el Modelo de Soberanía (Español)

-- 1. Eliminar columnas obsoletas o que cambiarán de tipo drásticamente (si no hay datos críticos)
-- Nota: 'genero' era ENUM, lo pasaremos a INT (FK)
ALTER TABLE pacientes 
    DROP COLUMN genero,
    DROP COLUMN tipo_sangre,
    DROP COLUMN ciudad,
    DROP COLUMN empresa_trabajo;

-- 2. Renombrar y Tipar columnas existentes para coincidir con el Modelo Aprobado
ALTER TABLE pacientes 
    CHANGE COLUMN cedula numero_documento VARCHAR(20) NOT NULL,
    CHANGE COLUMN nombres primer_nombre VARCHAR(100) NOT NULL,
    CHANGE COLUMN apellidos primer_apellido VARCHAR(100) NOT NULL,
    CHANGE COLUMN fecha_nacimiento fecha_nacimiento DATE NOT NULL,
    CHANGE COLUMN direccion direccion TEXT NULL,
    CHANGE COLUMN telefono telefono VARCHAR(20) NULL,
    CHANGE COLUMN nacionalidad id_nacionalidad INT(11) NULL,
    CHANGE COLUMN autoidentificacion_etnica id_etnia INT(11) NULL,
    CHANGE COLUMN estado_civil id_estado_civil INT(11) NULL,
    CHANGE COLUMN nivel_instruccion id_instruccion INT(11) NULL,
    CHANGE COLUMN tipo_seguro id_seguro_salud INT(11) NULL,
    CHANGE COLUMN fecha_registro fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 3. Agregar columnas faltantes del Modelo de Soberanía
ALTER TABLE pacientes
    ADD COLUMN id_tipo_identificacion INT(11) NULL AFTER id,
    ADD COLUMN segundo_nombre VARCHAR(100) NULL AFTER primer_nombre,
    ADD COLUMN segundo_apellido VARCHAR(100) NULL AFTER primer_apellido,
    ADD COLUMN id_sexo INT(11) NULL AFTER fecha_nacimiento,
    ADD COLUMN id_genero INT(11) NULL AFTER id_sexo,
    ADD COLUMN id_parroquia INT(11) NULL AFTER id_nacionalidad,
    ADD COLUMN lugar_nacimiento VARCHAR(200) NULL AFTER id_parroquia,
    ADD COLUMN id_nacionalidad_etnica INT(11) NULL AFTER id_etnia,
    ADD COLUMN id_pueblo INT(11) NULL AFTER id_nacionalidad_etnica,
    ADD COLUMN referencia_domicilio TEXT NULL AFTER direccion,
    ADD COLUMN telefono_fijo VARCHAR(20) NULL AFTER telefono,
    ADD COLUMN email VARCHAR(100) NULL AFTER telefono_fijo,
    ADD COLUMN tipo_empresa VARCHAR(100) NULL AFTER ocupacion,
    ADD COLUMN tiene_discapacidad TINYINT(1) DEFAULT 0 AFTER tipo_empresa,
    ADD COLUMN tipo_discapacidad VARCHAR(100) NULL AFTER tiene_discapacidad,
    ADD COLUMN porcentaje_discapacidad INT(11) NULL AFTER tipo_discapacidad,
    ADD COLUMN carnet_discapacidad VARCHAR(50) NULL AFTER porcentaje_discapacidad,
    ADD COLUMN nombre_representante VARCHAR(200) NULL AFTER carnet_discapacidad,
    ADD COLUMN id_tipo_doc_representante INT(11) NULL AFTER nombre_representante,
    ADD COLUMN documento_representante VARCHAR(20) NULL AFTER id_tipo_doc_representante,
    ADD COLUMN id_parentesco_representante INT(11) NULL AFTER documento_representante,
    ADD COLUMN creado_por INT(11) NULL AFTER id_parentesco_representante,
    ADD COLUMN fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

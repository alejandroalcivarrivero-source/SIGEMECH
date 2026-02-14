import json
import os

# Rutas de archivos
json_path = os.path.join('formularios cvs', 'ecuador.json')
sql_path = 'importar_datos_ecuador.sql'

try:
    # Cargar el archivo JSON
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    sql_statements = []
    
    # Templates para las inserciones
    ins_provincia = "INSERT INTO cat_provincias (id, nombre) VALUES ('{id}', '{nombre}');"
    ins_canton = "INSERT INTO cat_cantones (id, provincia_id, nombre) VALUES ('{id}', '{provincia_id}', '{nombre}');"
    ins_parroquia = "INSERT INTO cat_parroquias (id, canton_id, nombre) VALUES ('{id}', '{canton_id}', '{nombre}');"

    # Agregar desactivación de checks de llaves foráneas para facilitar la importación si fuera necesario
    sql_statements.append("SET FOREIGN_KEY_CHECKS = 0;")
    sql_statements.append("TRUNCATE TABLE cat_parroquias;")
    sql_statements.append("TRUNCATE TABLE cat_cantones;")
    sql_statements.append("TRUNCATE TABLE cat_provincias;")

    for prov_id, prov_data in data.items():
        # Saltamos la clave "90" que no tiene estructura de provincia o claves que no contengan "provincia"
        if isinstance(prov_data, dict) and "provincia" in prov_data:
            prov_nombre = prov_data["provincia"].replace("'", "''")
            sql_statements.append(ins_provincia.format(id=prov_id, nombre=prov_nombre))
            
            if "cantones" in prov_data:
                for canton_id, canton_data in prov_data["cantones"].items():
                    canton_nombre = canton_data["canton"].replace("'", "''")
                    sql_statements.append(ins_canton.format(id=canton_id, provincia_id=prov_id, nombre=canton_nombre))
                    
                    parroquias = canton_data.get("parroquias")
                    if parroquias:
                        for parr_id, parr_nombre in parroquias.items():
                            nombre_limpio = parr_nombre.replace("'", "''")
                            sql_statements.append(ins_parroquia.format(
                                id=parr_id,
                                canton_id=canton_id,
                                nombre=nombre_limpio
                            ))

    sql_statements.append("SET FOREIGN_KEY_CHECKS = 1;")

    # Guardar el resultado en un archivo .sql
    with open(sql_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_statements))

    print(f"Se ha generado el archivo {sql_path} con {len(sql_statements)} sentencias SQL.")

except FileNotFoundError:
    print(f"Error: No se encontró el archivo en {json_path}")
except Exception as e:
    print(f"Error inesperado: {e}")

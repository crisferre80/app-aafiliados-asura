-- Agrega el campo province a la tabla comision_directiva si no existe
ALTER TABLE comision_directiva ADD COLUMN IF NOT EXISTS province text;

-- Opcional: index para búsquedas rápidas por provincia
CREATE INDEX IF NOT EXISTS comision_directiva_province_idx ON comision_directiva (province);

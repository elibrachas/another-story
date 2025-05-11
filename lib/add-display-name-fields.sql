-- Añadir campo display_name a la tabla stories si no existe
ALTER TABLE stories ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Añadir campo display_name a la tabla comments si no existe
ALTER TABLE comments ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Crear índices para mejorar el rendimiento de las búsquedas
CREATE INDEX IF NOT EXISTS idx_stories_display_name ON stories(display_name);
CREATE INDEX IF NOT EXISTS idx_comments_display_name ON comments(display_name);

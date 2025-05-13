-- Consolidación de esquemas iniciales y configuraciones básicas

-- Añadir campo para comentarios pendientes de aprobación
ALTER TABLE comments ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT true;

-- Añadir campos para administración de usuarios
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_stories_published ON stories(published);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(approved);
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_banned ON profiles(is_banned);

-- Añadir campos de visualización para perfiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS anonymous_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS use_anonymous BOOLEAN DEFAULT true;

-- Hacer que el primer usuario sea administrador (para pruebas)
UPDATE profiles
SET is_admin = true
WHERE id IN (
  SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1
);

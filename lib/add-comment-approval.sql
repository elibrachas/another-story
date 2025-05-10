-- Añadir campo para comentarios pendientes de aprobación si no existe
ALTER TABLE comments ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT true;

-- Crear índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(approved);

-- Actualizar las políticas RLS para comentarios
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Política para permitir a todos leer comentarios aprobados
DROP POLICY IF EXISTS comments_select ON comments;
CREATE POLICY comments_select ON comments
  FOR SELECT
  USING (approved = true OR auth.uid() = user_id);

-- Política para permitir a usuarios autenticados insertar comentarios
DROP POLICY IF EXISTS comments_insert ON comments;
CREATE POLICY comments_insert ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política para permitir a usuarios actualizar sus propios comentarios
DROP POLICY IF EXISTS comments_update ON comments;
CREATE POLICY comments_update ON comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para permitir a usuarios eliminar sus propios comentarios
DROP POLICY IF EXISTS comments_delete ON comments;
CREATE POLICY comments_delete ON comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Política para permitir a administradores actualizar cualquier comentario
DROP POLICY IF EXISTS comments_admin_update ON comments;
CREATE POLICY comments_admin_update ON comments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.admin = true
    )
  );

-- Política para permitir a administradores eliminar cualquier comentario
DROP POLICY IF EXISTS comments_admin_delete ON comments;
CREATE POLICY comments_admin_delete ON comments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.admin = true
    )
  );

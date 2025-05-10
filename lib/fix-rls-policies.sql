-- Verificar las políticas actuales y eliminarlas si es necesario
DROP POLICY IF EXISTS stories_select ON stories;
DROP POLICY IF EXISTS stories_insert ON stories;
DROP POLICY IF EXISTS stories_update ON stories;
DROP POLICY IF EXISTS stories_delete ON stories;
DROP POLICY IF EXISTS stories_admin_update ON stories;

-- Asegurarse de que RLS está habilitado
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Política para permitir a todos leer historias publicadas
CREATE POLICY stories_select ON stories
  FOR SELECT
  USING (published = true OR auth.uid() = user_id);

-- Política para permitir a usuarios autenticados insertar historias
CREATE POLICY stories_insert ON stories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política para permitir a usuarios actualizar sus propias historias
CREATE POLICY stories_update ON stories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para permitir a usuarios eliminar sus propias historias
CREATE POLICY stories_delete ON stories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Política CRÍTICA: Permitir a administradores actualizar cualquier historia
CREATE POLICY stories_admin_update ON stories
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.admin = true
    )
  );

-- Política para permitir a administradores eliminar cualquier historia
CREATE POLICY stories_admin_delete ON stories
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.admin = true
    )
  );

-- Verificar que las políticas se han creado correctamente
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'stories';

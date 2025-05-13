-- Consolidación de políticas RLS y funciones relacionadas

-- Políticas para la tabla stories
CREATE POLICY IF NOT EXISTS "Cualquiera puede leer historias publicadas" 
ON stories FOR SELECT 
USING (published = true);

CREATE POLICY IF NOT EXISTS "Los usuarios pueden crear historias" 
ON stories FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Los usuarios pueden actualizar sus propias historias" 
ON stories FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Los administradores pueden actualizar cualquier historia" 
ON stories FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

CREATE POLICY IF NOT EXISTS "Los administradores pueden actualizar el contador de upvotes" 
ON stories FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
) 
WITH CHECK (true);

-- Función para bypass de RLS para administradores
CREATE OR REPLACE FUNCTION admin_can_bypass_rls(operation text, table_name text)
RETURNS boolean AS $$
DECLARE
  is_admin boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND is_admin = true
  ) INTO is_admin;
  
  RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

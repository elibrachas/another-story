-- Crear una función SQL con permisos elevados para aprobar historias
CREATE OR REPLACE FUNCTION approve_story_admin(story_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Esto hace que la función se ejecute con los permisos del creador
AS $$
DECLARE
  success BOOLEAN;
BEGIN
  UPDATE stories
  SET published = TRUE
  WHERE id = story_id;
  
  GET DIAGNOSTICS success = ROW_COUNT;
  
  RETURN success > 0;
END;
$$;

-- Asegurarse de que la función es accesible
GRANT EXECUTE ON FUNCTION approve_story_admin TO authenticated;

-- Verificar que la función existe
SELECT proname, prosecdef FROM pg_proc WHERE proname = 'approve_story_admin';

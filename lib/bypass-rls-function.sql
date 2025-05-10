-- Función con SECURITY DEFINER para eludir las políticas RLS
CREATE OR REPLACE FUNCTION admin_force_publish_story(story_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Esto hace que la función se ejecute con los privilegios del creador
AS $$
DECLARE
  success BOOLEAN := false;
  rows_affected INTEGER;
BEGIN
  UPDATE stories
  SET published = TRUE
  WHERE id = story_id;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  IF rows_affected > 0 THEN
    success := true;
  END IF;
  
  RETURN success;
END;
$$;

-- Asegurarse de que la función es accesible
GRANT EXECUTE ON FUNCTION admin_force_publish_story TO authenticated;
GRANT EXECUTE ON FUNCTION admin_force_publish_story TO service_role;

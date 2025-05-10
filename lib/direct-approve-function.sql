-- Crear una función SQL para aprobar directamente una historia
CREATE OR REPLACE FUNCTION approve_story_directly(story_id UUID)
RETURNS TABLE (id UUID, title TEXT, published BOOLEAN) AS $$
DECLARE
  updated_row RECORD;
BEGIN
  -- Actualizar la historia y devolver la fila actualizada
  UPDATE stories
  SET published = TRUE
  WHERE id = story_id
  RETURNING * INTO updated_row;
  
  -- Devolver la información de la historia actualizada
  RETURN QUERY SELECT 
    updated_row.id, 
    updated_row.title, 
    updated_row.published;
END;
$$ LANGUAGE plpgsql;

-- Crear una función para verificar el estado actual de una historia
CREATE OR REPLACE FUNCTION get_story_status(story_id UUID)
RETURNS TABLE (id UUID, title TEXT, published BOOLEAN, user_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.title, s.published, s.user_id
  FROM stories s
  WHERE s.id = story_id;
END;
$$ LANGUAGE plpgsql;

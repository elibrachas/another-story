-- Función simple para aprobar una historia
CREATE OR REPLACE FUNCTION approve_story(story_id UUID) 
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN;
BEGIN
  UPDATE stories
  SET published = TRUE
  WHERE id = story_id;
  
  GET DIAGNOSTICS success = ROW_COUNT;
  RETURN success > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función simple para rechazar una historia (eliminarla)
CREATE OR REPLACE FUNCTION reject_story(story_id UUID) 
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN;
BEGIN
  DELETE FROM stories
  WHERE id = story_id;
  
  GET DIAGNOSTICS success = ROW_COUNT;
  RETURN success > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener historias pendientes de aprobación
CREATE OR REPLACE FUNCTION get_pending_stories() 
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  author TEXT,
  industry TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.title, s.content, s.author, s.industry, s.created_at
  FROM stories s
  WHERE s.published = FALSE
  ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql;

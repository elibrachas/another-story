-- Función para verificar el estado de una historia
CREATE OR REPLACE FUNCTION check_story_status(story_id UUID)
RETURNS TABLE (id UUID, title TEXT, published BOOLEAN, created_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.title, s.published, s.created_at
  FROM stories s
  WHERE s.id = story_id;
END;
$$ LANGUAGE plpgsql;

-- Función para aprobar directamente una historia
CREATE OR REPLACE FUNCTION direct_approve_story(story_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  updated_rows INTEGER;
BEGIN
  UPDATE stories
  SET published = TRUE
  WHERE id = story_id;
  
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  
  RETURN updated_rows > 0;
END;
$$ LANGUAGE plpgsql;

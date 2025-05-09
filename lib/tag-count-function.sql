-- Crear una función para contar el uso de etiquetas
CREATE OR REPLACE FUNCTION get_tag_counts()
RETURNS TABLE (tag_id UUID, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT st.tag_id, COUNT(st.story_id)::BIGINT
  FROM story_tags st
  JOIN stories s ON st.story_id = s.id
  WHERE s.published = true
  GROUP BY st.tag_id;
END;
$$ LANGUAGE plpgsql;

-- Crear una función para incrementar el contador de upvotes
CREATE OR REPLACE FUNCTION increment_story_upvotes(story_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE stories
  SET upvotes = COALESCE(upvotes, 0) + 1
  WHERE id = story_id_param;
END;
$$ LANGUAGE plpgsql;

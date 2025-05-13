-- Crear una función para contar los upvotes de una historia
CREATE OR REPLACE FUNCTION count_story_upvotes(story_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    upvote_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO upvote_count
    FROM upvotes
    WHERE story_id = story_id_param;
    
    RETURN upvote_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar que la función se creó correctamente
SELECT pg_get_functiondef('count_story_upvotes'::regproc);

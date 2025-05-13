-- Crear una función para el trigger que actualiza el contador de upvotes
CREATE OR REPLACE FUNCTION update_story_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se inserta un nuevo upvote
    IF (TG_OP = 'INSERT') THEN
        -- Actualizar el contador de upvotes en la tabla stories
        UPDATE stories
        SET upvotes = (SELECT COUNT(*) FROM upvotes WHERE story_id = NEW.story_id)
        WHERE id = NEW.story_id;
    -- Si se elimina un upvote
    ELSIF (TG_OP = 'DELETE') THEN
        -- Actualizar el contador de upvotes en la tabla stories
        UPDATE stories
        SET upvotes = (SELECT COUNT(*) FROM upvotes WHERE story_id = OLD.story_id)
        WHERE id = OLD.story_id;
    END IF;
    
    RETURN NULL; -- para triggers AFTER
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear el trigger en la tabla upvotes
DROP TRIGGER IF EXISTS update_story_upvote_count_trigger ON upvotes;
CREATE TRIGGER update_story_upvote_count_trigger
AFTER INSERT OR DELETE ON upvotes
FOR EACH ROW
EXECUTE FUNCTION update_story_upvote_count();

-- Verificar que el trigger se creó correctamente
SELECT pg_get_triggerdef(oid) FROM pg_trigger WHERE tgname = 'update_story_upvote_count_trigger';

-- Sincronizar todos los contadores existentes
DO $$
DECLARE
    story_record RECORD;
BEGIN
    FOR story_record IN SELECT id FROM stories LOOP
        UPDATE stories
        SET upvotes = (SELECT COUNT(*) FROM upvotes WHERE story_id = story_record.id)
        WHERE id = story_record.id;
    END LOOP;
END $$;

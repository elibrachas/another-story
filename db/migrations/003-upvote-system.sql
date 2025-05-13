-- Sistema completo de upvotes con trigger y funciones relacionadas

-- Función para incrementar el contador de upvotes
CREATE OR REPLACE FUNCTION increment_story_upvotes(story_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE stories
  SET upvotes = upvotes + 1
  WHERE id = story_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener información de tablas
CREATE OR REPLACE FUNCTION get_table_info(table_name text)
RETURNS json AS $$
DECLARE
    result json;
BEGIN
    SELECT json_agg(
        json_build_object(
            'column_name', column_name,
            'data_type', data_type,
            'is_nullable', is_nullable
        )
    ) INTO result
    FROM information_schema.columns
    WHERE table_name = $1;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Función para contar upvotes de una historia
CREATE OR REPLACE FUNCTION count_story_upvotes(story_id_param UUID)
RETURNS integer AS $$
DECLARE
  upvote_count integer;
BEGIN
  SELECT COUNT(*) INTO upvote_count
  FROM upvotes
  WHERE story_id = story_id_param;
  
  RETURN upvote_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para actualizar el contador de upvotes
CREATE OR REPLACE FUNCTION update_story_upvote_count()
RETURNS TRIGGER AS $$
DECLARE
  story_id_val UUID;
  new_count integer;
BEGIN
  -- Determinar qué story_id usar según la operación
  IF TG_OP = 'INSERT' THEN
    story_id_val := NEW.story_id;
  ELSIF TG_OP = 'DELETE' THEN
    story_id_val := OLD.story_id;
  END IF;
  
  -- Contar upvotes actuales
  SELECT COUNT(*) INTO new_count
  FROM upvotes
  WHERE story_id = story_id_val;
  
  -- Actualizar el contador en la tabla stories
  UPDATE stories
  SET upvotes = new_count
  WHERE id = story_id_val;
  
  -- Devolver NEW o OLD según la operación
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  ELSE
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear el trigger para actualizar automáticamente el contador
DROP TRIGGER IF EXISTS update_story_upvote_count_trigger ON upvotes;
CREATE TRIGGER update_story_upvote_count_trigger
AFTER INSERT OR DELETE ON upvotes
FOR EACH ROW
EXECUTE FUNCTION update_story_upvote_count();

-- Sincronizar contadores existentes
DO $$
DECLARE
  story_record RECORD;
  upvote_count integer;
BEGIN
  FOR story_record IN SELECT id FROM stories LOOP
    SELECT COUNT(*) INTO upvote_count
    FROM upvotes
    WHERE story_id = story_record.id;
    
    UPDATE stories
    SET upvotes = upvote_count
    WHERE id = story_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

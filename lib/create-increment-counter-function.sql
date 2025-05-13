-- Crear una función RPC para incrementar el contador de upvotes
CREATE OR REPLACE FUNCTION increment_story_upvote_counter(story_id_param UUID, increment_by INTEGER)
RETURNS INTEGER AS $$
DECLARE
    current_upvotes INTEGER;
    new_upvotes INTEGER;
BEGIN
    -- Obtener el valor actual de upvotes
    SELECT COALESCE(upvotes, 0) INTO current_upvotes 
    FROM stories 
    WHERE id = story_id_param;
    
    -- Calcular el nuevo valor
    new_upvotes := current_upvotes + increment_by;
    
    -- Actualizar el contador
    UPDATE stories 
    SET upvotes = new_upvotes 
    WHERE id = story_id_param;
    
    -- Devolver el nuevo valor
    RETURN new_upvotes;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error al incrementar contador: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar que la función se creó correctamente
SELECT pg_get_functiondef('increment_story_upvote_counter'::regproc);

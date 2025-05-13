-- 1. Crear una política RLS que permita actualizar la columna upvotes en la tabla stories
CREATE POLICY "Allow authenticated users to update upvotes" ON stories
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 2. Crear una función para manejar el incremento de upvotes de manera atómica
CREATE OR REPLACE FUNCTION increment_story_upvote(story_id_param UUID, user_id_param UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    current_upvotes INT;
    new_upvotes INT;
    already_voted BOOLEAN;
BEGIN
    -- Verificar si el usuario ya votó
    SELECT EXISTS (
        SELECT 1 FROM upvotes 
        WHERE story_id = story_id_param AND user_id = user_id_param
    ) INTO already_voted;
    
    -- Si ya votó, devolver un resultado indicando esto
    IF already_voted THEN
        RETURN jsonb_build_object(
            'success', true,
            'already_voted', true,
            'message', 'User already voted for this story'
        );
    END IF;
    
    -- Obtener el contador actual de upvotes
    SELECT COALESCE(upvotes, 0) INTO current_upvotes 
    FROM stories 
    WHERE id = story_id_param;
    
    -- Registrar el voto en la tabla upvotes
    INSERT INTO upvotes (story_id, user_id) 
    VALUES (story_id_param, user_id_param);
    
    -- Incrementar el contador en la tabla stories
    new_upvotes := current_upvotes + 1;
    
    UPDATE stories 
    SET upvotes = new_upvotes 
    WHERE id = story_id_param;
    
    -- Devolver el resultado
    RETURN jsonb_build_object(
        'success', true,
        'already_voted', false,
        'previous_upvotes', current_upvotes,
        'new_upvotes', new_upvotes,
        'message', 'Upvote registered successfully'
    );
EXCEPTION
    WHEN OTHERS THEN
        -- En caso de error, devolver información sobre el error
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'error_detail', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Verificar que la función se creó correctamente
SELECT pg_get_functiondef('increment_story_upvote'::regproc);

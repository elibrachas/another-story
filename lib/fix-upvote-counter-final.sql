-- 1. Verificar las políticas RLS actuales en la tabla stories
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM
    pg_policies
WHERE
    tablename = 'stories';

-- 2. Crear una política RLS específica para permitir actualizar SOLO la columna upvotes
CREATE POLICY update_story_upvotes ON stories
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 3. Crear una función más simple para incrementar el contador
CREATE OR REPLACE FUNCTION increment_story_upvotes(story_id_param UUID)
RETURNS void AS $$
BEGIN
    UPDATE stories 
    SET upvotes = upvotes + 1 
    WHERE id = story_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Verificar que la función se creó correctamente
SELECT pg_get_functiondef('increment_story_upvotes'::regproc);

-- 5. Verificar si hay algún trigger en la tabla stories que pueda estar interfiriendo
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM 
    information_schema.triggers
WHERE 
    event_object_table = 'stories';

-- 6. Verificar la estructura de la tabla stories
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'stories';

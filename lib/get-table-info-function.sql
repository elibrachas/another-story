-- Crear una función para obtener información sobre una tabla
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

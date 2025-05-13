-- Funciones administrativas consolidadas

-- Función para aprobar una historia
CREATE OR REPLACE FUNCTION approve_story(story_id UUID) 
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN;
BEGIN
  UPDATE stories
  SET published = TRUE
  WHERE id = story_id;
  
  GET DIAGNOSTICS success = ROW_COUNT;
  RETURN success > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para rechazar una historia
CREATE OR REPLACE FUNCTION reject_story(story_id UUID) 
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN;
BEGIN
  DELETE FROM stories
  WHERE id = story_id;
  
  GET DIAGNOSTICS success = ROW_COUNT;
  RETURN success > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener historias pendientes
CREATE OR REPLACE FUNCTION get_pending_stories() 
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  author TEXT,
  industry TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.title, s.content, s.author, s.industry, s.created_at
  FROM stories s
  WHERE s.published = FALSE
  ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para procesar solicitudes de aprobación
CREATE OR REPLACE FUNCTION process_story_approval(action_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  target_story_id UUID;
  admin_user_id UUID;
  success BOOLEAN := false;
BEGIN
  -- Obtener información de la acción
  SELECT target_id, admin_id INTO target_story_id, admin_user_id
  FROM admin_actions
  WHERE id = action_id AND action_type = 'approve_story' AND status = 'pending';
  
  IF target_story_id IS NULL THEN
    -- Actualizar el registro de acción con error
    UPDATE admin_actions
    SET status = 'failed', processed_at = NOW(), error = 'Acción no encontrada o ya procesada'
    WHERE id = action_id;
    RETURN false;
  END IF;
  
  -- Intentar actualizar la historia
  BEGIN
    UPDATE stories
    SET published = TRUE
    WHERE id = target_story_id;
    
    success := true;
    
    -- Actualizar el registro de acción como completado
    UPDATE admin_actions
    SET status = 'completed', processed_at = NOW(), result = 'Historia publicada correctamente'
    WHERE id = action_id;
  EXCEPTION WHEN OTHERS THEN
    -- Actualizar el registro de acción con error
    UPDATE admin_actions
    SET status = 'failed', processed_at = NOW(), error = SQLERRM
    WHERE id = action_id;
    success := false;
  END;
  
  RETURN success;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar el estado de aprobación
CREATE OR REPLACE FUNCTION check_story_approval_status(story_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  published BOOLEAN,
  pending_approval BOOLEAN,
  last_action_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.title,
    s.published,
    EXISTS (
      SELECT 1 FROM admin_actions 
      WHERE target_id = s.id AND action_type = 'approve_story' AND status = 'pending'
    ) AS pending_approval,
    (
      SELECT status FROM admin_actions 
      WHERE target_id = s.id AND action_type = 'approve_story'
      ORDER BY created_at DESC LIMIT 1
    ) AS last_action_status
  FROM stories s
  WHERE s.id = story_id;
END;
$$ LANGUAGE plpgsql;

-- Función para contar etiquetas
CREATE OR REPLACE FUNCTION count_stories_by_tag()
RETURNS TABLE (
  tag_id UUID,
  tag_name TEXT,
  story_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id AS tag_id,
    t.name AS tag_name,
    COUNT(st.story_id) AS story_count
  FROM 
    tags t
  LEFT JOIN 
    story_tags st ON t.id = st.tag_id
  LEFT JOIN 
    stories s ON st.story_id = s.id AND s.published = true
  GROUP BY 
    t.id, t.name
  ORDER BY 
    story_count DESC, t.name;
END;
$$ LANGUAGE plpgsql;

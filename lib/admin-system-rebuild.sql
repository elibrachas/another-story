-- Crear una tabla para solicitudes de aprobación
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  admin_id UUID NOT NULL,
  result TEXT,
  error TEXT
);

-- Crear una política para permitir a los administradores insertar acciones
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_actions_insert ON admin_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY admin_actions_select ON admin_actions
  FOR SELECT
  TO authenticated
  USING (true);

-- Crear una función para procesar las solicitudes de aprobación
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

-- Crear una función para verificar el estado de una historia
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

-- Crear una función para obtener todas las historias pendientes
CREATE OR REPLACE FUNCTION get_pending_stories()
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  author TEXT,
  industry TEXT,
  created_at TIMESTAMPTZ,
  pending_approval BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.title,
    s.content,
    s.author,
    s.industry,
    s.created_at,
    EXISTS (
      SELECT 1 FROM admin_actions 
      WHERE target_id = s.id AND action_type = 'approve_story' AND status = 'pending'
    ) AS pending_approval
  FROM stories s
  WHERE s.published = FALSE
  ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql;

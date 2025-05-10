-- Crear tabla para logs administrativos
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  user_id UUID NOT NULL,
  target_id UUID,
  details JSONB,
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_user_id ON admin_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);

-- Establecer políticas de seguridad
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Solo los administradores pueden ver los logs
CREATE POLICY admin_logs_select ON admin_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.admin = true
    )
  );

-- Permitir inserción desde las funciones del servidor
CREATE POLICY admin_logs_insert ON admin_logs
  FOR INSERT
  WITH CHECK (true);

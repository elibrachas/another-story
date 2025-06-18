-- Add is_private column to stories table
ALTER TABLE stories ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;

-- Update policy to ensure only public stories are selectable by everyone
DROP POLICY IF EXISTS "Cualquiera puede leer historias publicadas" ON stories;
CREATE POLICY "Cualquiera puede leer historias publicadas"
ON stories FOR SELECT
USING (published = true AND is_private = false);

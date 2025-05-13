-- Verificar la estructura de la tabla upvotes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_name = 'upvotes';

-- Verificar la estructura de la tabla stories
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_name = 'stories' AND column_name = 'upvotes';

-- Verificar si hay restricciones en la tabla upvotes
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM
  information_schema.table_constraints tc
JOIN
  information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE
  tc.table_name = 'upvotes';

-- Verificar si hay políticas RLS en la tabla stories
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM
  pg_policies
WHERE
  tablename = 'stories';

-- Verificar si hay políticas RLS en la tabla upvotes
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM
  pg_policies
WHERE
  tablename = 'upvotes';

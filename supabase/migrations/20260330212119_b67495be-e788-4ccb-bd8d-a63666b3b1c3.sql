
-- Drop overly permissive policies on documentos
DROP POLICY IF EXISTS "Allow public delete on documentos" ON documentos;
DROP POLICY IF EXISTS "Allow public insert on documentos" ON documentos;
DROP POLICY IF EXISTS "Allow public update on documentos" ON documentos;

-- Recreate as authenticated-only
CREATE POLICY "Allow authenticated insert on documentos" ON documentos
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update on documentos" ON documentos
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on documentos" ON documentos
  FOR DELETE TO authenticated USING (true);

-- Drop overly permissive policies on empresas
DROP POLICY IF EXISTS "Allow public delete on empresas" ON empresas;
DROP POLICY IF EXISTS "Allow public insert on empresas" ON empresas;
DROP POLICY IF EXISTS "Allow public update on empresas" ON empresas;

-- Recreate as authenticated-only
CREATE POLICY "Allow authenticated insert on empresas" ON empresas
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update on empresas" ON empresas
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on empresas" ON empresas
  FOR DELETE TO authenticated USING (true);

-- Fix storage policies: drop anonymous access, keep authenticated
DROP POLICY IF EXISTS "Acesso Total ao Storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload to documentos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete from documentos bucket" ON storage.objects;

CREATE POLICY "Allow authenticated upload to documentos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documentos');

CREATE POLICY "Allow authenticated delete from documentos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'documentos');

-- RLS policies for documentos table
CREATE POLICY "Allow public read on documentos"
ON public.documentos FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public insert on documentos"
ON public.documentos FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public update on documentos"
ON public.documentos FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete on documentos"
ON public.documentos FOR DELETE
TO anon, authenticated
USING (true);

-- Storage RLS policies for documentos bucket
CREATE POLICY "Allow public upload to documentos bucket"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'documentos');

CREATE POLICY "Allow public read from documentos bucket"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'documentos');

CREATE POLICY "Allow public delete from documentos bucket"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'documentos');
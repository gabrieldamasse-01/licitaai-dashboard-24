
-- Allow public read access to empresas and licitacoes
CREATE POLICY "Allow public read access on empresas"
ON public.empresas FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public insert on empresas"
ON public.empresas FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public update on empresas"
ON public.empresas FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete on empresas"
ON public.empresas FOR DELETE
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public read access on licitacoes"
ON public.licitacoes FOR SELECT
TO anon, authenticated
USING (true);

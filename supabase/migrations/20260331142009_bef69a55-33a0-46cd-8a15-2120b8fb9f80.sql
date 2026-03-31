CREATE POLICY "Allow authenticated insert on licitacoes"
ON public.licitacoes
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update on licitacoes"
ON public.licitacoes
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
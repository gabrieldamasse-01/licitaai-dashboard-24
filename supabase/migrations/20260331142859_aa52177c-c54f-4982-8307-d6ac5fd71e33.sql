DROP INDEX IF EXISTS licitacoes_link_edital_unique;
ALTER TABLE public.licitacoes ADD CONSTRAINT licitacoes_link_edital_key UNIQUE (link_edital);
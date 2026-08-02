-- SCRIPT DE PARCHE (Fase 6: RLS para todas las tablas nuevas y actualizaciones)
-- Copia y pega en el SQL Editor de Supabase y ejecútalo.

-- Habilitar RLS en tablas restantes
ALTER TABLE public.juntada_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_players ENABLE ROW LEVEL SECURITY;

-- Políticas para juntada_attendees
CREATE POLICY "Permitir todo a juntada_attendees" ON public.juntada_attendees FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para games
CREATE POLICY "Permitir todo a games" ON public.games FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para matches
CREATE POLICY "Permitir todo a matches" ON public.matches FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para match_players
CREATE POLICY "Permitir todo a match_players" ON public.match_players FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas de UPDATE que faltaban en tablas anteriores
CREATE POLICY "Permitir update en group_members" ON public.group_members FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir update en juntadas" ON public.juntadas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

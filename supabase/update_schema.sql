-- SCRIPT DE ACTUALIZACIÓN (Códigos Cortos y Reparación de Perfiles)
-- Copia y pega este script en el SQL Editor de Supabase y ejecútalo.

-- 1. REPARACIÓN DEL ERROR DE FOREIGN KEY (Perfiles faltantes)
-- Esto soluciona el error al unirse: obliga a crear perfiles para las cuentas que se registraron antes de que existiera el Trigger.
INSERT INTO public.profiles (id, username)
SELECT id, COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1))
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 2. FUNCIÓN PARA GENERAR CÓDIGOS CORTOS (Ej: A4B9X2)
CREATE OR REPLACE FUNCTION public.generate_short_id() RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 3. RECREACIÓN DE TABLAS CON CÓDIGO CORTO
-- Al ser un entorno de pruebas, borraremos y recrearemos las tablas dependientes de grupos.
DROP TABLE IF EXISTS public.match_players CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.games CASCADE;
DROP TABLE IF EXISTS public.juntada_attendees CASCADE;
DROP TABLE IF EXISTS public.juntadas CASCADE;
DROP TABLE IF EXISTS public.group_members CASCADE;
DROP TABLE IF EXISTS public.groups CASCADE;

CREATE TABLE public.groups (
  id TEXT DEFAULT public.generate_short_id() PRIMARY KEY,
  name TEXT NOT NULL,
  admin_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE public.group_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id TEXT REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0 NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(group_id, user_id)
);

CREATE TABLE public.juntadas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id TEXT REFERENCES public.groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  state TEXT DEFAULT 'abierta' CHECK (state IN ('abierta', 'en_curso', 'finalizada')),
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE public.juntada_attendees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  juntada_id UUID REFERENCES public.juntadas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  check_in_time TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(juntada_id, user_id)
);

CREATE TABLE public.games (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  mode TEXT DEFAULT 'estandar' CHECK (mode IN ('estandar', 'torneo', 'asimetrico')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE public.matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  juntada_id UUID REFERENCES public.juntadas(id) ON DELETE CASCADE,
  game_id UUID REFERENCES public.games(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE public.match_players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_winner BOOLEAN DEFAULT FALSE,
  points_earned INTEGER DEFAULT 0 NOT NULL,
  UNIQUE(match_id, user_id)
);

-- 4. HABILITAR SEGURIDAD (RLS) NUEVAMENTE
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.juntadas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver todos los grupos" ON public.groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden crear grupos" ON public.groups FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden ver miembros" ON public.group_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden unirse a grupos" ON public.group_members FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden ver juntadas" ON public.juntadas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden crear juntadas" ON public.juntadas FOR INSERT TO authenticated WITH CHECK (true);

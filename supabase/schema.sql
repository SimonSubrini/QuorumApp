-- FASE 3: INFRAESTRUCTURA DE DATOS (MVP)
-- Copia y pega este script en el "SQL Editor" de tu panel de Supabase.

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: Perfiles (Se vincula con la tabla interna de usuarios de Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. TABLA: Grupos
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  admin_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. TABLA: Miembros de Grupos (Ranking y Puntaje Global)
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0 NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(group_id, user_id)
);

-- 5. TABLA: Juntadas (Eventos)
CREATE TABLE IF NOT EXISTS public.juntadas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  state TEXT DEFAULT 'abierta' CHECK (state IN ('abierta', 'en_curso', 'finalizada')),
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. TABLA: Asistencia a Juntadas
CREATE TABLE IF NOT EXISTS public.juntada_attendees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  juntada_id UUID REFERENCES public.juntadas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  check_in_time TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(juntada_id, user_id)
);

-- 7. TABLA: Juegos (Catálogo disponible)
CREATE TABLE IF NOT EXISTS public.games (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  mode TEXT DEFAULT 'estandar' CHECK (mode IN ('estandar', 'torneo', 'asimetrico')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. TABLA: Partidas Jugadas
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  juntada_id UUID REFERENCES public.juntadas(id) ON DELETE CASCADE,
  game_id UUID REFERENCES public.games(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. TABLA: Jugadores por Partida (Resultados)
CREATE TABLE IF NOT EXISTS public.match_players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_winner BOOLEAN DEFAULT FALSE,
  points_earned INTEGER DEFAULT 0 NOT NULL,
  UNIQUE(match_id, user_id)
);

-- 10. TRIGGER PARA CREAR PERFIL AUTOMÁTICAMENTE
-- Al registrarse un usuario en Supabase Auth, se crea su Perfil Público
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 11. HABILITAR SEGURIDAD (RLS) - Básico para el MVP
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.juntadas ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para usuarios autenticados (MVP Rápido)
CREATE POLICY "Usuarios autenticados pueden ver perfiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios pueden editar su propio perfil" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Usuarios autenticados pueden ver todos los grupos" ON public.groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden crear grupos" ON public.groups FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden ver miembros" ON public.group_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden unirse a grupos" ON public.group_members FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden ver juntadas" ON public.juntadas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden crear juntadas" ON public.juntadas FOR INSERT TO authenticated WITH CHECK (true);

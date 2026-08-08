-- SCRIPT DE PARCHE (Fase 7: Apuestas, Votaciones y Decimales)
-- Ejecutar en SQL Editor de Supabase.

-- 1. Modificar tipos de datos para soportar decimales (NUMERIC(10,1))
ALTER TABLE public.group_members 
ALTER COLUMN points TYPE NUMERIC(10,1) USING points::NUMERIC;

ALTER TABLE public.match_players 
ALTER COLUMN points_earned TYPE NUMERIC(10,1) USING points_earned::NUMERIC;

-- 2. TABLA: Apuestas
CREATE TABLE IF NOT EXISTS public.bets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  juntada_id UUID REFERENCES public.juntadas(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10,1) NOT NULL,
  is_multiplayer BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'abierta' CHECK (status IN ('abierta', 'cerrada', 'resuelta', 'cancelada')),
  winner_option_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. TABLA: Opciones de Apuesta
CREATE TABLE IF NOT EXISTS public.bet_options (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bet_id UUID REFERENCES public.bets(id) ON DELETE CASCADE,
  description TEXT NOT NULL
);

ALTER TABLE public.bets
ADD CONSTRAINT fk_winner_option
FOREIGN KEY (winner_option_id) REFERENCES public.bet_options(id) ON DELETE SET NULL;

-- 4. TABLA: Participantes de Apuesta
CREATE TABLE IF NOT EXISTS public.bet_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bet_id UUID REFERENCES public.bets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  option_id UUID REFERENCES public.bet_options(id) ON DELETE CASCADE,
  points_won NUMERIC(10,1) DEFAULT 0,
  UNIQUE(bet_id, user_id)
);

-- 5. TABLA: Votaciones
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id TEXT REFERENCES public.groups(id) ON DELETE CASCADE,
  juntada_id UUID REFERENCES public.juntadas(id) ON DELETE CASCADE, -- Solo para anulación
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('acto_extraordinario', 'anulacion')),
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Solo para acto
  target_match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE, -- Solo para anulación
  description TEXT NOT NULL,
  status TEXT DEFAULT 'activa' CHECK (status IN ('activa', 'aprobada', 'rechazada')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. TABLA: Respuestas a Votaciones
CREATE TABLE IF NOT EXISTS public.vote_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vote_id UUID REFERENCES public.votes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  response BOOLEAN NOT NULL,
  UNIQUE(vote_id, user_id)
);

-- 7. RLS
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bet_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bet_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vote_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver apuestas" ON public.bets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios pueden insertar apuestas" ON public.bets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios pueden actualizar apuestas" ON public.bets FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios pueden ver opciones de apuesta" ON public.bet_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios pueden insertar opciones" ON public.bet_options FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Usuarios pueden ver participantes de apuesta" ON public.bet_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios pueden participar en apuestas" ON public.bet_participants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios pueden actualizar participantes" ON public.bet_participants FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios pueden ver votaciones" ON public.votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios pueden crear votaciones" ON public.votes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios pueden actualizar votaciones" ON public.votes FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios pueden ver votos" ON public.vote_responses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios pueden emitir votos" ON public.vote_responses FOR INSERT TO authenticated WITH CHECK (true);

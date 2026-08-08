-- Agrega la columna description que faltó en el parche inicial a la tabla bets
ALTER TABLE public.bets ADD COLUMN description TEXT NOT NULL DEFAULT 'Sin descripción';

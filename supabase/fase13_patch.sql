-- SCRIPT DE PARCHE (Fase 13: Agregar flag is_bot a perfiles)
-- Ejecutar en SQL Editor de Supabase.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT FALSE;

-- Marcar bots existentes
UPDATE public.profiles SET is_bot = true WHERE username LIKE 'Bot %';

-- Actualizar la funcion de inyectar bots
CREATE OR REPLACE FUNCTION inject_mock_users(p_group_id text, p_juntada_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_i int;
  v_names text[] := ARRAY['Bot Alfa', 'Bot Beta', 'Bot Gamma', 'Bot Delta', 'Bot Epsilon'];
  v_avatar text;
  v_suffix text;
  v_final_username text;
BEGIN
  FOR v_i IN 1..5 LOOP
    v_user_id := gen_random_uuid();
    v_avatar := 'avatar_' || (floor(random() * 15 + 1)::int)::text;
    v_suffix := substr(md5(random()::text), 1, 4);
    v_final_username := v_names[v_i] || '_' || v_suffix;

    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'bot' || v_i || '_' || v_suffix || '@quorumapp.com',
      crypt('password123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      json_build_object('username', v_final_username)::jsonb,
      now(),
      now()
    );

    UPDATE public.profiles 
    SET username = v_final_username, avatar_url = v_avatar, is_bot = true
    WHERE id = v_user_id;

    INSERT INTO public.group_members (group_id, user_id, points)
    VALUES (p_group_id, v_user_id, 0)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.juntada_attendees (juntada_id, user_id)
    VALUES (p_juntada_id, v_user_id)
    ON CONFLICT DO NOTHING;
    
  END LOOP;
END;
$$;

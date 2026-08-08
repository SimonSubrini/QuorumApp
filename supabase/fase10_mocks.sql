-- SCRIPT PARA GENERAR DATOS FICTICIOS (MOCKS)
-- Ejecutar en SQL Editor de Supabase

-- Función segura para inyectar 5 usuarios falsos en un grupo y juntada para testing
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

    -- 1. Insertar en perfiles (saltamos auth.users para este mock si las FK lo permiten,
    -- pero si profiles.id referencia auth.users, debemos insertarlo ahí primero).
    -- Nota: En Supabase, a veces es riesgoso insertar directo en auth.users, pero para tests locales está bien.
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

    -- 2. Actualizar el perfil (que se crea automáticamente por el trigger de Supabase)
    UPDATE public.profiles 
    SET username = v_final_username, avatar_url = v_avatar
    WHERE id = v_user_id;

    -- 3. Unir al grupo
    INSERT INTO public.group_members (group_id, user_id, points)
    VALUES (p_group_id, v_user_id, 0)
    ON CONFLICT DO NOTHING;

    -- 4. Hacer Check-In en la juntada actual
    INSERT INTO public.juntada_attendees (juntada_id, user_id)
    VALUES (p_juntada_id, v_user_id)
    ON CONFLICT DO NOTHING;
    
  END LOOP;
END;
$$;

-- SCRIPT DE PARCHE (Fase 14: Politica para abandonar grupos)
-- Ejecutar en SQL Editor de Supabase.

CREATE POLICY "Usuarios pueden abandonar grupos" 
ON public.group_members 
FOR DELETE 
TO authenticated 
USING (user_id = auth.uid());

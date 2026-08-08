import { supabase } from '../lib/supabase';

export const injectMockUsers = async (groupId: string, juntadaId: string) => {
  const { error } = await supabase.rpc('inject_mock_users', {
    p_group_id: groupId,
    p_juntada_id: juntadaId
  });
  
  if (error) {
    throw new Error(error.message);
  }
  return true;
};

import { injectMockUsers } from '../mockGenerator';
import { supabase } from '../../lib/supabase';

// Mock de Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

describe('Generador de Mocks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe llamar a supabase.rpc con los parámetros correctos y retornar true si es exitoso', async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });

    const result = await injectMockUsers('group-123', 'juntada-456');

    expect(supabase.rpc).toHaveBeenCalledWith('inject_mock_users', {
      p_group_id: 'group-123',
      p_juntada_id: 'juntada-456'
    });
    expect(result).toBe(true);
  });

  it('debe arrojar un error si supabase.rpc falla', async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({ 
      error: { message: 'null value in column "username" of relation "profiles"' } 
    });

    await expect(injectMockUsers('group-123', 'juntada-456')).rejects.toThrow(
      'null value in column "username" of relation "profiles"'
    );
  });
});

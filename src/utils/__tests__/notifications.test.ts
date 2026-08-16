import { sendPushNotifications } from '../notifications';

// Mockear supabase para evitar el error de AsyncStorage en Jest
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      update: jest.fn(),
      select: jest.fn(),
    })),
  },
}));

describe('notifications', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ data: 'ok' }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('sendPushNotifications', () => {
    it('debe filtrar tokens inválidos o mal formados antes de enviar', async () => {
      const tokens = [
        'ExponentPushToken[12345]', // Válido
        'random_token_123', // Inválido
        '', // Inválido
        null as unknown as string, // Inválido
        'ExponentPushToken[67890]' // Válido
      ];

      await sendPushNotifications(tokens, 'Test Title', 'Test Body', { id: 1 });

      expect(global.fetch).toHaveBeenCalledTimes(1);

      const fetchCallArgs = (global.fetch as jest.Mock).mock.calls[0];
      const payload = JSON.parse(fetchCallArgs[1].body);

      // Solo 2 mensajes deben ser enviados
      expect(payload).toHaveLength(2);
      expect(payload[0].to).toBe('ExponentPushToken[12345]');
      expect(payload[1].to).toBe('ExponentPushToken[67890]');
      expect(payload[0].title).toBe('Test Title');
      expect(payload[0].data).toEqual({ id: 1 });
    });

    it('NO debe invocar a fetch si todos los tokens son inválidos', async () => {
      const tokens = ['fake_token', ''];
      
      await sendPushNotifications(tokens, 'Test', 'Body');

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});

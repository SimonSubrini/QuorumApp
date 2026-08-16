import { getAvatarSource, LOCAL_AVATARS } from '../avatars';

describe('avatars logic', () => {
  describe('getAvatarSource', () => {
    it('debe retornar null si la url es vacía o nula', () => {
      expect(getAvatarSource(null)).toBeNull();
      expect(getAvatarSource(undefined)).toBeNull();
      expect(getAvatarSource('')).toBeNull();
    });

    it('debe retornar un objeto uri si la url es remota (http/https)', () => {
      const url = 'https://example.com/avatar.png';
      expect(getAvatarSource(url)).toEqual({ uri: url });
    });

    it('debe retornar un objeto uri si la url es un archivo local del dispositivo (file://)', () => {
      const url = 'file:///data/user/0/com.quorumapp/cache/ImagePicker/avatar.png';
      expect(getAvatarSource(url)).toEqual({ uri: url });
    });

    it('debe resolver a un recurso local de React Native si la url coincide con una key estática', () => {
      const source = getAvatarSource('avatar_1');
      // No podemos hacer un toEqual exacto a un require() ya que Jest lo mockea como un número o string opaco,
      // pero podemos asegurar que es exactamente lo que está en LOCAL_AVATARS
      expect(source).toBe(LOCAL_AVATARS['avatar_1']);
    });

    it('debe hacer fallback a uri si se pasa un string aleatorio que no es url ni key válida', () => {
      const source = getAvatarSource('cualquier_cosa_invalida');
      expect(source).toEqual({ uri: 'cualquier_cosa_invalida' });
    });
  });
});

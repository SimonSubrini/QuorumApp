import { ImageSourcePropType } from 'react-native';

export const LOCAL_AVATARS: Record<string, ImageSourcePropType> = {
  'avatar_1': require('../../assets/avatars/avatar_1.png'),
  'avatar_2': require('../../assets/avatars/avatar_2.png'),
  'avatar_3': require('../../assets/avatars/avatar_3.png'),
  'avatar_4': require('../../assets/avatars/avatar_4.png'),
  'avatar_5': require('../../assets/avatars/avatar_5.png'),
  'avatar_6': require('../../assets/avatars/avatar_6.png'),
  'avatar_7': require('../../assets/avatars/avatar_7.png'),
  'avatar_8': require('../../assets/avatars/avatar_8.png'),
  'avatar_9': require('../../assets/avatars/avatar_9.png'),
  'avatar_10': require('../../assets/avatars/avatar_10.png'),
  'avatar_11': require('../../assets/avatars/avatar_11.png'),
  'avatar_12': require('../../assets/avatars/avatar_12.png'),
  'avatar_13': require('../../assets/avatars/avatar_13.png'),
  'avatar_14': require('../../assets/avatars/avatar_14.png'),
  'avatar_15': require('../../assets/avatars/avatar_15.png'),
};

export const DEFAULT_AVATAR_IDS = Object.keys(LOCAL_AVATARS);

export const getAvatarSource = (url: string | null | undefined): ImageSourcePropType | null => {
  if (!url) return null;
  // Si es una foto subida por el usuario o placeholder online
  if (url.startsWith('http') || url.startsWith('file://')) {
    return { uri: url };
  }
  // Si es uno de los avatares locales
  if (LOCAL_AVATARS[url]) {
    return LOCAL_AVATARS[url];
  }
  // Fallback
  return { uri: url };
};

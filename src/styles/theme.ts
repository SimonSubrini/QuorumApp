export const theme = {
  colors: {
    background: '#F4F4F0', // Blanco Tiza / Hueso
    primary: '#FF4D00', // Naranja Intenso (Acción/Botones)
    secondary: '#4361EE', // Azul Eléctrico (Datos/Dashboard)
    border: '#1A1A1A', // Negro Azabache (Estructura/Acentos)
    success: '#00F5D4', // Verde Neón (Validación/Éxito)
    text: '#1A1A1A', // Negro Azabache
    textLight: '#F4F4F0', // Blanco Tiza para botones oscuros o primarios
  },
  borders: {
    width: 4, // Bordes gruesos Neo-Brutalistas
    radius: 0, // Bordes cuadrados/duros
  },
  shadows: {
    neoBrutalism: {
      shadowColor: '#1A1A1A',
      shadowOffset: {
        width: 4,
        height: 4,
      },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 8, // Para Android
    },
  },
  typography: {
    // Para usar Custom Fonts (Space Grotesk, Inter), primero debemos instalarlas.
    // Por ahora definimos familias genéricas y tamaños base.
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
    }
  }
};

import React from 'react';
import { PixelRatio } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { NeoIconButton } from '../../src/components/NeoIconButton';
import { theme } from '../../src/styles/theme';

describe('Spec 00005: NeoIconButton', () => {
  const defaultProps = {
    icon: 'home' as const,
    onPress: jest.fn(),
    testID: 'neo-icon-button'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(1.0);
  });

  describe('RF-1: Renderizado del ícono', () => {
    it('CUANDO se renderiza, ENTONCES el contenedor debe existir', () => {
      const { getByTestId } = render(<NeoIconButton {...defaultProps} />);
      expect(getByTestId('neo-icon-button')).toBeTruthy();
    });
  });

  describe('RF-2: Variantes de diseño', () => {
    it('CUANDO no se especifica variante, ENTONCES usa primary por defecto', () => {
      const { getByTestId } = render(<NeoIconButton {...defaultProps} />);
      const button = getByTestId('neo-icon-button');
      
      expect(button.props.style).toEqual(
        expect.objectContaining({
          backgroundColor: theme.colors.primary,
        })
      );
    });

    it('CUANDO se usa variant="secondary", ENTONCES cambia el color de fondo', () => {
      const { getByTestId } = render(<NeoIconButton {...defaultProps} variant="secondary" />);
      const button = getByTestId('neo-icon-button');
      
      expect(button.props.style).toEqual(
        expect.objectContaining({
          backgroundColor: theme.colors.secondary,
        })
      );
    });

    it('CUANDO se usa variant="success", ENTONCES cambia el color de fondo', () => {
      const { getByTestId } = render(<NeoIconButton {...defaultProps} variant="success" />);
      const button = getByTestId('neo-icon-button');
      
      expect(button.props.style).toEqual(
        expect.objectContaining({
          backgroundColor: theme.colors.success,
        })
      );
    });
  });

  describe('RF-3: Interacción animada (Press)', () => {
    it('CUANDO se presiona el botón, ENTONCES el estilo se actualiza para hundirse (transform, shadow)', () => {
      const { getByTestId } = render(<NeoIconButton {...defaultProps} />);
      const button = getByTestId('neo-icon-button');

      // Antes del onPressIn
      expect(button.props.style).toEqual(
        expect.objectContaining({
          shadowOffset: { width: 2, height: 2 },
          transform: [{ translateX: 0 }, { translateY: 0 }],
        })
      );

      // Simulamos que el usuario pone el dedo
      fireEvent(button, 'onPressIn');
      
      expect(button.props.style).toEqual(
        expect.objectContaining({
          shadowOffset: { width: 0, height: 0 },
          transform: [{ translateX: 2 }, { translateY: 2 }],
        })
      );
      
      // Simulamos que el usuario levanta el dedo
      fireEvent(button, 'onPressOut');

      expect(button.props.style).toEqual(
        expect.objectContaining({
          shadowOffset: { width: 2, height: 2 },
          transform: [{ translateX: 0 }, { translateY: 0 }],
        })
      );
    });
    
    it('CUANDO se completa el press, ENTONCES ejecuta la función onPress', () => {
      const { getByTestId } = render(<NeoIconButton {...defaultProps} />);
      fireEvent.press(getByTestId('neo-icon-button'));
      expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('RF-4: Estado deshabilitado (Disabled)', () => {
    it('CUANDO está deshabilitado, ENTONCES el fondo es gris, shadow normal pero sin transform ni onPress', () => {
      const { getByTestId } = render(<NeoIconButton {...defaultProps} disabled={true} />);
      const button = getByTestId('neo-icon-button');
      
      // Colores deshabilitados
      expect(button.props.style).toEqual(
        expect.objectContaining({
          backgroundColor: '#A0A0A0',
        })
      );
      
      // Si se intenta presionar visualmente, no debe haber transformación
      fireEvent(button, 'onPressIn');
      expect(button.props.style).toEqual(
        expect.objectContaining({
          transform: [{ translateX: 0 }, { translateY: 0 }],
        })
      );
      
      // No debe emitir onPress
      fireEvent.press(button);
      expect(defaultProps.onPress).not.toHaveBeenCalled();
    });
  });

  describe('RF-5: Accesibilidad por tamaño de fuente', () => {
    it('CUANDO la escala es > 1.2, ENTONCES padding es 6', () => {
      jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(1.5);
      const { getByTestId } = render(<NeoIconButton {...defaultProps} />);
      const button = getByTestId('neo-icon-button');
      
      expect(button.props.style).toEqual(
        expect.objectContaining({ padding: 6 })
      );
    });

    it('CUANDO la escala es <= 1.2, ENTONCES padding es 10', () => {
      jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(1.0);
      const { getByTestId } = render(<NeoIconButton {...defaultProps} />);
      const button = getByTestId('neo-icon-button');
      
      expect(button.props.style).toEqual(
        expect.objectContaining({ padding: 10 })
      );
    });
  });
  
  describe('RF-6: Accesibilidad nativa', () => {
    it('CUANDO se pasa accessibilityLabel, ENTONCES se le inyecta correctamente al TouchableOpacity', () => {
      const { getByTestId } = render(
        <NeoIconButton {...defaultProps} accessibilityLabel="Cerrar ventana" />
      );
      const button = getByTestId('neo-icon-button');
      
      expect(button.props.accessibilityLabel).toBe('Cerrar ventana');
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessible).toBe(true);
    });
  });
});

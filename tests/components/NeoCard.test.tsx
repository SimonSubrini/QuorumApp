import React from 'react';
import { Text, PixelRatio } from 'react-native';
import { render } from '@testing-library/react-native';
import { NeoCard } from '../../src/components/NeoCard';
import { theme } from '../../src/styles/theme';

// No necesitamos hacer jest.mock completo porque rompe StyleSheet.
// Usaremos jest.spyOn sobre PixelRatio.getFontScale en los tests.

describe('Spec 00004: NeoCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(1.0);
  });

  describe('RF-1: Renderizado de contenido', () => {
    it('CUANDO se proveen children, ENTONCES deben renderizarse correctamente dentro del Card', () => {
      const { getByText } = render(
        <NeoCard>
          <Text>Contenido Interno</Text>
        </NeoCard>
      );
      
      expect(getByText('Contenido Interno')).toBeTruthy();
    });
  });

  describe('RF-2: Estilo Neo-Brutalista base', () => {
    it('CUANDO se renderiza el componente, ENTONCES debe aplicar los estilos base del tema Neo-Brutalista', () => {
      const { getByTestId } = render(
        <NeoCard testID="neo-card-container">
          <Text>Test</Text>
        </NeoCard>
      );
      
      const container = getByTestId('neo-card-container');
      expect(container.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: theme.colors.background,
            borderWidth: theme.borders.width,
            borderColor: theme.colors.border,
            borderRadius: theme.borders.radius,
            shadowColor: theme.shadows.neoBrutalism.shadowColor,
            shadowOffset: theme.shadows.neoBrutalism.shadowOffset,
          })
        ])
      );
    });
  });

  describe('RF-3: Estilos personalizados', () => {
    it('CUANDO se provee la prop style, ENTONCES debe combinarse con los estilos base', () => {
      const { getByTestId } = render(
        <NeoCard testID="neo-card-container" style={{ marginVertical: 30, backgroundColor: 'red' }}>
          <Text>Test</Text>
        </NeoCard>
      );
      
      const container = getByTestId('neo-card-container');
      
      // En RN, la prop style se convierte a un array o un flat object dependiendo del render,
      // pero el testing library suele procesarlo en un objeto aplanado para aserciones
      expect(container.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            marginVertical: 30,
            backgroundColor: 'red'
          })
        ])
      );
    });
  });

  describe('RF-4: Accesibilidad por tamaño de fuente', () => {
    it('CUANDO la escala de fuente es mayor a 1.2, ENTONCES debe reducir el padding a 12', () => {
      // Configuramos el mock para simular una fuente grande
      jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(1.5);
      
      const { getByTestId } = render(
        <NeoCard testID="neo-card-container">
          <Text>Test</Text>
        </NeoCard>
      );
      
      const container = getByTestId('neo-card-container');
      
      expect(container.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            padding: 12
          })
        ])
      );
    });

    it('CUANDO la escala de fuente es menor o igual a 1.2, ENTONCES debe mantener el padding normal', () => {
      jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(1.0);
      
      const { getByTestId } = render(
        <NeoCard testID="neo-card-container">
          <Text>Test</Text>
        </NeoCard>
      );
      
      const container = getByTestId('neo-card-container');
      
      expect(container.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            padding: 20 // Padding por defecto de styles.container
          })
        ])
      );
    });
  });

  describe('RF-5: Accesibilidad nativa', () => {
    it('CUANDO se provee accessibilityRole, ENTONCES debe marcarse como accessible y asignar el rol', () => {
      const { getByTestId } = render(
        <NeoCard testID="neo-card-container" accessibilityRole="summary">
          <Text>Test</Text>
        </NeoCard>
      );
      
      const container = getByTestId('neo-card-container');
      
      expect(container.props.accessible).toBe(true);
      expect(container.props.accessibilityRole).toBe('summary');
    });
    
    it('CUANDO NO se provee accessibilityRole, ENTONCES no debe marcarse forzosamente como accessible', () => {
      const { getByTestId } = render(
        <NeoCard testID="neo-card-container">
          <Text>Test</Text>
        </NeoCard>
      );
      
      const container = getByTestId('neo-card-container');
      
      expect(container.props.accessible).toBe(false);
      expect(container.props.accessibilityRole).toBeUndefined();
    });
  });
});

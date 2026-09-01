import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NeoInput } from '../../src/components/NeoInput';

describe('Spec 00003: NeoInput', () => {
  describe('RF-1: Renderizado básico y etiqueta', () => {
    it('CUANDO se proporcione la prop label, ENTONCES el componente debe renderizar el texto de la etiqueta en mayúsculas', () => {
      const { getByText } = render(<NeoInput label="Correo" />);
      const labelText = getByText('Correo');
      
      expect(labelText).toBeTruthy();
      expect(labelText.props.style).toEqual(
        expect.objectContaining({ textTransform: 'uppercase' })
      );
    });
  });

  describe('RF-2: Estado de Foco (Feedback visual)', () => {
    it('MIENTRAS el campo de texto tenga el foco activo, ENTONCES su contenedor debe cambiar a fondo blanco y trasladarse', () => {
      const { getByTestId } = render(<NeoInput />);
      const inputField = getByTestId('neo-input-field');
      const wrapper = getByTestId('neo-input-wrapper');

      // Simulamos Focus
      fireEvent(inputField, 'focus');
      
      expect(wrapper.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: '#FFFFFF',
            transform: [{ translateX: 2 }, { translateY: 2 }]
          })
        ])
      );

      // Simulamos Blur
      fireEvent(inputField, 'blur');
      
      // Ya no debería tener el estilo focused
      expect(wrapper.props.style).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: '#FFFFFF',
          })
        ])
      );
    });
  });

  describe('RF-3: Modo Contraseña y alternancia de visibilidad', () => {
    it('CUANDO el componente reciba secureTextEntry, ENTONCES debe mostrar el botón y alternar visibilidad al presionarlo', () => {
      const { getByTestId, getByText } = render(<NeoInput secureTextEntry={true} />);
      const inputField = getByTestId('neo-input-field');
      const toggleButton = getByTestId('neo-input-visibility-toggle');
      
      // Estado inicial oculto (secureTextEntry = true) y botón dice "VER"
      expect(inputField.props.secureTextEntry).toBe(true);
      expect(getByText('VER')).toBeTruthy();

      // Hacemos click en "VER"
      fireEvent.press(toggleButton);

      // Ahora debe ser visible (secureTextEntry = false) y el botón decir "OCULTAR"
      expect(inputField.props.secureTextEntry).toBe(false);
      expect(getByText('OCULTAR')).toBeTruthy();
    });
  });

  describe('RF-4: Manejo y visualización de errores', () => {
    it('CUANDO el componente reciba error, ENTONCES debe mostrar el texto de error', () => {
      const { getByText } = render(<NeoInput error="Dato inválido" />);
      const errorText = getByText('Dato inválido');
      
      expect(errorText).toBeTruthy();
    });
  });
});

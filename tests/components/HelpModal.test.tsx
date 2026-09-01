import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HelpModal } from '../../src/components/HelpModal';
import { theme } from '../../src/styles/theme';

describe('Spec 00006: HelpModal', () => {
  const onCloseMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('RF-1: Visibilidad controlada', () => {
    it('CUANDO visible es falso, ENTONCES no debe renderizar el modal', () => {
      const { queryByTestId } = render(<HelpModal visible={false} onClose={onCloseMock} />);
      expect(queryByTestId('help-modal')).toBeNull();
    });

    it('CUANDO visible es verdadero, ENTONCES debe renderizar el modal', () => {
      const { getByTestId } = render(<HelpModal visible={true} onClose={onCloseMock} />);
      expect(getByTestId('help-modal')).toBeTruthy();
    });
  });

  describe('RF-2: Navegación de slides', () => {
    it('CUANDO se presiona el botón Siguiente, ENTONCES cambia el contenido al siguiente slide', () => {
      const { getByTestId } = render(<HelpModal visible={true} onClose={onCloseMock} />);
      
      const title = getByTestId('help-title');
      expect(title.props.children).toBe('Grupos y Juntadas'); // Slide 0

      const nextBtn = getByTestId('next-btn');
      fireEvent.press(nextBtn);

      // Slide 1
      expect(title.props.children).toBe('Partidas y Torneos');
    });

    it('CUANDO se presiona el botón Atrás, ENTONCES cambia el contenido al slide anterior', () => {
      const { getByTestId } = render(<HelpModal visible={true} onClose={onCloseMock} />);
      const title = getByTestId('help-title');
      
      // Avanzamos al slide 1
      fireEvent.press(getByTestId('next-btn'));
      expect(title.props.children).toBe('Partidas y Torneos');

      // Retrocedemos al slide 0
      fireEvent.press(getByTestId('prev-btn'));
      expect(title.props.children).toBe('Grupos y Juntadas');
    });
  });

  describe('RF-3: Límite de navegación', () => {
    it('CUANDO se está en el primer slide, ENTONCES el botón Atrás no puede retroceder más y es secondary', () => {
      const { getByTestId } = render(<HelpModal visible={true} onClose={onCloseMock} />);
      
      const title = getByTestId('help-title');
      expect(title.props.children).toBe('Grupos y Juntadas');

      // El botón prev usa variante secondary cuando currentSlide === 0
      const prevBtn = getByTestId('prev-btn');
      expect(prevBtn.props.style).toEqual(
        expect.objectContaining({ backgroundColor: theme.colors.secondary })
      );

      // Intentar retroceder más allá del 0 no debería cambiar el slide
      fireEvent.press(prevBtn);
      expect(title.props.children).toBe('Grupos y Juntadas');
    });

    it('CUANDO se está en el último slide, ENTONCES aparece el botón ¡ENTENDIDO! y desaparece Siguiente', () => {
      const { getByTestId, queryByTestId } = render(<HelpModal visible={true} onClose={onCloseMock} />);
      
      // Avanzamos al slide 2 (último)
      fireEvent.press(getByTestId('next-btn'));
      fireEvent.press(getByTestId('next-btn'));

      const title = getByTestId('help-title');
      expect(title.props.children).toBe('Apuestas y Votaciones');

      // Ya no debe existir next-btn
      expect(queryByTestId('next-btn')).toBeNull();
      
      // Debe existir el botón close-btn
      expect(getByTestId('close-btn')).toBeTruthy();
    });
  });

  describe('RF-4: Cierre del modal', () => {
    it('CUANDO se presiona el botón ¡ENTENDIDO!, ENTONCES invoca onClose', () => {
      const { getByTestId } = render(<HelpModal visible={true} onClose={onCloseMock} />);
      
      // Ir al último slide
      fireEvent.press(getByTestId('next-btn'));
      fireEvent.press(getByTestId('next-btn'));

      fireEvent.press(getByTestId('close-btn'));
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('CUANDO se dispara onRequestClose, ENTONCES invoca onClose', () => {
      const { getByTestId } = render(<HelpModal visible={true} onClose={onCloseMock} />);
      const modal = getByTestId('help-modal');
      
      fireEvent(modal, 'onRequestClose');
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('RF-5: Paginación visual', () => {
    it('CUANDO estamos en el slide 0, ENTONCES el primer dot está activo', () => {
      const { getByTestId } = render(<HelpModal visible={true} onClose={onCloseMock} />);
      
      const dot0 = getByTestId('pagination-dot-0');
      const dot1 = getByTestId('pagination-dot-1');

      // En nuestro CSS, dotActive inyecta un ancho de 20 y primary
      expect(dot0.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ width: 20, backgroundColor: theme.colors.primary })
        ])
      );

      // Los inactivos no tienen dotActive
      expect(dot1.props.style).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ width: 20, backgroundColor: theme.colors.primary })
        ])
      );
    });

    it('CUANDO avanzamos de slide, ENTONCES el dot activo cambia', () => {
      const { getByTestId } = render(<HelpModal visible={true} onClose={onCloseMock} />);
      
      fireEvent.press(getByTestId('next-btn'));
      
      const dot0 = getByTestId('pagination-dot-0');
      const dot1 = getByTestId('pagination-dot-1');

      expect(dot1.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ width: 20, backgroundColor: theme.colors.primary })
        ])
      );

      expect(dot0.props.style).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ width: 20, backgroundColor: theme.colors.primary })
        ])
      );
    });
  });
});

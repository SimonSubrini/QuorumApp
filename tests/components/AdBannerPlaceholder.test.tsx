import React from 'react';
import { render } from '@testing-library/react-native';
import { AdBannerPlaceholder } from '../../src/components/AdBannerPlaceholder';

describe('Spec 00001: AdBannerPlaceholder', () => {
  describe('RF-1: Dimensiones fijas', () => {
    it('CUANDO el componente sea renderizado, ENTONCES debe ocupar el 100% del ancho y 50px de altura', () => {
      const { getByTestId } = render(<AdBannerPlaceholder />);
      const container = getByTestId('ad-banner-container');
      
      expect(container.props.style).toEqual(
        expect.objectContaining({
          height: 50,
          width: '100%',
        })
      );
    });
  });

  describe('RF-2: Mensajes indicativos', () => {
    it('CUANDO el componente sea renderizado, ENTONCES debe mostrar los textos de reserva truncados', () => {
      const { getByText } = render(<AdBannerPlaceholder />);
      
      const title = getByText('Espacio reservado para Anuncio (AdMob)');
      const subtitle = getByText('320x50');
      
      expect(title).toBeTruthy();
      expect(subtitle).toBeTruthy();
      expect(title.props.numberOfLines).toBe(1);
    });
  });

  describe('RF-3: Estilo visual distintivo', () => {
    it('CUANDO el componente sea renderizado, ENTONCES debe tener fondo y borde gris', () => {
      const { getByTestId } = render(<AdBannerPlaceholder />);
      const container = getByTestId('ad-banner-container');
      
      expect(container.props.style).toEqual(
        expect.objectContaining({
          backgroundColor: '#e0e0e0',
          borderTopColor: '#bdbdbd',
        })
      );
    });
  });
});


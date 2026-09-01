import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

export const AdBannerPlaceholder = () => {
  return (
    <View style={styles.container} testID="ad-banner-container">
      <Text style={styles.text} numberOfLines={1}>Espacio reservado para Anuncio (AdMob)</Text>
      <Text style={styles.subtext}>320x50</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    backgroundColor: '#e0e0e0',
    borderTopWidth: 1,
    borderTopColor: '#bdbdbd',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  text: {
    color: '#757575',
    fontWeight: 'bold',
    fontSize: 12,
  },
  subtext: {
    color: '#9e9e9e',
    fontSize: 10,
  }
});

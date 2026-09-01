import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme';
import { NeoButton } from './NeoButton';
import { NeoIconButton } from './NeoIconButton';
import { NeoCard } from './NeoCard';

const HELP_SLIDES = [
  {
    title: 'Grupos y Juntadas',
    content: 'Un GRUPO es tu círculo de amigos. Dentro del grupo podés crear JUNTADAS cada vez que se reúnan. Hacé "Check-in" cuando llegues para ganar tus puntos base y confirmar que estás presente.'
  },
  {
    title: 'Partidas y Torneos',
    content: 'En una juntada podés registrar PARTIDAS de distintos juegos. El ganador de la partida suma puntos extra para el Ranking global del Grupo. ¡Competí y subí en el podio!'
  },
  {
    title: 'Apuestas y Votaciones',
    content: '¡No hace falta jugar para ganar! Podés APOSTAR por otros jugadores y ganar puntos si ellos ganan. También podés organizar VOTACIONES (ej. "Mejor jugador de la noche") para repartir puntos democráticamente.'
  }
];

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
}

export const HelpModal = ({ visible, onClose }: HelpModalProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < HELP_SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  if (!visible) return null;

  return (
    <Modal testID="help-modal" transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <NeoCard style={styles.modalCard}>
          <View style={styles.header}>
            <Text testID="help-title" style={styles.title}>{HELP_SLIDES[currentSlide].title}</Text>
          </View>
          
          <View style={styles.contentContainer}>
            <Text testID="help-content" style={styles.content}>{HELP_SLIDES[currentSlide].content}</Text>
          </View>

          <View style={styles.pagination}>
            {HELP_SLIDES.map((_, index) => (
              <View 
                key={index} 
                testID={`pagination-dot-${index}`}
                style={[
                  styles.dot, 
                  currentSlide === index && styles.dotActive
                ]} 
              />
            ))}
          </View>

          <View style={styles.footer}>
            <NeoIconButton 
              testID="prev-btn"
              icon="chevron-back" 
              onPress={handlePrev} 
              variant={currentSlide === 0 ? 'secondary' : 'primary'} 
            />
            
            {currentSlide === HELP_SLIDES.length - 1 ? (
              <View style={{ flex: 1, marginLeft: 10 }}>
                <NeoButton testID="close-btn" title="¡ENTENDIDO!" onPress={onClose} />
              </View>
            ) : (
              <View style={{ flex: 1, marginLeft: 10, alignItems: 'flex-end' }}>
                <NeoIconButton 
                  testID="next-btn"
                  icon="chevron-forward" 
                  onPress={handleNext} 
                  variant="primary" 
                />
              </View>
            )}
          </View>
        </NeoCard>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    padding: 0,
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.primary,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000',
    textTransform: 'uppercase',
  },
  contentContainer: {
    padding: 30,
    minHeight: 180,
    justifyContent: 'center',
  },
  content: {
    fontSize: 18,
    lineHeight: 28,
    color: theme.colors.text,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.border,
    borderWidth: 1,
    borderColor: '#000',
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
    width: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 2,
    borderTopColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});

import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import type { LetterState } from 'wordle-engine';
import { useTheme } from '../ThemeProvider';
import { Tile } from './Tile';

export interface RowProps {
  letters: ReadonlyArray<{ letter?: string; state: LetterState }>;
  tileSize?: number;
  /** Triggers a horizontal shake animation when this value changes truthy. */
  shakeKey?: number;
  /** Stagger interval (ms) for the per-tile reveal flip. */
  revealStagger?: number;
}

export function Row({
  letters,
  tileSize,
  shakeKey,
  revealStagger = 250,
}: RowProps) {
  const theme = useTheme();
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!shakeKey) return;
    const intensity = theme.animations?.shakeIntensity ?? 8;
    Animated.sequence([
      Animated.timing(shake, {
        toValue: -intensity,
        duration: 50,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(shake, {
        toValue: intensity,
        duration: 50,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(shake, {
        toValue: -intensity,
        duration: 50,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(shake, {
        toValue: intensity,
        duration: 50,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(shake, {
        toValue: 0,
        duration: 50,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [shakeKey, shake, theme.animations?.shakeIntensity]);

  return (
    <Animated.View
      style={[
        styles.row,
        { gap: theme.spacing.tileGap, transform: [{ translateX: shake }] },
      ]}
    >
      {letters.map((cell, i) => (
        <Tile
          key={i}
          letter={cell.letter}
          state={cell.state}
          size={tileSize}
          revealDelay={i * revealStagger}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

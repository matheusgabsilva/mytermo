import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import type { LetterState } from 'wordle-engine';
import { useTheme } from '../ThemeProvider';

export interface TileProps {
  letter?: string;
  state: LetterState;
  size?: number;
  /** Stagger (ms) before flip animation runs. Tile uses it when state becomes revealed. */
  revealDelay?: number;
}

const REVEALED_STATES: ReadonlyArray<LetterState> = ['correct', 'present', 'absent'];

export function Tile({ letter, state, size = 54, revealDelay = 0 }: TileProps) {
  const theme = useTheme();
  const flip = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(1)).current;

  const isRevealed = REVEALED_STATES.includes(state);
  const isFilled = state === 'edited' || isRevealed;

  useEffect(() => {
    if (isRevealed) {
      flip.setValue(0);
      Animated.sequence([
        Animated.delay(revealDelay),
        Animated.timing(flip, {
          toValue: 1,
          duration: theme.animations?.flipDuration ?? 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      flip.setValue(0);
    }
  }, [isRevealed, revealDelay, flip, theme.animations?.flipDuration, state]);

  useEffect(() => {
    if (state === 'edited' && letter) {
      pop.setValue(0.85);
      Animated.spring(pop, {
        toValue: 1,
        friction: 4,
        tension: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [letter, state, pop]);

  const bgColor =
    state === 'correct' || state === 'present' || state === 'absent'
      ? theme.colors.tile[state]
      : theme.colors.tile.empty;
  const borderColor =
    state === 'edited' ? theme.colors.tile.borderActive : theme.colors.tile.borderIdle;
  const textColor = isRevealed
    ? theme.colors.tile.textOnFilled
    : theme.colors.tile.textOnEmpty;
  const borderWidth = isRevealed ? 0 : 2;

  const rotateX = flip.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '0deg'],
  });

  return (
    <Animated.View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          backgroundColor: bgColor,
          borderColor,
          borderWidth,
          transform: [{ perspective: 600 }, { rotateX }, { scale: pop }],
        },
      ]}
    >
      <Text
        style={{
          fontSize: size ? Math.round(size * 0.58) : theme.typography.sizes.tile,
          color: textColor,
          fontFamily: theme.typography.fontFamily.bold,
          fontWeight: '700',
        }}
        accessibilityRole="text"
      >
        {letter ?? ''}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
});

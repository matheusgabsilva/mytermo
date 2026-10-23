import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { LetterState } from 'wordle-engine';
import { useTheme } from '../ThemeProvider';

export type KeyValue = string | 'ENTER' | 'BACK';

export interface KeyProps {
  value: KeyValue;
  state?: LetterState;
  /** Estado por tabuleiro (ex: no dueto array com 2 estados, no quarteto com 4) */
  boardStates?: LetterState[];
  onPress: (value: KeyValue) => void;
  flex?: number;
  label?: string;
}

export function Key({
  value,
  state = 'empty',
  boardStates,
  onPress,
  flex = 1,
  label,
}: KeyProps) {
  const theme = useTheme();

  const isSpecial = value === 'ENTER' || value === 'BACK';
  const display =
    label ?? (value === 'BACK' ? '⌫' : value === 'ENTER' ? '↵' : value);

  // Se boardStates for fornecido e tiver múltiplos tabuleiros
  const hasMultiBoards =
    !isSpecial && boardStates && boardStates.length > 1;

  const getColorForState = (st?: LetterState) => {
    if (st === 'correct' || st === 'present' || st === 'absent') {
      return theme.colors.key[st];
    }
    return theme.colors.key.default;
  };

  // Se há algum estado preenchido, define cor do texto
  const hasFilled =
    hasMultiBoards
      ? boardStates!.some((s) => s === 'correct' || s === 'present' || s === 'absent')
      : state === 'correct' || state === 'present' || state === 'absent';

  const textColor = hasFilled
    ? theme.colors.key.textOnFilled
    : theme.colors.key.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Key ${value}`}
      onPress={() => onPress(value)}
      style={({ pressed }) => [
        styles.key,
        {
          flex,
          backgroundColor: hasMultiBoards
            ? theme.colors.key.default
            : getColorForState(state),
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {/* Background particionado para multi-boards (Dueto: split vertical / Quarteto: 4 quadrantes) */}
      {hasMultiBoards && boardStates!.length === 2 ? (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <View style={styles.splitRow}>
            <View
              style={[
                styles.splitHalf,
                { backgroundColor: getColorForState(boardStates![0]) },
              ]}
            />
            <View
              style={[
                styles.splitHalf,
                { backgroundColor: getColorForState(boardStates![1]) },
              ]}
            />
          </View>
        </View>
      ) : hasMultiBoards && boardStates!.length === 4 ? (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <View style={styles.quadrantRow}>
            <View
              style={[
                styles.quadrantCell,
                { backgroundColor: getColorForState(boardStates![0]) },
              ]}
            />
            <View
              style={[
                styles.quadrantCell,
                { backgroundColor: getColorForState(boardStates![1]) },
              ]}
            />
          </View>
          <View style={styles.quadrantRow}>
            <View
              style={[
                styles.quadrantCell,
                { backgroundColor: getColorForState(boardStates![2]) },
              ]}
            />
            <View
              style={[
                styles.quadrantCell,
                { backgroundColor: getColorForState(boardStates![3]) },
              ]}
            />
          </View>
        </View>
      ) : null}

      <View pointerEvents="none" style={styles.textWrapper}>
        <Text
          style={{
            color: textColor,
            fontSize: theme.typography.sizes.key,
            fontFamily: theme.typography.fontFamily.bold,
            fontWeight: '700',
          }}
        >
          {display}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  key: {
    minHeight: 52,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  textWrapper: {
    zIndex: 2,
  },
  splitRow: {
    flex: 1,
    flexDirection: 'row',
  },
  splitHalf: {
    flex: 1,
  },
  quadrantRow: {
    flex: 1,
    flexDirection: 'row',
  },
  quadrantCell: {
    flex: 1,
  },
});

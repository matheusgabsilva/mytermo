import { StyleSheet, View } from 'react-native';
import type { LetterState } from 'wordle-engine';
import { Key, type KeyValue } from './Key';

const ROWS: ReadonlyArray<ReadonlyArray<KeyValue>> = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];

export interface KeyboardProps {
  letterStates?: Record<string, LetterState>;
  letterBoardStates?: Record<string, LetterState[]>;
  onPress: (value: KeyValue) => void;
}

export function Keyboard({
  letterStates,
  letterBoardStates,
  onPress,
}: KeyboardProps) {
  return (
    <View style={styles.container}>
      {ROWS.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {row.map((value) => {
            const state =
              value === 'ENTER' || value === 'BACK'
                ? 'empty'
                : letterStates?.[value] ?? 'empty';
            const boardStates =
              value === 'ENTER' || value === 'BACK'
                ? undefined
                : letterBoardStates?.[value];
            const flex = value === 'ENTER' || value === 'BACK' ? 1.5 : 1;
            return (
              <Key
                key={value}
                value={value}
                state={state}
                boardStates={boardStates}
                onPress={onPress}
                flex={flex}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

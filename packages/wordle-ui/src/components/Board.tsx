import { StyleSheet, View } from 'react-native';
import type { EvaluatedLetter, LetterState } from 'wordle-engine';
import { useTheme } from '../ThemeProvider';
import { Row } from './Row';

export interface BoardProps {
  guesses: ReadonlyArray<ReadonlyArray<EvaluatedLetter>>;
  currentGuess: string;
  wordLength: number;
  maxAttempts: number;
  /** Se o tabuleiro já foi resolvido */
  isSolved?: boolean;
  tileSize?: number;
  /** Increments when current guess should shake (e.g. rejected submit). */
  shakeKey?: number;
}

export function Board({
  guesses,
  currentGuess,
  wordLength,
  maxAttempts,
  isSolved = false,
  tileSize,
  shakeKey,
}: BoardProps) {
  const theme = useTheme();
  const rows: Array<Array<{ letter?: string; state: LetterState }>> = [];

  for (const guess of guesses) {
    rows.push(guess.map((c) => ({ letter: c.letter, state: c.state })));
  }

  // Se o tabuleiro não foi resolvido e ainda há tentativas, mostra a linha atual
  if (!isSolved && rows.length < maxAttempts) {
    const cur: Array<{ letter?: string; state: LetterState }> = [];
    for (let i = 0; i < wordLength; i++) {
      const ch = currentGuess[i];
      cur.push({ letter: ch, state: ch ? 'edited' : 'empty' });
    }
    rows.push(cur);
  }

  // Preenche as linhas vazias restantes até maxAttempts
  while (rows.length < maxAttempts) {
    rows.push(
      Array.from({ length: wordLength }, () => ({
        state: 'empty' as LetterState,
      })),
    );
  }

  const currentIndex = guesses.length;

  return (
    <View style={[styles.board, { gap: theme.spacing.rowGap }]}>
      {rows.map((cells, i) => (
        <Row
          key={i}
          letters={cells}
          tileSize={tileSize}
          shakeKey={!isSolved && i === currentIndex ? shakeKey : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    alignSelf: 'center',
  },
});

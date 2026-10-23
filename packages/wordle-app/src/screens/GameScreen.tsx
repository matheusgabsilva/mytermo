import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { GameMode } from 'wordle-engine';
import {
  BackgroundImage,
  Board,
  EndGameModal,
  Header,
  Keyboard,
  PitchStripes,
  Toast,
  useTheme,
  type KeyValue,
} from 'wordle-ui';
import { useMultiGame } from '../hooks/useMultiGame';
import { usePersistedUsedWords } from '../hooks/usePersistedUsedWords';
import {
  pickDailyWords,
  pickMultipleWords,
} from '../services/multiWordPicker';

export function GameScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [currentMode, setCurrentMode] = useState<GameMode>('termo');
  const [playType, setPlayType] = useState<'free' | 'daily'>('free');

  const wordList = theme.wordList.pt;
  const validSet = useMemo(() => {
    const extra = theme.wordList.validGuesses?.pt ?? [];
    return new Set<string>([...wordList, ...extra]);
  }, [wordList, theme.wordList.validGuesses]);

  const { used, loaded: usedLoaded, markUsed } = usePersistedUsedWords(
    theme.id,
    'pt',
  );

  const usedRef = useRef(used);
  usedRef.current = used;

  const pickTargetsForMode = useCallback(
    (mode: GameMode): string[] => {
      const count = mode === 'quarteto' ? 4 : mode === 'dueto' ? 2 : 1;
      if (playType === 'daily') {
        return pickDailyWords(wordList, count, mode);
      }
      return pickMultipleWords(wordList, count, usedRef.current);
    },
    [wordList, playType],
  );

  const config = useMemo(
    () => ({
      wordLength: 5,
      isValidGuess: (g: string) => validSet.has(g),
    }),
    [validSet],
  );

  const { state, shakeKey, addLetter, removeLetter, submit, reset } =
    useMultiGame({
      mode: currentMode,
      pickTargets: pickTargetsForMode,
      config,
    });

  // Marca palavras como usadas no modo livre
  useEffect(() => {
    if (playType === 'free') {
      state.boards.forEach((b) => {
        if (b.targetNormalized) markUsed(b.targetNormalized);
      });
    }
  }, [state.boards, markUsed, playType]);

  // Teclado físico no Desktop / Web
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (state.phase === 'won' || state.phase === 'lost') {
        if (e.key === 'Enter') {
          e.preventDefault();
          reset();
        }
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        submit();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        removeLetter();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        addLetter(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.phase, submit, removeLetter, addLetter, reset]);

  const handleKey = (k: KeyValue) => {
    if (k === 'ENTER') submit();
    else if (k === 'BACK') removeLetter();
    else addLetter(k);
  };

  const handleModeChange = (nextMode: GameMode) => {
    setCurrentMode(nextMode);
    reset(nextMode);
  };

  const handleTogglePlayType = (nextType: 'free' | 'daily') => {
    setPlayType(nextType);
    reset(currentMode);
  };

  const errorMessage = useMemo(() => {
    if (state.lastRejection === 'too_short') return 'Letras insuficientes';
    if (state.lastRejection === 'invalid_word') return 'Palavra não encontrada';
    return '';
  }, [state.lastRejection]);

  const isEnd = state.phase === 'won' || state.phase === 'lost';
  const targetWords = state.boards.map((b) => b.targetNormalized);

  // Calcula tamanho dos tiles conforme o modo e largura da tela
  const tileSize = useMemo(() => {
    if (currentMode === 'termo') {
      return width < 380 ? 44 : 52;
    }
    if (currentMode === 'dueto') {
      return width < 600 ? 34 : 44;
    }
    // quarteto
    return width < 600 ? 28 : 38;
  }, [currentMode, width]);

  if (!usedLoaded) {
    return (
      <View
        style={[styles.loading, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const bgKind = theme.background?.kind ?? 'plain';

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: theme.colors.background }]}
    >
      {bgKind === 'pitchStripes' ? <PitchStripes /> : null}
      {bgKind === 'image' && theme.assets.backgroundPattern ? (
        <BackgroundImage
          source={theme.assets.backgroundPattern}
          opacity={theme.background?.opacity}
        />
      ) : null}

      <View style={styles.contentContainer}>
        <Header
          currentMode={currentMode}
          onSelectMode={handleModeChange}
          playType={playType}
          onTogglePlayType={handleTogglePlayType}
          onNewGamePress={() => reset(currentMode)}
        />

        <Toast showKey={shakeKey} message={errorMessage} />

        <ScrollView
          contentContainerStyle={styles.boardsScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentMode === 'termo' ? (
            <View style={styles.singleBoardArea}>
              <Board
                guesses={state.boards[0].guesses}
                currentGuess={state.currentGuess}
                wordLength={state.config.wordLength}
                maxAttempts={state.config.maxAttempts}
                isSolved={state.boards[0].isSolved}
                tileSize={tileSize}
                shakeKey={shakeKey}
              />
            </View>
          ) : currentMode === 'dueto' ? (
            <View style={styles.duetoArea}>
              <View style={styles.boardCol}>
                <Board
                  guesses={state.boards[0].guesses}
                  currentGuess={state.currentGuess}
                  wordLength={state.config.wordLength}
                  maxAttempts={state.config.maxAttempts}
                  isSolved={state.boards[0].isSolved}
                  tileSize={tileSize}
                  shakeKey={shakeKey}
                />
              </View>
              <View style={styles.boardCol}>
                <Board
                  guesses={state.boards[1].guesses}
                  currentGuess={state.currentGuess}
                  wordLength={state.config.wordLength}
                  maxAttempts={state.config.maxAttempts}
                  isSolved={state.boards[1].isSolved}
                  tileSize={tileSize}
                  shakeKey={shakeKey}
                />
              </View>
            </View>
          ) : (
            <View style={styles.quartetoArea}>
              <View style={styles.quartetoRow}>
                <View style={styles.boardCol}>
                  <Board
                    guesses={state.boards[0].guesses}
                    currentGuess={state.currentGuess}
                    wordLength={state.config.wordLength}
                    maxAttempts={state.config.maxAttempts}
                    isSolved={state.boards[0].isSolved}
                    tileSize={tileSize}
                    shakeKey={shakeKey}
                  />
                </View>
                <View style={styles.boardCol}>
                  <Board
                    guesses={state.boards[1].guesses}
                    currentGuess={state.currentGuess}
                    wordLength={state.config.wordLength}
                    maxAttempts={state.config.maxAttempts}
                    isSolved={state.boards[1].isSolved}
                    tileSize={tileSize}
                    shakeKey={shakeKey}
                  />
                </View>
              </View>
              <View style={styles.quartetoRow}>
                <View style={styles.boardCol}>
                  <Board
                    guesses={state.boards[2].guesses}
                    currentGuess={state.currentGuess}
                    wordLength={state.config.wordLength}
                    maxAttempts={state.config.maxAttempts}
                    isSolved={state.boards[2].isSolved}
                    tileSize={tileSize}
                    shakeKey={shakeKey}
                  />
                </View>
                <View style={styles.boardCol}>
                  <Board
                    guesses={state.boards[3].guesses}
                    currentGuess={state.currentGuess}
                    wordLength={state.config.wordLength}
                    maxAttempts={state.config.maxAttempts}
                    isSolved={state.boards[3].isSolved}
                    tileSize={tileSize}
                    shakeKey={shakeKey}
                  />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View
          style={[
            styles.keyboardArea,
            { paddingBottom: theme.spacing.padding },
          ]}
        >
          <Keyboard
            letterBoardStates={state.letterBoardStates}
            onPress={handleKey}
          />
        </View>
      </View>

      {isEnd ? (
        <EndGameModal
          visible
          phase={state.phase === 'won' ? 'won' : 'lost'}
          attempts={state.attemptCount}
          maxAttempts={state.config.maxAttempts}
          targetWords={targetWords}
          title={
            state.phase === 'won' ? 'PARABÉNS! 🏆' : 'FIM DE JOGO 😢'
          }
          message={
            state.phase === 'won'
              ? `Você acertou todas as palavras em ${state.attemptCount} tentativas!`
              : 'Não foi dessa vez! Veja as respostas abaixo:'
          }
          ctaLabel={playType === 'daily' ? 'Jogar Modo Livre' : 'Jogar Novamente'}
          onClose={() => reset(currentMode)}
          onPlayAgain={() => {
            if (playType === 'daily') setPlayType('free');
            reset(currentMode);
          }}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  boardsScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  singleBoardArea: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  duetoArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 16,
    flexWrap: 'wrap',
  },
  quartetoArea: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  quartetoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 12,
    flexWrap: 'wrap',
  },
  boardCol: {
    alignItems: 'center',
  },
  keyboardArea: {
    paddingHorizontal: 4,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

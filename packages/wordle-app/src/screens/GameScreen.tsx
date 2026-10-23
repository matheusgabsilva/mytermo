import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Locale } from 'theme-base';
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
import { useGame } from '../hooks/useGame';
import { usePersistedUsedWords } from '../hooks/usePersistedUsedWords';
import { getExplanation, interpolate, resolveStrings } from '../i18n';
import { pickNext } from '../services/wordPicker';

export interface GameScreenProps {
  locale: Locale;
  onChangeLocale: (next: Locale) => void;
}

export function GameScreen({ locale, onChangeLocale }: GameScreenProps) {
  const theme = useTheme();
  const strings = useMemo(() => resolveStrings(theme, locale), [theme, locale]);

  const wordList = theme.wordList[locale];
  const primaryList = theme.wordList.primary?.[locale];

  const validSet = useMemo(() => {
    const extra = theme.wordList.validGuesses?.[locale] ?? [];
    return new Set<string>([...wordList, ...extra]);
  }, [wordList, theme.wordList.validGuesses, locale]);

  const config = useMemo(
    () => ({
      wordLength: theme.gameConfig?.wordLength,
      maxAttempts: theme.gameConfig?.maxAttempts,
      isValidGuess: (g: string) => validSet.has(g),
    }),
    [theme.gameConfig?.wordLength, theme.gameConfig?.maxAttempts, validSet],
  );

  // Persistência de palavras já mostradas (por theme + locale). O picker
  // usa isso para evitar repetir até esgotar; primary esgota antes do resto.
  const { used, loaded: usedLoaded, markUsed, reset: resetUsed } =
    usePersistedUsedWords(theme.id, locale);

  // Ref garante que o picker sempre vê `used` mais recente, sem precisar
  // refazer a closure do useGame.
  const usedRef = useRef(used);
  usedRef.current = used;

  const pickNextTarget = useCallback((): string => {
    return pickNext({
      all: wordList,
      primary: primaryList,
      used: usedRef.current,
      onResetUsed: resetUsed,
    });
  }, [wordList, primaryList, resetUsed]);

  const { state, shakeKey, addLetter, removeLetter, submit, reset } = useGame({
    pickNextTarget,
    config,
  });

  // Marca o target atual como "visto" assim que ele muda.
  // Gera persistência mesmo se o jogador fechar o app antes de terminar.
  useEffect(() => {
    if (state.targetNormalized) {
      markUsed(state.targetNormalized);
    }
  }, [state.targetNormalized, markUsed]);

  // Suporte ao teclado físico na Web
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

  const errorMessage = useMemo(() => {
    if (state.lastRejection === 'too_short') return strings.errors.tooShort;
    if (state.lastRejection === 'invalid_word') return strings.errors.invalidWord;
    return '';
  }, [state.lastRejection, strings.errors]);

  const explanation = useMemo(
    () => getExplanation(theme, locale, state.targetNormalized),
    [theme, locale, state.targetNormalized],
  );

  const handleKey = (k: KeyValue) => {
    if (k === 'ENTER') submit();
    else if (k === 'BACK') removeLetter();
    else addLetter(k);
  };

  const handleLanguagePress = () => {
    const next: Locale = locale === 'pt' ? 'en' : 'pt';
    const hasProgress =
      state.guesses.length > 0 || state.currentGuess.length > 0;
    if (state.phase === 'playing' && hasProgress) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const confirmed = window.confirm(
          `${strings.language.switchConfirm.title}\n\n${strings.language.switchConfirm.message}`,
        );
        if (confirmed) {
          onChangeLocale(next);
        }
      } else {
        Alert.alert(
          strings.language.switchConfirm.title,
          strings.language.switchConfirm.message,
          [
            { text: strings.language.switchConfirm.keep, style: 'cancel' },
            {
              text: strings.language.switchConfirm.discard,
              style: 'destructive',
              onPress: () => onChangeLocale(next),
            },
          ],
        );
      }
    } else {
      onChangeLocale(next);
    }
  };

  const isEnd = state.phase === 'won' || state.phase === 'lost';

  // Aguarda hidratação do AsyncStorage antes de mostrar o board pra evitar
  // sortear/marcar palavra na lista vazia (que viraria stale após carregar).
  if (!usedLoaded) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
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
          title={strings.appTitle}
          locale={locale}
          onLanguagePress={handleLanguagePress}
        />
        <Toast showKey={shakeKey} message={errorMessage} />
        <View style={styles.boardArea}>
          <Board
            guesses={state.guesses}
            currentGuess={state.currentGuess}
            wordLength={state.config.wordLength}
            maxAttempts={state.config.maxAttempts}
            shakeKey={shakeKey}
          />
        </View>
        <View style={[styles.keyboardArea, { paddingBottom: theme.spacing.padding }]}>
          <Keyboard letterStates={state.letterStates} onPress={handleKey} />
        </View>
      </View>

      {isEnd ? (
        <EndGameModal
          visible
          phase={state.phase === 'won' ? 'won' : 'lost'}
          attempts={state.guesses.length}
          targetWord={state.targetNormalized}
          title={state.phase === 'won' ? strings.win.title : strings.lose.title}
          message={
            state.phase === 'won'
              ? interpolate(strings.win.message, { attempts: state.guesses.length })
              : interpolate(strings.lose.message, { word: state.targetNormalized })
          }
          ctaLabel={strings.newGame}
          explanation={explanation}
          wordRevealLabel={state.targetNormalized}
          onClose={reset}
          onPlayAgain={reset}
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
    maxWidth: 500,
    alignSelf: 'center',
  },
  boardArea: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 16,
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

import { evaluate } from '../core/evaluate';
import { normalize } from '../core/normalize';
import type { EvaluatedLetter, LetterState } from '../state/types';
import type {
  BoardState,
  GameMode,
  MultiAction,
  MultiEngineConfig,
  MultiGameState,
} from './types';

const STATE_PRIORITY: Record<LetterState, number> = {
  empty: 0,
  edited: 0,
  absent: 1,
  present: 2,
  correct: 3,
};

export const MODE_CONFIG: Record<
  GameMode,
  { numBoards: number; maxAttempts: number }
> = {
  termo: { numBoards: 1, maxAttempts: 6 },
  dueto: { numBoards: 2, maxAttempts: 7 },
  quarteto: { numBoards: 4, maxAttempts: 9 },
};

export function initialMultiState(
  targets: string[],
  mode: GameMode = 'termo',
  overrides?: Partial<MultiEngineConfig>,
): MultiGameState {
  const modeSpec = MODE_CONFIG[mode];
  const numBoards = overrides?.numBoards ?? modeSpec.numBoards;
  const maxAttempts = overrides?.maxAttempts ?? modeSpec.maxAttempts;
  const wordLength = overrides?.wordLength ?? 5;

  if (targets.length < numBoards) {
    throw new Error(
      `Mode ${mode} requires ${numBoards} targets, but received ${targets.length}`,
    );
  }

  const boards: BoardState[] = targets.slice(0, numBoards).map((t) => {
    const norm = normalize(t);
    if (norm.length !== wordLength) {
      throw new Error(
        `Target "${t}" has normalized length ${norm.length}, expected ${wordLength}`,
      );
    }
    return {
      target: t,
      targetNormalized: norm,
      guesses: [],
      isSolved: false,
      solvedAtAttempt: null,
    };
  });

  return {
    mode,
    config: {
      wordLength,
      maxAttempts,
      numBoards,
      isValidGuess: overrides?.isValidGuess,
    },
    boards,
    currentGuess: '',
    attemptCount: 0,
    phase: 'playing',
    letterBoardStates: {},
    lastRejection: null,
  };
}

export function multiReducer(
  state: MultiGameState,
  action: MultiAction,
): MultiGameState {
  if (action.type === 'RESET') {
    const nextMode = action.mode ?? state.mode;
    return initialMultiState(action.targets, nextMode, {
      wordLength: state.config.wordLength,
      isValidGuess: state.config.isValidGuess,
    });
  }

  if (state.phase !== 'playing') {
    return state;
  }

  switch (action.type) {
    case 'ADD_LETTER': {
      if (state.currentGuess.length >= state.config.wordLength) return state;
      const letter = normalize(action.letter);
      if (letter.length !== 1 || !/^[A-Z]$/.test(letter)) return state;
      return {
        ...state,
        currentGuess: state.currentGuess + letter,
        lastRejection: null,
      };
    }

    case 'REMOVE_LETTER': {
      if (state.currentGuess.length === 0) return state;
      return {
        ...state,
        currentGuess: state.currentGuess.slice(0, -1),
        lastRejection: null,
      };
    }

    case 'SUBMIT': {
      if (state.currentGuess.length !== state.config.wordLength) {
        return { ...state, lastRejection: 'too_short' };
      }
      if (
        state.config.isValidGuess &&
        !state.config.isValidGuess(state.currentGuess)
      ) {
        return { ...state, lastRejection: 'invalid_word' };
      }

      const nextAttemptCount = state.attemptCount + 1;
      const nextLetterBoardStates = { ...state.letterBoardStates };

      const nextBoards = state.boards.map((b, boardIdx) => {
        // Se o tabuleiro já foi resolvido em uma rodada anterior, ele não recebe novas tentativas
        if (b.isSolved) {
          return b;
        }

        const evaluation = evaluate(state.currentGuess, b.targetNormalized);
        const nextGuesses = [...b.guesses, evaluation];
        const isWin = evaluation.every((e) => e.state === 'correct');

        // Atualiza o estado das letras para este tabuleiro específico
        updateBoardLetterStates(
          nextLetterBoardStates,
          evaluation,
          boardIdx,
          state.config.numBoards,
        );

        return {
          ...b,
          guesses: nextGuesses,
          isSolved: isWin,
          solvedAtAttempt: isWin ? nextAttemptCount : null,
        };
      });

      const allSolved = nextBoards.every((b) => b.isSolved);
      const isExhausted = nextAttemptCount >= state.config.maxAttempts;

      const nextPhase = allSolved
        ? 'won'
        : isExhausted
          ? 'lost'
          : 'playing';

      return {
        ...state,
        boards: nextBoards,
        currentGuess: '',
        attemptCount: nextAttemptCount,
        phase: nextPhase,
        letterBoardStates: nextLetterBoardStates,
        lastRejection: null,
      };
    }

    default: {
      const _exhaustive: never = action;
      void _exhaustive;
      return state;
    }
  }
}

function updateBoardLetterStates(
  map: Record<string, LetterState[]>,
  evaluation: readonly EvaluatedLetter[],
  boardIdx: number,
  totalBoards: number,
): void {
  for (const { letter, state } of evaluation) {
    if (!map[letter]) {
      map[letter] = Array.from({ length: totalBoards }, () => 'empty' as LetterState);
    }
    const current = map[letter][boardIdx] ?? 'empty';
    if (STATE_PRIORITY[state] > STATE_PRIORITY[current]) {
      map[letter][boardIdx] = state;
    }
  }
}

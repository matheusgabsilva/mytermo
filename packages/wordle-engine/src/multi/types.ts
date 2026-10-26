import type { EvaluatedLetter, LetterState } from '../state/types';

export type GameMode = 'termo' | 'dueto' | 'quarteto';

export interface BoardState {
  target: string;
  targetNormalized: string;
  guesses: EvaluatedLetter[][];
  isSolved: boolean;
  solvedAtAttempt: number | null;
}

export interface MultiEngineConfig {
  wordLength: number;
  maxAttempts: number;
  numBoards: number;
  isValidGuess?: (normalized: string) => boolean;
}

export type MultiGamePhase = 'playing' | 'won' | 'lost';

export interface MultiGameState {
  mode: GameMode;
  config: MultiEngineConfig;
  boards: BoardState[];
  currentGuess: string;
  /**
   * Histórico global de tentativas submetidas.
   * length representa o número de tentativas já realizadas.
   */
  attemptCount: number;
  phase: MultiGamePhase;
  /**
   * Para cada tecla, mantemos o estado por tabuleiro:
   * Record<string, LetterState[]> (tamanho = numBoards).
   * Ex: para a letra 'A' no dueto: ['correct', 'absent'].
   */
  letterBoardStates: Record<string, LetterState[]>;
  lastRejection: 'too_short' | 'invalid_word' | null;
}

export type MultiAction =
  | { type: 'ADD_LETTER'; letter: string }
  | { type: 'REMOVE_LETTER' }
  | { type: 'SUBMIT' }
  | { type: 'RESET'; targets: string[]; mode?: GameMode };

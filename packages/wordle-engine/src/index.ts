export type {
  LetterState,
  EvaluatedLetter,
  EngineConfig,
  GamePhase,
  Rejection,
  GameState,
  Action,
} from './state/types';

export { reducer, initialState } from './state/reducer';
export { normalize } from './core/normalize';
export { evaluate } from './core/evaluate';
export { selectRandomWord, selectAvoiding } from './core/selectWord';
export type { RandomSource } from './core/selectWord';
export {
  DEFAULT_WORD_LENGTH,
  DEFAULT_MAX_ATTEMPTS,
  makeConfig,
} from './config';

export type {
  GameMode,
  BoardState,
  MultiEngineConfig,
  MultiGamePhase,
  MultiGameState,
  MultiAction,
} from './multi/types';
export {
  MODE_CONFIG,
  initialMultiState,
  multiReducer,
} from './multi/reducer';

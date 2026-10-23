import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import {
  initialMultiState,
  multiReducer,
  type GameMode,
  type MultiEngineConfig,
  type MultiGameState,
} from 'wordle-engine';

export interface UseMultiGameOptions {
  mode: GameMode;
  pickTargets: (mode: GameMode) => string[];
  config?: Partial<MultiEngineConfig>;
}

export interface UseMultiGameResult {
  state: MultiGameState;
  shakeKey: number;
  addLetter: (letter: string) => void;
  removeLetter: () => void;
  submit: () => void;
  reset: (nextMode?: GameMode) => void;
}

export function useMultiGame({
  mode,
  pickTargets,
  config,
}: UseMultiGameOptions): UseMultiGameResult {
  const pickRef = useRef(pickTargets);
  pickRef.current = pickTargets;

  const [state, dispatch] = useReducer(
    multiReducer,
    undefined as unknown as MultiGameState,
    () => initialMultiState(pickRef.current(mode), mode, config),
  );

  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    if (state.lastRejection) {
      setShakeKey((k) => k + 1);
    }
  }, [state.lastRejection]);

  const addLetter = useCallback(
    (letter: string) => dispatch({ type: 'ADD_LETTER', letter }),
    [],
  );
  const removeLetter = useCallback(
    () => dispatch({ type: 'REMOVE_LETTER' }),
    [],
  );
  const submit = useCallback(() => dispatch({ type: 'SUBMIT' }), []);
  const reset = useCallback(
    (nextMode?: GameMode) => {
      const targetMode = nextMode ?? state.mode;
      dispatch({
        type: 'RESET',
        targets: pickRef.current(targetMode),
        mode: targetMode,
      });
    },
    [state.mode],
  );

  return { state, shakeKey, addLetter, removeLetter, submit, reset };
}

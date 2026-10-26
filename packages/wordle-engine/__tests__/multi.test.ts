import { initialMultiState, multiReducer } from '../src/multi/reducer';

describe('MultiEngine', () => {
  it('initializes correctly for termo, dueto, quarteto', () => {
    const termoState = initialMultiState(['TERMO'], 'termo');
    expect(termoState.boards.length).toBe(1);
    expect(termoState.config.maxAttempts).toBe(6);

    const duetoState = initialMultiState(['TERMO', 'LIVRO'], 'dueto');
    expect(duetoState.boards.length).toBe(2);
    expect(duetoState.config.maxAttempts).toBe(7);

    const quartetoState = initialMultiState(
      ['TERMO', 'LIVRO', 'PAPEL', 'FESTA'],
      'quarteto',
    );
    expect(quartetoState.boards.length).toBe(4);
    expect(quartetoState.config.maxAttempts).toBe(9);
  });

  it('handles multi submit & frozen solved board', () => {
    let s = initialMultiState(['TERMO', 'MUNDO'], 'dueto');
    for (const char of 'TERMO') {
      s = multiReducer(s, { type: 'ADD_LETTER', letter: char });
    }
    expect(s.currentGuess).toBe('TERMO');
    s = multiReducer(s, { type: 'SUBMIT' });

    expect(s.attemptCount).toBe(1);
    expect(s.boards[0]?.isSolved).toBe(true);
    expect(s.boards[1]?.isSolved).toBe(false);
    expect(s.phase).toBe('playing');

    for (const char of 'MUNDO') {
      s = multiReducer(s, { type: 'ADD_LETTER', letter: char });
    }
    s = multiReducer(s, { type: 'SUBMIT' });

    expect(s.attemptCount).toBe(2);
    expect(s.boards[0]?.guesses.length).toBe(1);
    expect(s.boards[1]?.guesses.length).toBe(2);
    expect(s.boards[1]?.isSolved).toBe(true);
    expect(s.phase).toBe('won');
  });

  it('correctly transitions between modes on RESET', () => {
    // Start on termo
    let s = initialMultiState(['TERMO'], 'termo');
    expect(s.boards.length).toBe(1);
    expect(s.config.maxAttempts).toBe(6);

    // Switch to dueto
    s = multiReducer(s, {
      type: 'RESET',
      targets: ['TERMO', 'LIVRO'],
      mode: 'dueto',
    });
    expect(s.mode).toBe('dueto');
    expect(s.boards.length).toBe(2);
    expect(s.config.numBoards).toBe(2);
    expect(s.config.maxAttempts).toBe(7);
    expect(s.boards[0]?.target).toBe('TERMO');
    expect(s.boards[1]?.target).toBe('LIVRO');

    // Switch to quarteto
    s = multiReducer(s, {
      type: 'RESET',
      targets: ['TERMO', 'LIVRO', 'PAPEL', 'FESTA'],
      mode: 'quarteto',
    });
    expect(s.mode).toBe('quarteto');
    expect(s.boards.length).toBe(4);
    expect(s.config.numBoards).toBe(4);
    expect(s.config.maxAttempts).toBe(9);
    expect(s.boards[2]?.target).toBe('PAPEL');
    expect(s.boards[3]?.target).toBe('FESTA');

    // Switch back to termo
    s = multiReducer(s, {
      type: 'RESET',
      targets: ['SOLAR'],
      mode: 'termo',
    });
    expect(s.mode).toBe('termo');
    expect(s.boards.length).toBe(1);
    expect(s.config.numBoards).toBe(1);
    expect(s.config.maxAttempts).toBe(6);
  });

  it('evaluates submitted guess with isValidGuess and updates letter states', () => {
    const validSet = new Set(['TERMO', 'LIVRO', 'CASAS', 'PORTA']);
    let s = initialMultiState(['TERMO', 'LIVRO'], 'dueto', {
      wordLength: 5,
      isValidGuess: (g: string) => validSet.has(g),
    });

    // Type CASAS
    for (const char of 'CASAS') {
      s = multiReducer(s, { type: 'ADD_LETTER', letter: char });
    }
    expect(s.currentGuess).toBe('CASAS');

    // Submit
    s = multiReducer(s, { type: 'SUBMIT' });

    expect(s.attemptCount).toBe(1);
    expect(s.currentGuess).toBe('');
    expect(s.lastRejection).toBeNull();
    expect(s.boards[0]?.guesses.length).toBe(1);
    expect(s.boards[1]?.guesses.length).toBe(1);

    // Board 0 target is TERMO vs guess CASAS
    // C absent, A absent, S absent, A absent, S absent
    expect(s.boards[0]?.guesses[0]?.map((g) => g.state)).toEqual([
      'absent',
      'absent',
      'absent',
      'absent',
      'absent',
    ]);
  });

  it('handles reset to dueto and quarteto then submitting guesses', () => {
    const validSet = new Set(['TERMO', 'LIVRO', 'CASAS', 'PORTA', 'CANOA', 'AVIAO', 'PRETO', 'CAUTO', 'ANDOU', 'ADURO']);
    let s = initialMultiState(['TERMO'], 'termo', {
      wordLength: 5,
      isValidGuess: (g: string) => validSet.has(g),
    });

    // Reset to dueto
    s = multiReducer(s, {
      type: 'RESET',
      targets: ['CANOA', 'AVIAO'],
      mode: 'dueto',
    });
    expect(s.mode).toBe('dueto');
    expect(s.boards.length).toBe(2);

    for (const char of 'CASAS') {
      s = multiReducer(s, { type: 'ADD_LETTER', letter: char });
    }
    s = multiReducer(s, { type: 'SUBMIT' });
    expect(s.attemptCount).toBe(1);
    expect(s.boards[0]?.guesses.length).toBe(1);
    expect(s.boards[1]?.guesses.length).toBe(1);

    // Reset to quarteto
    s = multiReducer(s, {
      type: 'RESET',
      targets: ['PRETO', 'CAUTO', 'ANDOU', 'ADURO'],
      mode: 'quarteto',
    });
    expect(s.mode).toBe('quarteto');
    expect(s.boards.length).toBe(4);

    for (const char of 'CASAS') {
      s = multiReducer(s, { type: 'ADD_LETTER', letter: char });
    }
    s = multiReducer(s, { type: 'SUBMIT' });
    expect(s.attemptCount).toBe(1);
    expect(s.boards[0]?.guesses.length).toBe(1);
    expect(s.boards[1]?.guesses.length).toBe(1);
    expect(s.boards[2]?.guesses.length).toBe(1);
    expect(s.boards[3]?.guesses.length).toBe(1);
  });
});

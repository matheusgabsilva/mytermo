import assert from 'node:assert';
import { initialMultiState, multiReducer } from '../src/multi/reducer';

console.log('Testing MultiEngine...');

// Test 1: Initialization for Termo, Dueto, Quarteto
const termoState = initialMultiState(['TERMO'], 'termo');
assert.strictEqual(termoState.boards.length, 1);
assert.strictEqual(termoState.config.maxAttempts, 6);

const duetoState = initialMultiState(['TERMO', 'LIVRO'], 'dueto');
assert.strictEqual(duetoState.boards.length, 2);
assert.strictEqual(duetoState.config.maxAttempts, 7);

const quartetoState = initialMultiState(['TERMO', 'LIVRO', 'PAPEL', 'FESTA'], 'quarteto');
assert.strictEqual(quartetoState.boards.length, 4);
assert.strictEqual(quartetoState.config.maxAttempts, 9);

// Test 2: Multi submit & frozen solved board
let s = initialMultiState(['TERMO', 'MUNDO'], 'dueto');
// Typing TERMO
for (const char of 'TERMO') {
  s = multiReducer(s, { type: 'ADD_LETTER', letter: char });
}
assert.strictEqual(s.currentGuess, 'TERMO');
s = multiReducer(s, { type: 'SUBMIT' });

assert.strictEqual(s.attemptCount, 1);
assert.strictEqual(s.boards[0].isSolved, true);
assert.strictEqual(s.boards[1].isSolved, false);
assert.strictEqual(s.phase, 'playing');

// Second guess: MUNDO
for (const char of 'MUNDO') {
  s = multiReducer(s, { type: 'ADD_LETTER', letter: char });
}
s = multiReducer(s, { type: 'SUBMIT' });

assert.strictEqual(s.attemptCount, 2);
// Board 0 was already solved, should still have 1 guess!
assert.strictEqual(s.boards[0].guesses.length, 1);
assert.strictEqual(s.boards[1].guesses.length, 2);
assert.strictEqual(s.boards[1].isSolved, true);
assert.strictEqual(s.phase, 'won');

console.log('MultiEngine tests passed successfully!');

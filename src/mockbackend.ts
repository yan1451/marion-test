export interface SpinResult {
  matrix: string[][];
  isWin: boolean;
  winAmount: number;
}

const SYMBOLS = [
  "Bank/Bank",
  "Cell/Cell",
  "Dynamit/Dynamit",
  "Handcuffs/Handcuffs",
  "Littera_A/Littera_A",
  "Littera_J/Littera_J",
  "Littera_K/Littera_K",
  "Littera_Q/Littera_Q",
  "Number_10/Number_10",
  "Safe/Safe",
];
const COLUMNS = 6;
const ROWS = 5;

let spinCounter = 0;

export const mockSpinAPI = (bet: number): Promise<SpinResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      spinCounter++;

      const shouldForceWin = spinCounter % 3 === 0;

      const matrix: string[][] = Array.from({ length: COLUMNS }, () => []);

      const winningSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      const winningRowIndex = Math.floor(Math.random() * ROWS);
      for (let col = 0; col < COLUMNS; col++) {
        for (let row = 0; row < ROWS; row++) {
          if (shouldForceWin && row === winningRowIndex) {
            matrix[col].push(winningSymbol);
          } else {
            let randomSymbol =
              SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

            if (
              !shouldForceWin &&
              row === winningRowIndex &&
              randomSymbol === winningSymbol
            ) {
              randomSymbol =
                SYMBOLS[(SYMBOLS.indexOf(winningSymbol) + 1) % SYMBOLS.length];
            }

            matrix[col].push(randomSymbol);
          }
        }
      }

      const winAmount = shouldForceWin ? bet * 52.2 : 0;

      resolve({
        matrix,
        isWin: shouldForceWin,
        winAmount,
      });
    }, 150);
  });
};

import {
  addGuessForGame,
  addGuessMatches,
  createGame,
  GameStatus,
  getGame,
  getRandomWord,
  LetterMatchResult,
} from "../repo";

type GameDetails = {
  secretWord: string;
  guessesCount: number;
  currentLevel: number;
  status: GameStatus;
};

type GuessResult = {
  status: GameStatus;
  guessId: string;
};

export const newGame = async (
  parentGame: string = "",
  lang: "en" = "en"
): Promise<string> => {
  const level = 0;
  const secretWord = await getRandomWord(lang, `level${level}`);
  const gameId = await createGame(secretWord, level, parentGame, lang, level);
  return gameId;
};

export const getGameDetails = async (gameId: string): Promise<GameDetails> => {
  const details = await getGame(gameId);  
  return {
    secretWord: details.secretWord,
    currentLevel: details.level,
    guessesCount: details.guessesCount,
    status: details.status,
  };
};

export const addGuess = async (
  gameId: string,
  guessWord: string
): Promise<GuessResult> => {
  const {
    secretWord,
    guessesCount,
    currentLevel,
    status: currentStatus,
  } = await getGameDetails(gameId);
  if (currentStatus > GameStatus.InProgress)
    throw new Error(`game: '${gameId}' has been finished`);
  const maxGuesses = currentLevel;
  let status = GameStatus.None;
  if (secretWord === guessWord && guessesCount + 1 < maxGuesses) {
    status = GameStatus.Solved;
  } else if (guessesCount + 1 >= maxGuesses) {
    status = GameStatus.Failed;
  } else {
    status = GameStatus.InProgress;
  }
  const guessId = await addGuessForGame(gameId, guessWord, status);
  return { status, guessId };
};

export const addGuessDetail = async (
  gameId: string,
  guessId: string,
  matches: LetterMatchResult[]
): Promise<void> => {
  await addGuessMatches(gameId, guessId, matches);
};

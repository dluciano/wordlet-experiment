import { randomInt, randomUUID } from "crypto";
import dictionary from "./dictionary";

export enum GameStatus {
  None,
  Started,
  InProgress,
  Failed,
  Solved,
}

enum GuessResultEntity {
  None,
  Wrong,
  Solved,
}
enum MatchType {
  DoesNotContains,
  Contains,
  Match,
}
type GuessEntity = {
  guessId: string;
  word: string;
  guessType: GuessResultEntity;
  matches: LetterMatchResult[];
};

export type LetterMatchResult = {
  letter: string;
  idx: number;
  matchType: MatchType;
};

type GameEntity = {
  gameId: string;
  secretWord: string;
  createdOn: Date;
  level: number;
  parentGame: string;
  lang: string;
  maxNumberOfGuesses: number;
  guesses: GuessEntity[];
  guessesCount: number;
  status: GameStatus;
};

var games: GameEntity[] = [];

export const createGame = async (
  secretWord: string,
  level: number,
  parentGame: string,
  lang: string,
  maxNumberOfGuesses: number
) => {
  const gameId = randomUUID();
  const game: GameEntity = {
    gameId,
    secretWord,
    createdOn: new Date(), // TODO: Use UTC-0
    level,
    parentGame,
    lang,
    maxNumberOfGuesses,
    guesses: [],
    guessesCount: 0,
    status: GameStatus.Started,
  };
  games.push(game);
  return new Promise<string>((res) => res(gameId));
};

export const getRandomWord = async (
  lang: "en",
  level: "level0"
): Promise<string> => {
  return new Promise<string>((res) => {
    var lev = dictionary[lang][level];
    const r = randomInt(0, lev.count);
    const secretWord = lev.words[r];
    res(secretWord);
  });
};

export const getGame = async (gameId: string): Promise<GameEntity> =>
  new Promise<GameEntity>((res, err) => {
    const game = games.find((g) => g.gameId === gameId);
    if (!game) {
      err(new Error(`game: '${gameId}' not found`));
      return;
    }
    res(game);
  });

export const addGuessForGame = async (
  gameId: string,
  guessWord: string,
  status: GameStatus
): Promise<string> => {
  return new Promise((res, err) => {
    const game = games.find((g) => g.gameId === gameId);
    if (!game) {
      err(new Error(`game: '${gameId}' does not exists`));
      return;
    }
    const guessId = randomUUID();
    let guessType = GuessResultEntity.None;
    switch (status) {
      case GameStatus.Solved:
        guessType = GuessResultEntity.Solved;
        break;
      case GameStatus.InProgress:
        guessType = GuessResultEntity.Wrong;
        break;
      case GameStatus.Failed:
        guessType = GuessResultEntity.Wrong;
        break;
      default:
        throw new Error(
          `The game status ${status} is not valid to add a guess`
        );
    }
    const guess: GuessEntity = {
      guessId,
      word: guessWord,
      guessType,
      matches: [],
    };
    const updatedGame = {
      ...game,
      guessesCount: game.guessesCount + 1,
      status,
    };
    game.guesses.push(guess);
    res(guessId);
  });
};

export const addGuessMatches = async (
  gameId: string,
  guessId: string,
  matches: LetterMatchResult[]
): Promise<void> => {
  return new Promise((res, err) => {
    const game = games.find((g) => g.gameId === gameId);
    if (!game) {
      err(new Error(`game: '${gameId}' does not exists`));
      return;
    }
    const guess = game.guesses.find((g) => g.guessId === guessId);
    if (!guess)
      throw new Error(
        `gameId: '${gameId}' does not contains a guessId: '${guessId}'`
      );
    guess.matches = matches;
    res();
  });
};

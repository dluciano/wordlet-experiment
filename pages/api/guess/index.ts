import type { NextApiRequest, NextApiResponse } from "next";
import {
  addGuess,
  addGuessDetail,
  GameToken,
  getGameDetails,
  getGameIdForGameToken,
  getGameTokenForGameId,
  newGame,
} from "../../../hooks";
import { GameStatus } from "../../../repo";

enum MatchType {
  DoesNotContains,
  Contains,
  Match,
}

type LetterMatchResult = { letter: string; idx: number; matchType: MatchType };

type Response = {
  status: GameStatus;
  gameToken?: GameToken;
  guessResult?: LetterMatchResult[];
};

type Request = {
  gameToken: string;
  guessWord: string;
};

export default async function guess(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  const contentBody = JSON.parse(req.body) 
  const { gameToken, guessWord } = contentBody as Request;  
  //if() toke is invalid return forbidden
  const { gameId } = await getGameIdForGameToken(gameToken);
  const { secretWord, status: currentStatus } = await getGameDetails(gameId);

  if (currentStatus > GameStatus.InProgress) {
    res.status(200).json({ status: currentStatus });
    return;
  }

  const { status, guessId } = await addGuess(gameId, guessWord);

  if (status === GameStatus.Solved) {
    var newGameId = await newGame(gameId);
    var newToken = getGameTokenForGameId(newGameId);
    res.status(200).json({ status, gameToken: newToken });
    return;
  }

  if (status === GameStatus.Failed) {
    res.status(200).json({ status });
    return;
  }

  const matchResult: LetterMatchResult[] = [];
  for (let idx = 0; idx < guessWord.length; idx++) {
    const letter = guessWord[idx];
    if (!secretWord.includes(letter)) {
      matchResult.push({ letter, idx, matchType: MatchType.DoesNotContains });
      continue;
    }
    if (secretWord[idx] === letter) {
      matchResult.push({ letter, idx, matchType: MatchType.Match });
      continue;
    }
    matchResult.push({ letter, idx, matchType: MatchType.Contains });
  }
  await addGuessDetail(gameId, guessId, matchResult);

  const result: Response = {
    status: status,
    guessResult: matchResult,
  };

  res.status(200).json(result);
}

/*


open site -> 
  new game -> 
    new game(lan)
      if !dict.containsKey(lan) return 404
      secretWord = getRandomWord(lan, initialLevel) // dict[lang][level] = {es: {1: [5words], 2: [6words],...}}
      store (secretWord, createOn, level, parent: null, guesses: [], guessesCount: 0, maxNumberOfGuesses: level, status: initial) -> gameId
      token = createTokenFor(gameId) // no expire token
      return token
  
  guess(token, guessWord)
    if toke is invalid return forbidden
    gameId = get game id from token
    retrieve for gameId secretWord, guessesCount, currentLevel, status
    if(status is solved) return success
    if(status is failed) return failed
     
    if secretWord is guessWord
      update for gameId, guessesCount+1 and status=solved
      newLevel = currentLevel + 1
      secretWord = getRandomWord(lan, newLevel)
      store (secretWord, createOn, newLevel, parent: gameId, guesses: [], guessesCount: 0, maxNumberOfGuesses: newLevel, solved: false) -> newGameId
      token = createTokenFor(newGameId)
      return success, token
    
    // example, g: hoouse - s: worodle = huse
    Set<char> noContaining = g: house - s: wordle = huse
    result = {}
    for each letter in guessWord with idx
      if letter in noContaining
        result.notContaining.add {letter, idx}
        continue
      if secretWord[idx] === letter
        result.matches.add {letter, idx}
        continue
      result.contains.add{letter, idx}

    if(guessesCount + 1 >= maxGuesses)
      status = failed
    
    update for gameId, status, guessesCount + 1, guesses.add(guessWord, wrong, result)
    
    return status, result
*/

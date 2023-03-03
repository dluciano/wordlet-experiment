import { sign, verify } from "jsonwebtoken";
export type GameToken = string;
type TokenContent = {
  gameId: string;
};

export const getGameIdForGameToken = async (token: GameToken) =>
  await getTokenContent(token);

export const getGameTokenForGameId = (gameId: string): GameToken =>
  generateToken({
    gameId,
  });

const generateToken = (content: TokenContent) => {
  if (!process.env.TOKEN_SECRET) throw new Error("no token secret configured");
  return sign(JSON.stringify(content), process.env.TOKEN_SECRET);
};

const getTokenContent = async (gameToken: string): Promise<TokenContent> => {
  if (!process.env.TOKEN_SECRET) throw new Error("no token secret configured");
  const promise = new Promise<TokenContent>((res, promiseError) => {
    if (!process.env.TOKEN_SECRET)
      throw new Error("no token secret configured");    
    verify(gameToken, process.env.TOKEN_SECRET, (err: any, content: any) => {
      if (err) promiseError(err);
      else {
        res(content);
      }
    });
  });
  return promise;
};

import type { NextApiRequest, NextApiResponse } from "next";
import { GameToken, getGameTokenForGameId, newGame } from "../../../hooks";

type Response = {
  gameToken: GameToken;
};

export default async function post(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {  
  const gameId = await newGame();  
  const gameToken = getGameTokenForGameId(gameId);
  res.status(200).json({ gameToken });
}
import type { NextPage } from "next";
import { useEffect, useState } from "react";

const Home: NextPage = () => {
  const [guess, setGuess] = useState("");
  const [gameToken, setGameToken] = useState("");
  useEffect(() => {
    (async () => {
      const response = await fetch("api/game");
      const token = (await response.json()) as { gameToken: string };
      setGameToken(token.gameToken);
    })();
  }, [setGameToken]);
  const submit = () => {
    fetch("api/guess", {
      method: "POST",
      body: JSON.stringify({
        gameToken,
        guessWord: guess,
      }),
    });
  };
  return (
    <>
      Hello World
      <input type="text" onChange={(e) => setGuess(e.target.value)} />
      <button type="button" onClick={submit}>
        Submit
      </button>
    </>
  );
};

export default Home;

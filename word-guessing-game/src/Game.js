// src/Game.js
import React, { useState, useEffect } from 'react';

function Game({ difficulty, socket, userName }) {
  const [word, setWord] = useState('');
  const [hint, setHint] = useState('');
  const [guesses, setGuesses] = useState([]);

  useEffect(() => {
    // Listen for a new round with the word
    socket.on('newRound', ({ wordWithMissingLetters }) => {
      setWord(wordWithMissingLetters);
    });

    // Listen for hints from the server
    socket.on('hint', ({ hint }) => {
      setHint(hint);
    });

    // Request the server for a new game word based on difficulty
    socket.emit('chooseDifficulty', difficulty);

    return () => {
      socket.off('newRound');
      socket.off('hint');
    };
  }, [difficulty, socket]);

  const handleGuess = (guess) => {
    socket.emit('guess', guess);
    setGuesses([...guesses, guess]);
  };

  const requestHint = () => {
    socket.emit('requestHint');
  };

  return (
    <div className="game-container">
      <h2>{userName}, you are playing in {difficulty} mode!</h2>
      <p>Word: {word}</p>
      <button onClick={requestHint}>Get a Hint</button>
      <p>Hint: {hint}</p>
      <div>
        <input type="text" placeholder="Enter your guess" onKeyDown={(e) => {
          if (e.key === 'Enter') handleGuess(e.target.value);
        }} />
      </div>
      <p>Your Guesses: {guesses.join(', ')}</p>
    </div>
  );
}

export default Game;

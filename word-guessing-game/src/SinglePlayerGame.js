import React, { useState, useEffect } from 'react';
import { generate } from 'random-words'; // Import the generate function
import './SinglePlayerGame.css';

function SinglePlayerGame({ difficulty, userName, onRepeat, onQuit }) {
  const [guess, setGuess] = useState('');
  const [hint, setHint] = useState('');
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(60);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentWord, setCurrentWord] = useState('');
  const [displayedWord, setDisplayedWord] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    generateNewWord();
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else {
      nextRound();
    }
  }, [timer]);

  const generateNewWord = () => {
    // Set the word length based on difficulty
    let wordLength;
    if (difficulty === 'easy') {
      wordLength = Math.floor(Math.random() * (5 - 3 + 1)) + 3; // Random length between 3 and 5
    } else if (difficulty === 'medium') {
      wordLength = Math.floor(Math.random() * (8 - 6 + 1)) + 6; // Random length between 6 and 8
    } else {
      wordLength = Math.floor(Math.random() * (12 - 9 + 1)) + 9; // Random length between 9 and 12
    }

    // Generate a word with the specified length
    let word;
    do {
      word = generate(); // Generate a random word
    } while (word.length !== wordLength);

    setCurrentWord(word);
    setDisplayedWord(generateMaskedWord(word));
    setHint(''); // Clear hint for new word
    setFeedback(''); // Clear feedback for new word

    console.log("Generated Word:", word); // Debugging statement to see the generated word
  };

  const generateMaskedWord = (word) => {
    return word.split('').map((char) =>
      Math.random() > 0.5 ? '_' : char
    ).join('');
  };

  const requestHint = () => {
    setHint(`Hint: The word is related to ${difficulty === 'easy' ? 'basic' : 'advanced'} vocabulary.`);
  };

  const submitGuess = () => {
    if (guess.trim().toLowerCase() === currentWord) {
      setScore(score + 1);
      setFeedback('Correct guess!');
      nextRound();
    } else {
      setFeedback('Incorrect guess. Try again!');
    }
    setGuess('');
  };

  const nextRound = () => {
    if (currentRound < 10) {
      setCurrentRound(currentRound + 1);
      setTimer(60);
      generateNewWord();
    } else {
      setShowModal(true); // Show final score modal after 10 rounds
    }
  };

  const handleRepeat = () => {
    setScore(0);
    setCurrentRound(1);
    setTimer(60);
    setShowModal(false);
    generateNewWord();
    onRepeat();
  };

  return (
    <div className="game-container">
      <h1 className="game-title">Word Guessing Challenge</h1>

      <div className="score-timer">
        <span className="score">Score: {score}</span>
        <span className="timer">Time Left: {timer}s</span>
      </div>

      <h2 className="welcome-message">Good luck, {userName}!</h2>
      <p className="difficulty-level">Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
      <p className="round-info">Round {currentRound} of 10</p>

      <div className="guess-section">
        <p className="displayed-word">{displayedWord}</p>
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Enter your guess"
          className="guess-input"
        />
        <button className="submit-button" onClick={submitGuess}>Submit Guess</button>
        <p className="feedback-message">{feedback}</p>
      </div>

      <div className="hint-section">
        <button className="hint-button" onClick={requestHint}>Request a Hint</button>
        {hint && <p className="hint-display">{hint}</p>}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Game Over!</h2>
            <p>Your Final Score: {score}</p>
            <button className="modal-button" onClick={handleRepeat}>Play Again</button>
            <button className="modal-button" onClick={onQuit}>Quit</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SinglePlayerGame;
// src/MultiplayerGameSession.js
import React, { useState, useEffect } from 'react';
import './MultiplayerGameSession.css';
import axios from 'axios';

function MultiplayerGameSession({ socket, roomID, userName }) {
  const [guess, setGuess] = useState('');
  const [hint, setHint] = useState('');
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(60);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentWord, setCurrentWord] = useState('');
  const [displayedWord, setDisplayedWord] = useState('');
  const [feedback, setFeedback] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    socket.on('gameStateUpdate', ({ word, displayedWord, timer, round }) => {
      setCurrentWord(word);
      setDisplayedWord(displayedWord);
      setTimer(timer);
      setCurrentRound(round);
    });

    socket.on('receiveHint', (aiHint) => setHint(`Hint: ${aiHint}`));

    socket.on('chatMessage', (message) => {
      setChatMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('receiveMessage', (data) => {
        setChatMessages((prev) => [...prev, { userName: data.userName, message: data.message }]);
    });
    

    return () => {
      socket.off('gameStateUpdate');
      socket.off('receiveHint');
      socket.off('chatMessage');
    };
  }, [socket]);

  const handleGuessSubmit = () => {
    socket.emit('submitGuess', { roomID, guess, userName });
    setGuess('');
  };

  const requestHint = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/generate-hint`, { params: { word: currentWord } });
      setHint(response.data.hint);
    } catch (error) {
      console.error("Error fetching hint:", error);
      setHint("Hint: Unable to fetch hint at the moment.");
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      socket.emit('sendChatMessage', { roomID, message: newMessage, userName });
      setChatMessages([...chatMessages, { userName, message: newMessage }]);
      setNewMessage('');
    }
  };

  return (
    <div className="multiplayer-game-container">
      <div className="background-letters">
        {Array.from({ length: 64 }).map((_, index) => (
          <span key={index}>{String.fromCharCode(65 + Math.floor(Math.random() * 26))}</span>
        ))}
      </div>
      <div className="game-panel">
        <h1 className="game-title">Multiplayer Word Guessing Game</h1>
        <div className="score-timer">
          <span className="score">Score: {score}</span>
          <span className="timer">Time Left: {timer}s</span>
        </div>
        <p>Round {currentRound} of 10</p>
        <div className="guess-section">
          <p className="displayed-word">{displayedWord}</p>
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Enter your guess"
            className="guess-input"
          />
          <button className="submit-button" onClick={handleGuessSubmit}>Submit Guess</button>
          <p className="feedback-message">{feedback}</p>
        </div>
        <div className="hint-section">
          <button className="hint-button" onClick={requestHint}>Request a Hint</button>
          {hint && <p className="hint-display">{hint}</p>}
        </div>
      </div>
    </div>
  );
}

export default MultiplayerGameSession;
// src/App.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import WelcomeScreen from './WelcomeScreen';
import GameModeScreen from './GameModeScreen';  // Import GameModeScreen component
import './App.css';

const socket = io('http://localhost:4000');  // Connect to Node.js backend

function App() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isNameEntered, setIsNameEntered] = useState(false);
  const [gameMode, setGameMode] = useState('');
  const [userName, setUserName] = useState('');
  const [wordLength, setWordLength] = useState(0);
  const [guess, setGuess] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [hint, setHint] = useState('');
  const [scoreboard, setScoreboard] = useState({});
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    if (isGameStarted) {
      socket.on('newRound', (data) => {
        setWordLength(data.wordLength);
        setGuess('');
        setHint('');
      });

      socket.on('roundResult', (data) => {
        alert(`Winner: ${data.winner} with the correct word: ${data.correctWord}`);
        setScoreboard(data.scores);
      });

      socket.on('hint', (data) => {
        setHint(data.hint);
      });

      socket.on('chatMessage', (message) => {
        setChatHistory((prev) => [...prev, message]);
      });

      return () => {
        socket.off('newRound');
        socket.off('roundResult');
        socket.off('hint');
        socket.off('chatMessage');
      };
    }
  }, [isGameStarted]);

  const handleStartGame = (firstName, lastName) => {
    setUserName(`${firstName} ${lastName}`);
    setIsNameEntered(true);
  };

  const handleSelectMode = (mode) => {
    setGameMode(mode);
    setIsGameStarted(true);
  };

  const submitGuess = () => {
    if (guess.trim()) {
      socket.emit('guess', guess.trim());
      setGuess('');
    }
  };

  const requestHint = () => {
    socket.emit('requestHint');
  };

  const selectDifficulty = (level) => {
    setDifficulty(level);
    socket.emit('chooseDifficulty', level);
  };

  const sendChatMessage = () => {
    if (chatMessage.trim()) {
      socket.emit('chatMessage', chatMessage.trim());
      setChatMessage('');
    }
  };

  return (
    <div className="App">
      {!isGameStarted ? (
        !isNameEntered ? (
          <WelcomeScreen onStartGame={handleStartGame} />
        ) : (
          <GameModeScreen onSelectMode={handleSelectMode} />
        )
      ) : (
        <div>
          <h1>Multiplayer Word Guessing Game</h1>
          <h2>Welcome, {userName}!</h2>
          <h3>Mode: {gameMode === 'single' ? 'Single Player' : 'Multiplayer'}</h3>

          <div>
            <h3>Select Difficulty</h3>
            <button onClick={() => selectDifficulty('easy')}>Easy</button>
            <button onClick={() => selectDifficulty('medium')}>Medium</button>
            <button onClick={() => selectDifficulty('hard')}>Hard</button>
          </div>

          <p>Word Length: {wordLength}</p>

          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Enter your guess"
          />
          <button onClick={submitGuess}>Submit Guess</button>

          <h2>Scoreboard</h2>
          <ul>
            {Object.entries(scoreboard).map(([player, { score }]) => (
              <li key={player}>{player}: {score} points</li>
            ))}
          </ul>

          <div className="hint-section">
            <h3>Hint Section</h3>
            <button onClick={requestHint}>Request a Hint</button>
            {hint && <p>Hint: {hint}</p>}
          </div>

          <div className="chat">
            <h3>Chat</h3>
            <div className="chat-box">
              {chatHistory.map((msg, index) => (
                <div key={index}>{msg}</div>
              ))}
            </div>
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button onClick={sendChatMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

// src/App.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import WelcomeScreen from './WelcomeScreen';
import GameModeScreen from './GameModeScreen';
import DifficultyScreen from './DifficultyScreen';  // Import DifficultyScreen component
import './App.css';

const socket = io('http://localhost:4000');  // Connect to Node.js backend

function App() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isNameEntered, setIsNameEntered] = useState(false);
  const [gameMode, setGameMode] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [userName, setUserName] = useState('');

  const handleStartGame = (firstName, lastName) => {
    setUserName(`${firstName} ${lastName}`);
    setIsNameEntered(true);
  };

  const handleSelectMode = (mode) => {
    setGameMode(mode);
    if (mode === 'single') {
      setDifficulty(''); // Reset difficulty to show difficulty screen for single mode
    } else {
      setIsGameStarted(true); // For multiplayer, start the game directly
    }
  };

  const handleSelectDifficulty = (level) => {
    setDifficulty(level);
    setIsGameStarted(true); // Start the game after selecting difficulty
  };

  return (
    <div className="App">
      {!isGameStarted ? (
        !isNameEntered ? (
          <WelcomeScreen onStartGame={handleStartGame} />
        ) : (
          gameMode === 'single' && !difficulty ? (
            <DifficultyScreen onSelectDifficulty={handleSelectDifficulty} />
          ) : (
            <GameModeScreen onSelectMode={handleSelectMode} />
          )
        )
      ) : (
        <div>
          {/* Game component will be here */}
          <h1>Welcome to the {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Mode!</h1>
          <p>Game content for {gameMode} mode and {difficulty} difficulty will go here.</p>
        </div>
      )}
    </div>
  );
}

export default App;

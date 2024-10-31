// src/App.js
import React, { useState } from 'react';
import io from 'socket.io-client';
import WelcomeScreen from './WelcomeScreen';
import GameModeScreen from './GameModeScreen';
import DifficultyScreen from './DifficultyScreen';
import SinglePlayerGame from './SinglePlayerGame';
import './App.css';

const socket = io('http://localhost:4000');

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
      setDifficulty('');
    } else {
      setIsGameStarted(true);
    }
  };

  const handleSelectDifficulty = (level) => {
    setDifficulty(level);
    setIsGameStarted(true);
  };

  const handleRepeat = () => {
    setDifficulty('');
    setIsGameStarted(false);
  };

  const handleQuit = () => {
    setIsNameEntered(false);
    setGameMode('');
    setDifficulty('');
    setIsGameStarted(false);
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
        <SinglePlayerGame
          difficulty={difficulty}
          userName={userName}
          onRepeat={handleRepeat}
          onQuit={handleQuit}
        />
      )}
    </div>
  );
}

export default App;
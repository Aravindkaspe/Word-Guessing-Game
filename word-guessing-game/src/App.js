// src/App.js
import React, { useState } from 'react';
import io from 'socket.io-client';
import WelcomeScreen from './WelcomeScreen';
import GameModeScreen from './GameModeScreen';
import DifficultyScreen from './DifficultyScreen';
import SinglePlayerGame from './SinglePlayerGame';
import MultiplayerLobby from './MultiplayerLobby';
import MultiplayerGame from './MultiplayerGame';
import './App.css';

const socket = io('http://localhost:4000');

function App() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isNameEntered, setIsNameEntered] = useState(false);
  const [gameMode, setGameMode] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [userName, setUserName] = useState('');
  const [roomName, setRoomName] = useState('');

  const handleStartGame = (firstName, lastName) => {
    setUserName(`${firstName} ${lastName}`);
    setIsNameEntered(true);
  };

  const handleSelectMode = (mode) => {
    setGameMode(mode);
    if (mode === 'single') {
      setDifficulty('');
    } else {
      setIsGameStarted(false); // Go to lobby for multiplayer
    }
  };

  const handleSelectDifficulty = (level) => {
    setDifficulty(level);
    setIsGameStarted(true);
  };

  const handleRoomJoin = (room) => {
    setRoomName(room);
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
    setRoomName('');
  };

  return (
    <div className="App">
      {!isGameStarted ? (
        !isNameEntered ? (
          <WelcomeScreen onStartGame={handleStartGame} />
        ) : (
          gameMode === 'single' && !difficulty ? (
            <DifficultyScreen onSelectDifficulty={handleSelectDifficulty} />
          ) : gameMode === 'multiplayer' ? (
            <MultiplayerLobby socket={socket} userName={userName} onRoomJoin={handleRoomJoin} />
          ) : (
            <GameModeScreen onSelectMode={handleSelectMode} />
          )
        )
      ) : gameMode === 'single' ? (
        <SinglePlayerGame
          difficulty={difficulty}
          userName={userName}
          onRepeat={handleRepeat}
          onQuit={handleQuit}
        />
      ) : (
        <MultiplayerGame socket={socket} roomName={roomName} userName={userName} />
      )}
    </div>
  );
}

export default App;
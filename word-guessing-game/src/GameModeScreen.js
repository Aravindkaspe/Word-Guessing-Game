// src/GameModeScreen.js
import React from 'react';
import './GameModeScreen.css';

function GameModeScreen({ onSelectMode }) {
  return (
    <div className="game-mode-container">
      <h1 className="game-mode-title">Choose Your Game Mode</h1>
      <p className="game-mode-subtitle">Select a mode to start guessing words!</p>
      <div className="button-container">
        <button className="mode-button" onClick={() => onSelectMode('single')}>
          Single Player
        </button>
        <button className="mode-button" onClick={() => onSelectMode('multiplayer')}>
          Multiplayer
        </button>
      </div>
      <div className="background-letters">
        {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter, index) => (
          <span key={index}>{letter}</span>
        ))}
      </div>
    </div>
  );
}

export default GameModeScreen;

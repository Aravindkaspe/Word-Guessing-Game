// src/GameModeScreen.js
import React from 'react';

function GameModeScreen({ onSelectMode }) {
  return (
    <div style={{ textAlign: 'center', marginTop: '20%' }}>
      <h1>Choose Game Mode</h1>
      <button onClick={() => onSelectMode('single')}>Single Player</button>
      <button onClick={() => onSelectMode('multiplayer')}>Multiplayer</button>
    </div>
  );
}

export default GameModeScreen;

// src/WelcomeScreen.js
import React, { useState } from 'react';
import './WelcomeScreen.css';

function WelcomeScreen({ onStartGame }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleStartGame = () => {
    if (firstName && lastName) {
      onStartGame(firstName, lastName);
    } else {
      alert('Please enter both first and last names.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleStartGame();
    }
  };

  return (
    <div className="welcome-container">
      <h1 className="welcome-title">Welcome to the Word Guessing Challenge!</h1>
      <p className="welcome-subtitle">Enter your name to get started</p>
      <div className="input-container">
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="input-field"
          onKeyDown={handleKeyDown}
        />
      </div>
      <button className="start-button" onClick={handleStartGame}>
        Start Game
      </button>
      <div className="background-letters">
          {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter, index) => (
          <span key={index}>{letter}</span>
            ))}
      </div>

    </div>
    
  );
}

export default WelcomeScreen;

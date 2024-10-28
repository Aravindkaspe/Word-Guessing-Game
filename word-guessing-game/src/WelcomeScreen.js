// src/WelcomeScreen.js
import React, { useState } from 'react';

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

  return (
    <div style={{ textAlign: 'center', marginTop: '20%' }}>
      <h1>Welcome to the Multiplayer Word Guessing Game!</h1>
      <p>Please enter your first and last name to start the game.</p>
      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
      <br />
      <button onClick={handleStartGame}>Start Game</button>
    </div>
  );
}

export default WelcomeScreen;

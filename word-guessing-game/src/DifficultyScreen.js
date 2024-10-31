// src/DifficultyScreen.js
import React from 'react';
import './DifficultyScreen.css';

function DifficultyScreen({ onSelectDifficulty }) {
  return (
    <div className="difficulty-container">
      <h1 className="difficulty-title">Choose Difficulty Level</h1>
      <p className="difficulty-subtitle">Select a level to start the word guessing challenge!</p>
      <div className="difficulty-buttons">
        <button className="difficulty-button" onClick={() => onSelectDifficulty('easy')}>
          Easy
        </button>
        <button className="difficulty-button" onClick={() => onSelectDifficulty('medium')}>
          Medium
        </button>
        <button className="difficulty-button" onClick={() => onSelectDifficulty('hard')}>
          Hard
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

export default DifficultyScreen;

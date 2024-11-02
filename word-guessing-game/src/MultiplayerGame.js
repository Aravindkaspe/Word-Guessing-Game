// MultiplayerGame.js
import React, { useState, useEffect } from 'react';
import './MultiplayerGame.css';

function MultiplayerGame({ socket, roomName, userName }) {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    socket.emit('joinRoom', { roomName, userName });

    socket.on('playerJoined', ({ players }) => {
      console.log('Received player list:', players);
      setPlayers(Object.values(players));
      if (players[socket.id]?.isHost) {
        setIsHost(true);
      }
    });

    socket.on('gameStarted', () => {
      setIsGameStarted(true);
    });

    return () => {
      socket.off('playerJoined');
      socket.off('gameStarted');
    };
  }, [socket, roomName, userName]);

  const handleStartGame = () => {
    socket.emit('startGame', roomName);
  };

  if (!isGameStarted) {
    return (
      <div className="waiting-room-container">
        <div className="background-letters">
          {Array.from({ length: 64 }).map((_, index) => (
            <span key={index} style={{ '--random-rotation': Math.random() * 2 - 1 }}>
              {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
            </span>
          ))}
        </div>
        <h1 className="waiting-room-title">Waiting Room</h1>
        <p className="room-info">Room ID: {roomName}</p>
        <p className="welcome-message">Welcome, {userName}</p>
        <ul className="player-list">
          {players.map((player, index) => (
            <li key={index} className="player-item">
              {player.name ? player.name : "Unknown"} - Points: {player.score}
            </li>
          ))}
        </ul>
        {isHost ? (
          <button className="start-game-button" onClick={handleStartGame}>Start Game</button>
        ) : (
          <p className="waiting-message">Waiting for the host to start the game...</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1>Game Component (Game is Started)</h1>
    </div>
  );
}

export default MultiplayerGame;
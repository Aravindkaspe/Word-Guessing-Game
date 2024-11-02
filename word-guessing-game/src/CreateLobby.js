// src/CreateLobby.js
import React, { useState, useEffect } from 'react';

function CreateLobby({ socket, userName, onRoomJoin, onRoomCreated }) {
  const [roomCreated, setRoomCreated] = useState(false);
  const [roomID, setRoomID] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [players, setPlayers] = useState([]);

  const handleCreateRoom = () => {
    const uniqueRoomID = `${userName}-${Math.floor(Math.random() * 10000)}`;
    setRoomID(uniqueRoomID);
    setRoomCreated(true);
    onRoomCreated();
  };

  const handleSelectDifficulty = (level) => {
    setDifficulty(level);
    // Emit 'createRoom' with userName included
    socket.emit('createRoom', { roomID, difficulty: level, userName });
    onRoomJoin(roomID);
  };

  // Listen for new players joining the room
  useEffect(() => {
    socket.on('playerJoined', ({ players }) => {
      setPlayers(Object.values(players));
    });

    return () => {
      socket.off('playerJoined');
    };
  }, [socket]);

  // Emit start game event when host clicks start
  const handleStartGame = () => {
    socket.emit('startGame', roomID);
  };

  return (
    <div className="create-lobby-container">
      {!roomCreated ? (
        <button className="create-room-button" onClick={handleCreateRoom}>
          Create Room
        </button>
      ) : !difficulty ? (
        <div>
          <h3>Room ID: {roomID}</h3>
          <p>Select Difficulty:</p>
          <div className="difficulty-buttons">
            <button className="difficulty-button" onClick={() => handleSelectDifficulty('easy')}>
              Easy
            </button>
            <button className="difficulty-button" onClick={() => handleSelectDifficulty('medium')}>
              Medium
            </button>
            <button className="difficulty-button" onClick={() => handleSelectDifficulty('hard')}>
              Hard
            </button>
          </div>
        </div>
      ) : (
        <div className="waiting-room">
          <h3>Waiting for Players to Join...</h3>
          <p>Room ID: {roomID}</p>
          <p>Difficulty: {difficulty}</p>
          <ul className="player-list">
            {players.map((player, index) => (
              <li key={index}>{player.name || "Unknown"} - Points: {player.score}</li>
            ))}
          </ul>
          {players.length > 1 && (
            <button className="start-game-button" onClick={handleStartGame}>
              Start Game
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default CreateLobby;
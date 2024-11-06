// src/CreateLobby.js
import React, { useState, useEffect } from 'react';
import './CreateLobby.css';

function CreateLobby({ socket, userName, onRoomJoin, onRoomCreated }) {
  const [roomCreated, setRoomCreated] = useState(false);
  const [roomID, setRoomID] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [joinRoomID, setJoinRoomID] = useState('');
  const [players, setPlayers] = useState([]);

  const handleCreateRoom = () => {
    const uniqueRoomID = `${userName.split(' ').map(n => n.charAt(0)).join('')}-${Math.floor(1000 + Math.random() * 9000)}`;
    setRoomID(uniqueRoomID);
    setRoomCreated(true);
    onRoomCreated();
  };

  const handleSelectDifficulty = (level) => {
    setDifficulty(level);
    socket.emit('createRoom', { roomID, difficulty: level, userName });
    onRoomJoin(roomID);
  };

  const handleJoinRoom = () => {
    if (joinRoomID.trim() !== '') {
      socket.emit('joinRoom', { roomID: joinRoomID, userName });
      onRoomJoin(joinRoomID);
    }
  };

  useEffect(() => {
    socket.on('playerJoined', ({ players }) => {
      setPlayers(Object.values(players));
    });

    return () => {
      socket.off('playerJoined');
    };
  }, [socket]);

  const handleStartGame = () => {
    socket.emit('startGame', roomID);
  };

  return (
    <div className="create-lobby-container">
      {!roomCreated ? (
        <div className="create-join-container">
          <button className="create-room-button" onClick={handleCreateRoom}>
            Create Room
          </button>
          <p>Or enter a Room ID to join:</p>
          <div className="room-id-wrapper">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={joinRoomID}
              onChange={(e) => setJoinRoomID(e.target.value)}
              className="room-id-input"
            />
            <button className="create-room-button join-room-button" onClick={handleJoinRoom}>
              Join Room
            </button>
          </div>
        </div>
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
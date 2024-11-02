// src/MultiplayerLobby.js
import React, { useState } from 'react';
import CreateLobby from './CreateLobby';
import JoinLobby from './JoinLobby';
import './MultiplayerLobby.css';

function MultiplayerLobby({ socket, userName, onRoomJoin }) {
  const [roomCreated, setRoomCreated] = useState(false);
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const handleRoomCreation = () => {
    setRoomCreated(true);
  };

  return (
    <div className="lobby-container">
      <h1 className="lobby-title">Multiplayer Lobby</h1>
      <CreateLobby socket={socket} userName={userName} onRoomJoin={onRoomJoin} onRoomCreated={handleRoomCreation} />
      {!roomCreated && <JoinLobby socket={socket} onRoomJoin={onRoomJoin} />}

      {/* Background letters with scrambled effect */}
      <div className="background-letters">
        {Array.from({ length: 64 }).map((_, index) => (
          <span key={index} style={{ '--random-rotation': Math.random() * 2 - 1 }}>
            {letters[Math.floor(Math.random() * letters.length)]}
          </span>
        ))}
      </div>
    </div>
  );
}

export default MultiplayerLobby;
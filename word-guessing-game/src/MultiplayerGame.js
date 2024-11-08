// MultiplayerGame.js
import React, { useState, useEffect } from 'react';
import './MultiplayerGame.css';
import MultiplayerGameSession from './MultiplayerGameSession';

function MultiplayerGame({ socket, roomName, userName }) {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');


  useEffect(() => {
    socket.emit('joinRoom', { roomName, userName });

    socket.on('playerJoined', ({ players }) => {
        console.log("Player list received:", players);
      setPlayers(Object.values(players));
      if (players[socket.id]?.isHost) {
        setIsHost(true);
      }
    });

    socket.on('gameStarted', () => {
      setIsGameStarted(true);
    });

    socket.on('receiveMessage', ({ userName, message }) => {
      setMessages((prevMessages) => [...prevMessages, { userName, message }]);
    });

    return () => {
      socket.off('playerJoined');
      socket.off('gameStarted');
      socket.off('receiveMessage');
    };
  }, [socket, roomName, userName]);

  const handleStartGame = () => {
    socket.emit('startGame', roomName);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('chatMessage', { roomID: roomName, userName, message });
      setMessage('');
    }
  };

  const chatPanel = (
    <div className="chat-panel">
      <h2 className="chat-title">Chat Messages</h2>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <p key={index}><strong>{msg.userName}</strong>: {msg.message}</p>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="chat-form">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="chat-input"
        />
        <button type="submit" className="send-button">Send</button>
      </form>
    </div>
  );

  if (!isGameStarted) {
    return (
      <div className="waiting-room-container">
        {/* Scrambled Background Letters */}
        <div className="background-letters">
          {Array.from({ length: 64 }).map((_, index) => (
            <span key={index} style={{ '--random-rotation': Math.random() * 2 - 1 }}>
              {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
            </span>
          ))}
        </div>

        {/* Main Content in the Center */}
        <div className="main-content">
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
        {chatPanel}
      </div>
    );
  }

  return (
    <div className="multiplayer-game-container">
      {!isGameStarted ? (
        <div className="waiting-room-container">
          {/* Scrambled Background Letters */}
          <div className="background-letters"> {/* Background letter styling here */} </div>
          <div className="main-content"> {/* Player list and start button */} </div>
          {chatPanel}
        </div>
      ) : (
        <>
          <MultiplayerGameSession socket={socket} roomName={roomName} userName={userName} />
          {chatPanel}
        </>
      )}
    </div>
  );
}

export default MultiplayerGame;
// src/JoinLobby.js
import React, { useEffect, useState } from 'react';

function JoinLobby({ socket, onRoomJoin }) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    socket.emit('getRooms');
    
    socket.on('availableRooms', (availableRooms) => {
      setRooms(availableRooms);
    });

    return () => {
      socket.off('availableRooms');
    };
  }, [socket]);

  const handleJoinRoom = (roomID) => {
    socket.emit('joinRoom', roomID);
    setSelectedRoom(roomID);
    onRoomJoin(roomID);
  };

  socket.on('playerJoined', ({ difficulty, roomID }) => {
    setSelectedRoom({ roomID, difficulty });
  });

  return (
    <div className="join-lobby-container">
      <h2>Available Rooms:</h2>
      <ul className="room-list">
        {rooms.map((roomID, index) => (
          <li key={index} className="room-item">
            Room ID: {roomID}
            <button className="join-button" onClick={() => handleJoinRoom(roomID)}>
              Join
            </button>
          </li>
        ))}
      </ul>
      {selectedRoom && (
        <div className="room-info">
          <h3>Room ID: {selectedRoom.roomID}</h3>
          <p>Difficulty: {selectedRoom.difficulty}</p>
        </div>
      )}
    </div>
  );
}

export default JoinLobby;
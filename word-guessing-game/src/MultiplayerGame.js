import React, { useState, useEffect } from 'react';
import './MultiplayerGame.css';
import axios from 'axios';

function MultiplayerGame({ socket, roomName, userName, onQuit }) {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [maskedWord, setMaskedWord] = useState('');
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(60);
  const [difficulty, setDifficulty] = useState();
  const [roundNumber, setRoundNumber] = useState(1);
  const [scores, setScores] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [hint, setHint] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
const [showGameOverScreen, setShowGameOverScreen] = useState(false);


  useEffect(() => {
    socket.emit('joinRoom', { roomName, userName });

    socket.on('playerJoined', ({ players }) => {
      setPlayers(Object.values(players));
      if (players[socket.id]?.isHost) {
        setIsHost(true);
      }
    });

    socket.on('gameStarted', ({ difficulty }) => {
      setIsGameStarted(true);
      setTimer(60);
      setDifficulty(difficulty);
      setRoundNumber(1);
      setGameOver(false);
      setScores([]);
      setShowModal(false);
      console.log(`Game started. Difficulty: ${difficulty}, Initial Round: 1`);
    });

    socket.on('receiveMessage', ({ userName: senderName, message: receivedMessage }) => {
      setMessages(prevMessages => [...prevMessages, { userName: senderName, message: receivedMessage }]);
    });

    socket.on('newRound', ({ maskedWord, roundNumber, word }) => {
      setMaskedWord(maskedWord);
      setFeedback('');
      setTimer(60);
      setRoundNumber(roundNumber);
      setHint('');
      setCurrentWord(word);
      console.log(`New round started with word: ${word}, Round: ${roundNumber}, Masked Word: ${maskedWord}`);
    });

    socket.on('guessResult', ({ userName: senderName, correct }) => {
      setFeedback(correct ? `${senderName} guessed correctly!` : 'Incorrect guess. Try again!');
    });

    socket.on('scoreUpdate', ({ updatedScores }) => {
      setScores(updatedScores);
      const playerScore = updatedScores.find(player => player.name === userName)?.score || 0;
      setScore(playerScore);
      console.log('Score update received:', updatedScores);
    });

    socket.on('gameOver', ({ scores }) => {
      console.log("Game Over event received");
      setGameOver(true);
      setScores(scores);
      setIsGameStarted(true);
      setShowGameOverScreen(true);
      console.log('Game over. Final scores:', scores);
    });

    socket.on('receiveHint', (hint) => {
      setHint(hint);
      console.log(`Hint received: ${hint}`);
    });

    return () => {
      socket.off('playerJoined');
      socket.off('gameStarted');
      socket.off('receiveMessage');
      socket.off('newRound');
      socket.off('guessResult');
      socket.off('gameOver');
      socket.off('receiveHint');
      socket.off('scoreUpdate');
    };
  }, [socket, roomName, userName]);

  // Separate useEffect to handle gameOver and showModal update
  useEffect(() => {
    if (gameOver) {
      setShowModal(true);
      console.log("showModal set to true:", showModal);
    }
  }, [gameOver]);


  useEffect(() => {
    let countdown;
    if (isGameStarted && timer > 0) {
      countdown = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      handleTimeOut();
    }

    return () => clearInterval(countdown);
  }, [isGameStarted, timer]);

  const handleStartGame = () => socket.emit('startGame', roomName);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('chatMessage', { roomID: roomName, userName, message });
      setMessage('');
    }
  };

  const handleGuessSubmit = (e) => {
    e.preventDefault();
    if (guess.trim()) {
      socket.emit('submitGuess', { roomID: roomName, userName, guess });
      setGuess('');
    }
  };

  const requestHint = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/generate-hint`, {
        params: { word: currentWord },
      });
      const aiHint = response.data.hint;
      setHint(`Hint: ${aiHint}`);
    } catch (error) {
      console.error("Error fetching AI-generated hint:", error);
      setHint('Hint: Unable to fetch hint at the moment. Try again later.');
    }
  };

  const handleTimeOut = () => {
    setFeedback("Time's up! Starting the next round...");
    socket.emit('timeOut', { roomID: roomName, userName });
    setTimeout(() => startNewRound());
  };

  const startNewRound = () => {
    socket.emit('startNewRound', roomName);
  };

  const handleRepeat = () => {
    setShowGameOverScreen(false);
    setShowModal(false);
    socket.emit('startGame', roomName);
    setScores([]);
  };

  const handleQuit = () => {
    if (onQuit) {
      onQuit();
    }
  };

  if (!isGameStarted && !showGameOverScreen) {
    return (
      <div className="waiting-room-container">
        <div className="background-letters">
          {Array.from({ length: 64 }).map((_, index) => (
            <span key={index} style={{ '--random-rotation': Math.random() * 2 - 1 }}>
              {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
            </span>
          ))}
        </div>
        <div className="main-content">
          <h1 className="waiting-room-title">Waiting Room</h1>
          <p className="room-info">Room ID: {roomName}</p>
          <p className="welcome-message">Welcome, {userName}</p>
          <ul className="player-list">
            {players.map((player, index) => (
              <li key={index} className="player-item">
                {player.name} - Points: {player.score}
              </li>
            ))}
          </ul>
          {isHost ? (
            <button className="start-game-button" onClick={handleStartGame}>Start Game</button>
          ) : (
            <p className="waiting-message">Waiting for the host to start the game...</p>
          )}
        </div>
        <div className="chat-panel-container">
          <h2 className="chat-title">Chat Messages</h2>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <p key={index} className={`chat-message ${msg.userName === userName ? 'user-message' : 'other-message'}`}>
                <strong>{msg.userName}</strong>: {msg.message}
              </p>
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
      </div>
    );
  }

  return (
    <div className="game-container">
      <h1 className="game-title">Word Guessing Challenge</h1>
      {showModal ? (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Game Over!</h2>
          <p>Final Scores:</p>
          <ul className="score-list">
            {scores.map((player, index) => (
              <li key={index} className="score-item">
                {player.name}: {player.score}
              </li>
            ))}
          </ul>
          <div className="modal-button-container">
            <button className="modal-button" onClick={handleRepeat}>Play Again</button>
            <button className="modal-button" onClick={handleQuit}>Quit</button>
          </div>
        </div>
      </div>
    ) : null}

      <div className="score-timer">
        <span>Score: {scores.find((p) => p.name === userName)?.score || 0}</span>
        <span>Time Left: {timer}s</span>
      </div>
      <p className="difficulty-level">Difficulty: {difficulty}</p>
      <p className="round-info">Round {roundNumber} of 10</p>

      <div className="masked-word">{maskedWord}</div>

      <div className="guess-section">
        <form onSubmit={handleGuessSubmit}>
          <input
            type="text"
            placeholder="Enter your guess"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            className="guess-input"
          />
          <button type="submit" className="submit-button">Submit Guess</button>
        </form>
        <button className="hint-button" onClick={requestHint}>Request a Hint</button>
      </div>
      {hint && <p className="hint-text">{hint}</p>}
      <p className="feedback">{feedback}</p>
      <div className="chat-panel-container">
        <h2 className="chat-title">Chat Messages</h2>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <p key={index} className={`chat-message ${msg.userName === userName ? 'user-message' : 'other-message'}`}>
              <strong>{msg.userName}</strong>: {msg.message}
            </p>
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
    </div>
  );
}

export default MultiplayerGame;
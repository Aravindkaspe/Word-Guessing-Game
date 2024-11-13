const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');
const words = require('word-list-json');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// Use CORS with specified origin
app.use(cors({
    origin: 'http://localhost:3000' // Allow requests from your React app
}));

const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    }
});

let players = {};
let currentWord = "";
let currentHint = "";
let rooms = {};


async function generateHint(word) {
    try {
        const genAI = new GoogleGenerativeAI("AIzaSyAIIsD9LAsSGCpkCdRW0us36O0-WnXe1L8");  // Make sure API key is set in your environment
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Give me a hint for the word '${word}' without revealing the word itself.`;
        const result = await model.generateContent(prompt);

        // Return the AI-generated hint
        return result.response.text();
    } catch (error) {
        console.error("Error generating AI hint:", error);
        return `The word starts with "${word.charAt(0)}" and has ${word.length} letters.`;  // Fallback hint
    }
}

module.exports = generateHint;

app.get('/generate-hint', async (req, res) => {
    const word = req.query.word;
    const hint = await generateHint(word);
    res.json({ hint });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

function broadcastAvailableRooms() {
    // Broadcast the list of rooms to all clients
    io.emit('availableRooms', Object.keys(rooms));
}

io.on('connection', (socket) => {
    console.log('A player connected:', socket.id);

    // Send the current list of rooms to the new connection
    socket.emit('availableRooms', Object.keys(rooms));

    socket.on('createRoom', ({ roomID, userName, difficulty }) => {
        if (!rooms[roomID]) {
            rooms[roomID] = {
                players: {},
                word: getRandomWord(difficulty),
                difficulty,
                host: socket.id,
                roundNumber: 0
            };

            rooms[roomID].players[socket.id] = { score: 0, name: userName, isHost: true };
            console.log(`Room created with ID: ${roomID}`);
            console.log(`Assigned host: ${userName} (ID: ${socket.id}), Host flag: true`);

            socket.join(roomID);
            broadcastAvailableRooms(); // Update all clients with the new room list

            io.in(roomID).emit('playerJoined', { players: rooms[roomID].players });
        }
    });

    socket.on('joinRoom', ({ roomID, userName }) => {
        if (rooms[roomID]) {
            socket.join(roomID);
            rooms[roomID].players[socket.id] = { score: 0, name: userName, isHost: false };

            console.log(`Player joined room ${roomID}: ${userName} (ID: ${socket.id})`);
            io.in(roomID).emit('playerJoined', { players: rooms[roomID].players });
            broadcastAvailableRooms(); // Update all clients with the new room list
        } else {
            socket.emit('errorMessage', 'Room does not exist.');
        }
    });

    socket.on('disconnect', () => {
        for (const roomID in rooms) {
            if (rooms[roomID].players[socket.id]) {
                delete rooms[roomID].players[socket.id];
                console.log(`Player disconnected: ${socket.id} from room ${roomID}`);

                // If no players are left in the room, delete the room
                if (Object.keys(rooms[roomID].players).length === 0) {
                    delete rooms[roomID];
                    console.log(`Room ${roomID} deleted as it has no more players.`);
                } else {
                    io.in(roomID).emit('playerJoined', { players: rooms[roomID].players });
                }
                broadcastAvailableRooms(); // Update all clients with the new room list
                break;
            }
        }
    });

    socket.on('chatMessage', ({ roomID, userName, message }) => {
        io.in(roomID).emit('receiveMessage', { userName, message });
    });

    socket.on('startGame', (roomID) => {
        if (rooms[roomID] && rooms[roomID].host === socket.id) {
            const difficulty = rooms[roomID].difficulty;
            rooms[roomID].roundNumber = 0;
            Object.values(rooms[roomID].players).forEach(player => {
                player.score = 0;
            });
            io.in(roomID).emit('gameStarted', { difficulty });
            startRound(roomID); // Start the first round
            console.log(`Game started in room ${roomID}. Difficulty: ${difficulty}, Initial Round: ${rooms[roomID].roundNumber}`);
        }
    });

    socket.on('timeOut', ({ roomID }) => {
        startRound(roomID);
    });


    socket.on('submitGuess', ({ roomID, userName, guess }) => {
        const room = rooms[roomID];
        if (room && room.players) {
            const currentWord = room.currentWord;
            const player = Object.values(room.players).find(player => player.name === userName);

            if (player && currentWord && guess.toLowerCase() === currentWord.toLowerCase()) {
            // Increase the score of the player who guessed correctly
                player.score += 1;

                console.log(`Score updated for ${userName}. Current scores:`);
                console.log(
                Object.values(room.players).map(player => ({
                    name: player.name,
                    score: player.score
                }))
                );

            // Emit the updated scores to all players in the room
                const updatedScores = Object.values(room.players).map(player => ({
                    name: player.name,
                    score: player.score
        }));
            io.in(roomID).emit('scoreUpdate', { updatedScores });
            io.in(roomID).emit('guessResult', { userName, correct: true });
            startRound(roomID); // Start next round
            console.log(`Correct guess by ${userName} in room ${roomID}. Starting next round.`);
            }
        } else {
            socket.emit('guessResult', { userName, correct: false });
            console.log(`Incorrect guess by ${userName} in room ${roomID}.`);

        }
    });

    socket.on('requestHint', ({ roomID, userName }) => {
        const word = rooms[roomID]?.currentWord;
        if (word) {
            const hint = `The word starts with "${word.charAt(0)}" and is ${word.length} letters long.`;
            io.to(socket.id).emit('receiveHint', hint);
        }
    });
});

function getRandomWord(difficulty) {
    // Define logic to pick a random word based on difficulty
    // For example, filtering from `words` based on length
    let wordLength;
    if (difficulty === 'easy') {
        wordLength = 3 + Math.floor(Math.random() * 3); // 3 to 5 letters
    } else if (difficulty === 'medium') {
        wordLength = 6 + Math.floor(Math.random() * 3); // 6 to 8 letters
    } else {
        wordLength = 9 + Math.floor(Math.random() * 4); // 9+ letters
    }
    const filteredWords = words.filter(word => word.length === wordLength);
    return filteredWords[Math.floor(Math.random() * filteredWords.length)];
}

function startRound(roomID) {
    if (rooms[roomID]) {

        if (rooms[roomID].roundNumber >= 3) {
            const finalScores = Object.values(rooms[roomID].players).map(player => ({
                name: player.name,
                score: player.score
            }));
            io.in(roomID).emit('gameOver', { scores: finalScores });
            console.log(`Game over in room ${roomID}. Final scores:`, finalScores);
            return;
        }

        const difficulty = rooms[roomID].difficulty;
        const word = getRandomWord(difficulty);
        rooms[roomID].currentWord = word;
        rooms[roomID].roundNumber += 1;
        // Send masked word to clients, masking some characters
        const maskedWord = maskWord(word);
        io.in(roomID).emit('newRound', {maskedWord, roundNumber: rooms[roomID].roundNumber, word});
        console.log(`Starting new round in room ${roomID}. Word: ${word}, Masked Word: ${maskedWord}, round: ${rooms[roomID].roundNumber}`);
    }
}

function maskWord(word) {
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    return word
        .split('')
        .map(char => (vowels.includes(char.toLowerCase()) ? char : '_'))
        .join('');
}
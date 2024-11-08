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

    socket.on('createRoom', ({ roomID, userName, difficulty }) => {
        rooms[roomID] = {
            players: {},
            word: getRandomWord(difficulty),
            difficulty,
            host: socket.id,
        };
        rooms[roomID].players[socket.id] = { score: 0, name: userName, isHost: true };
        socket.join(roomID);
        console.log(`Room created with ID: ${roomID}, Host: ${userName}`);
        io.in(roomID).emit('playerJoined', { players: rooms[roomID].players });
    });

    socket.on('joinRoom', ({ roomID, userName }) => {
        if (rooms[roomID]) {
            socket.join(roomID);
            rooms[roomID].players[socket.id] = { score: 0, name: userName, isHost: false };
            console.log(`${userName} joined room ${roomID}`);
            io.in(roomID).emit('playerJoined', { players: rooms[roomID].players });
        } else {
            socket.emit('errorMessage', 'Room does not exist.');
        }
    });

    socket.on('startGame', (roomID) => {
        if (rooms[roomID] && rooms[roomID].host === socket.id) {
            io.in(roomID).emit('gameStarted', { word: rooms[roomID].word });
            console.log(`Game started in room ${roomID}`);
        }
    });

    socket.on('chatMessage', ({ roomID, userName, message }) => {
        console.log(`Message in room ${roomID} from ${userName}: ${message}`);
        io.to(roomID).emit('receiveMessage', { userName, message });
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
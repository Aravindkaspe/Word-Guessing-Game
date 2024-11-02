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

io.on('connection', (socket) => {
    console.log('A player connected:', socket.id);

    socket.on('createRoom', ({ roomID, difficulty, userName }) => {
        // Set the creator as the host with their username
        rooms[roomID] = {
            players: {
                [socket.id]: { score: 0, name: userName, isHost: true }
            },
            word: words[Math.floor(Math.random() * words.length)], // Use random word from list
            difficulty,
        };
        socket.join(roomID);

        console.log(`Room created with ID: ${roomID}`);
        console.log(`Assigned host: ${userName} (ID: ${socket.id}), Host flag:`, rooms[roomID].players[socket.id].isHost);

        io.in(roomID).emit('playerJoined', { players: rooms[roomID].players });
        console.log(`Emitted playerJoined to room ${roomID} with players:`, JSON.stringify(rooms[roomID].players));
    });

    socket.on('joinRoom', ({ roomName, userName }) => {
        if (rooms[roomName]) {
            socket.join(roomName);

            // Add new player if they don't already exist in the room
            if (!rooms[roomName].players[socket.id]) {
                rooms[roomName].players[socket.id] = { score: 0, name: userName, isHost: false };
            }

            console.log(`Player joined room ${roomName}: ${userName} (ID: ${socket.id})`);
            console.log(`Updated players in room ${roomName}:`, JSON.stringify(rooms[roomName].players));

            io.in(roomName).emit('playerJoined', { players: rooms[roomName].players });
        } else {
            socket.emit('errorMessage', 'Room does not exist.');
        }
    });

    socket.on('startGame', (roomID) => {
        if (rooms[roomID] && rooms[roomID].players[socket.id].isHost) {
            io.in(roomID).emit('gameStarted', { word: rooms[roomID].word });
            console.log(`Game started by host (ID: ${socket.id}) in room ${roomID}`);
        } else {
            console.log(`Start game attempt by non-host (ID: ${socket.id}) in room ${roomID}`);
        }
    });

    socket.on('disconnect', () => {
        for (const roomID in rooms) {
            if (rooms[roomID].players[socket.id]) {
                delete rooms[roomID].players[socket.id];
                io.in(roomID).emit('playerJoined', { players: rooms[roomID].players });
                console.log(`Player disconnected: ${socket.id} from room ${roomID}`);
            }
        }
        console.log('A player disconnected:', socket.id);
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
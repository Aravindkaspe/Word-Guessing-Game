const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const words = require('word-list-json');
const { GoogleGenerativeAI } = require("@google/generative-ai");  // Import Google Generative AI

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "http://localhost:3000",  // React frontend
        methods: ["GET", "POST"],
    }
});

let players = {};
let currentWord = "";
let currentHint = "";  // Store hint for the current word
let roundWinner = null;

// Function to get a random word based on difficulty
function getRandomWord(difficulty) {
    let wordLength;
    switch (difficulty) {
        case 'easy':
            wordLength = Math.floor(Math.random() * (5 - 3 + 1)) + 3;  // 3-5 letters
            break;
        case 'medium':
            wordLength = Math.floor(Math.random() * (8 - 6 + 1)) + 6;  // 6-8 letters
            break;
        case 'hard':
            wordLength = Math.floor(Math.random() * (12 - 9 + 1)) + 9;  // 9+ letters
            break;
        default:
            wordLength = 5;  // Default to 5 letters if no difficulty selected
    }
    const filteredWords = words.filter(word => word.length === wordLength);
    return filteredWords[Math.floor(Math.random() * filteredWords.length)];
}

// Function to generate an AI-based hint using Google Generative AI
async function generateHint(word) {
    try {
        const genAI = new GoogleGenerativeAI(process.env.API_KEY);  // Make sure API key is set in your environment
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

io.on('connection', (socket) => {
    console.log('New player connected:', socket.id);
    
    players[socket.id] = { score: 0 };

    // Handle player selection of difficulty
    socket.on('chooseDifficulty', async (difficulty) => {
        currentWord = getRandomWord(difficulty);  // Get a word based on difficulty
        currentHint = await generateHint(currentWord);  // Generate an AI-based hint (asynchronous)
        io.emit('newRound', { wordLength: currentWord.length });
    });

    // Handle player guesses
    socket.on('guess', (guess) => {
        if (guess === currentWord) {
            roundWinner = socket.id;
            players[socket.id].score += 1;
            io.emit('roundResult', { winner: socket.id, correctWord: currentWord, scores: players });

            // Start a new round after guessing the word
            currentWord = getRandomWord('easy');  // Default to easy for new round
            io.emit('newRound', { wordLength: currentWord.length });
        }
    });

    // Handle hint request
    socket.on('requestHint', () => {
        socket.emit('hint', { hint: currentHint });
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        console.log('Player disconnected:', socket.id);
    });
});

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
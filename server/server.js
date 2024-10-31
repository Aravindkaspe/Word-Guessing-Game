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

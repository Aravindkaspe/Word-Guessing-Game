# Word-Guessing-Game

The **Word Guessing Game** is an engaging and interactive application designed for players of all ages to test their vocabulary, word recognition, and deductive reasoning skills. Players can enjoy the game in two modes: **Single Player**, for a relaxed and self-paced experience, and **Multiplayer**, for a competitive and fun-filled challenge with friends. The game generates words of varying difficulties and provides players with masked versions of these words, challenging them to guess the correct word within a set time limit. Players can request AI-generated hints to make their guesses easier and compete for points to achieve the highest score.

The multiplayer mode allows players to create or join game rooms, chat with other players in real time, and enjoy a seamless gaming experience with interactive rounds. Each round becomes more engaging with features like word masking, timed gameplay, and score tracking. The game is designed to foster an enjoyable gaming atmosphere through its intuitive user interface and exciting features.

Whether you're a casual gamer looking for light entertainment or a competitive player eager to outscore others, the **Word Guessing Game** offers a unique blend of fun and challenge that will keep you coming back for more. Perfect for playing solo or as a group activity, this game is a great way to improve your vocabulary while having a fantastic time!

## Built With

- [![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
- [![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
- [![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
- [![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
- [![Google Generative AI](https://img.shields.io/badge/Google%20Generative%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google/)


## Prerequisites

Before cloning and using this application, you'll need to install these things on your computer:
* [Node.js](https://nodejs.org/en/download/): a single-threaded, open-source, cross-platform runtime environment for building fast and scalable server-side and networking applications. It runs on Chrome's V8 JavaScript runtime engine, and it uses event-driven, non-blocking I/O architecture, which makes it efficient and suitable for real-time applications.
* [Express](https://expressjs.com/): fast, unopinionated, minimalist web framework for Node.js.
    ```sh
    npm install express
    ```
* [Socket.IO](https://socket.io/): a library that enables <b>low-latency</b>, <b>bidirectional</b> and <b>event-based</b> communication between a client and a server. It is built on top of the WebSocket protocol and provides additional guarantees like fallback to HTTP long-polling or automatic reconnection.
    ```sh
    npm install socket.io
    ```
* [Visual Studio Code](https://code.visualstudio.com/download): You can choose any IDE or Text Editor that you want. To build a simple application like this, I recommend <b>Visual Studio Code</b>.

## Installation
You can install this application by cloning this repository into your current working directory:
```sh
git clone https://github.com/Aravindkaspe/Word-Guessing-Game.git
```
After cloning the repository, you can open the project by Visual Studio Code.

Open a terminal and type this command to install the necessary modules required for the project:
```sh
npm install
```

Then type this command to run the project:
```sh
npm start
```
Then open browser windows for <i>http://localhost:3000/</i>, on which the application runs.

## Usage

### Welcome Screen
- Enter your first and last name to start the game.

### Single Player
- Guess the word based on the displayed masked letters.
- Click "Submit" or press "Enter" to submit guesses.
- Request hints as needed.
- View final score and replay or quit after the game ends.

### Multiplayer
- Create or join a game room.
- Wait for at least two players to start the game.
- The host starts the game by clicking "Start Game."
- Chat with players and guess words to earn points.
- View final scores and replay or quit after the game ends.




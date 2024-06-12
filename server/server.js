// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');


const app = express();
app.use(cors());
//const END_POINT = "https://dixit-one.vercel.app";
const END_POINT = 'http://localhost:5173';


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: END_POINT,
        methods: ["GET", "POST"]
    }
})

app.get('/', (req, res) => {
    res.status(200).send(`server is up and running on port ${PORT}`);
})

const PORT = 5000;



const rooms = {}; // To keep track of rooms and players

// Function to initialize a new room
const initializeRoom = (roomName) => {
    rooms[roomName] = {
        players: [],
        names: [],
        gameState: {
            started: false,
            round: 0,
            deck: ['card1', 'card2', 'card3'], // Include all cards
            playersData: {}, // To store player scores and submitted cards
            story: '',
            storyteller: null,
            storyCard: null,
            submittedCards: [],
            votes: {}
        }
    };
};

io.on('connect', (socket) => {
    console.log('A player connected:', socket.id);

    // Create room event
    socket.on('createRoom', (roomName, playerName, callback) => {
        if (rooms[roomName]) {
            callback({ success: false, message: 'Room already exists' });
        } else {
            initializeRoom(roomName);
            rooms[roomName].players.push(socket.id);
            rooms[roomName].names.push(playerName);
            rooms[roomName].gameState.playersData[socket.id] = 0;
            socket.join(roomName);
            callback({ success: true, message: 'Room created', roomName });
            console.log(`Room ${roomName} created by ${socket.id}`);
        }
    });

    // Join room event
    socket.on('joinRoom', (roomName, playerName, callback) => {
        if (rooms[roomName]) {
            rooms[roomName].players.push(socket.id);
            rooms[roomName].names.push(playerName);
            rooms[roomName].gameState.playersData[socket.id] = 0;
            socket.join(roomName);
            callback({ success: true, message: 'Joined room', roomName });
            console.log(`${socket.id} joined room ${roomName}`);
            io.to(roomName).emit('playerJoined', socket.id);
        } else {
            callback({ success: false, message: 'Room does not exist' });
        }
    });

    // Start game event
    socket.on('startGame', (roomName, callback) => {
        const userRegistry = {};
        const room = rooms[roomName];
        if (room && room.players.length >= 1) {
            room.gameState.started = true;
            room.players.forEach((key, index) => {
                userRegistry[key] = room.names[index];
            })
            io.to(roomName).emit('gameStarted', room.gameState, userRegistry);
            dealCards(roomName, room.players);
            startRound(roomName); // Start the first round
            callback({ success: true, message: 'Game started' });
        } else {
            callback({ success: false, message: 'Not enough players to start the game' });
        }
    });

    //shuffle cards
    const shuffle = (array) => {

        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i));
            const temp = array[j];
            array[j] = array[i];
            array[i] = temp;
        }

        return array;
    }

    const dealCards = (roomName, players) => {
        const DECK_SIZE = 90;
        const deck = Array.from({ length: DECK_SIZE }, (_, index) => index);
        const cardsDealt = {};
        const shuffledCards = shuffle(deck);
        const numCardsPerPlayer = Math.floor(deck.length / Object.keys(players).length);
        for (let playerId in players) {
            cardsDealt[players[playerId]] = shuffledCards.splice(0, numCardsPerPlayer);
        }
        console.log(cardsDealt);
        io.to(roomName).emit('dealCards', cardsDealt);
    }


    // Start a new round
    const startRound = (roomName) => {
        const room = rooms[roomName];
        const gameState = room.gameState;
        gameState.round++;
        gameState.storyteller = getNextStoryteller(room);
        //gameState.storyCard = drawCard(room);
        gameState.storyCard = null;
        gameState.submittedCards = [];
        gameState.votes = {};
        gameState.story = ''; // Clear previous story
        rooms[roomName].gameState.submittedCards = [];
        io.to(roomName).emit('newRound', gameState);
    };

    // Get the next storyteller
    const getNextStoryteller = (room) => {
        const players = room.players;
        const index = (room.gameState.round - 1) % players.length;
        return players[index];
    };

    // Draw a card from the deck
    // const drawCard = (room) => {
    //     const deck = room.gameState.deck;
    //     const cardIndex = Math.floor(Math.random() * deck.length);
    //     return deck.splice(cardIndex, 1)[0]; // Remove and return the drawn card
    // };

    // Submit story event
    socket.on('submitStory', (roomName, story, storyCard, callback) => {
        const room = rooms[roomName];
        const gameState = room.gameState;
        if (gameState.storyteller === socket.id && storyCard != '') {
            gameState.story = story;
            gameState.storyCard = storyCard;
            io.to(roomName).emit('newStory', { story, storyteller: socket.id, storyCard });
            callback({ success: true, message: 'Story submitted' });
        } else {
            callback({ success: false, message: 'Select a card and write a story.' });
        }
    });

    // Submit card event
    socket.on('submitCard', (roomName, card, callback) => {
        const room = rooms[roomName];
        const gameState = room.gameState;
        if (gameState.started && socket.id !== gameState.storyteller && card != '') {
            rooms[roomName].gameState.submittedCards.push({ player: socket.id, card });
            if (rooms[roomName].gameState.submittedCards.length === room.players.length - 1) {
                rooms[roomName].gameState.submittedCards.push({ player: gameState.storyteller, card: gameState.storyCard });
                const shuffledDeck = shuffle(rooms[roomName].gameState.submittedCards);
                io.to(roomName).emit('cardsSubmitted', shuffledDeck);
            }
            callback({ success: true, message: 'Card submitted' });
        } else {
            callback({ success: false, message: 'Select a card to submit' });
        }
    });

    // Vote card event
    socket.on('voteCard', (roomName, cardId, callback) => {
        const room = rooms[roomName];
        const gameState = room.gameState;

        if (gameState.started && socket.id !== gameState.storyteller) {
            gameState.votes[socket.id] = cardId;
            if (Object.keys(gameState.votes).length === room.players.length - 1) {
                io.to(roomName).emit('votesSubmitted', gameState.votes);
                endRound(roomName); // All votes submitted, end the round
            }
            callback({ success: true, message: 'Vote submitted' });
        } else {
            callback({ success: false, message: 'You cannot vote' });
        }
    });

    // End the current round
    const endRound = (roomName) => {
        const MAX_ROUNDS = 16;
        const room = rooms[roomName];
        const gameState = room.gameState;
        const scores = calculateScores(room);
        io.to(roomName).emit('roundResults', scores);
        // Update player scores
        for (const playerId in scores) {
            room.gameState.playersData[playerId] += scores[playerId].score;
        }
        io.to(roomName).emit('roundEnded', gameState);
        // Check if the game should continue to the next round or end
        if (gameState.round < MAX_ROUNDS) {
            startRound(roomName);
        } else {
            endGame(roomName);
        }
    };

    // Calculate scores for the current round
    const calculateScores = (room) => {
        const gameState = room.gameState;
        const storytellerId = gameState.storyteller;
        const storyCard = gameState.storyCard;
        const votes = gameState.votes;
        const submittedCards = gameState.submittedCards;
        const scores = {};
        const votedGuessers = {};
        const votingRes = {};

        for (const id in votes) {  //votes {'id' : 'card'}
            //voteCount {card : frequency}
            const card = votes[id];
            if (card === storyCard) {
                scores[id] = {storyteller: false, score : 2};
            } else {
                votedGuessers[id] = {storyteller:false, score: 0};
                const playerId = submittedCards.find(obj => obj['card'] === card).player; //returns playerID 
                if (scores[playerId]) scores[playerId] = {storyteller:false, score: 3};
                else votedGuessers[playerId] = {storyteller:false, score: 1};
            }
        }

        if (Object.keys(scores).length == Object.keys(votes).length || Object.keys(scores).length == 0)
            scores[storytellerId] = {storyteller:true, score: 0};
        else
            scores[storytellerId] = {storyteller:true, score: 3};

        const finalScores = { ...scores, ...votedGuessers }
        return finalScores;
    };

    // End the game
    const endGame = (roomName) => {
        // Implement end game logic here
        console.log(`Game in room ${roomName} ended`);
    };

    // Handle player disconnection
    socket.on('disconnect', () => {
        console.log('A player disconnected:', socket.id);
        for (const roomName in rooms) {
            const room = rooms[roomName];
            const index = room.players.indexOf(socket.id);
            if (index !== -1) {
                room.players.splice(index, 1);
                console.log(`${socket.id} left room ${roomName}`);
                io.to(roomName).emit('playerLeft', socket.id);
                if (room.players.length === 0) {
                    delete rooms[roomName];
                    console.log(`Room ${roomName} removed`);
                }
                break;
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

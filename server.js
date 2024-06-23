const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for messages
let messages = ['I love you ❤️'];

// Function to save messages to a file
function saveMessagesToFile() {
    console.log('Saving messages to file');
    console.log('Messages:', messages);
    fetch('https://riddhimandal.com/textingapp/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
    }).then(
        res => {
            console.log('Messages saved successfully');
            console.log('Response:', res);
        }
    
    ).catch(err => {
        console.error('Error saving messages:', err);
    });
}

// Fetch initial messages
fetch('https://riddhimandal.com/textingapp/get')
    .then(response => response.json())
    .then(data => {
        messages = data;
        // Save the messages to a file every 1 hour
        setInterval(saveMessagesToFile, 1000 * 60 * 60);
    })
    .catch(err => {
        console.error('Error fetching initial messages:', err);
        process.exit(1);
    });

// Send endpoint
app.post('/send', (req, res) => {
    const { message } = req.body;
    if (message) {
        messages.push(message);
        broadcast(message);
        saveMessagesToFile();

        res.status(200).send({ status: 'Message received' });
    } else {
        res.status(400).send({ error: 'Message not received' });
    }
});

// Default endpoint
app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'public', 'send.html'));
});

// Receive endpoint
app.get(['/receive', '/r', '/recieve', '/rec'], (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'public', 'receive.html'));
});

// Get endpoint
app.get('/get', (req, res) => {
    res.status(200).send(messages);
});

// Initialize messages from file
const messagesFilePath = path.join(__dirname, 'messages.json');
app.get('/initmsgs', (req, res) => {
    fs.readFile(messagesFilePath, (err, data) => {
        if (err) {
            console.error('Error reading messages from file:', err);
            res.status(500).send('Error reading messages from file');
        } else {
            const initialMessages = JSON.parse(data);
            res.status(200).send(initialMessages);
        }
    });
});

// Start the HTTP server
const server = app.listen(process.env.PORT || port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Broadcast function to send message to all connected clients
function broadcast(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Ping clients every minute to keep the connection alive
function sendPing() {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.ping(); // Send a ping to keep the connection alive
        }
    });
}

setInterval(sendPing, 1000 * 60);


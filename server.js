const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Save the messages to a file every 1 hour
function saveMessagesToFile() {
    const filePath = path.join(__dirname, 'messages.json');
    fs.writeFile(filePath, JSON.stringify(messages, null, 2), (err) => {
        if (err) {
            console.error('Error saving messages to file:', err);
        } else {
            console.log('Messages saved to file:', filePath);
        }
    });
}


// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for messages
let messages = ['I love you ❤️'];
setInterval(saveMessagesToFile, 1000 * 60);


const messagesFilePath = path.join(__dirname, 'messages.json');
if (fs.existsSync(messagesFilePath)) {
    fs.readFile(messagesFilePath, (err, data) => {
        if (err) {
            console.error('Error reading messages from file:', err);
        } else {
            messages = JSON.parse(data);
            console.log('Loaded messages from file:', messages);
        }
    });
}

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

// Receive endpoint, allow /receive or /receive.html or /receive.htm  or /receive.htm or /r or /r.html or /r.htm or /r.html or /r.htm
app.get(['/receive','/r','/recieve','/rec']  , (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'public', 'receive.html'));
});

// Get endpoint
app.get('/get', (req, res) => {
    res.status(200).send(messages);
});


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

// Ping clients every minute seconds to keep the connection alive
function sendPing() {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.ping(); // Send a ping to keep the connection alive
        }
    });
}

setInterval(sendPing, 1000 * 60);
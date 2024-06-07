const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const users = {};

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (users[username]) {
        return res.status(400).send('User already exists');
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[username] = hashedPassword;
    res.status(200).send('User registered');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = users[username];
    if (!hashedPassword || !bcrypt.compareSync(password, hashedPassword)) {
        return res.status(400).send('Invalid credentials');
    }
    res.status(200).send('Login successful');
});

io.on('connection', (socket) => {
    socket.on('file-upload', (file) => {
        socket.broadcast.emit('file-transfer', file);
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});

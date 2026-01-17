const { Server } = require('socket.io');
const { createAdapter } = require("@socket.io/redis-adapter");
const { pub , sub} = require('../redis/redis');
const registerSocketEvents = require('./socketEvent')
const socketAuth = require('../middlewares/socketAuth')

const initSocket = (server) => {
    const io = new Server(server, {
        cors: { origin: "*"},
    });

    io.use(socketAuth);

    io.adapter(createAdapter(pub, sub));

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);
        registerSocketEvents(io, socket);
    })

    return io;
}

module.exports = initSocket;
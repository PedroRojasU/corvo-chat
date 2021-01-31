const path = require('path');
const express = require('express');
const cors = require('cors');
const { ObjectID } = require('mongodb');
require('dotenv').config();

const timestamp = require('./aux-functions/timestamp');
const generateHash = require('./aux-functions/generateHash');
const mongoService = require('./services/mongoService');
const webSocketService = require('./services/webSocketService');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoService.connect().then(async mongoClient => {

    const chatsDb = mongoClient.db('corvo').collection('corvo-chat');
    const usersDb = mongoClient.db('corvo').collection('users');

    const wsServer = await webSocketService.enable(app);

    const activeClients = {};
    const content = null;
    const isTyping = [];

    wsServer.on('request', async request => {
        console.log(`${timestamp} - Received a new connection from ${request.origin}`);
        const clientData = await mongoService.identifyClient(request.origin);
        //Validate if connection should be accepted
        if (!clientData) {
            return
        }
        const connection = request.accept(null, request.origin);
        console.log(`${timestamp} - Client identified as ${clientData.name} (${clientData._id.toString()})`); //test clientData.str.toString()
        //Add to activeClients
        activeClients[clientData.name] = connection;
        // New data
        let lastTypeDate;
        const typedRecently = false;

        connection.on('message', data => {
            console.log(`New request!`);
            const dataFromClient = JSON.parse(data.utf8Data);
            const updatedData = { ...dataFromClient };
            if (dataFromClient.type === "userStatus") {
                updatedData.activeUsers = Array(Object.keys(activeClients));
                webSocketService.broadcastAll(activeClients, updatedData);
            }
            if (dataFromClient.type === "contentChange") {
                content = dataFromClient.content;
                webSocketService.broadcastAll(activeClients, updatedData);
            }
            if (dataFromClient.type === "isTyping") {
                lastTypeDate = Date.now();
                if (!typedRecently) {
                    isTyping.push(clientData.name);
                    updatedData.isTyping = isTyping;
                    webSocketService.broadcastAll(activeClients, updatedData);
                    typingInterval = setInterval(() => {
                        if ((Date.now() - lastTypeDate()) / 1000 > 3) {
                            updatedData.isTyping = isTyping.filter((value, index, arr) => value !== clientData.name);
                            webSocketService.broadcastAll(activeClients, updatedData);
                            typedRecently = false;
                            clearInterval(typingInterval);
                        }
                    }, 3100);
                }
                typedRecently = true;
            }
        });
        // User disconnected
        connection.on('close', connection => {
            delete activeClients[clientData.name]
            console.log(`User disconnected`);
        });
    });

});
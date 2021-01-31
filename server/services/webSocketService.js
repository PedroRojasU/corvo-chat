const http = require('http');
const timestamp = require('../aux-functions/timestamp');

module.exports = enable = async (app) => {
    const server = http.createServer(app);
    server.listen(PORT, () => {
        console.log(`${timestamp} - Websocket server listening on port ${PORT}...`);
    });
    return new webSocketServer({ httpServer: server });
}

module.exports = broadcastAll = async (clientList, jsonData) => {
    Object.values(clientList).forEach(clientConnection => {
        clientConnection.sendUTF(jsonData)
    });
}
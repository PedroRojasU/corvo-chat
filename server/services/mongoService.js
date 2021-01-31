const mongo = require('mongodb').MongoClient;
const timestamp = require('../aux-functions/timestamp');

module.exports = connect = async () => {
    const URL = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URL}/${process.env.DB_NAME}?retryWrites=true&w=majority`;
    try {
        const mongoClient = await mongo.connect(URL, { useUnifiedTopology: true });
        console.log(`${timestamp} - Connected successfully to mongodb`);
        return mongoClient.db('corvo');
    } catch {
        console.log(`${timestamp} - Something went wrong while trying to connect to mongo: ${err}`);
    }
}

module.exports = findUserName = async (usersDb, ip) => {
    const userName = await usersDb.findOne({ ip: ip });

}

module.exports = identifyClient = async (ip, db) => {
    const trustedIps = db.collection('trusted-ips');
    let clientData = await trustedIps.findOne({ ip: ip });
    if (!clientData) {
        console.log(`${timestamp} - Unknown client. Connection to ${ip} refused`);
        return null;
    } else {
        console.log(`${timestamp} - Client ${clientData.name} connected from ${ip}`);
        return clientData;
    }
}
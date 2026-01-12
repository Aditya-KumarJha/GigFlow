import dotenv from 'dotenv';
dotenv.config();
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { connect } from './src/broker/broker.js';
import { startNotificationConsumers } from './src/broker/notification.consumer.js';
import http from 'http';
import { initSocketServer } from './src/sockets/socket.server.js';

const PORT = process.env.PORT;

connectDB();
connect().then(() => {
    startNotificationConsumers();
});

const server = http.createServer(app);
initSocketServer(server);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

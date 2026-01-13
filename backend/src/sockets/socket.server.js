import { Server } from 'socket.io';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';

let ioInstance = null;
export const userSockets = new Map(); 

export async function initSocketServer(httpServer) {
    if (ioInstance) return ioInstance;

    const io = new Server(httpServer, {
        path: '/api/socket/socket.io/',
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            credentials: true,
        },
    });

    io.use((socket, next) => {
        try {
            const cookies = socket.handshake.headers?.cookie || '';
            const { token } = cookies ? cookie.parse(cookies) : {};
            if (!token) return next(new Error('Authentication error: No token'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            socket.token = token;
            return next();
        } catch (err) {
            return next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.user?.id || socket.user?._id || socket.user?.sub;
        console.log('Socket connected:', socket.id, 'user:', userId);

        if (userId) userSockets.set(userId.toString(), socket.id);

        socket.on('ping', () => socket.emit('pong'));

        socket.on('disconnect', () => {
            if (userId) userSockets.delete(userId.toString());
            console.log('Socket disconnected:', socket.id);
        });
    });

    ioInstance = io;
    return io;
}

export default initSocketServer;

export function getIo() {
    return ioInstance;
}

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
export let io;
export const initSocket = (server) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: env.FRONTEND_URL,
            credentials: true,
        },
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }
        jwt.verify(token, env.JWT_ACCESS_SECRET, (err, decoded) => {
            if (err)
                return next(new Error('Authentication error'));
            socket.user = decoded;
            next();
        });
    });
    io.on('connection', (socket) => {
        const user = socket.user;
        console.log(`Socket connected: ${user.id} in company ${user.companyId}`);
        // Join a room for the specific user to receive targeted notifications
        socket.join(`user_${user.id}`);
        // Join a room for the company to receive broad broadcasts
        socket.join(`company_${user.companyId}`);
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${user.id}`);
        });
    });
    return io;
};
// Helper function to emit notifications
export const sendNotification = (userId, event, data) => {
    if (io) {
        io.to(`user_${userId}`).emit(event, data);
    }
};
export const broadcastCompany = (companyId, event, data) => {
    if (io) {
        io.to(`company_${companyId}`).emit(event, data);
    }
};
//# sourceMappingURL=index.js.map
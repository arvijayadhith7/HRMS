import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
export declare let io: SocketIOServer;
export declare const initSocket: (server: HTTPServer) => SocketIOServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export declare const sendNotification: (userId: string, event: string, data: any) => void;
export declare const broadcastCompany: (companyId: string, event: string, data: any) => void;
//# sourceMappingURL=index.d.ts.map
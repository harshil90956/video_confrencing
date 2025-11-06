import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

const handleSocketConnection = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['*'],
      credentials: true,
    }
  });

// server.js (Socket.io server side)
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join-call', (data) => {
        const { room, username } = data;
        
        // Join the room
        socket.join(room);
        
        // Store username in socket object
        socket.username = username;
        
        // Notify others about new user with username
        socket.to(room).emit('user-joined', {
            id: socket.id,
            username: username
        });
        
        // Send existing users to new user with usernames
        const clients = Array.from(io.sockets.adapter.rooms.get(room) || []);
        const existingUsers = clients
            .filter(clientId => clientId !== socket.id)
            .map(clientId => {
                const clientSocket = io.sockets.sockets.get(clientId);
                return {
                    id: clientId,
                    username: clientSocket.username || `User${clientId.slice(-4)}`
                };
            });
        
        socket.emit('existing-users', existingUsers);
    });

    socket.on('signal', (toId, message) => {
        socket.to(toId).emit('signal', socket.id, message);
    });

    socket.on('chat-message', (message, username) => {
        // Broadcast message with username
        socket.to(Array.from(socket.rooms)[1]).emit('chat-message', message, username, socket.id);
    });

    socket.on('disconnect', () => {
        // Notify others about user leaving
        socket.to(Array.from(socket.rooms)[1]).emit('user-left', socket.id);
    });
});

  // Periodic cleanup of empty rooms (optional)
  setInterval(() => {
    const now = new Date();
    for (const [roomKey, users] of Object.entries(connections)) {
      if (users.length === 0) {
        // Double check if room is really empty
        const room = io.sockets.adapter.rooms.get(roomKey);
        if (!room || room.size === 0) {
          delete connections[roomKey];
          delete messages[roomKey];
          console.log(`Cleaned up empty room: ${roomKey}`);
        }
      }
    }
  }, 300000); // Clean up every 5 minutes

  return io;
};

export default handleSocketConnection;
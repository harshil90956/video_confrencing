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

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-call", (path) => {
      try {
        if (connections[path] === undefined) {
          connections[path] = [];
        }
        
        // Add user to the room
        connections[path].push(socket.id);
        timeOnline[socket.id] = new Date();
        
        // Join socket room for easier room management
        socket.join(path);

        console.log(`User ${socket.id} joined room ${path}. Total users: ${connections[path].length}`);

        // Send existing users to the new user (EXCLUDING themselves)
        const existingUsers = connections[path].filter(id => id !== socket.id);
        socket.emit("existing-users", existingUsers);

        // Notify all other users in the room about the new user
        socket.to(path).emit("user-joined", socket.id, connections[path]);

        // Send chat history to the new user
        if (Array.isArray(messages[path])) {
          for (let a = 0; a < messages[path].length; ++a) {
            socket.emit(
              "chat-message", 
              messages[path][a]['data'], 
              messages[path][a]['sender'], 
              messages[path][a]['socket-id-sender']
            );
          }
        } else {
          console.log(`No messages found for path: ${path}`);
        }

      } catch (error) {
        console.error('Error in join-call:', error);
      }
    });

    socket.on("signal", (toId, message) => {
      try {
        io.to(toId).emit("signal", socket.id, message);
      } catch (error) {
        console.error('Error in signal:', error);
      }
    });

    socket.on("chat-message", (data, sender) => {
      try {
        // Find which room the socket is in
        const matchingRoom = Object.keys(connections).find(room => 
          connections[room].includes(socket.id)
        );

        if (matchingRoom) {
          // Initialize messages array if it doesn't exist
          if (messages[matchingRoom] === undefined) {
            messages[matchingRoom] = [];
          }
          
          // Add message to history (limit to last 100 messages to prevent memory issues)
          messages[matchingRoom].push({ 
            'sender': sender, 
            'data': data, 
            'socket-id-sender': socket.id 
          });
          
          // Keep only last 100 messages
          if (messages[matchingRoom].length > 100) {
            messages[matchingRoom] = messages[matchingRoom].slice(-100);
          }

          console.log("message", matchingRoom, ":", sender, data);

          // Broadcast to all users in the room
          io.to(matchingRoom).emit("chat-message", data, sender, socket.id);
        } else {
          console.log(`User ${socket.id} not found in any room`);
        }

      } catch (error) {
        console.error('Error in chat-message:', error);
      }
    });

    socket.on("disconnect", () => {
      try {
        console.log("User disconnected:", socket.id);
        
        var diffTime = Math.abs(timeOnline[socket.id] - new Date());
        console.log(`User ${socket.id} was online for ${diffTime}ms`);

        // Find and clean up all rooms this user was in
        for (const [roomKey, users] of Object.entries(connections)) {
          const userIndex = users.indexOf(socket.id);
          if (userIndex !== -1) {
            console.log(`Removing user ${socket.id} from room ${roomKey}`);
            
            // Remove user from the room
            users.splice(userIndex, 1);
            
            // Notify other users in the room
            socket.to(roomKey).emit('user-left', socket.id);
            
            // Clean up empty rooms
            if (users.length === 0) {
              delete connections[roomKey];
              delete messages[roomKey];
              console.log(`Room ${roomKey} deleted (no users left)`);
            }
            
            break; // User can only be in one room at a time
          }
        }

        // Clean up time tracking
        delete timeOnline[socket.id];

      } catch (error) {
        console.error('Error in disconnect:', error);
      }
    });

    // Handle connection errors
    socket.on("error", (error) => {
      console.error('Socket error:', error);
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
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import handleSocketConnection from "./controllers/socketManager.js"; 
import userRouter from "./routes/userRoute.js";

// Express app
const app = express();
const server = createServer(app);
const io =  handleSocketConnection(server);// if give any err then remove { cors: { origin: "*" } };

app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); 
app.use(cors({
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['*'],
      credentials: true,
    })); // Enable CORS


app.set("port",(8000));
app.use("/api/v1/users",userRouter);



// MongoDB connection and server startup
const start = async () => {
    try {
        // MongoDB connection (adjust URI if needed)
        await mongoose.connect("mongodb+srv://harshildobariya070:vkyUfPUwMT2X3zK0@cluster0.hz87j.mongodb.net/Video_con?retryWrites=true&w=majority", {});
        
        console.log("Connected to MongoDB",mongoose.connection.name);

        // Start the server on port 3000
        server.listen(app.get("port"), () => {
            console.log("Listening on port 8000");
        });
    } catch (error) {
        console.error("Error starting server:", error);
    }
};

// Call the start function
start();

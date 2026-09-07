import express from "express";
import "dotenv/config"
import cors from "cors"
import http from "http";
import ConnectDB from "./lib/db.js";
import userRouter from "./router/userRoutes.js";
import messageRouter from "./router/messageRoutes.js";
import {Server} from "socket.io"


//express app and http server
const app = express();
const server = http.createServer(app);

//initialize socket.io Server
export const io = new Server(server,{
    cors:{origin:"*"}
})

//Store online users
export const userSocketMap = {} //{userId:socketId}

//socket.io connection handler
io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected" , userId);

    if(userId)userSocketMap[userId] = socket.id;

    //Emit online user to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", ()=>{
        console.log("userDisconnectd" , userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers" , Object.keys(userSocketMap))
    })
})


//middleware
app.use(express.json({limit:"15mb"}));
app.use(cors());

app.use("/api/status" , (req,res)=>res.send("server is live "));


//api
app.use("/api/auth" , userRouter)
app.use("/api/messages" , messageRouter);


//db connection
await ConnectDB();



const PORT = process.env.PORT || 5000;
server.listen(PORT , ()=>console.log("server is running on port: "+ PORT));

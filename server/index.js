const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes"); 
const messageRoutes=require("./routes/messageRoute");
const socket=require("socket.io");

const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());

app.use("/api/auth",userRoutes);
app.use("/api/messages",messageRoutes);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection successfull");
  })
  .catch((err) => console.log("DB error=", err));

const server = app.listen(process.env.PORT, () => {
  console.log(`Server Started on Port ${process.env.PORT}`);
});

const io=socket(server,{
  cors:{
    origin: '*',
    credentials: true,
  }
});

global.onlineUsers=new Map();
io.on("connection",(socket)=>{
  global.chatSocket=socket;
  socket.on("add-user",(userId)=>{
    onlineUsers.set(userId,socket.id);
  });

  socket.on("send-msg",(data)=>{
    const sendUserSocket=onlineUsers.get(data.to);
    if(sendUserSocket)
    {
        console.log("data",data);
        socket.to(sendUserSocket).emit("msg-recieve",data.message);
    }
  })
})
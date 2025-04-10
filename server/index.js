import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import { Server } from 'socket.io';
import cors from 'cors';
const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(bodyParser.json()); 
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  let emailtosocket = new Map()
  let sockettoemail = new Map()
io.on('connection', (socket) => {
    console.log('socket connected',socket.id)
    socket.on('join_room', (data) => {
        const {roomId,email}=data
        emailtosocket.set(email,socket.id)
        sockettoemail.set(socket.id,email)
        console.log('inside ')
        socket.join(roomId)
        socket.to(roomId).emit('user_joined', {email})
        io.to(socket.id).emit('joined_room', {roomId,email})
    })
    socket.on('call-user', (data) => {
        const {email,offer}=data
        console.log('inside call user')
        const socketId=emailtosocket.get(email)
        const socketEmail=sockettoemail.get(socket.id)
        console.log(sockettoemail)
        console.log(emailtosocket)
        console.log(socketId)
        console.log(socketEmail)
        socket.to(socketId).emit('incoming-call', {offer,from:socketEmail})
    })
    socket.on('accepted',(data)=>{
        const {email,ans}=data
        const socketId=emailtosocket.get(email)
        socket.to(socketId).emit('call_accepted', {ans,email})
    })
})
server.listen(8000, () => {
    console.log('Server is running on port 8000');
  });
  


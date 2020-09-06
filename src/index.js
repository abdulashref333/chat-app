const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const multer = require('multer');
const socketio = require('socket.io');
const Filter = require('bad-words');
const siofu = require("socketio-file-upload");
const post = require('./routes/post');

const {generateMessages} = require('./utils/messages');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');
const e = require('express');
const port = process.env.PORT || 3000 ;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'../public')));
app.use(siofu.router);
app.use(post);

io.on('connection',(socket) => {
    console.log('New WebSocket connection..');
    socket.on('join',(options,callback)=>{
        const {error, user} = addUser({id:socket.id,...options});
        if(error){
            return callback(error);
        }
        socket.join(user.roomname);
        socket.emit('message',generateMessages('Admin', 'welcome!')); // for the particlare user 
        socket.broadcast.to(user.roomname).emit('message',generateMessages(`${user.username} has joined`),user.username);
        io.to(user.roomname).emit('roomData',{
            room:user.roomname,
            users:getUsersInRoom(user.roomname)
        })

        callback();
    });

    //for uploading images..
    const uploader = new siofu();
    uploader.dir = path.join(__dirname,"../uploads");
    uploader.listen(socket);
    uploader.on("start", function(event){
        if (!event.file.name.match(/\.(jpg|png|jpeg)$/i) ) {
            uploader.abort(event.file.id,socket);
            socket.emit('fileUpload',{
                img:undefined,
                error:'you can upload only images'
            })
        }
    });
    uploader.on('saved',(event)=>{
        const user = getUser(socket.id);
        // console.log(event.file);
        fs.readFile(event.file.pathName, function(err, data){
            const url = `data:${event.file.name}/png;base64,`+ data.toString("base64")
            const img = ` <img class="img" src="${url}" ><br>`;
            io.to(user.roomname).emit('fileUpload',{img, error:undefined});
        });
        fs.unlink(event.file.pathName,()=>{});
    });

    socket.on('sendMessage',(message,callback)=>{
        const user = getUser(socket.id);
        const filter = new Filter();

        if(filter.isProfane(message)||message.length===0){
            return callback('it is not allowd to send bad words!');
        }

        io.to(user.roomname).emit('message',generateMessages(user.username,message)); // for all users
        callback(); 
    })

    socket.on('sendLocation',({longitude,latitude},callback)=>{
        const user = getUser(socket.id);
        const url = `https://google.com/maps?q=${latitude},${longitude}`;
        io.to(user.roomname).emit('locationMessage',generateMessages(user.username,url));
        callback('Location delivered!');
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id);
        if(user){
            io.to(user.roomname).emit('message',generateMessages('Admin',`${user.username} has left!`));
            io.to(user.roomname).emit('roomData',{
                room:user.roomname,
                users:getUsersInRoom(user.roomname)
            });
        }
    })
})

server.listen(port,()=> console.log('server is up on port ',port));
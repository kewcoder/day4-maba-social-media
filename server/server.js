require('dotenv').config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

const users = {};

const socketToRoom = {};

let roomData = [];

io.on('connection', socket => {

    socket.on("find room", () => {
        socket.emit("all rooms", roomData);
    })

    socket.on("join room", data => {
        const roomID = data.roomID
        const moderator = data.moderator
        const speakers = data.speakers
        const slot = data.slot
        const name = data.name
        const code = data.code

        if (users[roomID]) {

            const length = users[roomID].length;

            
            users[roomID].push(socket.id);

            let objIndex = roomData.findIndex((obj => obj.roomID == roomID));
            
            roomData[objIndex].length = length
            
            let speakerslength = roomData[objIndex].speakers.length;
            
            if(speakerslength < slot){
                
                roomData[objIndex].speakers.push({
                    slot: speakerslength,
                    id: speakers.id
                })
            }


        } else {

            users[roomID] = [socket.id];

            roomData.push({
                name: name,
                code: code,
                roomID: roomID,
                length: 1,
                moderator: moderator,
                slot: slot,
                speakers: [{
                    slot: 0,
                    id: speakers.id
                }]
            })

        }


        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);
        const roomData0 = roomData.filter(d => d.roomID == roomID);

        socket.emit("all users", usersInThisRoom);
        socket.emit("room data", roomData0);

    });

    socket.on("sending signal", payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
    });

    socket.on("returning signal", payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    socket.on('disconnect', () => {

        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;
            
            users[roomID].map(d => {
                // emit
                io.to(d).emit("user leave", socket.id)
            })


        }

        socket.emit("user leave", socket.id)


    });

});

server.listen(process.env.PORT || 8000, () => console.log('server is running on port 8000'));



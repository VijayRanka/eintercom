const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http);
const mysql = require('mysql');

app.get('/', (req, res) => {
    res.send("Node Server is running. Yay!!")
})

var users = [];

io.on('connection', socket => {
    //Get the chatID of the user and join in a room of the same chatID
    chatID = socket.handshake.query.chatID
    socket.join(chatID)
    console.log("made with socket Id " + chatID);
    if(!users.includes(chatID))
    users.push(chatID);


    console.log(JSON.stringify(users));

    //Leave the room if the user closes the socket
    socket.on('disconnect', () => {
        console.log('user ' + chatID + ' disconnected');
        socket.leave(chatID);
        const index = users.indexOf(chatID);
            if (index > -1) {
              users.splice(index, 1);
            }
    console.log(JSON.stringify(users));


    })

    //Send message to only a particular user
    socket.on('send_message', message => {
        receiverChatID = message.receiverChatID
        senderID = message.senderID
        content = message.content
        recieverID=message.recieverID
        //Send message to only that particular room
        console.log('user send ' + message.content + '');


        socket.in(recieverID).emit('user_present',{
            'message': content,
            'senderID': senderID,
            'status': users.includes(recieverID),
        });
        
        socket.in(receiverChatID).emit('receive_message', {
            'content': content,
            'senderID': senderID,
        })
    })
   
});



http.listen(3000)
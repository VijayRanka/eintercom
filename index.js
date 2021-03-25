const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http);
const mysql = require('mysql');

app.get('/', (req, res) => {
    res.send("Node Server is running. Yay!!")
})

io.on('connection', socket => {
    //Get the chatID of the user and join in a room of the same chatID
    chatID = socket.handshake.query.chatID
    socket.join(chatID)
    console.log("made with socket Id " + chatID);

    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "eintercom"
    });

    con.connect(function(err) {
        if (err) {
            throw err;
        }
        console.log("Connected!");
    });
    //Leave the room if the user closes the socket
    socket.on('disconnect', () => {
        console.log('user ' + chatID + ' disconnected');
        socket.leave(chatID)
    })

    //Send message to only a particular user
    socket.on('send_message', message => {
        receiverChatID = message.receiverChatID
        senderChatID = message.senderChatID
        content = message.content
        product_chat_id=message.productChatId
        //Send message to only that particular room

        insertMessage(message,con);
        
        socket.in(receiverChatID).emit('receive_message', {
            'content': content,
            'senderChatID': senderChatID,
            'receiverChatID': receiverChatID,
        })
    })

    function insertMessage(meesage,con){
       var sql = "INSERT INTO `chat`(`sender_id`, `reciever_id`, `prod_id`, `message`) VALUES ('" + senderChatID + "','" + receiverChatID + "','" + product_chat_id + "','" + content + "')";
            con.query(sql, function(err, result) {
                if (err) {
                    throw err;
                }
            }); 
        }
});



http.listen(3000)
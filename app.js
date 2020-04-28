const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

var validAdmin = false;

//initial votes data.
var votes = {1:100,
            2: 100,
            3:100};

io.on('connection', client => {
    console.log('socket.io client connected');
    io.emit('vote info',votes);

    client.on('disconnect', () => {
        console.log('socket.io client disconnected.');
    });
  });

var emitVotes = function(){
    io.emit('vote info',votes);
};

app.use(express.static(__dirname + '/public'));

app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: false } ) );

app.get('/admin', function(req,res){
    if(validAdmin){
        res.sendFile(__dirname + '/vote_admin.html');
    }
    else {
        res.sendFile(__dirname + '/public/admin.html');
    }
});

app.post('/vote', function(req,res) {
    console.log(req.body.id);

    if(req.body.id){
        var count = 1;
        if(req.body.num){//admin votes
            count = parseInt(req.body.num);
            if (isNaN(count)){//if invalid number passed in, such 'sdlkjsdf', reset it to 100.
                count = 100;
            }
        }
        else {
            count = votes[req.body.id] + count;
        }
        
        votes[req.body.id] = count;
        console.log(votes);

        emitVotes();
        res.json({url:'vote_result.html',success:true});
    }
    else {
        res.send('invalid request.');
    }
});

app.post('/login',function(req,res) {
    console.log(req.body);
    if(req.body.user) {//login page
        if(req.body.user === 'admin' && req.body.password === '1234'){
            validAdmin = true;
            res.json({url:'admin',success:true});
        }
    }
    res.json({success:false});
});

app.post('/logout',function(req,res) {
    console.log('admin logged out');
    if(validAdmin) {
        validAdmin = false;
    }
    
    res.json({success:true});
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server started on port ${port}.`);
});
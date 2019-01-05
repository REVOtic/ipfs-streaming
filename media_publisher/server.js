'use strict';

// IPFS API
const IPFS = require('ipfs')


// Websocket for recieving video chunks
// const WebSocket = require('ws');


// Create a socket for chunks
// const wss = new WebSocket.Server({ port: 8000 });

// for sending hash
// const hashSocket = new WebSocket.Server({ port: 8082 });


// Filesystem
var fs = require('fs');

// Child Pocess Creation
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;


// var express = require('express');
// var app = require('express')();
// var server = require('http').Server(app);
// var io = require('socket.io')(server);

// server.listen(8081);

var app = require('express')();
var server = app.listen(8081);
var io = require('socket.io').listen(server);

console.log("Server ready");

// const app = express();
// const socketIO = require('socket.io');

// const server = express()
//   .use(app)
//   .listen(8081, () => console.log(`Listening Socket on ${ 8081 }`));

// const io = socketIO(server);


var __dirname = "./media_subscriber";

app.get('/', function (req, res) {
  res.sendFile('/index.html', {root: __dirname});
});

app.get('/main.js', function (req, res) {
  res.sendFile('/main.js', {root: __dirname});
});

app.get('/subscriber.js', function (req, res) {
  res.sendFile('/subscriber.js', {root: __dirname});
});

app.get('/player', function (req, res) {
  res.sendFile('/static.html', {root: __dirname});
});

// Variable to hold the name and directory structure
// dir holds the path for temp_folder
// hash holds the hash of newly added content
// pinCommand holdes the string for adding content to ipfs in child node
let dir, hash, pinCommand, number;


// let hs = hashSocket.on('connection', function connection(hSocket) {
//     console.log("hashSocket ready");
//     hSocket.send("Test");

//     hashSocket.on("hash", function(data){
//         hSocket.send(data);
//     });
// });

var hash_room;

// handle incoming connections from clients
io.sockets.on('connection', function(socket) {
  
  socket.on('room', function(room) {
    socket.join(room);
  });

  socket.on('room_for_hash', function(room) {
    hash_room = room+"_hash";
    socket.join(hash_room);
  });

  socket.on("list_rooms", function(id){
    console.log("Listing rooms for "+id);
    io.sockets.emit('rooms_available', io.sockets.adapter.rooms);

  });

  socket.on('chunk', function(message) {
        if(message == "init"){

            number = 0;
            
            // Current date to name the file uniquely
            var dateNow = new Date();
            
            var timeShot = dateNow.getTime();

            // Create a directory with this name
            dir = './media_publisher/temp_folder/tmp' + timeShot
            // var dirPath = '/temp_folder/tmp' + timeShot
            

            // Create the directory using filesystem
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir, function(err){
                    if (err) {
                        console.log('failed to create directory', err);
                    }    
                });
            }
       }
        else{
            number++;
            
            console.log("Recieved Data")
            // Current date to name the file uniquely
            var dateNow = new Date();

            var folder = dir + "/chunk_"+dateNow.getTime();
            pinCommand = 'ipfs add -r '+folder;
            if (!fs.existsSync(folder)){
                fs.mkdirSync(folder, function(err){
                    if (err) {
                        console.log('failed to create directory', err);
                    }else{
                                    
                        console.log('create directory', folder);
                    }    
                });
            }

            // Name of the master file
            // var fileName = dateNow.getTime()+".m3u8";
            var fileName = dateNow.getTime() + "master.m3u8";
            var finalName = folder+"/"+fileName;
            

            // Args for HLS conversion
            var args = [
                '-y', 
                '-i', '-',                  // - because we are sending in the input
                '-strict', '-2',
                '-profile:v', 'baseline', // baseline profile (level 3.0) for H264 video codec
                '-level', '3.0',          
                '-start_number', '0',     // start the first .ts segment at index 0
                '-hls_time', '10',        // 10 second segment duration
                '-hls_list_size', '0',    // Maxmimum number of playlist entries (0 means all entries/infinite)
                '-f', 'hls', finalName               // HLS format    
            ];

            // Spawn the child process with ffmpeg and args
            const proc = spawn('ffmpeg', args);


            // Write the incoming chunk to the proc
            proc.stdin.write(message);

            // End the writing stream
            proc.stdin.end();

            // If FFmpeg stops for any reason, close the child_process.
            proc.on('close', (code, signal) => {
                console.log('FFmpeg child process closed, code ' + code + ', signal ' + signal);
                try{
                    // console.log("Add to IPFS");
                    var addNewContent = execSync(pinCommand);                            
                    
                    var hashString = addNewContent.toString();

                    hash = hashString.split("\n")[2].split(" ")[1]

                                                    
                    console.log("Send this hash: "+ hash);


                    io.sockets.in(hash_room).emit('hash', {'hash': hash.trim(), "master_name": fileName, "sequence_number": number});

                }catch(e){
                    console.log(e);
                }
    

            });

            proc.stdin.on('error', (e) => {
                console.log('FFmpeg STDIN Error', e);
            });

            // FFmpeg outputs all of its messages to STDERR.  Let's log them to the console.
            proc.stderr.on('data', (data) => {
                // console.log('FFmpeg messages:', data.toString());
            });

               
        }
  });
});


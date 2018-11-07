'use strict';

const IPFS = require('ipfs')
const node = new IPFS()

var fs = require('fs');

var lockFile = require('lockfile');

var spawn = require('child_process').spawn;


node.on('ready', () => {
	console.log("IPFS ready")
})

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8000 });


 // Variable to hold the name and directory structure
let dir, fd


// Socket Connection
wss.on('connection', function connection(ws) {

    ws.on('message', function incoming(message) {
        // Make  an empty folder and add it to ipfs, create the ipns for it
        if(message == "init"){
            
            var date = new Date();
            
            // Create a directory with this name
            dir = './temp_folder/tmp' + date.getTime();
            
            if (!fs.existsSync()){
                fs.mkdirSync(dir);
            }


            // Adding to IPFS
            // Commented for now
            // let results = node.files.add(dir, recursive=true);
            // console.log(results);
        }else{
            var date = new Date();

            // Name of the master file
            var name = dir+"/"+date.getTime()+".m3u8";
            
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
                '-f', 'hls', name               // HLS format    
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
            });

            // Handle STDIN pipe errors by logging to the console.
            // These errors most commonly occur when FFmpeg closes and there is still
            // data to write.  If left unhandled, the server will crash.
            proc.stdin.on('error', (e) => {
                console.log('FFmpeg STDIN Error', e);
            });

            // FFmpeg outputs all of its messages to STDERR.  Let's log them to the console.
            proc.stderr.on('data', (data) => {
                console.log('FFmpeg messages:', data.toString());
            });

            
        }

    });
});
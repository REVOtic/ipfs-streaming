'use strict';

// IPFS API
const IPFS = require('ipfs')

// Create IPFS node with pubsub = true
const node = new IPFS({
    EXPERIMENTAL: {
    pubsub: true
  }
});

// Websocket for recieving video chunks
const WebSocket = require('ws');

// Create a socket 
const wss = new WebSocket.Server({ port: 8000 });

// Filesystem
var fs = require('fs');

// Lockfile library to lock master.m3u8
var lockFile = require('lockfile');

// Child Pocess Creation
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;


// once the server is ready
node.on('ready', () => {
    console.log("IPFS ready", node.id)
})


// Variable to hold the name and directory structure
// dir holds the path for temp_folder
// hash holds the hash of newly added content
// pinCommand holdes the string for adding content to ipfs in child node
let dir, hash, pinCommand;

// Topic for the pubsub to publish the new hash
const topic = "newHash";


// Socket Connection
wss.on('connection', function connection(ws) {
    // On receiving the message
    ws.on('message', function incoming(message) {
        // Make  an empty folder and add it to ipfs, create the ipns for it
        if(message == "init"){
            
            // Current date to name the file uniquely
            var dateNow = new Date();
            
            var timeShot = dateNow.getTime();

            // Create a directory with this name
            dir = './temp_folder/tmp' + timeShot
            // var dirPath = '/temp_folder/tmp' + timeShot
            

            // Create the directory using filesystem
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir, function(err){
                    if (err) {
                        console.log('failed to create directory', err);
                    }    
                });
            }

            // Add a master.m3u8 file, empty
            fs.writeFile(dir+"/master.m3u8", "#EXTM3U\n", function(err) {
                if(err) {
                    return console.log(err);
                }


                console.log("The file was saved!");

                pinCommand = 'ipfs add -Qr '+dir;

    	       // Add this folder to IPFS
                var addEmptyFolder = execSync(pinCommand);

    	        // console.log(hash.toString);
                // console.log(node.pubsub);

                // const topic = 'fruit-of-the-day';
                // const msg = Buffer.from('banana');

                // node.pubsub.publish(topic, msg, (err) => {
                //   if (err) {
                //     return console.error(`failed to publish to ${topic}`, err)
                //   }
                //   // msg was broadcasted
                //   console.log(`published to ${topic}`)
                // })


                // Publish the hash to pubsub topic "newHash"
                node.pubsub.publish(topic, new node.types.Buffer('banana'));

        		// node.pubsub.publish(topic, hash, (err) =>{
        		// 	if(err){
        		// 		return console.log(err);			
          //           }
          //           console.log("published");
        		// })	
                
    	    });             
        }else{
            // Current date to name the file uniquely
            var dateNow = new Date();

            // Name of the master file
            var fileName = dateNow.getTime()+".m3u8";
            var finalName = dir+"/"+fileName;
            
            console.log("Name it ", fileName);

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

            console.log("Spawn");

            // Write the incoming chunk to the proc
            proc.stdin.write(message);

            // End the writing stream
            proc.stdin.end();

            // If FFmpeg stops for any reason, close the child_process.
            proc.on('close', (code, signal) => {
                console.log('FFmpeg child process closed, code ' + code + ', signal ' + signal);
                

                // lock the master
                lockFile.lock(dir+"/master.m3u8.lock", function(er){
                    // Write the filename name to master.m3u8 
                    console.log("Write the filename name to master.m3u8 ");

                    var wstream = fs.createWriteStream(dir+"/master.m3u8", {'flags': 'a'});
                    
                    wstream.write("#EXT-X-STREAM-INF:BANDWIDTH=150000\n"+fileName+"\n");
                    
                    console.log("End writing");
                    wstream.end();

                    
                    // On finish writing stream
                    wstream.on('finish', function(){
                        // Add this folder to ipfs
                        try{
                            console.log("Add to IPFS");
                            var addNewContent = execSync(pinCommand);                            
                            
                            hash = addNewContent;
                                                            
                            console.log("Send this hash: "+hash);
                                         
                            // publish to topic                   
                            console.log("publish to topic");
                            // node.pubsub.publish(topic, hash, (err) =>{
                            //     if(err){
                            //         console.log(err);           
                            //     }
                            //     console.log("published");
                            // })

                            node.pubsub.publish(topic, new node.types.Buffer('banana'))
                        }catch(e){
                            console.log(e.stdout);
                        }
    
                        lockFile.unlock(dir+"/master.m3u8.lock", function(err){
                            // unlocked;
                            console.log("unlock master");
                        })
                    })
                     
                });



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

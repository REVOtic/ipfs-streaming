'use strict';

const IPFS = require('ipfs')
const node = new IPFS()

var fs = require('fs');

var lockFile = require('lockfile');

var spawn = require('child_process').spawn;

var exec = require('child_process').exec;
var execSync = require('child_process').execSync;


node.on('ready', () => {
	console.log("IPFS ready")
})

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8000 });


 // Variable to hold the name and directory structure
let dir, fd, ipns, hash, pinCommand;
let ipnsCommand = "ipfs name publish /ipfs/"

const topic = "newHash";


// Socket Connection
wss.on('connection', function connection(ws) {

    ws.on('message', function incoming(message) {
        // Make  an empty folder and add it to ipfs, create the ipns for it
        if(message == "init"){
            
            var date = new Date();
            
            var timeShot = date.getTime();

            // Create a directory with this name
            dir = './temp_folder/tmp' + timeShot
            // var dirPath = '/temp_folder/tmp' + timeShot
            
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir, function(err){
                    if (err) {
                        console.log('failed to create directory', err);
                    }    
                });
            }

            fs.writeFile(dir+"/master.m3u8", "#EXTM3U\n", function(err) {
                if(err) {
                    return console.log(err);
                }

                console.log("The file was saved!");
		
		pinCommand = 'ipfs add -Qr '+dir;

	        var hash = execSync(pinCommand);
	        console.log(hash.toString);

		node.pubsub.publish(topic, hash.toString(), (err) =>{
			if(err){
				console.log("Error");			
			}
			console.log("published");
		})	
            
	    }); 


            



            
        }else{
            var date = new Date();

            // // Name of the master file
            var fileName = date.getTime()+".m3u8";
            var name = dir+"/"+fileName;
            
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
                

                lockFile.lock(dir+"/master.m3u8.lock", function(er){
                    
                    // Write the filename name to master.m3u8 

                    var wstream = fs.createWriteStream(dir+"/master.m3u8", {'flags': 'a'});
                    wstream.write("#EXT-X-STREAM-INF:BANDWIDTH=150000\n"+fileName+"\n");
                    wstream.end();

                    
                    // On finish writing stream
                    wstream.on('finish', function(){
                        // Add this folder to ipfs
                        execSync(pinCommand, function(error, stdout, stderr) {
                            console.log('stdout: ' + stdout);
                            
                            // get new hash
                            hash = stdout;
                            console.log('stderr: ' + stderr);
                            if (error !== null) {
                                console.log('exec error: ' + error);
                            }else{
                                // ipfs name publish /ipfs/<CURRENT_PARENTFOLDER_HASH>
                                
                                // Added
                                console.log("Send this hash: "+hash);
                            	
				node.pubsub.publish(topic, hash.toString(), (err) =>{
					if(err){
						console.log("Error");			
					}
					console.log("published");
				})         
                            }
                        });    
                        lockFile.unlock(dir+"/master.m3u8.lock", function(err){
                            // unlocked;
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

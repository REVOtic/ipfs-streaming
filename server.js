'use strict';

// const IPFS = require('ipfs')
// const node = new IPFS()

var fs = require('fs');

var lockFile = require('lockfile');

var spawn = require('child_process').spawn;

var exec = require('child_process').exec;
var execSync = require('child_process').execSync;


// node.on('ready', () => {
// 	console.log("IPFS ready")
// })

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8000 });


 // Variable to hold the name and directory structure
let dir, fd, ipns, hash, pinCommand;
let ipnsCommand = "ipfs name publish /ipfs/"


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
            }); 


            pinCommand = 'ipfs add -Qr '+dir;

            var hash = execSync(pinCommand);
            console.log(hash);
            // exec(pinCommand, function(error, stdout, stderr) {
            //     console.log('stdout: ' + stdout);
            //     hash = stdout;
            //     // console.log('stderr: ' + stderr);
            //     if (error !== null) {
            //         console.log('exec error: ' + error);
            //     }else{
            //         exec(ipnsCommand+hash, function(error, stdout, stderr) {
            //             console.log('stderr: ' + stderr);
            //             if (error !== null) {
            //                 console.log('exec error: ' + error);
            //             }
            //         });
            //     }
            // });


            
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
                    var wstream = fs.createWriteStream(dir+"/master.m3u8", {'flags': 'a'});
                    wstream.write("#EXT-X-STREAM-INF:BANDWIDTH=150000\n"+fileName+"\n");
                    wstream.end();

                    

                    wstream.on('finish', function(){
                        execSync(pinCommand, function(error, stdout, stderr) {
                            console.log('stdout: ' + stdout);
                            hash = stdout;
                            console.log('stderr: ' + stderr);
                            if (error !== null) {
                                console.log('exec error: ' + error);
                            }else{
                                // ipfs name publish /ipfs/<CURRENT_PARENTFOLDER_HASH>
                                
                                     
                            }
                        });    
                        lockFile.unlock(dir+"/master.m3u8.lock", function(err){
                            // unlocked;
                        })
                    })
                     
                });


                // var lsCommand = "find "+dir+" -name \"*.m3u8\"  -printf \"%f\n\" | sort"; 

                // var res = execSync(lsCommand).toString();
                // // console.log(result.toString());

                // var m3u8s = res.split("\n");

                // // console.log(lsCommand);

                // // // lockFile.lock(dir+"/master.m3u8.lock", function (er) {
                // var catCommand = "cat temp.m3u8 > "+dir+"/master.m3u8";
                // var file = execSync(catCommand).toString();

                // // // "#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=150000\n"

                // var wstream = fs.createWriteStream(dir+"/master.m3u8", {'flags': 'a'});

                // m3u8s.forEach((m3u8, index) => {
                //     // console.log(m3u8.split("/"));
                //     if(m3u8!="master.m3u8" && m3u8 != "")
                //         wstream.write("#EXT-X-STREAM-INF:BANDWIDTH=150000\n"+m3u8+"\n");
                    
                // });

                // wstream.end();

                // wstream.on("finish", function() {
                    // console.log("finished");
                    // Writing to the file is actually complete.
                    // lockFile.unlock(dir+"/master.m3u8.lock", function (er) {
                    //     // er means that an error happened, and is probably bad.
                    // })  
                // });

                // exec(pinCommand, function(error, stdout, stderr) {
                //     console.log('stdout: ' + stdout);
                //     hash = stdout;
                //     console.log('stderr: ' + stderr);
                //     if (error !== null) {
                //         console.log('exec error: ' + error);
                //     }else{
                //         // ipfs name publish /ipfs/<CURRENT_PARENTFOLDER_HASH>

                             
                //     }
                // });

            });

            // Handle STDIN pipe errors by logging to the console.
            // These errors most commonly occur when FFmpeg closes and there is still
            // data to write.  If left unhandled, the server will crash.
            proc.stdin.on('error', (e) => {
                console.log('FFmpeg STDIN Error', e);
            });

            // FFmpeg outputs all of its messages to STDERR.  Let's log them to the console.
            proc.stderr.on('data', (data) => {
                // console.log('FFmpeg messages:', data.toString());
            });

            // fs.writeFile(dir+"/"+date+".webm", message, function (err) {
            //     if (err) {
            //         return console.log(err);
            //     }
            //     console.log("The file was saved!");
            // });   
        }
    });
});
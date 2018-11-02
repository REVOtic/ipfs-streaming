'use strict';

const IPFS = require('ipfs')
const node = new IPFS()

var fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');
var lockFile = require('lockfile');
// var cp = require('child_process');

// const spawn = require('child_process').spawn;   


node.on('ready', () => {
	console.log("IPFS ready")
})

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8000 });

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}


let dir, fd
wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log(Buffer.isBuffer(message));
    // Make  an empty folder and add it to ipfs, create the ipns for it
    if(message == "init"){
        var date = new Date();
        dir = './temp_folder/tmp' + date.getTime();
        console.log(message);
        if (!fs.existsSync()){
            fs.mkdirSync(dir);
        }
        fd = dir+"/"+date.getTime()+".mp4";
        // let results = node.files.add(dir, recursive=true);
        // console.log(results);
    }else{
        // console.log(message);
        var date = new Date();


        lockFile.lock('temp_folder.lock', function (er) {
            // let writeStream = fs.createWriteStream(fd);
            // writeStream.write(message);
            // writeStream.on('finish', () => {  
            //     console.log('wrote all data to file');
            // });

            // writeStream.end();

            // var proc = cp.spawn('ffmpeg', [
            //   '-hide_banner',
            //   '-i', '-',
            //   fd,
            //   '-strict', 
            //   '-profile:v', 'baseline',
            //   '-level', '3.0',
            //   '-start_number', '0',
            //   '-hls_time', '5',
            //   '-hls_list_size', '0',
            //   '-f', 'hls',
            //   'master.m3u8, fd,
            // ]);  
            // console.log("it is ready")
            // proc.stdin.write(message);

            // proc.stdin.end();

            // proc.stderr.pipe(process.stdout);

            // const ffmpeg = spawn('ffmpeg', ['-i', message, '-strict', '-2', '-profile:v', 'baseline', '-level', '3.0', 'start_number', '0', '-hls_time', '5', '-hls_list_size', '0', '-f', `hls`,  fd.m3u8]);

            // ffmpeg.stderr.on('data', (data) => {
            //     console.log`${data}`);


            // });
            // ffmpeg.on('close', (code) => {
            //     // console.log(code);
            //     // resolve();
            // });

            console.log("The file  saving!");
            fs.appendFile(fd, message, function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("The file was saved!, ", fd);


            });

            // function callback() { 
            //     // do something when encoding is done 
            //     console.log("done");
            // }
             
            // try {
            //     ffmpeg(fd).addOptions([
            //         '-profile:v baseline', // baseline profile (level 3.0) for H264 video codec
            //         '-level 3.0', 
            //         '-s 640x360',          // 640px width, 360px height output video dimensions
            //         '-start_number 0',     // start the first .ts segment at index 0
            //         '-hls_time 10',        // 10 second segment duration
            //         '-hls_list_size 0',    // Maxmimum number of playlist entries (0 means all entries/infinite)
            //         '-f hls'               // HLS format
            //       ]).output(fd+'.m3u8').on('end', callback).run()  
            // } catch (err) {
            //   console.error(err)
            // }

            lockFile.unlock('temp_folder.lock', function (er) {
                // er means that an error happened, and is probably bad.
            })

            

            
        })

          
        // fs.writeFileSync(dir+"/"+date+".mp4", message, function (err) {
        //     if (err) {
        //         return console.log(err);
        //     }
        //     console.log("The file was saved!");
        // });



        // console.log('received: %s', message);
        // console.log(message.type)
        // const toStream = require('buffer-to-stream')
         
        // const readable = toStream(message);
        // ffmpeg(readable, { timeout: 432000 })
        //     .addOption('-level', 3.0)
        //     // size
        //     .addOption('-s','640x360')
        //     // start_number
        //     .addOption('-start_number', 0)
        //     // set hls segments time
        //     .addOption('-hls_time', 10)
        //     // include all the segments in the list
        //     .addOption('-hls_list_size', 0)
        //     // format -f
        //     .format('hls')
        //     // setup event handlers
        //     .on('start', function(cmd) {
        //        console.log('Started ');
        //     })
        //     .on('error', function(err) {
        //       console.log('an error happened: ' + err.message);
        //     })
        //     .on('end', function() {
        //        console.log('File has been converted succesfully');
        //     })
        //

             // .save(dir)

        // ffmpeg(message)
        //   .size('320x240')
        //   .on('error', function(err) {
        //     console.log('An error occurred: ' + err.message);
        //   })
        //   .on('end', function() {
        //     console.log('Processing finished !');
        //   })
        //   .save(dir+"/"+date+".mp4");
        
        // fs.writeFileSync(dir+"/"+date+".webm", message, function (err) {
        //     if (err) {
        //         return console.log(err);
        //     }
        //     console.log("The file was saved!");
        // });
    }

    


  });
});
var date = new Date();

var fs = require('fs');

var ffmpeg = require('fluent-ffmpeg');

// fd = "./temp_folder/tmp1541525124314/1541525124314.mp4";
// dir = './temp_folder/tmp' + date.getTime();
// var name = "/temp_folder/"+date.getTime()+".m3u8";
// console.log("The file was saved!, ", fd);

ffmpeg(fd, { timeout: 432000 }).addOptions([
    '-strict -2',
    '-profile:v baseline', // baseline profile (level 3.0) for H264 video codec
    '-level 3.0', 
    '-s 640x360',          // 640px width, 360px height output video dimensions
    '-start_number 0',     // start the first .ts segment at index 0
    '-hls_time 5',        // 10 second segment duration
    '-hls_list_size 0',    // Maxmimum number of playlist entries (0 means all entries/infinite)
    '-f hls'               // HLS format
  ])
    .on('end', callback)
    .on('start', function(commandLine, stderrLine) {
        console.log('Spawned Ffmpeg with command: ' + commandLine)
    })
    .on('error', function(err, stdout, stderr) {
            console.log('Error: ' + err.message);
    })

    .save(name)    

function callback() { 
    // do something when encoding is done 
    console.log("done");
}
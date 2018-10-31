# ipfs-streaming
Streaming Live Media over the IPFS Network


## Convert a video to HLS

ffmpeg -i ../../overlay_14.mp4 -strict -2 -profile:v baseline -level 3.0 -start_number 0 -hls_time 5 -hls_list_size 0 -f hls master.m3u8


## Add the folder to IPFS

ipfs add -Qr .
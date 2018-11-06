# ipfs-streaming
Streaming Live Media over the IPFS Network


## Convert a video to HLS

ffmpeg -i ./temp_folder/tmp1541525124314/1541525124314.mp4 -strict -2 -profile:v baseline -level 3.0 -start_number 0 -hls_time 5 -hls_list_size 0 -f hls master.m3u8


## Add the folder to IPFS

ipfs add -Qr .



ffmpeg -i ./temp_folder/tmp1541525124314/1541525124314.mp4  -strict -2 -y -profile:v baseline -level 3.0  -start_number 0 -hls_time 5 -hls_list_size 0 -f hls 1541531639241.m3u8


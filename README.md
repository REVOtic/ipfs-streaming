# ipfs-streaming
Streaming Live Media over the IPFS Network



## Installation

1. Install IPFS js API 

```npm install ipfs --save```

2. Install connect and serve-static

```npm install connect serve-static```











## Convert a video to HLS

ffmpeg -i ./temp_folder/tmp1541525124314/1541525124314.mp4 -strict -2 -profile:v baseline -level 3.0 -start_number 0 -hls_time 5 -hls_list_size 0 -f hls master.m3u8


## Add the folder to IPFS

ipfs add -Qr .



ffmpeg -i ./temp_folder/tmp1541525124314/1541525124314.mp4  -strict -2 -y -profile:v baseline -level 3.0  -start_number 0 -hls_time 5 -hls_list_size 0 -f hls 1541531639241.m3u8


ipfs daemon --enable-pubsub-experiment

https://stackoverflow.com/questions/36497420/play-multiple-m3u8-files-continuously-in-web-hls-player


About pubsub in browser
https://github.com/ipfs/js-ipfs-http-client/issues/518



These are edge cases but they might happen if there are huge delays updating the lockfile (e.g. slow nfs disk). If the time took to update the lockfile is greater than the staleness duration, the lock might have been acquired by another process, hence compromised.

You can use ipfs config to set the Access-Control-Allow-Origin header and other headers:

ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["GET", "POST"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '["Authorization"]'
ipfs config --json API.HTTPHeaders.Access-Control-Expose-Headers '["Location"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'

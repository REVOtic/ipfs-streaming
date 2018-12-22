# IPFS Streaming
> Streaming Live and On-Demand Media over the IPFS Network

[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/Naereen/StrapDown.js/graphs/commit-activity)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/dwyl/esta/issues)


![](https://www.logistec.com/wp-content/uploads/2017/12/placeholder.png)


## Requirements  (Prerequisites)
Tools and packages required to successfully install this project.
For example:
* FFMpeg [Install](https://www.ffmpeg.org/)
* Node.js [Install](https://nodejs.org/en/)
* IPFS [Install](https://ipfs.io/)

## Installation
A step by step list of commands / guide that informs how to install an instance of this project. 

1. Make sure you haveNode installed

2. Install FFMpeg

	For Linux and OS X

		sudo apt-get install ffmpeg

	For Windows

		http://www.ffmpeg.org/download.html

3. Clone this repository 

		git clone https://github.com/REVOtic/ipfs-streaming

4. Install dependencies

		npm install


 


## Deployment Notes
Explain how to deploy your project  on a live server. To do so include step by step guide. Potentially do this for multiple platforms. 

1. Run IPFS daemon on port 8080 by:

		ipfs daemon

2. cd into media_publisher and run the node server

		node server.js

3. You can open the media recorder page at `localhost:8081` and media player page at `localhost:8081/static.html`

4. To start the recording, click on `start camera` and then click on `start recording`

5. To stop recording click on `stop recording` 


## Authors 

Sagar Ganiga  – tech.ganiga@gmail.com
 
You can find me here at:
[Github](https://github.com/SagarGaniga)
[LinkedIn](https://www.linkedin.com/in/sagar-ganiga/)


## License
This project is licensed under the MIT License - see the LICENSE.md file for details

MIT © REVOtic

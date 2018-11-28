// The MediaSource interface of the Media Source Extensions API represents a source of media data for an HTMLMediaElement object. A MediaSource object can be attached to a HTMLMediaElement to be played in the user agent.

const mediaSource = new MediaSource();

mediaSource.addEventListener('sourceopen', handleSourceOpen, false);


// Make the variable
let mediaRecorder;
let recordedBlobs;
let sourceBuffer;
let interval;

// Get the elements
const gumVideo = document.querySelector('video#gum');

// Error section
const errorMsgElement = document.querySelector('span#errorMsg');

// Video element to play the recorded video
const recordedVideo = document.querySelector('video#recorded');

// Button to record
const recordButton = document.querySelector('button#record');

// listen to record button on click
recordButton.addEventListener('click', () => {
  
    // if text says "Start Recording" 
  if (recordButton.textContent === 'Start Recording') {
    // call startRecording function
    startRecording();
    interval = setInterval(record_and_send, 1000);

  } else {
    stopRecording();
    recordButton.textContent = 'Start Recording';
    playButton.disabled = false;
    downloadButton.disabled = false;
  }
});

function record_and_send(stream) {
   const recorder = new MediaRecorder(window.stream);
   const chunks = [];
   recorder.ondataavailable = e => chunks.push(e.data);
   console.log("Data sent") 
   recorder.onstop = e => conn.send(new Blob(chunks));
   setTimeout(()=> recorder.stop(), 1000); // we'll have a 5s media file
   recorder.start();
}

const playButton = document.querySelector('button#play');
playButton.addEventListener('click', () => {
  const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
  recordedVideo.src = null;
  recordedVideo.srcObject = null;
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
  recordedVideo.controls = true;
  recordedVideo.play();
});

const downloadButton = document.querySelector('button#download');
downloadButton.addEventListener('click', () => {
  const blob = new recorded(recordedBlobs, {type: 'video/webm'});
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'test.webm';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
});

function handleSourceOpen(event) {
  // console.log('MediaSource opened');
  sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
  // console.log('Source buffer: ', sourceBuffer);
}

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {

    // var rb = [];
    recordedBlobs.push(event.data);

    // rb.push(event.data);
    // var reader = new FileReader();
    // reader.readAsArrayBuffer(recordedBlobs);


    // reader.onloadend = function (event) {
        // connection.send(reader.result);
        // conn.send(reader.result);
        // var sb = new Blob(rb, {type: 'video/webm'});
        // conn.send(event.data);


        // console.log("event.data: ", reader.result);
      
    // };
    // conn.send(event.data);
    // mediaRecorder.stop();
    
    // console.log("Stopped");

    // startRecording();
    // console.log("started again");
  }
  
}

function startRecording() {
  // Create an empty array
  recordedBlobs = [];

  let options = {mimeType: 'video/webm;codecs=vp9'};
  

  // check if there is any support issue
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.error(`${options.mimeType} is not Supported`);
    errorMsgElement.innerHTML = `${options.mimeType} is not Supported`;
    options = {mimeType: 'video/webm;codecs=vp8'};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.error(`${options.mimeType} is not Supported`);
      errorMsgElement.innerHTML = `${options.mimeType} is not Supported`;
      options = {mimeType: 'video/webm'};
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error(`${options.mimeType} is not Supported`);
        errorMsgElement.innerHTML = `${options.mimeType} is not Supported`;
        options = {mimeType: ''};
      }
    }
  }


  try {
    // The MediaRecorder interface of the MediaStream Recording API provides functionality to easily record media. It is created using the MediaRecorder() constructor.
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder:', e);
    errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
    return;
  }

  // console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  recordButton.textContent = 'Stop Recording';
  playButton.disabled = true;
  downloadButton.disabled = true;

  // On stopoing the recording
  mediaRecorder.onstop = (event) => {
    // console.log('Recorder stopped: ', event);
  };

  
  mediaRecorder.start(1000); 
  mediaRecorder.ondataavailable = handleDataAvailable;
  // console.log('MediaRecorder started', mediaRecorder);
}



function stopRecording() {
  mediaRecorder.stop();
  console.log(interval);
  clearInterval(interval);
  // console.log('Recorded Blobs: ', recordedBlobs);
}

function handleSuccess(stream) {
  recordButton.disabled = false;
  // console.log('getUserMedia() got stream:', stream);
  window.stream = stream;

  
  gumVideo.srcObject = stream;
}

async function init(constraints) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    handleSuccess(stream);
    

    conn = new WebSocket('ws://localhost:8000');
    conn.binaryType = 'arraybuffer';

    conn.onmessage = function(e){ console.log(e.data); };
    conn.onopen = () => conn.send('init');
    console.log(conn);

  } catch (e) {
    console.error('navigator.getUserMedia error:', e);
    errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
  }
}

document.querySelector('button#start').addEventListener('click', async () => {
  const hasEchoCancellation = document.querySelector('#echoCancellation').checked;
  const constraints = {
    audio: {
      echoCancellation: {exact: hasEchoCancellation}
    },
    video: {
      width: 1280, height: 720
    }
  };
  // console.log('Using media constraints:', constraints);
  await init(constraints);
});

// recordedVideo.addEventListener('canplay', () => {
//   recordedVideo.srcObject = stream;
// });
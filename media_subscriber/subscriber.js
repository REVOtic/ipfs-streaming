// Create WebSocket connection.
const socket = new WebSocket('ws://13.84.224.77:8082');

// Connection opened
socket.addEventListener('open', function (event) {
    socket.send('Hello Server!');
});

// Listen for messages
socket.addEventListener('message', function (event) {
    // console.log('Message from server:::::::::::', event.data);
   	hashes.push(event.data);
});

// socket.addEventListener('hash', function (data) {
//   console.log(data);
//   // socket.emit('my other event', { my: 'data' });
// });

// Create WebSocket connection.
// const socket = new WebSocket('ws://stream.endereum.io:8082');

// // Connection opened
// socket.addEventListener('open', function (event) {
//     socket.send('Hello Server!');
// });

// // Listen for messages
// socket.addEventListener('message', function (event) {
//     // console.log('Message from server:::::::::::', event.data);
//    	hashes.push(event.data);
// });

// socket.addEventListener('hash', function (data) {
//   console.log(data);
//   // socket.emit('my other event', { my: 'data' });
// });

var publishers = document.getElementById("publishers");

socket = io.connect("http://localhost:8081");


// socket.on('connect', function() {
//    	// Connected, let's sign-up for to receive messages for this room
//    	socket.emit('room', 'room1_hash');
// 	socket.emit("list_rooms", socket.id);

// });

socket.on('hash', function(data) {
   console.log('Incoming message:', data);
   hashes.push(data);
});

socket.on('rooms_available', function(data) {
	// data.forEach(function(room) {
	//   console.log(room);
	// });
	// console.log(data);

	while (publishers.firstChild) {
        publishers.removeChild(publishers.firstChild);
    }	

	for (var key in data) {
		if(key.startsWith("publisher")){
			console.log(key);
			var o = document.createElement("option");
	        o.value = key;
	        o.text = key;
	        publishers.appendChild(o);
		}
	}
	if(!publishers.firstChild){
		var o = document.createElement("option");
        o.value = null;
        o.text = "No Streams Available";
        publishers.appendChild(o);
	}
});

function refreshRooms(){
	socket.emit("list_rooms", socket.id);
}

function startStream(){
	var e = document.getElementById("publishers");
	var publisher = e.options[e.selectedIndex].value;
	if(publisher != null){
		socket.emit('room_for_hash', publisher);	
	}
		
}
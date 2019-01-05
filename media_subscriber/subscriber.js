var publishers = document.getElementById("publishers");

socket = io.connect("https://stream.endereum.io:8081");
// socket = io.connect("https://localhost:8081");


socket.on('hash', function(data) {
   console.log('Incoming message:', data.hash);
   hashes.push(data);
});

socket.on('rooms_available', function(data) {

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
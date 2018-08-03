const socket = require('socket.io'); 
const http = require('http'); 
const path = require('path');
const Initiators = require('./initiatorDataStructure');

// Sends new clients to get data from the server or
// from an available peer
function DataPair(server, threshold) {
  // Server threshold defaults to 2
  const serverThreshold = threshold || 2;

  // Keep track of initiators
  const inits = new Initiators();
  const initList = inits.list;
  let initNumber = 0;
  const currentSenders = {};

  const io = socket(server);
  
  io.on('connection', function(client) {
    
    // Check if client has already downloaded data
    client.emit('check_data');
    client.on('check_data', (downloaded) => {
      if (!downloaded) getData(client, io, serverThreshold);
    });
    
    // Handle client becoming available
    client.on('available', () => {
      // Add them to list of available initiators
      inits.add(client.id); 
      // If the client was sending, remove them from list of current senders
      if (currentSenders[client.id]) {
        delete currentSenders[client.id];
      } 
      initNumber++;
    });
    
    // Handle client disconnecting
    client.on('disconnect', () => {
      // If the client was an available initiator, remove them
      if (initList[client.id]) {
      inits.remove(client.id);
      initNumber--;
      } 
      // If the client was currently sending files, tell the receiver to get data from server instead
      if (currentSenders[client.id]) {
        io.to(currentSenders[client.id]).emit('access_directly_from_server');
        delete currentSenders[client.id];
      } 
    }); 

    // Pass signaling messages along to paired client
    client.on('signaling', (messageReceived, recipient) => {
      io.to(recipient).emit('signaling', messageReceived);
    });
  })

  // Get data from either server or another client
  function getData(client, io, serverThreshold) { 

    // If there are not enough available clients, get directly from server
    if (initNumber < serverThreshold) { 
      client.emit('access_directly_from_server');
    } else { // Otherwise, get data from a peer
      // Pair the two clients
      client.emit('receiver', inits.head);
      io.to(inits.head).emit('sender', client.id);
      // Update list of potential initiators
      currentSenders[inits.head] = client.id;
      inits.remove(inits.head);
      initNumber--;
    }
  }
}

module.exports = DataPair;
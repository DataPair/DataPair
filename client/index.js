let initiator = false;
let partnerID;
let downloaded = false;
let pc;
let dataChannel;

////////////////// Socket functions //////////////////

const socket = io.connect();

// Handles signaling messages
socket.on('signaling', (input) => {
  signalingMessageCallback(input);
})

// Gets images from server when directed
socket.on('access_directly_from_server', () => {
  getImagesFromServer();
})

// Initiates connection as a receiver
socket.on('receiver', (senderID) => {
  partnerID = senderID;
  createPeerConnection(initiator);
})

// Initiates connection as a sender
socket.on('sender', (receiverID) => {
  partnerID = receiverID;
  initiator = true;
  createPeerConnection(initiator);
})

// Tell server if data has already been downloaded
socket.on('check_data', () => {
  socket.emit('check_data', downloaded);
})

////////////////// Photo functions //////////////////

// Get list of tagged images for P2P transfer
let allImages = Object.values(document.getElementsByTagName('img'));
imageArray = allImages.filter(image => image.hasAttribute('data-p2p'));

// Get images directly from server instead of P2P
function getImagesFromServer() {
  imageArray.forEach(image => {
    image.setAttribute('src', (image.getAttribute('data-p2p')))
  })
  readyToSend();
}

// Send downloaded photos to a new client in the network
function sendAllPhotos() {
  imageArray.forEach(image => {
    sendPhoto(image);
  })
  dataChannel.send('all-done');
  readyToSend();
}

// Send an individual photo
function sendPhoto(image) {
  const data = getImageData(image);
  // Establish chunks of data
  const CHUNK_LEN = 64000;
  const totalChunks = data.length / CHUNK_LEN;

  let start;
  let end;

  // Loop through image, sending each chunk
  for (let i = 0; i < totalChunks; i++) {
    start = i * CHUNK_LEN;
    end = (i + 1) * CHUNK_LEN;
    dataChannel.send(data.slice(start, end));
  }
  dataChannel.send('photo-done');
}

// Format image data to send
function getImageData(image) {
  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d');
  context.canvas.width = image.width;
  context.canvas.height = image.height;
  context.drawImage(image, 0, 0, image.width, image.height);
  return canvas.toDataURL('image/jpeg')
}

// Handle and receive incoming images
function receiveData() {
  let imageData = '';
  let counter = 0;
  let dataString;
  return function onMessage(message) {
    dataString = message.data.toString();
    if (dataString.slice(0, 10) == 'photo-done') {
        // If all entire image has been sent, place on screen
        setImage(imageData, counter);
        counter++;
        imageData = '';
    } else if (dataString.slice(0, 8) == 'all-done') {
        // If all images have been sent, tell server
        readyToSend();
    } else {
        // If sending more data in same image, accumulate the extra data
        imageData += dataString;
    }
  }
}

// Place image on the canvas
function setImage(imageData, counter) {
  imageArray[counter].src = imageData;
}

////////////////// Signaling functions //////////////////

// Create an RTC connection with another peer
function createPeerConnection(initiator) {
  pc = new RTCPeerConnection();
  // Send ICE candidates to server
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      sendMessage({
        type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate
      })
    }
  }
  if (initiator) {
    // Create the data channel, label it messages
    dataChannel = pc.createDataChannel('messages');
    // Set up handlers for new data channel
    onDataChannelCreated(dataChannel)
    // Create offer, then pass to onLocalDescription,
    // which sets as local description and sends it
    pc.createOffer(onLocalDescription, logError);
  } else {
    // Create an ondatachannel handler to respond
    // when the data channel from the other client arrives
    pc.ondatachannel = (event) => {
      dataChannel = event.channel
      onDataChannelCreated(dataChannel);
    }
  }
}

// Receive and handle signaling messages
function signalingMessageCallback(message) {
  if (message.type === 'candidate') {
    pc.addIceCandidate(new RTCIceCandidate({candidate: message.candidate}));
  } else if (message.type === 'answer') {
    onRemoteDescription(message);
  } else if (message.type === 'offer') {
    onRemoteDescription(message);
    pc.createAnswer(onLocalDescription, logError);
  }
}

// Handler for creation of data channel itself
function onDataChannelCreated(channel) {
  channel.onopen = () => {
    if (initiator) {
      sendAllPhotos();           
    } 
  }

  channel.onmessage = receiveData();
}

// Set the local description and send
function onLocalDescription(desc) {
  pc.setLocalDescription(desc, () => {
    sendMessage(pc.localDescription)
  }, logError);
}

// Set the remote description
function onRemoteDescription(desc) {
  pc.setRemoteDescription(new RTCSessionDescription(desc), () => {}, logError);
}

////////////////// Server communication functions //////////////////

// Tell server that client is ready to send files to new peers
function readyToSend() {
  downloaded = true;
  socket.emit('available');
}

// Emit signaling messages to server
function sendMessage(message) {
  socket.emit('signaling', message, partnerID);
}

// Log errors
function logError(err) {
  console.log('Error:', err);
}
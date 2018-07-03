let initiator = false;
let config = null;
let imageArray = Object.values(document.getElementsByTagName('img'));

let pc;
let dataChannel;

const socket = io.connect('http://localhost:3000');

socket.on('message', (input) => {
    signalingMessageCallback(input);
})

socket.on('created', () => {
    initiator = true;
    getImagesFromServer();
})

//Second person to enter the room. 
socket.on('joined', () => {
    createPeerConnection();
})

socket.on('ready', () => {
    createPeerConnection();
})

////////////////////////////////////////////////////// Photo functions //////////////////////////////////////////////////////

/// For base initiator
function getImagesFromServer() {
    imageArray.forEach(image => {
        image.id === 'image1' ? image.setAttribute('src', 'https://source.unsplash.com/pHANr-CpbYM/800x600') :
        image.setAttribute('src', 'https://source.unsplash.com/3Z70SDuYs5g/800x600');
    })
}

function sendAllPhotos() {
    imageArray.forEach(image => {
        console.log('Sending', image.id);
        sendPhoto(image);
    })
}

function sendPhoto(image) {
    const data = getImageData(image);
    // console.log('Image data is:', data);
    const CHUNK_LEN = 64000;
    const totalChunks = data.length / CHUNK_LEN;
    // console.log('This many chunks to send:', totalChunks);

    let start;
    let end;
    for (let i = 0; i < totalChunks; i++) {
        // console.log('Sending chunk', i);
        start = i * CHUNK_LEN;
        end = (i + 1) * CHUNK_LEN;
        dataChannel.send(data.slice(start, end));
    }
    dataChannel.send('finished');
    // console.log('Finished sending that photo');
}

function getImageData(image) {
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    context.canvas.width = image.width;
    context.canvas.height = image.height;
    context.drawImage(image, 0, 0, image.width, image.height);
    return canvas.toDataURL('image/jpeg')
}

function receiveData() {
    let imageData = '';
    let counter = 0;
    let dataString;
    return function onMessage(data) {
        dataString = data.data.toString();
        // console.log('Running onMessage, dataString is:', dataString);
        if (dataString.slice(0, 8) !== 'finished') {
            // console.log('Adding this datastring in');
            imageData += dataString;
        } else {
            // console.log('Finished, calling setImage');
            setImage(imageData, counter);
            counter++;
            imageData = '';
        }
    }
}

function setImage(imageData, counter) {
    // console.log('In setImage');
    imageArray[counter].src = imageData;
}

////////////////////////////////////////////////////// Signaling functions //////////////////////////////////////////////////////

function createPeerConnection() {
    // console.log('Creating peer connection!');
    pc = new RTCPeerConnection(config);
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            // console.log('onicecandidate event is:', event.candidate);
            sendMessage({
                type: 'candidate',
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            })
        }
        // else console.log('Out of candidates');
    }
    if (initiator) {
        // Create the data channel, label it messages
        dataChannel = pc.createDataChannel('messages');
        // Set up handlers for new data channel
        onDataChannelCreated(dataChannel)

        // Create offer, then pass to onLocalDescription
        // (which sets as local description and sends it)
        pc.createOffer(onLocalDescription, logError);
    }
    else {
        // Create an ondatachannel handler to respond
        // when the data channel from the other client arrives
        pc.ondatachannel = (event) => {
            dataChannel = event.channel
            onDataChannelCreated(dataChannel);
        }
    }
}

function signalingMessageCallback(message) {
    if (message.type === 'candidate') {
        // console.log('Received icecandidate:', message.candidate);
        pc.addIceCandidate(new RTCIceCandidate({candidate: message.candidate}));
    }
    else if (message.type === 'answer') {
        // console.log('Received answer:', message);
        pc.setRemoteDescription(new RTCSessionDescription(message), () => {}, logError);
    }
    else if (message.type === 'offer') {
        // console.log('Received offer:', message);
        pc.setRemoteDescription(new RTCSessionDescription(message), () => {}, logError)
        pc.createAnswer(onLocalDescription, logError);
    }
}

function onDataChannelCreated(channel) {
    channel.onopen = () => {
        // console.log('Channel opened');
        if (initiator) {
            sendAllPhotos();           
        } 
    }

    channel.onclose = () => {
        // console.log('Channel closed');
    }

    channel.onmessage = receiveData();
}

function onLocalDescription(desc) {
    pc.setLocalDescription(desc, () => {
        // console.log('Sending local description:', pc.localDescription);
        sendMessage(pc.localDescription)
    }, logError);
}

////////////////////////////////////////////////////// Messaging functions //////////////////////////////////////////////////////

function sendMessage(message) {
    socket.emit('message', message);
}

function logError(err) {
    console.log('Error:', err);
}
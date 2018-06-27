// Initialize sockets

// const   
let initiator = true;
console.log('Running index.js')

const socket = io.connect('http://localhost:3000');
const input = document.getElementById('input');

input.addEventListener('click', () => {
    socket.emit('message', 'Hi there!');
})

socket.on('message', (input) => {
    console.log(input);
})

socket.on('joined', () => {
    initiator = false;
    console.log('Im the second to join')
    createPeerConnection();
})

socket.on('ready', () => {
    console.log('Now I know the server is ready')
    createPeerConnection();
})

function createPeerConnection() {
    console.log('Creating a peer connection');
}

let imgUrls = [
    'https://source.unsplash.com/3Z70SDuYs5g/800x600',
    'https://source.unsplash.com/01vFmYAOqQ0/800x600',
    'https://source.unsplash.com/2Bjq3A7rGn4/800x600',
    'https://source.unsplash.com/t20pc32VbrU/800x600',
    'https://source.unsplash.com/pHANr-CpbYM/800x600',
    'https://source.unsplash.com/3PmwYw2uErY/800x600',
    'https://source.unsplash.com/uOi3lg8fGl4/800x600',
    'https://source.unsplash.com/CwkiN6_qpDI/800x600',
    'https://source.unsplash.com/9O1oQ9SzQZQ/800x600',
    'https://source.unsplash.com/E4944K_4SvI/800x600',
    'https://source.unsplash.com/-hI5dX2ObAs/800x600',
    'https://source.unsplash.com/vZlTg_McCDo/800x600'
];

imgUrls.map((url, index) => {
    let div = document.createElement('div');
    div.classList.add('column');
    let img = document.createElement('img');
    let rowClass = document.querySelector('.row');
    rowClass.appendChild(div)
    div.appendChild(img)
    img.setAttribute('src', url);
});

const express = require('express'); 
const app = express(); 
const http = require('http');
const path = require('path'); 
const server = http.Server(app); 
const socket = require('socket.io'); 
const DataPair = require('./../../server/server.js');

let imageRequests = 0;
let serverThreshold = 1;

////////////////// Invoke Data Pair //////////////////

DataPair(server, serverThreshold);

////////////////// Server //////////////////

app.use(express.static(path.join(__dirname, './../client')));

// Default path to get images from the server
app.get('/images/:imageName', (req, res) => {
    imageName = req.params.imageName;
    let url = ('./../client/images/' + imageName + '.jpg');
    res.sendFile(path.join(__dirname, url))
    imageRequests++
    console.log('Total image requests:', imageRequests);
})

// Path to link to DP on client side
app.get('/DP_client', (req, res) => {
    let url = ('./../../client/index.js');
    res.sendFile(path.join(__dirname, url));
})

server.listen(3000);


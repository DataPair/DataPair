![Data Pair](https://github.com/DataPair/DataPair/tree/master/assets/data_pair_logo.jpg)

Data Pair is a JavaScript library that uses WebRTC to create a P2P CDN for static assets in Node applications.

Data Pair is easy to implement: a node module for your server file, an UNPKG script for the client side, and custom tags for images that you'd like distributed through the network.

Once you've done this, Data Pair takes care of the rest: maintaining the network of available peers that can send assets and choosing one to pair with an incoming client, using WebSockets to automate WebRTC signaling between peers, and handling transmission of images through RTCDataChannel.

## Getting started
**Server**
 - [ ] NPM install Data-Pair-Server:
```npm install --save data-pair-server```
 - [ ] Require the Data Pair module into your server file:
```DataPair = Require('data-pair-server');```
 - [ ]  Invoke Data Pair, inputting your server and the threshold of how many available peers must exist before new clients are redirected to get static assets from the CDN instead of the server:
```DataPair(server, threshold);```

**Client**
 - [ ] Include a src link to the client-side UNPKG file:
 ```<script  src="https://unpkg.com/data-pair-client"></script>```
 - [ ] Add a custom data attribute called 'data-p2p' to all assets that should be shared through the network:
 ```<img data-p2p="sourceURL">```

 **Usage**
 * From there, it just works: new clients will request the static assets directly from the server up until your chosen threshold, at which point they'll be redirected to the P2P CDN.
 ## Contributors
 Ben Hawley (https://github.com/benjaminhawley)
 Shahrukh Jalil (https://github.com/jalilshahrukh)
 David Destefano (https://github.com/david-dest01)
 Mahfuz Kabir (https://github.com/mahfuzk)

Found a bug? Have a suggestion? Want to make Data Pair better? Please submit issues/pull requests if you have feedback or would like to contribute.

If you're interested in joining the Data Pair team as a contributor, feel free to reach out at datapairNPM@gmail.com.

## License
This project is licensed under the MIT License - see the [LICENSE.txt](https://github.com/DataPair/DataPair/tree/master/license.txt] file for details
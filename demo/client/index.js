let images = document.getElementById('imageList');

let imageNames = ['autumn', 'clouds', 'fog', 'foggy-trees', 'forest-haze', 'big-cat', 'forest', 'lake', 'road', 'waterfall'];

// Initialize images on page
for (let i = 0; i < imageNames.length; i++) {
  let div = document.createElement('div');
  let image = document.createElement('img');
  // Tag with 'Data-P2P' custom attribute for P2P access
  image.setAttribute('data-p2p', 'http://localhost:3000/images/' + imageNames[i]);
  image.className = 'images';
  div.appendChild(image);
  images.append(image);
}

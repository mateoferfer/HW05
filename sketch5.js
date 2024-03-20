let particles = [];
let img, imgBuffer;

function setup() {
  createCanvas(720, 400);
  pixelDensity(1);
  img = createImage(width, height);
  imgBuffer = createImage(width, height);
  img.resize(width, height);
  imgBuffer.resize(width, height);
}

function draw() {
  background('#0f0f0f');
  
  // Reset merge status before checking
  particles.forEach(particle => {
    particle.mergedWith = null;
    particle.mergeStartTime = null;
  });

  // Move and check for merges
  for (let i = 0; i < particles.length; i++) {
    particles[i].moveParticle();
    for (let j = i + 1; j < particles.length; j++) {
      particles[i].joinParticles([particles[j]]);
    }
  }

  // Draw particles
  particles.forEach(particle => {
    particle.draw();
  });

  if (mouseIsPressed) {
    // Draw a red square where the mouse is
    img.loadPixels();
    for (let y = mouseY - 10; y < mouseY + 10; y++) {
      for (let x = mouseX - 10; x < mouseX + 10; x++) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          let index = (x + y * width) * 4;
          img.pixels[index] = 255; // Red
          img.pixels[index + 1] = 0; // Green
          img.pixels[index + 2] = 0; // Blue
          img.pixels[index + 3] = 255; // Alpha
        }
      }
    }
    img.updatePixels();
  }

  // Perform dilation
  img.loadPixels();
  imgBuffer.loadPixels();
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let maxVal = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          let index = ((x + kx) + (y + ky) * width) * 4;
          let val = img.pixels[index]; // Assuming grayscale, so just look at red component
          if (val > maxVal) maxVal = val;
        }
      }
      let targetIndex = (x + y * width) * 4;
      imgBuffer.pixels[targetIndex] = maxVal;
      imgBuffer.pixels[targetIndex + 1] = maxVal;
      imgBuffer.pixels[targetIndex + 2] = maxVal;
      imgBuffer.pixels[targetIndex + 3] = 255;
    }
  }

  // Subtract the original image from the dilated image every 10 frames
  if (frameCount % 10 === 0) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let index = (x + y * width) * 4;
        imgBuffer.pixels[index] -= img.pixels[index];
        imgBuffer.pixels[index + 1] -= img.pixels[index + 1];
        imgBuffer.pixels[index + 2] -= img.pixels[index + 2];
        imgBuffer.pixels[index + 3] = 255;
      }
    }
  }

  imgBuffer.updatePixels();

  // Swap the images
  let temp = img;
  img = imgBuffer;
  imgBuffer = temp;

  // Display the result
  image(img, 0, 0);
}

function mousePressed() {
  for (let i = 0; i < 3; i++) {
    // Generate a random offset for each particle
    let offsetX = random(-100, 30); // Adjust the range as needed
    let offsetY = random(-100, 30); // Adjust the range as needed

    // Add the offset to the mouseX and mouseY positions
    particles.push(new Particle(mouseX + offsetX, mouseY + offsetY));
  }
}

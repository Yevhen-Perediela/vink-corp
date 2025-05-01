const track = document.getElementById('carouselTrack');
let images = Array.from(track.children);

const radius = 1600; // zwiększamy promień = więcej miejsca
const visibleRange = 120; // większy zakres półkola
const speed = 0.1; // prędkość przesuwania

let angles = images.map((_, index) => -60 + (index * (visibleRange / (images.length - 1))));

function layoutImages() {
  images.forEach((img, index) => {
    const angle = angles[index];
    const rad = angle * Math.PI / 180;
    const x = Math.sin(rad) * radius;
    const z = Math.cos(rad) * radius;

    img.style.transform = `
      translate3d(${x}px, -50%, ${-z}px)
      rotateY(${-angle}deg)
    `;
    img.style.opacity = (angle > 90 || angle < -90) ? 0 : 1;
  });
}

// const track = document.getElementById('carouselTrack');

document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.3) * 2;
  const y = (e.clientY / window.innerHeight - 0.3) * 2;

  const rotateX = y * 3;
  const rotateY = -x * 7;

  track.style.transform = `translateZ(0px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});



function animate() {
  angles = angles.map(angle => angle - speed);

  if (angles[0] < -100) {
    const firstImg = images.shift();
    images.push(firstImg);

    const lastAngle = angles[angles.length - 1];
    angles.shift();
    angles.push(lastAngle + (visibleRange / (images.length - 1)));
    track.appendChild(firstImg);
  }

  layoutImages();
  requestAnimationFrame(animate);
}

layoutImages();
animate();

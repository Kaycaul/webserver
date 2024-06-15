let sneaks = document.getElementById("sneakers");

let x = 0;
let y = 0;
let dirX = 1;
let dirY = 1;
let speed = 1;
const sneaksWidth = sneaks.clientWidth;
const sneaksHeight = sneaks.clientHeight;

// update sneaks position every frame to do the funny dvd logo thing
function update() {
    console.log(speed);
    speed += 0.0001;
    if (speed > 75) speed = 1;
    const bodyWidth = document.body.clientWidth;
    const bodyHeight = document.body.clientHeight;

    // bounce off walls
    if (x > bodyWidth - sneaksWidth || x < 0) {
        dirX *= -1;
    }

    if (y > bodyHeight - sneaksHeight || y < 0) {
        dirY *= -1;
    }

    x += dirX * speed;
    y += dirY * speed;

    sneaks.style.left = x + "px";
    sneaks.style.top = y + "px";
    
    window.requestAnimationFrame(update);
}

window.requestAnimationFrame(update);
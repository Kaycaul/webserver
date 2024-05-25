// deferred script
document.getElementById("contact").addEventListener("click", contact);
document.getElementById("comms").addEventListener("click", comms);
document.getElementById("profilepicture").addEventListener("click", boop);

function contact() {
    location.href = "https://doughcatball.carrd.co/#contacts";
}

function comms() {
    location.href = "https://doughcatball.carrd.co/#comms";
}

let boopCount = 0;

function boop() {
    let boopCounter = document.getElementById("boop-counter");
    boopCounter.hidden = false;
    boopCounter.innerText = `Boops: ${boopCount}`;
    // PUT boop for +1 boops
    let xhttp2 = new XMLHttpRequest();
    xhttp2.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 204) {
            // GET boop count
            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    let boops = JSON.parse(this.responseText);
                    boopCount = boops ? boops.boops : 0;
                }
                // update boop counter on screen
                boopCounter.innerText = "Boops: " + boopCount;
            };
            xhttp.open("GET", "boops", true);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send();
        }
    }
    xhttp2.open("PUT", "boops", true);
    xhttp2.setRequestHeader("Content-type", "application/json");
    xhttp2.send();
}
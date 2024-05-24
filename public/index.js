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

let boops = 0;

function boop() {
    boops++;
    boopCounter = document.getElementById("boop-counter");
    boopCounter.hidden = false;
    boopCounter.innerText = "Boops: " + boops;
}
function element(id) {
    return document.getElementById(id);
}

function addClass(id, className) {
    element(id).classList.add(className);
}

function removeClass(id, className) {
    element(id).classList.remove(className);
}

let boopCount = 0;

function boop() {
    let boopCounter = element("boop-counter");
    boopCounter.hidden = false;
    boopCounter.innerText = `Boops: ${boopCount}`;
    // PUT boop for +1 boops
    let xhttp2 = new XMLHttpRequest();
    xhttp2.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 204) {
            // GET boop count
            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
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

// do it quickly at the start to avoid crazy overlapping
buttons();
// defer this so that the height can be properly calculated
window.onload = function () {
    buttons();
}

element("contact-button").addEventListener("click", contact);
element("comms-button").addEventListener("click", comms);
element("gallery-button").addEventListener("click", gallery);
element("profilepicture").addEventListener("click", boop);
// find all back buttons and add event listener
let backButtons = document.getElementsByClassName("back-button");
for (let i = 0; i < backButtons.length; i++) {
    backButtons[i].addEventListener("click", buttons);
}

function buttons() {
    element("main").style.height = element("buttons").offsetHeight + "px";
    element("contact").style.transform = "translateX(-100vw) scaleY(0)";
    element("gallery").style.transform = "translateX(-100vw) scaleY(0)";
    element("buttons").style.transform = "translateX(0) scaleY(1)";
    element("comms").style.transform = "translateX(100vw) scaleY(0)";
}

function contact() {
    element("main").style.height = element("contact").offsetHeight + "px";
    element("contact").style.transform = "translateX(0) scaleY(1)";
    element("buttons").style.transform = "translateX(100vw) scaleY(0)";
}

function comms() {
    element("main").style.height = element("comms").offsetHeight + "px";
    element("comms").style.transform = "translateX(0) scaleY(1)";
    element("buttons").style.transform = "translateX(-100vw) scaleY(0)";
}

function gallery() {
    element("main").style.height = element("gallery").offsetHeight + "px";
    element("gallery").style.transform = "translateX(0) scaleY(1)";
    element("buttons").style.transform = "translateX(100vw) scaleY(0)";
}
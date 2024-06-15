// gradient spotlight follows the mouse
let glow = document.getElementsByClassName("glow-js")[0];
center(glow);
if (matchMedia('(pointer:fine)').matches) {
    glow.addEventListener("mouseleave", function () {
        glow.classList.add("glow-js-transition");
        center(glow);
    });
    glow.onpointermove = function (e) {
        glow.classList.remove("glow-js-transition");
        glow.style.setProperty("--glow-x", `${e.clientX}px`);
        glow.style.setProperty("--glow-y", `${e.clientY}px`);
    }
}

function center(element) {
    let box = element.getBoundingClientRect();
    let width = box.left + box.right / 2;
    let height = box.top + box.bottom / 2;
    element.style.setProperty("--glow-x", `${width}px`);
    element.style.setProperty("--glow-y", `${height}px`);
}
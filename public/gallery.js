const main = document.querySelector("main");
let artworkIDs = [];
let currentArtwork = 0;
// ajax all artwork ids
let galleryIDsRequest = new XMLHttpRequest();
galleryIDsRequest.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        let ids = JSON.parse(this.responseText);
        artworkIDs = ids;
        loadMore(9);
    }
}
galleryIDsRequest.open("GET", "gallery", true);
galleryIDsRequest.setRequestHeader("Accept", "application/json");
galleryIDsRequest.send();


function loadMore(amount) {
    let start = currentArtwork;
    let end = currentArtwork + amount;
    for (let i = start; i < end && i < artworkIDs.length; i++) {
        currentArtwork++;
        addArtwork(artworkIDs[i]);
    }
}

function addArtwork(id) {
    // insert the card first, while we wait for the artwork object
    let div = document.createElement("div");
    div.classList.add("artwork-card");
    main.appendChild(div);
    // ajax the artwork
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let artwork = JSON.parse(this.responseText);
            // add the details of the artwork object to the card
            addArtworkElement(artwork, div);
        }
    }
    xhttp.open("GET", "gallery/" + id, true);
    xhttp.setRequestHeader("Accept", "application/json");
    xhttp.send();
}

function addArtworkElement(artwork, div) {
    // title
    let h2 = document.createElement("h2");
    let title = artwork.path.replace(/^.*[\\/]/, '');
    h2.textContent = title;
    div.appendChild(h2);
    // image
    let container = document.createElement("div");
    container.classList.add("image-container");
    div.appendChild(container);
    let img = document.createElement("img");
    img.src = artwork.path;
    container.appendChild(img);
    // desc
    let desc = document.createElement("div");
    desc.classList.add("desc");
    div.appendChild(desc);
    // artist
    let p = document.createElement("p");
    p.textContent = `By ${artwork.artist}, ${unixToDate(Date.parse(artwork.date))}`;
    desc.appendChild(p);
    // tags
    let tags = document.createElement("p");
    tags.classList.add("tags");
    let text = `Tags: ${artwork.tags[0]}`;
    for (let i = 1; i < artwork.tags.length; i++) {
        text += ", " + artwork.tags[i];
    }
    tags.textContent = text;
    desc.appendChild(tags);
}

// load more on scroll
window.onscroll = function () {
    if (window.innerHeight + window.scrollY + 400 >= document.body.offsetHeight) {
        loadMore(9);
    }
}

// thank you internet
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function unixToDate(UNIX_timestamp) {
    let timestamp = new Date(UNIX_timestamp);
    let year = timestamp.getFullYear();
    let month = months[timestamp.getMonth()];
    let date = timestamp.getDate();
    let time = month + ' ' + date + ', ' + year;
    return time;
}
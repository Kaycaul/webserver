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
    // ajax the artwork
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let artwork = JSON.parse(this.responseText);
            addArtworkElement(artwork);
        }
    }
    xhttp.open("GET", "gallery/" + id, true);
    xhttp.setRequestHeader("Accept", "application/json");
    xhttp.send();
}

function addArtworkElement(artwork) {
    let div = document.createElement("div");
    div.classList.add("artwork-card");
    main.appendChild(div);
    // title
    let h2 = document.createElement("h2");
    let title = artwork.path.replace(/^.*[\\/]/, '');
    h2.textContent = title;
    div.appendChild(h2);
    // image
    let img = document.createElement("img");
    img.src = artwork.path;
    div.appendChild(img);
    let desc = document.createElement("div");
    desc.classList.add("desc");
    div.appendChild(desc);
    // artist
    let p = document.createElement("p");
    p.textContent = `By ${artwork.artist}, ${artwork.year}`;
    desc.appendChild(p);
    // tags
    let tags = document.createElement("p");
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
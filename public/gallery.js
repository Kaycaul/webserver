// i hate this entire script and its very confusing but it works
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const main = document.querySelector("main");
let elements = {};
let artworkIDs = [];
let currentArtwork = 0;
let page = 0;
let stopped = false; // true when server reaches final page (404)
let waiting = false; // true while requesting more ids from server
let loading = 0; // greater than 0 while loading artwork
let results = 0; // current results on page

let queryString = window.location.search;
let query = {};
if (queryString) {
    queryString = queryString.substring(1); // remove ?
    let queryList = queryString.split("&");
    for (let i = 0; i < queryList.length; i++) {
        let pair = queryList[i].split("=");
        query[pair[0]] = pair[1];
    }
}

// load the first few
requestMore(9);

function requestMore(amount) {
    // lock
    waiting = true;
    // ajax another page of artwork ids
    let galleryIDsRequest = new XMLHttpRequest();
    let pageQueryString = window.location.search ? "&" : "?";
    pageQueryString += "page=" + page++;
    galleryIDsRequest.open("GET", `/gallery/${window.location.search}${pageQueryString}`, true);
    galleryIDsRequest.setRequestHeader("Accept", "application/json");
    galleryIDsRequest.onreadystatechange = function () {
        // unlock
        waiting = false;
        if (this.readyState == 4 && this.status == 200) {
            let ids = JSON.parse(this.responseText);
            // append to list
            artworkIDs = artworkIDs.concat(ids);
            loadMore(amount);
        }
        if (this.readyState == 4 && this.status == 404) {
            // no more artwork
            stopped = true;
            element("loading").classList.add("hidden");
            if (results == 0) {
                element("no-results-container").hidden = false;
            }
        }
    }
    galleryIDsRequest.send();
}

function loadMore(amount) {
    let start = currentArtwork;
    let end = currentArtwork + amount;
    for (let i = start; i < end && i < artworkIDs.length; i++) {
        currentArtwork++;
        addArtwork(artworkIDs[i]);
    }
}

function addArtwork(id) {
    loading++;
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
            addArtworkElement(artwork, div, id);
        }
    }
    xhttp.open("GET", `/gallery/${id}`, true);
    xhttp.setRequestHeader("Accept", "application/json");
    xhttp.send();
}

function addArtworkElement(artwork, div, id) {
    // title
    let title = document.createElement("a");
    title.classList.add("art-title");
    title.href = `/artwork/${id}`;
    let titleText = artwork.path.replace(/^.*[\\/]/, '');
    title.textContent = titleText;
    div.appendChild(title);
    // image
    let container = document.createElement("div");
    container.onclick = function () {
        enlargeImage(artwork.path, id);
    }
    container.classList.add("image-container");
    div.appendChild(container);
    let img = document.createElement("img");
    img.src = artwork.path + "?optimize";
    img.draggable = false;
    container.appendChild(img);
    // desc
    let desc = document.createElement("div");
    desc.classList.add("desc");
    div.appendChild(desc);
    // this next part is horrible im sorry i dont know how to add inline elements
    // artist
    let p = document.createElement("p");
    p.innerHTML = `By <a class="artist-link" href="/gallery?artist=${artwork.artist}">${artwork.artist}</a>, Uploaded ${unixToDate(Date.parse(artwork.date))}`
    desc.appendChild(p);
    // tags
    let tags = document.createElement("p");
    tags.classList.add("tags");
    let html = `Tags: <a class="tag-link" href="/gallery?tags=${artwork.tags[0]}">${artwork.tags[0]}</a>`;
    for (let i = 1; i < artwork.tags.length; i++) {
        html += `, <a class="tag-link" href="/gallery?tags=${artwork.tags[i]}">${artwork.tags[i]}</a>`;
    }
    tags.innerHTML = html;
    desc.appendChild(tags);
    // id
    let mongoId = document.createElement("p");
    mongoId.classList.add("mongo-id");
    mongoId.innerHTML = `ID: ${id}`;
    desc.appendChild(mongoId);
    // set grid span for wide images
    img.onload = () => {
        let ratio = img.width / img.height;
        if (ratio > 2.05) {
            img.classList.add("very-wide-image");
        } else if (ratio > 1.57) {
            img.classList.add("wide-image");
        } else if (ratio < 0.35) {
            img.classList.add("tall-image");
        }
    }
    loading--;
    results++;
    // get more if they dont fill the screen
    checkLoadMore();
}

// load more on scroll
window.onscroll = checkLoadMore;
function checkLoadMore() {
    if (stopped || waiting) return;
    if (window.innerHeight + window.scrollY + 400 >= document.body.offsetHeight) {
        requestMore(9);
    }
}

// put the search term into the search terms header
if (query.search || query.artist || query.tags) {
    let text = "Search results for: ";
    text += query.search ?? "anything";
    text += ", by "
    text += query.artist ?? "anyone";
    if (query.tags) text += ", with tags: " + query.tags.replaceAll("+", ", ");
    element("search-terms").innerText += text;
    element("search-terms-container").hidden = false;
}

// enlarge images
let enlarged = false;
document.addEventListener("keydown", (event) => {
    if (event.key == "Escape" && enlarged) {
        unenlarge();
    }
});
element("image-view").onclick = unenlarge;
function unenlarge() {
    element("image-view").style.animationName = "fade-out";
    element("enlarged-image-container").style.animationName = "shrink";
    element("enlarged-image-container").style.animationTimingFunction = "ease-in";
    enlarged = false;
}
function enlargeImage(path, id) {
    element("enlarged-image").src = "/assets/loading.gif";
    element("image-view").style.animationName = "fade-in";
    element("enlarged-image-container").style.animationName = "enlarge";
    element("enlarged-image-container").style.animationTimingFunction = "ease-out";
    element("enlarged-image").src = path + "?optimize";
    element("enlarged-image-link").href = path; // not optimized intentionally
    element("enlarged-image-container").onclick = function () {
        window.location.href = path; // not optimized intentionally
    }
    enlarged = true;
}

// thank you internet
function unixToDate(UNIX_timestamp) {
    let timestamp = new Date(UNIX_timestamp);
    let year = timestamp.getFullYear();
    let month = months[timestamp.getMonth()];
    let date = timestamp.getDate();
    let time = month + ' ' + date + ', ' + year;
    return time;
}

function element(id) {
    if (!elements[id]) elements[id] = document.getElementById(id);
    return elements[id];
}
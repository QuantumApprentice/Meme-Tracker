// https://quantumapprentice.github.io/Meme-Tracker/
// github.com/QuantumApprentice/Meme-Tracker
"use strict";

let types = [
    "webm",
    "gif",
    "mp4"
];

// storing favorites in an array just for start
// need to switch to some more permanent storage
let favorites = [];
let img_type  = 0;
let new_base  = null;
let base_gif  = null;
let base_webm = null;

function routing()
{
    window.addEventListener("hashchange",()=>{
        const current_path = window.location.hash.slice(2);
        img_type = types.indexOf(current_path);

        if (img_type >= 0 && img_type < 3) {
            let btn = document.getElementById("imgtype");
            if ((img_type == 0) || (img_type == 2)) {
                btn.textContent = "Gif";
                btn.onclick = ()=>window.location.assign(`#/gif`);
            } else {
                btn.textContent = "Webm";
                btn.onclick = ()=>window.location.assign(`#/webm`);
            }
        }
        display_memes();
    });
}

async function load_meme_list()
{
    return fetch('./assets/Meme_Tracker_list.json').then(res=>{
        if (!res.ok) {
            throw new Error("ERROR: Unable to load Meme_Tracker_list.json");
        }
        return res.json();
    });
}

// basic lazy loading using intersection observer
// images/videos have link assigned to .url instead of .src
// returns new intersection observer, which is used to observe images
function lazy_loading()
{
    let observerCB = (entries, observer)=>{
        entries.forEach(e => {
            setTimeout(() => {
            }, 1000);
            if (e.isIntersecting) {
                // meme can be either gif or webm (or mp4 sometimes)
                // gif are handled as images
                // while webm are handled as videos
                // which makes handling errors frustrating
                // since you can't just replace a video with an image url
                let meme  = e.target;
                meme.src  = meme.url;
                if (meme instanceof HTMLMediaElement) {
                    meme.play();
                }

                //TODO: add a delay to loading to check if image
                //      is still in viewport in case the user
                //      is scrolling by really fast
                // observer.unobserve(meme);
            }
            //TODO: need to add something for when
            //      image is outside viewable area?
            else {
                let meme = e.target;
                if (meme instanceof HTMLMediaElement) {
                    meme.pause();
                }
            }
        });
    };
    let observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 1.0,
    };

    let observer = new IntersectionObserver(observerCB, observerOptions);

    return observer;
}

async function display_memes()
{
    let memeList = await load_meme_list();
    get_favorites();

    const current_path = window.location.hash.slice(2);
    img_type = types.indexOf(current_path);
    let observer = lazy_loading();

    // if current_path isn't in the types array (ie root path)
    // then img_type ends up being -1 and it has to be set so the page can load
    if (img_type < 0) {
        img_type = 0;
    }

    if (img_type == 0 && base_webm == null) {
        base_webm = document.createElement("div");
        memeList.forEach((e)=>{
            let basename = e.filename;
            let command  = e.memename;
            let created  = e.created;
            if (e.filetype == "audio") {
                return;
            }
            base_webm.appendChild(
                list_meme(basename, command, created, observer, 0)
            );
        });

        new_base = base_webm;
    }

    if (img_type == 1 && base_gif == null) {
        base_gif  = document.createElement("div");
        memeList.forEach((e)=>{
            let basename = e.filename;
            let command  = e.memename;
            let created  = e.created;
            if (e.filetype == "audio") {
                return;
            }
            base_gif.appendChild(
                list_meme(basename, command, created, observer, 1)
            );
        });

        new_base = base_webm;
    }

    if (img_type == 0 && new_base != base_webm) {
        new_base = base_webm;
    } else
    if (img_type == 1 && new_base != base_gif) {
        new_base = base_gif;
    }

    let base = document.getElementById("base");
    base.replaceWith(new_base);
    new_base.id = "base";
}

function list_meme(basename, command, created, observer, img_type)
{
    let meme;
    if (types[img_type] == "webm") {
        meme = create_meme_webm(basename, command, observer);
    }
    if (types[img_type] == "gif") {
        meme = create_meme_gif(basename, command, observer);
    }
    if (types[img_type] == "mp4") {
        meme = create_meme_mp4(basename, command, observer);
    }
    let div = document.createElement("div");
    div.className = "meme";

    div.append(meme);
    add_basename(      div, basename);
    add_created_date(  div, created );
    add_command_button(div, command );

    return div;
}

//TODO: this is being kept in case I need
//      to reference canvas commands to
//      manipulate individual video frames
//      from a supported media type
//  Delete when I find a better place to save it
async function greenscreen(video, canvas)
{
    setTimeout(() => {
        greenscreen(video, canvas);
    }, 100);
    if (video.src == "") {
        return;
    }
    if (video.videoWidth < 1) {
        return;
    }
    if (video.paused) {
        return;
    }
    let w = video.videoWidth;
    let h = video.videoHeight;
    canvas.width  = w;
    canvas.height = h;

    let ctx1  = canvas.getContext("2d");
    let ctx2  = canvas.getContext("2d");

    ctx1.drawImage(video, 0,0,w,h);
    const frame = ctx1.getImageData(0,0,w,h);
    const data  = frame.data;

    // loop through the image pixels
    // and convert anything vaguelly green to clear alpha
    for (let i = 0; i < data.length; i++) {
        const r = data[i +0];
        const g = data[i +1];
        const b = data[i +2];
        if ((g > 250) && (r < 60) && (b < 60)) {
            data[i+3] = 0; //alpha channel on image
        }
    }
    ctx2.putImageData(frame, 0, 0);
}

//TODO: Delete this when I finish messing with
//      the greenscreen stuff
function create_meme_mp4(basename, observer)
{
    let vid     = document.createElement("video");
    vid.url     = `./memes/mp4/${basename}.mp4`
    observer.observe(vid);
    vid.loop    = true;
    vid.muted   = true;
    vid.volume  = 0.5;
    vid.play();

    // vid.onerror = (e)=>{
    //     e.parentNode.remove();
    // }

    // apparently each image needs its own canvas
    // or else all the image draws crossover onto each other
    let canvas = document.createElement("canvas");
    setTimeout(() => {
        greenscreen(vid, canvas);
    }, 200);

    // mute/unmute on click
    // TODO: restart playback on click?
    vid.addEventListener("click", (e)=>{
        // navigator.clipboard.writeText(`!${command}`);
        e.currentTarget.muted = !e.currentTarget.muted;
    });

    // mute on mouseout
    vid.addEventListener("mouseout", (e)=>{
        e.currentTarget.muted = true;
    });

    let meme = document.createElement("div");
    meme.className = "meme";
    meme.appendChild(vid);
    meme.appendChild(canvas);

    return meme;
}

// create_meme_webm() and the create_meme_gif()
// both create a video/image element and a div element
// assign the className and any mouse functions to the video/image
// returns the div with the image appended
function create_meme_webm(basename, command, observer)
{
    let vid    = document.createElement("video");
    vid.url    = `./memes/webm/${basename}.webm`;
    vid.id     = command;
    observer.observe(vid);
    vid.loop   = true;
    vid.muted  = true;
    vid.volume = 0.5;
    vid.fav    = favorites.includes(vid.id);

    // TODO: restart playback on click?
    // mute/unmute on click
    vid.addEventListener("click", (e)=>{
        e.currentTarget.muted = !e.currentTarget.muted;
    });

    let meme = document.createElement("div");
    // mute on mouseout
    // attaching the event to the containing div
    // prevents it from firing when hovering the overly
    meme.addEventListener("mouseleave", ()=>{
        vid.muted = true;
    });

    meme.className = 'underlay';
    meme.appendChild(vid);
    add_overlay_vid(vid, meme);

    return meme;
}
function create_meme_gif(basename, command, observer)
{
    let img = document.createElement("img");
    img.url = `./memes/gif/${basename}.gif`;
    img.id  = command;
    img.fav = favorites.includes(img.id);
    observer.observe(img);
    img.addEventListener("click", ()=>{
        // instead of copying the command when clicking a gif
        // copy the gif link to the clipboard for pasting around town
        navigator.clipboard.writeText(img.src);
    });

    let meme = document.createElement("div");
    meme.className = 'meme';
    meme.appendChild(img);
    add_overlay_img(img,meme);

    return meme;
}

// the user name of the person who requested/created this meme
// TODO: none of the memes currently have a listed creator
// this should be drawn from a separate txt file or database
// during the Meme_Tracker_list.json creation process
function add_username(div, user)
{
    let username_txt = document.createElement("div");
    username_txt = `Created by: ${user == undefined ? "Unknown" : user}`;

    div.append(username_txt);
}

// file name of the meme file itself, no extension
// TODO: right now this is used for identifying the meme
// for others to search for, but this sucks as a search
// Need to add tags and a search system
function add_basename(div, basename)
{
    let basename_txt = document.createElement("div");
    basename_txt.className = 'text';
    basename_txt.innerText = `${basename}`;

    div.append(basename_txt);
}

// date the meme was created on
// TODO: right now this is read from the meme file itself,
// but for the meme economy I need to track this separately
function add_created_date(div, date)
{
    let created_txt = document.createElement("div");
    created_txt.innerText = `Created: ${date.slice(0,10)}`;

    div.append(created_txt);
}

function clipboard_img()
{
    let clipboard = document.createElement("img");
    clipboard.src = "assets/clipboard.svg";
    clipboard.className = 'clipboard';
    clipboard.alt = "Copy to clipboard";
    return clipboard;
}

// copy meme shortcut to clipboard for use in chat
function add_command_button(div, command)
{
    let button = document.createElement("button");
    button.innerText = `${command}`;
    button.append(clipboard_img());
    button.onclick = ()=>{
        navigator.clipboard.writeText(`!${command}`);
    }
    div.append(button);
}

//TODO: delete corner_buttons(),
//      replaced by buttons built in the dom
//      and the routing system...whenever I get it working anyway
function corner_buttons(base)
{
    // switch between webm, gif, mp4
    let type = document.createElement("button");
    type.innerText = types[(img_type+1)%3]
    type.onclick = ()=>{
        img_type = (img_type+1) % 3;
        base.innerHTML = "";
        display_memes();
    };
    type.style = "position: fixed";
    base.appendChild(type);

    // repo link
    let github = document.createElement("button");
    github.innerText = "Repo";
    github.onclick = ()=>{
        window.open("https://github.com/QuantumApprentice/Meme-Tracker");
    }
    github.style="top: 40px; position: fixed";
    base.appendChild(github);
}

function add_audio_buttons(overlay, vid)
{
    let mute_icon = document.createElement("img");
    mute_icon.src = "assets/sound_off.svg";
    mute_icon.className = 'sound_off';

    vid.onclick = ()=>{
        mute_icon.style.visibility = vid.muted ? "visible" : "hidden";
    }
    overlay.onclick = ()=>{
        vid.muted = !vid.muted;
        mute_icon.style.visibility = vid.muted ? "visible" : "hidden";
    }
    overlay.addEventListener("mouseleave", ()=>{
        // attaching the event to the containing overlay
        // prevents it from firing when hovering the overly
        // but now it fires whenever I click a button on the overlay,
        // that's not what I want...sadface :(
        mute_icon.style.visibility = "visible";
    });

    mute_icon.className ="audio_icon";
    overlay.append(mute_icon);

    let volume = document.createElement("input");
    volume.className = "volume";
    volume.type      = "range";
    volume.min       = 0.00;
    volume.max       = 1.00;
    volume.step      = 0.01;
    volume.value     = 0.50;

    volume.addEventListener("input", (e)=>{
        vid.volume = e.target.value;
    });
    volume.onclick = (e)=>{
        e.stopPropagation();
    }

    overlay.append(volume);
}

function add_heart(overlay, img)
{
    let heart_icon = document.createElement("button");
    heart_icon.className = "heart";
    heart_icon.innerHTML =
        `<svg viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>`;

    heart_icon.onclick = (e)=>{
        e.stopPropagation();
        // storing favorites in an array just for start
        // need to switch to some more permanent storage
        if (favorites.includes(img.id)) {
            let idx = favorites.indexOf(img.id);
            if (idx >= 0) {
                favorites.splice(idx, 1);
            }
            img.fav = false;
        } else {
            favorites.push(img.id);
            img.fav = true;
        }
        set_favorites();
        heart_icon.classList.toggle("is_fav",img.fav);
    }

    heart_icon.classList.toggle("is_fav",img.fav);
    overlay.append(heart_icon);
}

function add_overlay_img(img, meme)
{
    let overlay = document.createElement("div");
    overlay.className = "overlay";

    add_heart(overlay, img);

    meme.append(overlay);
}

function add_overlay_vid(vid, meme)
{
    let overlay = document.createElement("div");
    overlay.className = "overlay";

    add_audio_buttons(overlay,vid);
    add_heart(overlay, vid);

    meme.append(overlay);
}

function set_favorites()
{
    let fav_string = JSON.stringify(favorites);
    localStorage.setItem("favorites", fav_string);
}

function get_favorites()
{
    let fav = localStorage.getItem("favorites");
    if (fav == null) {
        return;
    }

    try {
        favorites = JSON.parse(fav);
    } catch (error) {
        console.log("ERROR: Loading favorites failed:",error);
        if (!Array.isArray(fav)) {
            favorites = [];
        }
        return;
    }
}

routing();
display_memes();

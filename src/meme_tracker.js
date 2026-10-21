// https://quantumapprentice.github.io/Meme-Tracker/
// github.com/QuantumApprentice/Meme-Tracker
"use strict";

let img_type = false;


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
            if (e.isIntersecting) {
                let img = e.target;
                img.src = img.url;
                observer.unobserve(img);
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
    // console.log(memeList);

    let base   = document.getElementById("base");
    corner_buttons(base);

    let observer = lazy_loading();
    for (let i = 0; i < 100; i++) {
        let basename = memeList[i].filename;
        let command  = memeList[i].memename;
        let created  = memeList[i].created;

        if (memeList[i].filetype == "audio") {
            continue;
        }

        list_meme(basename, command, created, observer);
    }
}

function list_meme(basename, command, created, observer)
{
    let div;
    if (img_type == false) {
        div = create_meme_video(basename, command, observer);
    }
    if (img_type == true) {
        div = create_meme_image(basename, command, observer);
    }

    add_basename(      div, basename);
    add_created_date(  div, created );
    add_command_button(div, command );

    base.appendChild(div);
}


//TODO: decide what type of image I want to use
//      (mp4/webm/gif)
// create_meme_video() and the create_meme_image()
// both create a video/image element and a div element
// assign the className and any mouse functions to the video/image
// returns the div with the image appended
function create_meme_video(basename, command, observer)
{
    let vid     = document.createElement("video");
    vid.url = `./memes/${basename}.webm`;
    observer.observe(vid);
    vid.loop    = true;
    vid.muted   = true;
    vid.volume  = 0.3;
    vid.play();
    vid.addEventListener("click", (e)=>{
        navigator.clipboard.writeText(`!${command}`);
        e.currentTarget.muted = !e.currentTarget.muted;
    });

    // TODO: used to start playback on mouseover, now just loops
    // probably delete if I don't want any mouseover behavior?
    vid.addEventListener("mouseenter", (e)=>{
        // e.currentTarget.play();
    });
    // mute on mouseout
    vid.addEventListener("mouseout", (e)=>{
        e.currentTarget.muted = true;
    });

    let div = document.createElement("div");
    div.className = 'meme';
    div.appendChild(vid);

    return div;
}
function create_meme_image(basename, command, observer)
{
    let img = document.createElement("img");
    img.url = `./memes/${basename}.gif`;
    observer.observe(img);
    img.addEventListener("click", (e)=>{
        navigator.clipboard.writeText(`!${command}`);
    });
    let div = document.createElement("div");
    div.className = 'meme';
    div.appendChild(img);

    return div;
}

// the user name of the person who requested/created this meme
// TODO: none of the memes currently have a listed creator
// this should be drawn from a separate txt file or database
// during the Meme_Tracker_list.json creation process
function add_username(div, user)
{
    let username_txt = document.createElement("div");
    username_txt = `Created by: ${user != undefined ? user : "Unknown"}`;

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
    let copy = document.createElement("img");
    copy.src = "assets/copy to clipboard symbol.svg";
    copy.className = 'clipboard';
    copy.alt = "Copy to clipboard";
    return copy;
}

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

function corner_buttons(base)
{
    let type = document.createElement("button");
    type.innerText = img_type ? "gif" : "webm";
    type.onclick = ()=>{
        img_type = !img_type;
        base.innerHTML = "";
        display_memes();
    };
    type.style = "position: fixed"

    let github = document.createElement("button");
    github.innerText = "Repo";
    github.onclick = ()=>{
        window.open("https://github.com/QuantumApprentice/Meme-Tracker");
    }
    github.style="top: 40px; position: fixed";

    base.appendChild(type);
    base.appendChild(github);
}


display_memes();
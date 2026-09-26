"use strict";

async function load_meme_list()
{
    return fetch('./src/Meme_Tracker_list.json').then(res=>{
        if (!res.ok) {
            throw new Error("ERROR: Unable to load Meme_Tracker_list.json");
        }
        return res.json();
    });
}

async function display_memes()
{
    let memeList = await load_meme_list();
    console.log(memeList);

    let root     = document.getElementById("root");
    let basename = memeList[0].filename;
    let command  = memeList[0].memename;

    // let img = document.createElement("img");
    // img.src = `./assets/${basename}.gif`;
    // img.loading = "lazy";
    // img.addEventListener("click", (e)=>{
    //     navigator.clipboard.writeText(`!${command}`);
    // });
    // root.appendChild(img);

    let vid = document.createElement("video");
    vid.src = `./assets/${basename}.webm `;
    vid.loading = "lazy";
    // vid.autoplay = true;
    vid.setAttribute("muted","");
    vid.setAttribute("controls","");
    vid.setAttribute("autoplay", "");
    vid.onHover
    vid.addEventListener("click", (e)=>{
        navigator.clipboard.writeText(`!${command}`);
    });
    // vid.addEventListener("mouseover", (e)=>{
    //     vid.setAttribute("autoplay","");
    // });
    root.appendChild(vid);


    // root.innerHTML = `<div id="meme1">
    //                     <img loading="lazy" src="./assets/${gifname}>
    //                   </div>`
}

display_memes();
"use strict";

async function load_meme_list()
{
    return fetch('./Meme_Tracker_list.json').then(res=>{
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

    console.log(memeList[0].filename);

    let basename = memeList[0].filename;
    let gifname = `${basename}.gif`;

    let img = document.createElement("img");
    img.src = `./assets/${gifname}`;

    let root = document.getElementById("root");
    root.appendChild(img);


    // root.innerHTML = `<div id="meme1">
    //                     <img loading="lazy" src="./assets/${gifname}>
    //                   </div>`
}

display_memes();
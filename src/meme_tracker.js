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

    let basename = memeList[0].filename;
    let command  = memeList[0].memename;
    let img = document.createElement("img");
    img.src = `./assets/${basename}.gif`;
    img.loading = "lazy";
    // img.onclick(navigator.clipboard.writeText(`!${command}`))
    img.addEventListener("click", (e)=>{
        navigator.clipboard.writeText(`!${command}`);
    });

    let root = document.getElementById("root");
    root.appendChild(img);


    // root.innerHTML = `<div id="meme1">
    //                     <img loading="lazy" src="./assets/${gifname}>
    //                   </div>`
}

display_memes();
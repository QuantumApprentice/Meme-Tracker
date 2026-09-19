"use strict";

function load_meme_list()
{
    fetch('./Meme_Tracker_list.json').then(res=>{
        if (!res.ok) {
            throw new Error("ERROR: Unable to load Meme_Tracker_list.json");
        }
        return res.json();
    });
}




function display_memes()
{
    memeList = load_meme_list();
    console.log("memelist: ", memeList);
}

display_memes();
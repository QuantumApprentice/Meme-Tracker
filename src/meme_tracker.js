// https://quantumapprentice.github.io/Meme-Tracker/
// github.com/QuantumApprentice/Meme-Tracker
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

let img_type = false;
async function display_memes()
{
    let memeList = await load_meme_list();
    // console.log(memeList);

    let base   = document.getElementById("base");
    buttons(base);

    for (let i = 0; i < 100; i++) {
        let basename = memeList[i].filename;
        let command  = memeList[i].memename;
        if (img_type == false) {
            append_meme_video(basename, command, base);
        }
        if (img_type == true) {
            append_meme_image(basename, command, base);
        }
    }
}

//TODO: might want to remove this if all the memes will be video/audio only
function append_meme_image(basename, command, base)
{
    let img = document.createElement("img");
    // img.className = 'meme_img';
    img.src = `./assets/${basename}.gif`;
    img.loading = "lazy";
    img.addEventListener("click", (e)=>{
        navigator.clipboard.writeText(`!${command}`);
    });
    let div = document.createElement("div");
    div.className = 'meme';
    div.appendChild(img);

    command_button(div, command);

    base.appendChild(div);
}
//TODO: thought I would use this, but I can't think of a place to put the button yet
// function copy_to_clipboard_button(data)
// {
//     return <img className='clipboard'
//         src={"copy to clipboard symbol.svg"}
//         onClick={()=>{
//             navigator.clipboard.writeText(
//                 `${data}`
//             );
//         }}
//         onError={()=>{setErr(true)}}
//     />
// }

function append_meme_video(basename, command, base)
{
    let vid = document.createElement("video");
    vid.src = `./assets/${basename}.webm `;
    vid.loading = "lazy";
    vid.loop = true;
    vid.muted = true;
    vid.play();
    vid.addEventListener("click", (e)=>{
        navigator.clipboard.writeText(`!${command}`);
        e.currentTarget.muted = !e.currentTarget.muted;
    });
    vid.addEventListener("mouseenter", (e)=>{
        e.currentTarget.play();
        // e.currentTarget.muted = !e.currentTarget.muted;
        // e.currentTarget.muted = false;
    });
    vid.addEventListener("mouseout", (e)=>{
        // e.currentTarget.pause();
        e.currentTarget.muted = true;
    });

    let div = document.createElement("div");
    div.className = 'meme';
    div.appendChild(vid);

    command_button(div, command);

    base.appendChild(div);
}

function command_button(div, command)
{
    let button = document.createElement("button");
    button.innerText = command;
    button.onclick = function(e){
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
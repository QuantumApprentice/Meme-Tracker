"use strict";

async function load_meme_list()
{
    return fetch('./assets/Meme_Tracker_list.json').then(res=>{
        if (!res.ok) {
            throw new Error("ERROR: Unable to load Meme_Tracker_list.json");
        }
        return res.json();
    });
}

async function display_memes()
{
    let memeList = await load_meme_list();
    // console.log(memeList);


    // let observer = lazy_loading();

    // for (let i = 0; i < 10; i++) {
    //     let basename = memeList[i].filename;
    //     let command  = memeList[i].memename;
    //     let created  = memeList[i].created;
    //     if (memeList[i].filetyp == "audio") {
    //         return;
    //     }
    //     list_meme(basename, command, created);
    // }
    let i = 0;
    memeList.forEach((e)=>{
        if (i > 0) {
            return;
        }
        i++;
        let basename = e.filename;
        let command  = e.memename;
        let created  = e.created;
        if (e.filetype == "audio") {
            return;
        }
        list_meme(basename, command, created);

    });
}

function list_meme(basename, command, created, observer)
{
    let base   = document.getElementById("base");
    let div;
        div = create_meme_video(basename, command);
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
    vid.src     = `./memes/webm/${basename}.webm`;
    // observer.observe(vid);
    vid.loop    = true;
    vid.muted   = true;
    vid.volume  = 0.5;
    vid.play();


    // const ctx  = canvas.getContext("2d");
    // canvas.url = vid.url;
    // vid.src = vid.url;

    let canvas = document.createElement("canvas");
    setTimeout(() => {
        draw(canvas, vid);
    }, 100);


    let div = document.createElement("div");
    div.className = 'meme';
    div.appendChild(canvas);

    return div;
}

async function draw(canvas, vid)
{
    // FrankL81: to get the right size 
    // you get the window.rectangle data 
    // and then use that to substract your 
    // canvas position relativ to that
    // document.querySelector('.my-element').getBoundingClientRect(); console.log(rect.width, rect.height, rect.top, rect.left);

    const ctx1 = canvas.getContext("2d");
    ctx1.drawImage(vid,0,0,300,300);
    const frame = ctx1.getImageData(0,0,vid.videoWidth,vid.videoHeight);
    const data  = frame.data;

    for (let i = 0; i < data.length; i++) {
        const r = data[i +0];
        const g = data[i +1];
        const b = data[i +2];
        if ((g > 100) && (r < 20) && (b < 20)) {
            //alpha channel on image?
            data[i+3] = 0;
        }

    }
    const ctx2 = canvas.getContext("2d");
    canvas.width = vid.videoWidth;
    canvas.height = vid.videoHeight;
    ctx2.putImageData(frame, 0, 0);
    // console.log(data);


    setTimeout(() => {
        draw(canvas, vid);
    }, 0);


    // document.getElementById("base").append(canvas);

}

display_memes();
// draw();
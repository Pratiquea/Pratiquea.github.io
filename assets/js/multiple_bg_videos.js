var videoSource = new Array();
videoSource[0]='./assets/videos/wall.mp4';
videoSource[1]='./assets/videos/window.mp4';
var videoCount = videoSource.length;
// console.info("vid source 0 = ",videoSource[0])
// console.info("vid source 1 = ",videoSource[1])

document.getElementById("bgvid").setAttribute("src",videoSource[0]);
// Create a function to load and play the videos.
 
function videoPlay(videoNum)
{
    document.getElementById("bgvid").setAttribute("src",videoSource[videoNum]);
    document.getElementById("bgvid").load();
    document.getElementById("bgvid").play();
}

document.getElementById('bgvid').addEventListener('ended',myHandler,false);
i=0;
// console.info("counter = ",i)
function myHandler() {
    i++;
    // console.info("counter = ",i)
    // console.info("videocount = ",videoCount)
    if(i == (videoCount-1))
    {
        videoPlay(i);
        i = -1;
        // console.info("counter inside 1= ",i)
    }
    else{
        // console.info("counter inside 2= ",i)
        videoPlay(i);
    }
}
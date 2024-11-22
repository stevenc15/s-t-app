let video_frames = 0;

const setVideoFrames = (frames) => {
    video_frames = frames;
};

const getVideoFrames = () => {
    return video_frames;
};

module.exports = {setVideoFrames, getVideoFrames};
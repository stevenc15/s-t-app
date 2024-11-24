//token verification es un PROBLEMA
//all endpoints checked for, no major adjustments needed, but still could adjust
const express = require('express');
const router = express.Router()
const multer = require('multer'); // Import Multer, a middleware for handling multipart/form-data (used for file uploads)
const path = require('path'); // Import the path module to handle file paths across different OS platforms
const { processVideo } = require('../Routes_help/videoProcessor'); // Import the custom video processing function
const {send_completion_email} = require('../Routes_help/v_email'); //send verification email
const {convertToH264} = require("../Routes_help/convert_video"); //convert video to valid format for website display
const {uploadGCS, generate_signed_url} = require("../Routes_help/storage"); //storage functions for videos
const Video = require('../Schemas/VideoSchema'); //video model
const User = require('../Schemas/UserSchema'); //user model
// Configure multer to store uploaded files in the 'inputs' folder temporarily
const input = multer({ dest: './inputs' }); // Multer stores uploaded files in the '/inputs' directory

const verifyToken = require ('../Routes_help/jwt'); //create helper function `for jwts
const {Op} = require('sequelize'); //operator from sequelize module
const dotenv = require('dotenv');
dotenv.config({path: '../backend_details.env'});

const {setVideoFrames, getVideoFrames} = require('../Routes_help/video_utils')
const ffmpeg = require('fluent-ffmpeg');
const useCloud = process.env.USE_CLOUD===true;
//CHECKED for 200, 500

router.post('/process_video', verifyToken, input.single('video'), async(req, res) => { //fix verify token
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    try{
        //add user id as parameter
        //define paths for input and output
        const inputPath = req.file.path; //file path for input from input.single to req
        const outputPath = path.join(__dirname, 'outputs', req.file.filename + '.mp4'); // Set the output path for the processed video file in the 'outputs' folder
        const converted_outputPath = path.join(__dirname, 'outputs', req.file.filename + 'CONV.mp4'); // Set the output path for the converted video file in the 'outputs' folder

        ffmpeg(inputPath)
            .ffprobe(0, (err, metadata)=>{

                if (err){
                    console.error("Error extracting metadata:", err);
                    return res.status(500).send("Error processing video");
                }
                const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
            if (videoStream) {
                const totalFrames = Math.floor(videoStream.duration * videoStream.r_frame_rate.split('/')[0]);
                setVideoFrames(totalFrames); // Set the global frame count
                console.log(`Video has ${totalFrames} frames`);
            } else {
                console.log("No video stream found");
            }
            });
        console.log(inputPath);
        console.log(outputPath);

        // Process the video using the custom 'processVideo' function
        await processVideo(inputPath, outputPath); 
        
        //convert video to playable format for output preview
        await convertToH264(outputPath, converted_outputPath);
        
        //path to be returned
        const videoUrl = `/outputs/${req.file.filename}CONV.mp4`;

        
        res.status(200).json({ videoUrl});
    }catch(error){
        console.error(error); // Log any errors to the console
        res.status(500).send('Error processing video'); // Send an error response with HTTP status code 500 if something goes wrong
    }
});

router.post('/send_completion', verifyToken, async(req, res)=> {
    try{
        const {userId} = req.body;
        const user = await User.findOne({where:{userId:userId}});

        const email = user.email;

        send_completion_email(email);
        res.status(200).json({message: 'success'})
    }catch(error){

        res.status(500).json({error: 'email notification not sent'});
    
    }

    
});
//CHECKED for 200, 400, add functionality to check only for user list, adjust to store data in non-cloud database
router.post('/save_video', verifyToken, async(req, res) =>{
    try{
        const {userId, filepath, video_name} = req.body; //userId, filepath, video name should be entered
        
        console.log(userId);
        console.log(filepath); //./outputs/54b1d3ffcd2f019ccf07a9cf50e48773CONV.mp4
        console.log(video_name)

        // 'path' in bucket specified with username and video_name
        const GCSPath=`${userId}/${video_name}`; 
        
        //check if video is already saved in system REVISE
        const Video_name = await Video.findOne({ //check if video already saved in database
            where: {userId:userId,
                    video_name:video_name}
        });
        if (Video_name){ 
            return res.status(400).json({error: 'video already saved'});
        }

        //grab user by id
        //const user = await User.findByPk(userId);

        let url;

        if (useCloud){
            //upload to google bucket
            await uploadGCS(filepath, GCSPath);

            //create url to store in database, access for viewing/download is available for a weekish
            url = await generate_signed_url(GCSPath);
        }

        else{
            url = GCSPath;
        }

        console.log(`url: ${url}`);
        //create video associated with user and store accessible username in database
        await Video.create({
            userId: userId,
            Url: url,
            video_name: video_name
        });

        res.status(200).json({message: 'successfully saved video'});
    }catch(error){
        console.error(error);
        res.status(500).json({error: 'video not saved'});
    }
});

//CHECKED for 200, 401
router.post('/delete_video', verifyToken, async(req, res)=>{ //check if token present
    try{

        const {userId, video_name}=req.body; //user id but video name most important

        //check if user exists, possibly remove
        //const user = await User.findByPk(userId); 
        //if (!user){
            //return res.status(400).json({message: 'user not found'});
        //}

        //check if video exists matching user
        const video = await Video.findOne({
            where: {
                userId:userId,
                ...(video_name && {video_name: {[Op.like]: `%${video_name}%`}})
            }
        });
        if (!video){
            return res.status(401).json({message: 'video file not found'});
        }

        //delete video
        await video.destroy();

        //success message
        res.status(200).json({message: 'video file successfully destroyed'});

    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Failed to destroy video'});
    }
});

//CHECKED for 200, 400
router.post('/search_video', verifyToken, async(req, res)=>{
    try{
        const {userId, video_name}=req.body; //user id but video name most important
        
        //check if video exists matching user
        const video = await Video.findOne({
            where:{
                userId:userId,
                ...(video_name && {video_name: {[Op.like]: `%${video_name}%`}})
            }
        });        
        if (!video) {
            return res.status(400).json({ message: 'No video by that name found for this user' });
        }
        
        //return video if found, check for correctness
        res.status(200).json({message: "video found", video});
        
    }catch(error){
        console.error(error);
        res.status(500).json({error:'video search unsuccessful'});
    }
});

router.get('/saved-videos/:userId', verifyToken, async(req, res)=>{
    try{
        const {userId} = req.params;

        const saved_videos = await Video.find({where: {userId:userId}});

        res.status(200).json(saved_videos);
    }catch(error){
        res.status(500).send(error);
    }
});

router.get('/download_video', verifyToken, async(req, res)=>{
    try{

        const {userId, video_name} = req.body;
        const video = await Video.findOne({where: {userId:userId,
                                                video_name:video_name
        }});

        res.status(200).send(video.Url);
    }catch(error){
        res.status(500).send(error);
    }
});
module.exports=router;




    

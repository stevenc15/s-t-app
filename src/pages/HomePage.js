//HomePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './stylings/HomePage.css';
import Process_saveVideo from '../components/process_saveVideo';

import Logout from '../components/logout';
import {Box, Button, Typography} from '@mui/material';
import {useUser} from '../components/userContext';
import {getCookie} from '../components/cookieUtils';
import {useNavigate} from 'react-router-dom';

const HomePage = () => {
    const [videoURL, setVideoURL] = useState(''); 
    const [outputVideo, setOutputVideo] = useState(null); 
    const navigate = useNavigate(); 
    const isDisabled = process.env.REACT_APP_USE_CLOUD==='true';
//grab user ID
const {setUserId} = useUser();
const storeUserId = getCookie('userId');
const storedToken = getCookie('token');
useEffect( ()=> {
  if (storeUserId){
      setUserId(storeUserId)
    }
  }, [setUserId, storeUserId]
);

//DEFINE USESTATES
const [inputVideo, setInputVideo] = useState(null);  
const [isProcessing, setIsProcessing] = useState(false); 
const [videoName, setVideoName] = useState('');
const [popupVisible, setPopupVisible] = useState(false);
const [message, setMessage] = useState('');
const [progress, setProgress] = useState(0);

    useEffect(()=>{
      const tokenExists = document.cookie.split('; ').some((cookie)=>cookie.startsWith('token='));
      if (!tokenExists){

        alert('must log in again');
        navigate('/login');
      }
    }, [navigate]);

    const handleDownload = () =>{
      const link = document.createElement('a');
      link.href=outputVideo;
      link.download='processed_video.mp4';

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
    };

  //function to call save video input
  const callSaveVideo = async () => {
        
    //get input
    const obj = {userId:storeUserId,
                filepath:outputVideo, //test si necesita el output video o necesita el data.videoUrl
                video_name:videoName};
    const js = JSON.stringify(obj);

    //send to endpoint aka backend
    try{
    const response = await fetch('video/save_video', {
        method: 'POST',
        body:js,
        headers:{
            'authorization': `Bearer ${storedToken}`,
            'Content-Type':'application/json'
            
        }
    });

    //check response
    if (response.status===200){
      setMessage('successfully saved');
    }else if(response.status===400){
      setMessage('video already saved or name already used');
    }else{
      setMessage('unknown error');
    }
    }catch(error){
        console.error('Error:', error);
    }
  };
    //MAKE PAGE
    return ( 
      <div className="page-container">
    {/* Alert Message for Cloud Status */}
    <div className='cloud-status'>
      {!isDisabled ? "ALERT: Cloud Storage is not active" : "ALERT: Cloud Storage is active"}
    </div>

    {/* Header Section */}
    <header className='header'>
      <h1 className='app-title'>Track Videos</h1>
    </header> 

    <div>
    <Logout />
    </div>
      <div>
        <Link to='/video'>
          <button disabled={!isDisabled} className="saved-videos-button">Cloud-Saved Videos</button>
        </Link>
      </div>
    <main>   
      {/* Video Upload Section */}
      <h2 className='action-title'>Upload Video Below</h2>
      <Process_saveVideo 
        setVideoURL={setVideoURL} 
        setOutputVideo={setOutputVideo}
        outputVideo={outputVideo}
      />

      {/* Video Preview Section */}
      {videoURL && ( 
        <div> 
          <h3 className='processing-title'>Input Video</h3> 
          <video width="640" height="360" controls> 
            <source src={videoURL} type="video/mp4" /> 
            Your browser does not support the video tag. 
          </video>
        </div>
      )}

      {/* Processed Video Section */}
      {outputVideo && ( 
        <div> 
          <h3 className='processing-title'>Processed Video</h3> 
          <video width="640" height="360" controls> 
            <source src={outputVideo} type="video/mp4" /> 
            Your browser does not support the video tag. 
          </video>

          <button onClick={handleDownload} className="download-button">
            Download processed video
          </button>
          <button onClick={()=>setPopupVisible(true)} className='save-button'>
            Save Processed Video
          </button>
          {popupVisible && (
          <div>

            <h3 className='video-name'>Enter Video Name</h3>
            <input 
            type='text'
            value={videoName}
            onChange={(e)=>setVideoName(e.target.value)}
            placeholder='Video Name'
            />
            <button onClick={callSaveVideo} className='saves-button'>Save</button>
            <button onClick={()=>{setPopupVisible(false); setMessage('')}} className='cancel-button'>Cancel</button>
          </div>
        )}

        {message && <p className='message'>{message}</p>}
        </div>
      )}

      {/* Start Processing and Saved Videos Button */}
      
    </main> 
  </div>
    );
  }

  export default HomePage; 

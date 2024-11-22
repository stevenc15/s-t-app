import React, {useState, useEffect} from 'react';
import Upload from './Upload';
import {useUser} from './userContext';
import {getCookie} from './cookieUtils';
import {Box, Button, Typography, CircularProgress} from '@mui/material';
import './stylings/process_saveVideo.css';

const Process_saveVideo = ({setVideoURL, setOutputVideo, outputVideo}) =>{
  

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

  /*
  useEffect(()=>{

    const socket = new WebSocket('ws://localhost:5001');

    socket.onopen = () => {
      console.log('websocket connection established2')
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.progress!==undefined){
        setProgress(data.progress);
      } else if(data.message==='Processing complete'){
        console.log('processing complete');
        setMessage('processing complete');
        setIsProcessing(false);
      }
    };
    socket.onerror=(error)=>{
      console.error('WebSocket Error:', error);
    }

    socket.onclose=()=>{
      console.log('WebSocket connection closed2');
    }

    return () => {
      socket.close();
    }
  }, []
);

*/

  //FUNCTION TO HANDLE DROPPING/UPLOADING FILE
  const handleDrop = (acceptedFiles) => { 
    setInputVideo(acceptedFiles[0]); 
    setVideoURL(URL.createObjectURL(acceptedFiles[0])); 
  }; 

  //FUNCTION TO PROCESS VIDEO
  const handleProcessVideo = async () => { 
    console.log('inputVideo:',inputVideo);
    setIsProcessing(true); //FLAG


   
    //PREPARE DATA
    const formData = new FormData(); 
    formData.append('video', inputVideo);

    //NOTIFY PROCESSING
    console.log("Processing started for:", inputVideo.name);

    const storedToken = getCookie('token');
    //CALL ENDPOINT
    const response = await fetch('video/process_video', { 
      method: 'POST', 
      body: formData, 
      headers: {
        'Authorization': storedToken
      }
    });

    setIsProcessing(false);//FLAG 

    //CHECK FOR ERROR/PASS
    if (response.ok) { 
      //const outputVideoURL = `http://localhost:5001/Routes/outputs/${filename}.mp4`//URL.createObjectURL(await response.blob()); 
      const data = await response.json();
      console.log('Processed video URL:',data.videoUrl);
      setOutputVideo(`http://localhost:5001${data.videoUrl}`);
      console.log('Output video set to:', `http://localhost:5001${data.videoUrl}`);
    } else { 
      console.error('Error processing video'); 
    }
  };

  //function to send completion email
  const callCompletion = async () => {
        
    //get input
    const obj = {userId:storeUserId
                };
    const js = JSON.stringify(obj);

    //send to endpoint aka backend
    try{
    const response = await fetch('video/send_completion', {
        method: 'POST',
        body:js,
        headers:{
            'Content-Type':'application/json',
            'Authorization': storedToken
        }
    });

    //check response
    if (response.status===200){
      setMessage('successfully notified');
    }else{
      setMessage('unknown error');
    }
    }catch(error){
        console.error('Error:', error);
    }
  };

  useEffect(()=>{
    if (outputVideo){
      callCompletion();
    }
  }, [outputVideo]);
  
  return(

    <div>
        <Upload onDrop={handleDrop} />
        {inputVideo && <p className='action-title'>Uploaded file: {inputVideo.name}</p>}            
        <button onClick={handleProcessVideo} disabled={!inputVideo || isProcessing} className='process-button'>Start Processing</button>           
        {isProcessing && (
          <div className='processing-container'>
          <p className='processing-title'>Processing your video, please wait</p> 
          <CircularProgress/>
          </div>
        )}

        {outputVideo && !isProcessing &&(
          <div>
          <p className='processing-title'>Finished Processing</p>
          </div>
        )}

        {/*  
        {isProcessing && (
        <div>
          <p>Progress: {Math.round(progress)}%</p>
          <div style={{ width: '100%', background: '#f3f3f3', borderRadius: '5px' }}>
            <div
              style={{
                width: `${progress}%`,
                height: '20px',
                background: '#4caf50',
                borderRadius: '5px',
              }}
            />
          </div>
        </div>
      )}
      */}

    </div>
    
  );

};
export default Process_saveVideo;
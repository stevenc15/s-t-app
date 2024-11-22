import React, {useState, useEffect} from 'react';
import {useUser} from './userContext';
import {getCookie} from './cookieUtils';

function SearchDeleteVideo (){


    const [videos, setVideos] = useState([]);

    const [deleteVideoName, setDeleteVideoName] = useState(''); //enter video name to confirm deletion
    const [searchVideoName, setSearchVideoName] = useState(''); //search bar input
    const [downloadVideoName, setDownloadVideoName] = useState(''); //search bar input
    const [message, setMessage] = useState('');
    const [showDeletePopup, setShowDeletePopup ] = useState(false); //enter confirmation here
    const [showDownloadPopup, setShowDownloadPopup ] = useState(false); //use provided url to download video
    const [isLoading, setIsLoading] = useState(false);
    const storedToken = getCookie('token');

    const storeUserId = getCookie('userId');

    useEffect(()=>{
        const fetchVideos = async() =>{
            setIsLoading(true);
            try{
    
                const response = await fetch(`video/saved-videos/${storeUserId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': storedToken
                    }
                });
                if (response.ok){
                    const data = await response.json();
                    setVideos(data);
                }else{
                    setMessage('failed to fetch videos')
                }
            }catch(error){
                console.error('Error:', error);
            }finally{
                setIsLoading(false);
            }
        };

        if (storeUserId){
            fetchVideos();
        }
    }, [storeUserId, storedToken]
    );

    const callDeleteVideo = async () => {

        const obj = {userId: storeUserId,
                    video_name: deleteVideoName
        };

        const js = JSON.stringify(obj);

        try{
        const response = await fetch('video/delete_video', {
            method: 'POST',
            body: js, 
            headers: {
                'Content-Type':'application/json',
                'Authorization': storedToken
            }
        });

        if (response.status===200){
            setMessage('successfully deleted');
            setVideos(videos.filter(video=>video.video_name!==deleteVideoName));
          }else if(response.status===400){
            setMessage('video already deleted or incorrect name used');
          }else{
            setMessage('unknown error');
          }
        }catch(error){
            console.error('Error:', error);
        }
    };

    const callSearchVideo = async () => {

        const obj = {userId: storeUserId,
                    video_name: searchVideoName
        };

        const js = JSON.stringify(obj);

        try{
        const response = await fetch('video/search_video', {
            method: 'POST',
            body: js, 
            headers: {
                'Content-Type':'application/json',
                'Authorization': storedToken
            }
        });

        if (response.status===200){
            const data = await response.json();
            setVideos([data.video]);
          }else if(response.status===400){
            setMessage('no video by that name found');
          }else{
            setMessage('unknown error');
          }
        }catch(error){
            console.error('Error:', error);
        }
    };

    const callDownloadVideo = async () => {

        const obj = {userId: storeUserId,
                    video_name: downloadVideoName
        };

        const js = JSON.stringify(obj);

        try{
        const response = await fetch('video/download_video', {
            method: 'POST',
            body: js, 
            headers: {
                'Content-Type':'application/json',
                'Authorization': storedToken
            }
        });

        if (response.ok){
            const data = await response.json();
            const url = data.url;

            window.open(url, '__blank')
            setVideos(videos.filter(video=>video.video_name!==deleteVideoName));
          }else{
            setMessage('failed to download video');
          }
        }catch(error){
            console.error('Error:', error);
        }
    };
    return (
        <div> 
            <div>
                <input 
                type='text'
                value={searchVideoName}
                onChange={(e) => setSearchVideoName(e.target.value)}
                placeholder='search video by name'
                />
                <button onClick={callSearchVideo}>
                    Search
                </button>
            </div>
            

            {isLoading && <p>videos loading</p>}

            {!isLoading && videos.length>0 ? (
                <ul>
                    {videos.map((video, index)=>(
                        <li key={index}>
                            {video.video_name}

                            <button onClick={()=>setShowDeletePopup(true)}>
                                Delete
                            </button>
                            {showDeletePopup && (
                                <div>
                                    <h3>confirm deletion by entering video name</h3>
                                    <input 
                                    type='text'
                                    value={deleteVideoName}
                                    onChange={(e)=>setDeleteVideoName(e.target.target.value)}
                                    placeholder='Video Name'
                                    />
                                    <button onClick={callDeleteVideo}>Delete</button>
                                    <button onClick={()=>setShowDeletePopup(false)}>Cancel</button>
                                </div>
                            )}

                            <button onClick={()=>{callDownloadVideo();
                                                  setDownloadVideoName(video.video_name);
                                                  }}>
                                Download
                            </button>
                        </li>
                        )
                        )
                    }
                </ul>
            ):(<p>no videos saved</p>)}

           {message && <p>{message}</p>}
        </div>
    )
};


export default SearchDeleteVideo;
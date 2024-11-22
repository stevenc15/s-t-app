import React, {useState} from 'react';
import SearchDeleteVideo from '../components/search_deleteVideo';
import { Link } from 'react-router-dom';

const VideoPage = () => {

    return (
        <div>

            <h2>Saved Videos</h2>
            <SearchDeleteVideo />
            <Link to='/home'>
                <button>go back</button>
           </Link>
        </div>
    );
};

export default VideoPage;
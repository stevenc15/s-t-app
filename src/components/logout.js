import React from 'react';
import {useNavigate} from 'react-router-dom';
import {useUser} from './userContext';
import './stylings/logout.css'
import {Box, Button, Typography} from '@mui/material';

function Logout(){
    const navigate = useNavigate();
    const {setUserId} = useUser();

    const handleLogout=()=>{
        setUserId(null);
        navigate('/login');
    };

    return(

        <button onClick={handleLogout} className='logout-button'>
            Logout
        </button>
    );

};

export default Logout;
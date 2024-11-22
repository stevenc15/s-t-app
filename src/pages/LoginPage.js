import React, {useEffect} from 'react';
import Login from '../components/login';
import './stylings/LoginPage.css'; // Import the CSS file
import {Box, Button, Typography} from '@mui/material';

//log in title, and login component
import {useLocation} from 'react-router-dom';
const LoginPage = () => {
const location = useLocation();

useEffect(()=>{
    document.cookie='token=; expires=Thu, 01 Jan 2001 00:00:00 UTC; path=/;';
}, [location])

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Log in</h2>
                <Login />
            </div>
        </div>
    );
};

export default LoginPage;
import React from 'react';
import Register from '../components/register';
import { Link } from 'react-router-dom'; // Ensure you import Link from react-router-dom
import './stylings/RegisterPage.css'; // Import the CSS file for RegisterPage styles

const RegisterPage = () => {
    return (
        <div>
            <Register />
            <div className="register-page-switch-login">
                <p className='register-page-title'>Already have an account?</p>
                <Link to="/login">
                    <button className="switch-to-login-button">Switch to Login</button>
                </Link>
            </div>
        </div>
    );
};

export default RegisterPage;

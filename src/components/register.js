import React, {useState} from 'react';
import './stylings/register.css';
import {useNavigate} from 'react-router-dom';

const Register = () => {

    //usestates for key variables
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    //v code usestate
    const [verificationCode, setVerificationCode ]= useState('');

    //message useStates
    const [errorMessage, setErrorMessage] = useState('');
    const [verificationErrorMessage, setVerificationErrorMessage] = useState('')

    //enter email verification box usestate
    const [showVerificationPopup, setShowVerificationPopup] = useState(false);

    //what use?
    const [overlayActive, setOverlayActive] = useState(false);

    //navigate to other pages
    const navigate = useNavigate();
    
    //function to call register endpoint
    const callRegister = async (event)=>{
        event.preventDefault(); //investiga

        // Reset error message
        setErrorMessage('');

        //check for username, password, email presence 
        if (!username || !password || !email) {
            setErrorMessage('All input fields must be filled.');
            return;
          }

        //password restrictions
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)){
            setErrorMessage('Password must contain at least 8 characters, one uppercase letter, one number, one lowercase letter, and one special character.');
            return;
        }

        try {
            
            //set input
            const obj = {
                username:username, 
                password:password,
                email: email
            };
            const js = JSON.stringify(obj)

            //send credentials to register endpoint
            const response = await fetch('users/register', {
                method: 'POST',
                body: js,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            //check response
            if (response.status === 200) {
                setShowVerificationPopup(true);
                setOverlayActive(true);
            } else if (response.status === 400) {
                setErrorMessage('User already exists');
            } else if (response.status === 500) {
                setErrorMessage('A server error has occurred.');
            } else {
                setErrorMessage('Unknown error');
            }

            //error
        }catch(error){
            setErrorMessage('An error occurred. Please try again.');
        }
    };

    // Function to close overlay and verification popup
    const closeOverlay = () => {
        setOverlayActive(false);
        setShowVerificationPopup(false);
    };

    //function to check verification code
    const checkVerification = async (event) =>{
        event.preventDefault(); //investigate use

        //set input
        const obj = {emailVtoken: verificationCode};
        const js = JSON.stringify(obj);

        // Reset verification code error
        setVerificationErrorMessage('');

        try{

            //send credentials to end point
            const response = await fetch('/users/verifyEmail', {
                method: 'POST',
                body: js,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            //check response 
            if (response.status === 200) {
                navigate('/login');
              } else if (response.status === 400) {
                setVerificationErrorMessage('Invalid verification code');
              } else if (response.status === 500) {
                setVerificationErrorMessage('A server error has occurred.');
              } else {
                setVerificationErrorMessage('Unknown error');
              }

              //error
        }catch(error){
            setVerificationErrorMessage('An error occurred. Please try again.');
        }
    };

    //make webpage
  return (

    <div className="register-container">
    {/* Add the overlay with conditional active class */}
    <div className={`overlay ${overlayActive ? 'active' : ''}`}></div>

    {/* Headings */}
    <h2 className="register-title">Register</h2>

    {/* input section */}
    <form onSubmit={callRegister} className="register-form">
        
         {/* Username */}
        <input 
            type="text"
            className={`register-input ${errorMessage ? 'error' : ''}`}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
        />

        {/* Password */}
        <input
            type="password"
            className={`register-input ${errorMessage ? 'error' : ''}`}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />

        {/* Email */}
        <input
            type="email"
            className={`register-input ${errorMessage ? 'error' : ''}`}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
        />

        {/* Submit button */}
        <button type="submit" className="register-butto">Submit</button>
    </form>

    {/* Display message */}
    <p className={`error-message ${showVerificationPopup ? 'verification-popup-error' : ''}`}>{errorMessage}</p>

    {/* Enter email verification code */}
    {showVerificationPopup && (
        <div className={`verification-popup ${overlayActive ? 'active' : ''}`}>
            <button className="close-button" onClick={closeOverlay}>X</button>
            <h2>Enter Verification Code From Email</h2>
            <form onSubmit={checkVerification}>
                <input
                    type="text"
                    className="verification-input"
                    placeholder="Verification Code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                />
                <button type="submit" className="verification-button">Verify</button>
            </form>
            <p>{verificationErrorMessage}</p>
        </div>
    )}

</div>
);
    
};

export default Register;
import React, {useState} from 'react'; //react library
import {Link, useNavigate} from 'react-router-dom'; //link and useNavigate to move to other page
import {useUser} from './userContext';
import EmailPopup from './EmailPopup';
import CodePopup from './CodePopup';
import ChangePasswordPopup from './ChangePasswordPopup';
import './stylings/login.css'; 
import {Box, Button, Typography} from '@mui/material';

//login component
function Login() {
    const [overlayActive, setOverlayActive] = useState(false); //check for usage, para permitir popups?

    //variables used throughout function definition
    var loginName; 
    var loginPassword;

    //key variables usestates
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [code, setCode] =useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    //popup usestates, forgot password email, password reset code, change password
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [showEnterPRCode, setShowEnterPRCode] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);

    //navigate to switch between pages
    const navigate = useNavigate();

    //usestate to change user id throughout application
    const {setUserId} = useUser();

    //message usestate
    const [message, setMessage] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [codeMessage, setCodeMessage] = useState('');
    const [changePasswordMessage, setChangePasswordMessage]= useState('');

    //function to popup box to enter email for reset password
    const GenerateForgotPassword = () => {
        setShowForgotPassword(true);
        setOverlayActive(true); //check usage 
    };

    //function to call endpoint to send email for reset password
    const CallResetPasswordEmail = async () => {
        try{
            //call endpoint
            const response = await fetch('users/resetPasswordEmail', {
                method: 'POST', 
                body: JSON.stringify({email}),
                headers: {'Content-Type': 'application/json'}
            });

            //check response
            if (response.status===200){
                setShowEnterPRCode(true); //authorization to enter code for reset password
                setEmailMessage('Check email for password reset code');
                setShowForgotPassword(false);
            }else{
                setEmailMessage('Error sending code');
            }

            //error
        }catch(error){
            console.error('Error:', error)
        }
    };

    const CallEnterPRCode = async () => {
        try{
            //call endpoint
            const response = await fetch('users/enterResetCode', {
                method: 'POST',
                body: JSON.stringify({code}),
                headers: {'Content-Type': 'application/json'}
            });

            //check response
            if (response.status===200){
                setShowChangePassword(true); //authorization to allow user to change password
                setShowEnterPRCode(false);
            }else if (response.status===400){
                setCodeMessage('Invalid Code');
            }

            //error
        }catch(error){
            console.error('Error:', error);
        }
    };

    //function to change password
    const CallChangePassword = async () => {
        try{
            //call endpoint
            const response = await fetch('users/changePassword', {
                method: 'POST',
                body: JSON.stringify({username, newPassword: newPassword, confirmPassword:confirmPassword}),
                headers: {'Content-Type': 'application/json'}
            });

            //check response
            if (response.status===200){
                setChangePasswordMessage('Password Changed');
                //setShowForgotPassword(false);
                //setShowEnterPRCode(false);
                setShowChangePassword(false);
                setOverlayActive(false);
            }else{
                setChangePasswordMessage('Error changing password');
            }
            
            //error
        }catch(error){
            console.error('Error:', error);
        }
    };

    //function to call login endpoint
    const doLogin = async(event)=> {
        event.preventDefault(); //check use

        //set input
        const obj = { username: loginName.value, password: loginPassword.value};
        const js = JSON.stringify(obj);

        try{
            //call endpoint
            const response = await fetch('users/login', {
                method: 'POST', 
                body: js,
                headers: {'Content-Type': 'application/json'}
            });
            if (response.status === 200){

                //set document cookies
                const data = await response.json();
                document.cookie = `userId=${data.userId}; path=/`;
                document.cookie = `token=${data.token}; path=/; `;

                //set global userId
                setUserId(data.userId);

                //success message
                setMessage('Login successful');

                //pass to home page
                navigate('/home');

            }else if (response.status===400){
                setMessage('Username does not exist');
            }else if (response.status===401){
                setMessage('Invalid Password');
            }else if (response.status===402){
                setMessage('Email verification incomplete');
            }
            //error
        }catch(error){
            alert(error.toString());
            return;
        }
    };

    //make webpage
    return (
        <div className='login-container'>
            <div className={`overlay ${overlayActive ? 'active' : ''}`}></div>
            {/* Login field, forgot password option */}
            <form className="login-form" onSubmit={doLogin}>
                <input
                    type='text'
                    id='loginName'
                    placeholder='Enter Username'
                    ref={(c) =>(loginName=c)}
                />
                <input
                    type='password'
                    id='loginPassword'
                    placeholder='Enter Password'
                    ref={(c) =>(loginPassword=c)}
                />
                <button type="submit">Enter</button>
            </form>

            <Button className="forgot-password-button"  onClick={GenerateForgotPassword}>Forgot Password</Button>
            

            {/* email enter for forgot password code */}
            {showForgotPassword && (
                <div className="popup-container">
                    <EmailPopup
                    title='Enter Email'
                    onSubmit={CallResetPasswordEmail}
                    email={email}
                    setEmail={setEmail}
                    message={emailMessage}
                    />
                </div>
            )}

            {/* enter PR code */}
            {showEnterPRCode && (
                <div className="popup-container">
                    <CodePopup 
                    title="Enter Code" 
                    onSubmit={CallEnterPRCode} 
                    code={code} 
                    setCode={setCode} 
                    message={codeMessage}
                    />
                </div>
            )}
    
            {/* actual change password */}
            {showChangePassword && (
                <div className="popup-container">
                    <ChangePasswordPopup
                    title="Change Password"
                    onSubmit={CallChangePassword}
                    username={username}
                    setUsername={setUsername}
                    newPassword={newPassword}
                    setNewPassword={setNewPassword}
                    confirmPassword={confirmPassword}
                    setConfirmPassword={setConfirmPassword}
                    message={changePasswordMessage}
                    />
                </div>
            )}


            {/* button to register page*/}
            <Link to='/register'>
                <Button className='register-button'>Don't have an account?</Button>
            </Link>
                {/* display message */}
                <span className='message'>{message}</span>

            </div>
     
        );
    
    };
    
    export default Login;

/*
import React, {useState} from 'react'; //react library
import {Link, useNavigate} from 'react-router-dom'; //link and useNavigate to move to other page
import {useUser} from './userContext';
import EmailPopup from './EmailPopup';
import CodePopup from './CodePopup';
import ChangePasswordPopup from './ChangePasswordPopup';

function Login() {
    //what is overlay, esto es para un class name si el overlay esta active
    const [OverlayActive, setOverlayActive] = useState(false);
    
    //two variables declared, login username and login password
    var loginName; 
    var loginPassword;

    //usestate to change key variables 
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [code, setCode] =useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    //authorizations to endpoints
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [showEnterPRCode, setShowEnterPRCode] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);

    //navigate to be used to change pages
    const navigate = useNavigate();

    //access global user id usestate
    const {setUserID} = useUser();

    //message usestates, para organizar console logs
    const [message, setMessage] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [codeMessage, setCodeMessage] = useState('');
    const [changePasswordMessage, setChangePasswordMessage]= useState('');

    //function to basically give user forgot password box to enter email
    const GenerateForgotPassword = () => {
        setShowForgotPassword(true); //authorization para el forgot password email endpoint
        setOverlayActive(true); //para un classname
    }

    //function to call reset password email endpoint
    const CallResetPasswordEmail = async () => {
        try{

            //response calls endpoint and takes user input
            const response = await fetch('users/resetPasswordEmail', {
                method: 'POST', 
                body: JSON.stringify({email}),
                headers: {'Content-Type': 'application/json'}
            });

            //check response, SEND MESSAGE 
            if (response.status===200){
                setShowEnterPRCode(true); //authorization to popup box to enter reset password code
                setEmailMessage('check email for password reset code');
            }else{
                setEmailMessage('error sending code');
            }

            //ERROR
        }catch(error){
            console.error('Error:', error)
        }
    };

    //function to call enter password reset Password code endpoint
    const CallEnterPRCode = async () => {
        try{

            //response calls endpoint and takes user input
            const response = await fetch('users/enterResetCode', {
                method: 'POST',
                body: JSON.stringify({code}),
                headers: {'Content-Type': 'application/json'}
            });

            //check response, SEND MESSAGE 
            if (response.status===200){
                setShowChangePassword(true); //authorization to popup box for users to change password 
            }else if (response.status===400){
                setCodeMessage('Invalid Code');
            }

            //ERROR
        }catch(error){
            console.error('Error:', error);
        }
    };

    //function to call change password endpoint
    const CallChangePassword = async () => {
        try{

            //response calls endpoint and takes user input
            const response = await fetch('users/changePassword', {
                method: 'POST',
                //body is what is being sent to endpoint, should match endpoint parameters
                body: JSON.stringify({username, newPassword: newPassword, confirmPassword:confirmPassword}),
                headers: {'Content-Type': 'application/json'}
            });

            //check response, SEND MESSAGE 
            if (response.status===200){
                setChangePasswordMessage('Password Changed');
                setShowForgotPassword(false); //basically go back, after successfully changing passwords
                setShowEnterPRCode(false);//close this option
                setShowChangePassword(false); //close this option
                setOverlayActive(false); // classname
            }else if (response.status===400){
                setChangePasswordMessage('Invalid Code');
            }else if (response.status===401){
                setChangePasswordMessage('Invalid Code');
            }else if (response.status===402){
                setChangePasswordMessage('Invalid Code');
            }

            //ERROR
        }catch(error){
            console.error('Error:', error);
        }
    };


    //function to call login endpoint
    const doLogin = async(event)=> {

        event.preventDefault(); 

        var obj = { username: loginName.value, password: loginPassword.value};
        var js = JSON.stringify(obj);
        
        try{

            //response calls endpoint and takes user input
            const response = await fetch('users/login', {
                method: 'POST', 
                body: js,
                headers: {'Content-Type': 'application/json'}
            });

            //check response
            if (response.status === 200){
                const data = await response.json();
                document.cookie = `userId=${data.userId}; path=/`;
                document.cookie = `token=${data.token}; path=/; `; //expires in an hour
                setUserID(data.userId); //set or update user id globally
                setMessage('Login successful');
                navigate('/home'); // pass to next authorized page
            }else if (response.status===400){
                setMessage('invalid username');
            }else if (response.status===401){
                setMessage('Invalid Password');
            }else if (response.status===402){
                setMessage('email verification incomplete');
            }else if (response.status===500){
                setMessage('Failed Login');
            }else{
                setMessage('unknown error');
            }
            
            //ERROR
        }catch(error){
            alert(error.toString());
            return;
        }
    };

    //create component, use above defined functions
    return (

        <div>
            <div></div>
            <form onSubmit={doLogin}>
                <h2>Welcome To</h2>
                <input
                    type='text'
                    id='loginName'
                    
                    placeholder='Enter Username'
                    ref = {(c) =>(loginName=c)}
                />
                <input
                    type='password'
                    id='loginPassword'
                    
                    placeholder='Enter Password'
                    ref = {(c) =>(loginPassword=c)}
                />
                <button type="submit">
                    Enter  
                </button>
                <button type='button' onClick={GenerateForgotPassword}>
                    Forgot Password
                </button>
            </form>
            
            {showForgotPassword && (

                <EmailPopup
                title='Enter Email'
                onSubmit={CallResetPasswordEmail}
                email={email}
                setEmail={setEmail}
                message={emailMessage}
                setMessage={setEmailMessage}
                />
            )}
            {showEnterPRCode && (
                <CodePopup 
                title="Enter Code" 
                onSubmit={CallEnterPRCode} 
                code={code} 
                setCode={setCode} 
                message={codeMessage}
                />
            )}


            {showChangePassword && (
                <ChangePasswordPopup
                title="Change Password"
                onSubmit={CallChangePassword}
                username={username}
                setUsername={setUsername}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                message={changePasswordMessage}
                />
            )}
            {/*<Link to='/register'>
                <button >Register</button>
            </Link>
            <span>{message}</span>
        </div>


    );

}

export default Login;
*/
import React, {useState} from 'react';

function EmailPopup({onSubmit, email, setEmail, message}){
    const [error, setError] = useState(null); //error flag



    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const checkEmail_send = () => {
        if (!validateEmail){
            setError('invalid email');
            return;
        }
        setError(null);
        onSubmit();
    };

    return ( 
        <div>
            <h3 className='email-title'>Enter Email</h3>
            <input
            type='email'
            id='forgotPasswordEmail'
            placeholder='enter email'
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
            />
            <button type='button' onClick={checkEmail_send} className='submit-button'>
                Submit
            </button>
            {error && <p>{error}</p>}
        </div>
    );
}

export default EmailPopup;
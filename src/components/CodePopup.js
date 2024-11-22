import React from 'react';

function CodePopup({onSubmit, code, setCode, message}){

    return (
        <div>
            <h3 className='email-title'>Enter Code</h3>
            <input
            type='text'
            id='enterCode'
            placeholder='Check email for code'
            value={code}
            onChange={(e)=>setCode(e.target.value)}
            required
            />
            <button type='button' onClick={onSubmit} className='submit-button'>
                Submit
            </button>
            {message && <p>{message}</p>}
        </div>
    );
}
export default CodePopup;
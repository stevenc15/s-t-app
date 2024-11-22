import React from 'react';
import './stylings/AboutPage.css';
import { Link } from 'react-router-dom';

const AboutPage = () => {
    return (

        <div className='gen_explanation'>
            <header>
                <h1> write about app</h1>
            </header>
           <Link to='/home'>
            <button>go back</button>
           </Link>
        </div>
    )

}

export default AboutPage;

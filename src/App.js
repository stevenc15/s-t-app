//App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import VideoPage from './pages/VideoPage';
//import AccountPage from './pages/AccountPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { UserProvider } from './components/userContext';

function App() {

  return(
    <div className="App">
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />{/* -> login =>solo para el user aterrizar*/}
            <Route path="/login" element={<LoginPage/>} />{/* -> register || home =>login a la cuenta o ir a register, reset password*/}
            <Route path="/register" element={<RegisterPage/>} /> {/* Register page -> login || home => register a una cuenta nueva (email verification) o ve al login*/}
            <Route path="/home" element={<HomePage/>} /> {/* -> about || video || account => process y save video*/}
            <Route path="/about" element={<AboutPage />} /> {/* -> home => learn about tracker */}
            <Route path="/Video" element={<VideoPage/>} /> {/* -> home => search, delete and download video*/}
            {/*<Route path="/account" element={<AccountPage />} />*/} {/* ->landingPage =>para logout o delete account*/}
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </div>
  );
}

export default App;
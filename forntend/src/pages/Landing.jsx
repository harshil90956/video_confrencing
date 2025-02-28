import React from 'react';
import '../App.css';
import { Link, useNavigate } from 'react-router-dom';

function generateRandomString(length = 6) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export default function Landing() {
  const router = useNavigate();

  const handleGuestJoin = () => {
    const randomString = generateRandomString();
    router(`/${randomString}`);
  };

  return (
    <div className='landingPageContainer'>
      <nav>
        <div className='navHeader'>
          <h2>BeamTalk</h2>
        </div>
        <div className='navList'>
          <p onClick={handleGuestJoin}>Join as Guest</p>
          <p onClick={() => router('/auth')}>Register</p>
          <div role='button' onClick={() => router('/auth')}>
            <p>Login</p>
          </div>
        </div>
      </nav>

      <div className="landingMainContainer">
        <div>
          <h1>
            <span style={{ color: '#FF9839' }}>Connect</span> with Your Loved Ones
          </h1>
          <p>Cover a distance by BeamTalk</p>
          <div role='button'>
            <Link to={'/auth'}>Get Started</Link>
          </div>
        </div>
        <div>
          <img src='/mobile.png' alt='' />
        </div>
      </div>
    </div>
  );
}

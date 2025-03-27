import React from 'react';
import './LoginScreen.css';

const LoginScreen = ({ onLoginClick }) => {
  return (
    <div className="login-container">
      <h1>
        Ja<span className="highlight">mmm</span>ing
      </h1>
      <div className="login-content">
        <h2>Welcome to Jamming</h2>
        <p>To start creating and managing your Spotify playlists, please log in with your Spotify account</p>
        <button className="login-button" onClick={onLoginClick}>
          Login with Spotify
        </button>
      </div>
    </div>
  );
};

export default LoginScreen; 
import React, { useState, useRef } from 'react';
import MusicPlayer from './components/MusicPlayer';
import LyricsDisplay from './components/LyricsDisplay';
import SongSelection from './components/SongSelection';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileLines, faFileAlt, faMusic } from '@fortawesome/free-solid-svg-icons';
import { getAllSongs } from './services/songService';
import './App.css';

function App() {
  const [songs] = useState(getAllSongs() || []);
  const [currentSong, setCurrentSong] = useState(songs.length > 0 ? songs[0] : null);
  const [currentTime, setCurrentTime] = useState(0);
  const [showLyrics, setShowLyrics] = useState(window.innerWidth > 480); // Default to hidden on mobile
  const playerRef = useRef(null);
    // Handler for updating current song and time from MusicPlayer
  const handleSongProgress = (song, time) => {
    if (song) {
      setCurrentSong(song);
      setCurrentTime(time || 0);
    }
  };
  
  // Toggle lyrics display
  const toggleLyrics = () => {
    setShowLyrics(!showLyrics);
  };
  
  // Seek to specific time when clicking on a lyric
  const handleSeekToTime = (time) => {
    if (playerRef.current) {
      playerRef.current.seekToTime(time);
    }
  };
    return (
    <div className="app-container">
      <div className="app">
        <div className="player-with-lyrics">
          <MusicPlayer 
            ref={playerRef}
            songs={songs} 
            onSongProgress={handleSongProgress}
          />
          
          {showLyrics && (
            <div className="lyrics-overlay">
              {currentSong && (
                <LyricsDisplay 
                  currentSong={currentSong}
                  currentTime={currentTime}
                  onSeekToTime={handleSeekToTime}
                />
              )}
            </div>
          )}        </div>
      </div>      {/* Regular fixed buttons for desktop */}
      <button className="lyrics-toggle" onClick={toggleLyrics}>
        <FontAwesomeIcon icon={showLyrics ? faFileAlt : faFileLines} />
        {showLyrics ? 'பாடல் வரிகள்  ✖' : 'பாடல் வரிகள் 🟢'}
      </button>

      <SongSelection 
        songs={songs} 
        currentSong={currentSong}
        onSongSelect={(song) => {
          if (playerRef.current) {
            playerRef.current.selectSong(song);
          }
        }}
      />
      
      {/* Mobile control buttons container */}
      <div className="control-buttons-container">
        <button className="lyrics-toggle" onClick={toggleLyrics}>
          <FontAwesomeIcon icon={showLyrics ? faFileAlt : faFileLines} />
          {showLyrics ? 'பாடல் வரிகள்  ✖' : 'பாடல் வரிகள் 🟢'}
        </button>

        <button className="song-selection-button" onClick={() => {
          const songSelectElement = document.querySelector('.song-selection-wrapper .song-selection-button');
          if (songSelectElement) {
            songSelectElement.click();
          }
        }}>
          <FontAwesomeIcon icon={faMusic} />
          திருப்புகழ் பாடல்கள்
        </button>
      </div>
    </div>
  );
}

export default App;

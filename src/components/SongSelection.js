import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic, faPlay } from '@fortawesome/free-solid-svg-icons';
import './SongSelection.css';

const SongSelection = ({ songs, currentSong, onSongSelect }) => {
  const [showSongList, setShowSongList] = useState(false);
  
  // Toggle song list visibility
  const toggleSongList = () => {
    setShowSongList(!showSongList);
  };
  
  // Handle song selection
  const handleSongSelect = (song) => {
    if (onSongSelect) {
      onSongSelect(song);
      setShowSongList(false); // Hide the list after selection
    }
  };
  
  return (
    <>
      <button className="song-selection-button" onClick={toggleSongList}>
        <FontAwesomeIcon icon={faMusic} />
        Songs
      </button>
      
      {showSongList && (
        <div className="song-list-container">
          <div className="song-list-header">Available Songs</div>
          <ul className="song-list">
            {songs.map((song) => (
              <li 
                key={song.id}
                className={currentSong && currentSong.id === song.id ? 'active' : ''}
                onClick={() => handleSongSelect(song)}
              >
                <div className="song-info">
                  <div className="song-name">{song.displayName}</div>
                  <div className="song-artist">{song.artist}</div>
                </div>
                {currentSong && currentSong.id === song.id && (
                  <div className="song-play-indicator">
                    <FontAwesomeIcon icon={faPlay} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default SongSelection;

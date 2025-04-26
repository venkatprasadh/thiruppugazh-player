import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faBackward, faForward } from '@fortawesome/free-solid-svg-icons';
import '../App.css';

const MusicPlayer = forwardRef(({ songs, onSongProgress }, ref) => {
  // Ensure songs is always an array
  const songList = Array.isArray(songs) && songs.length > 0 ? songs : [];
  
  // State variables
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicIndex, setMusicIndex] = useState(0);
  const [currentSong, setCurrentSong] = useState(songList.length > 0 ? songList[0] : null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Refs
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    seekToTime: (time) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
      }
    },
    selectSong: (song) => {
      // Find the index of the selected song
      const selectedIndex = songList.findIndex(s => s.id === song.id);
      if (selectedIndex !== -1) {
        setMusicIndex(selectedIndex);
        loadMusic(song);
        
        // If music is already playing, continue playing the new song
        if (isPlaying && audioRef.current) {
          setTimeout(() => {
            audioRef.current.play();
          }, 100);
        }
      }
    }
  }));

  // Function to toggle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  };

  // Function to play music
  const playMusic = () => {
    setIsPlaying(true);
    audioRef.current.play();
  };

  // Function to pause music
  const pauseMusic = () => {
    setIsPlaying(false);
    audioRef.current.pause();
  };
  // Function to load music
  const loadMusic = (song) => {
    if (song) {
      setCurrentSong(song);
    }
  };
  // Function to change music
  const changeMusic = (direction) => {
    if (songList.length === 0) return;
    
    const newIndex = (musicIndex + direction + songList.length) % songList.length;
    setMusicIndex(newIndex);
    loadMusic(songList[newIndex]);
    
    // If music is already playing, continue playing the new song
    if (isPlaying) {
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play();
        }
      }, 100);
    }
  };
    // Function to update progress bar
  const updateProgressBar = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 0;
      
      setCurrentTime(currentTime);
      setDuration(duration);
      
      const progressPercent = (currentTime / duration) * 100;
      setProgress(progressPercent || 0);
      
      // Pass current song and time to parent component for lyrics display
      if (onSongProgress && currentSong) {
        onSongProgress(currentSong, currentTime);
      }
    }
  };

  // Function to set progress bar when clicked
  const setProgressBar = (e) => {
    const width = progressBarRef.current.clientWidth;
    const clickX = e.nativeEvent.offsetX;
    audioRef.current.currentTime = (clickX / width) * audioRef.current.duration;
  };

  // Format time to MM:SS
  const formatTime = (time) => {
    if (isNaN(time) || time === 0) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };  // Effect to load the initial song
  useEffect(() => {
    if (songList.length > 0) {
      loadMusic(songList[musicIndex]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to update song when musicIndex changes
  useEffect(() => {
    if (songList.length > 0 && musicIndex < songList.length) {
      loadMusic(songList[musicIndex]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicIndex, songs]);
  // If there are no songs, show a placeholder
  if (!currentSong || songList.length === 0) {
    return (
      <div className="container">
        <div className="player-img">
          <div className="no-music">No songs available</div>
        </div>
        <h2>No Music Available</h2>
        <h3>Please add songs to your collection</h3>
      </div>
    );
  }
  
  return (
    <>
      <div className="background">
        <img src={currentSong.cover} alt="background" id="bg-img" />
      </div>
      
      <div className="container">
        <div className="player-img">
          <img 
            src={currentSong.cover} 
            className="active" 
            alt="album cover"
            id="cover"
          />
        </div>
        
        <h2 id="music-title">{currentSong.displayName}</h2>
        <h3 id="music-artist">{currentSong.artist}</h3>
        
        <div 
          className="player-progress" 
          id="player-progress"
          ref={progressBarRef}
          onClick={setProgressBar}
        >
          <div 
            className="progress" 
            id="progress"
            style={{ width: `${progress}%` }}
          ></div>
          <div className="music-duration">
            <span id="current-time">{formatTime(currentTime)}</span>
            <span id="duration">{formatTime(duration)}</span>
          </div>
        </div>
        
        <div className="player-controls">
          <FontAwesomeIcon 
            icon={faBackward} 
            title="Previous" 
            id="prev"
            onClick={() => changeMusic(-1)}
          />
          <FontAwesomeIcon 
            icon={isPlaying ? faPause : faPlay} 
            className="play-button"
            title={isPlaying ? "Pause" : "Play"} 
            id="play"
            onClick={togglePlay}
          />
          <FontAwesomeIcon 
            icon={faForward} 
            title="Next" 
            id="next"
            onClick={() => changeMusic(1)}
          />
        </div>
      </div>      <audio 
        ref={audioRef}
        src={currentSong ? currentSong.path : ''}
        onTimeUpdate={updateProgressBar}
        onLoadedMetadata={updateProgressBar}
        onEnded={() => changeMusic(1)}
      />
    </>  );
});

// This ensures proper naming of the component for React DevTools
MusicPlayer.displayName = 'MusicPlayer';

export default MusicPlayer;

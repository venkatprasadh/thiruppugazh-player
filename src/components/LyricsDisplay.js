import React, { useState, useEffect, useRef } from 'react';
import { getLyricsBySong, getCurrentLyric } from '../services/lyricsService';
import './LyricsDisplay.css';

function LyricsDisplay({ currentSong, currentTime }) {
  const [lyrics, setLyrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const lyricsContainerRef = useRef(null);
  const activeLyricRef = useRef(null);
    // Load lyrics when the song changes
  useEffect(() => {
    const fetchLyrics = async () => {
      if (!currentSong) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const songLyrics = await getLyricsBySong(currentSong);
        setLyrics(songLyrics || []);
      } catch (err) {
        console.error('Failed to load lyrics:', err);
        setError('Failed to load lyrics');
        setLyrics([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLyrics();
  }, [currentSong]);
  
  // Update active lyric based on current time
  useEffect(() => {
    if (!lyrics || lyrics.length === 0) return;
    
    const currentLyric = getCurrentLyric(lyrics, currentTime);
    if (currentLyric && currentLyric.index !== activeLyricIndex) {
      setActiveLyricIndex(currentLyric.index);
    }
  }, [currentTime, lyrics, activeLyricIndex]);
  
  // Scroll to active lyric
  useEffect(() => {
    if (activeLyricRef.current && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;
      const activeElement = activeLyricRef.current;
      
      const containerHeight = container.clientHeight;
      const activeElementTop = activeElement.offsetTop;
      const activeElementHeight = activeElement.clientHeight;
      
      // Scroll the container so that the active lyric is centered
      container.scrollTop = activeElementTop - containerHeight / 2 + activeElementHeight / 2;
    }
  }, [activeLyricIndex]);
  
  // Render loading state
  if (loading) {
    return (
      <div className="lyrics-container">
        <div className="lyrics-loading">Loading lyrics...</div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="lyrics-container">
        <div className="lyrics-error">{error}</div>
      </div>
    );
  }
  
  // Render empty state
  if (!lyrics || lyrics.length === 0) {
    return (
      <div className="lyrics-container">
        <div className="lyrics-empty">No lyrics available for this song.</div>
      </div>
    );
  }
    // Render lyrics
  return (
    <div className="lyrics-container" ref={lyricsContainerRef}>
      <h3 className="lyrics-title">{currentSong?.displayName}</h3>
      <div className="lyrics-scroll-area">
        {lyrics.map((lyric, index) => {
          // Check if the line contains dots (indicating a musical interlude)
          const hasDots = lyric.text.includes('......');
          
          // Replace multiple dots with a musical interlude symbol
          const formattedText = hasDots 
            ? lyric.text.replace('......', '♪♫♪')
            : lyric.text;
            
          return (
            <div
              key={index}
              ref={index === activeLyricIndex ? activeLyricRef : null}
              className={`lyrics-line ${index === activeLyricIndex ? 'active' : ''} ${hasDots ? 'interlude' : ''}`}
            >
              {formattedText}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LyricsDisplay;

import React, { useState, useEffect, useRef } from 'react';
import { getLyricsBySong, getCurrentLyric } from '../services/lyricsService';
import './LyricsDisplay.css';

function LyricsDisplay({ currentSong, currentTime, onSeekToTime }) {
  const [lyrics, setLyrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const scrollAreaRef = useRef(null); // Changed to reference the actual scrollable area
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
      console.log('Active lyric changed to index:', currentLyric.index, 'Text:', currentLyric.text);
      setActiveLyricIndex(currentLyric.index);
    }
  }, [currentTime, lyrics, activeLyricIndex]);  // Scroll to active lyric
  useEffect(() => {
    // Only attempt to scroll if we have a valid active lyric index
    if (activeLyricIndex < 0) return;
    
    // Use setTimeout to ensure the DOM has updated before trying to scroll
    const scrollTimeout = setTimeout(() => {
      // Check if refs are available
      if (activeLyricRef.current && scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current;
        const activeElement = activeLyricRef.current;
        
        // Get the top position of the active element relative to the scroll container
        const activeElementTop = activeElement.offsetTop;
        
        // Add some padding at the top for better visibility
        const topPadding = 20;
        
        // Log for debugging
        console.log('Scrolling to position:', activeElementTop - topPadding);
        console.log('Active element:', activeElement);
        console.log('Scroll container:', scrollContainer);
          // Try two different scroll methods for maximum compatibility
        try {
          // Method 1: Use scrollTo with smooth behavior
          scrollContainer.scrollTo({
            top: activeElementTop - topPadding,
            behavior: 'smooth'
          });
          
          // Method 2: Direct property assignment as fallback
          // Some browsers might not support scrollTo with options
          scrollContainer.scrollTop = activeElementTop - topPadding;
        } catch (err) {
          // Fallback if scrollTo fails
          console.error('Error during scroll:', err);
          scrollContainer.scrollTop = activeElementTop - topPadding;
        }
      } else {
        console.log('Refs not available for scrolling:', {
          activeLyricRef: activeLyricRef.current,
          scrollAreaRef: scrollAreaRef.current,
          activeLyricIndex
        });
      }
    }, 50); // Small delay to ensure DOM update
    
    // Clean up timeout
    return () => clearTimeout(scrollTimeout);
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
  // Handle click on a lyric line to seek to that timestamp
  const handleLyricClick = (time) => {
    if (onSeekToTime) {
      onSeekToTime(time);
    }
  };
  // Render lyrics
  return (
    <div className="lyrics-container">
      <div className="lyrics-scroll-area" ref={scrollAreaRef}>
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
              onClick={() => handleLyricClick(lyric.time)}
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

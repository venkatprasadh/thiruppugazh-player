import React, { useState, useEffect, useRef } from 'react';
import { getLyricsBySong, getCurrentLyric } from '../services/lyricsService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExpand, faCompress, faGear, faTimes, 
  faMagnifyingGlassMinus, faMagnifyingGlassPlus, 
  faFont, faPalette
} from '@fortawesome/free-solid-svg-icons';
import './LyricsDisplay.css';

function LyricsDisplay({ currentSong, currentTime, onSeekToTime }) {
  const [lyrics, setLyrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const scrollAreaRef = useRef(null);
  const activeLyricRef = useRef(null);
  const lyricsContainerRef = useRef(null);
  
  // Customization states
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100); // 100% by default
  const [textColor, setTextColor] = useState('#FFFFFF'); // White by default
  const [activeColor, setActiveColor] = useState('#FFD700'); // Gold by default
  const [bgOpacity, setBgOpacity] = useState(65); // 65% by default
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
  }, [currentTime, lyrics, activeLyricIndex]);  
  
  // Scroll to active lyric
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
        
        // Get all lyric lines
        const lyricsLines = document.querySelectorAll('.lyrics-line');
        
        // Calculate line height for a typical line
        const lineHeight = activeElement.offsetHeight;
        
        // Calculate offset to position this line as the second visible line
        // We want one line before this one to be visible
        const topOffset = lineHeight + 30; // One line height + some padding
        
        // Log for debugging
        console.log('Scrolling to show active lyric as second line:', activeElementTop - topOffset);
        console.log('Active element:', activeElement);
        console.log('Line height:', lineHeight);
          
        // Try two different scroll methods for maximum compatibility
        try {
          // Method 1: Use scrollTo with smooth behavior
          scrollContainer.scrollTo({
            top: activeElementTop - topOffset,
            behavior: 'smooth'
          });
          
          // Method 2: Direct property assignment as fallback
          // Some browsers might not support scrollTo with options
          scrollContainer.scrollTop = activeElementTop - topOffset;
        } catch (err) {
          // Fallback if scrollTo fails
          console.error('Error during scroll:', err);
          scrollContainer.scrollTop = activeElementTop - topOffset;
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
    return () => clearTimeout(scrollTimeout);  }, [activeLyricIndex]);
  
  // Watch for full screen change events - placed BEFORE any conditional returns
  useEffect(() => {
    const onFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', onFullScreenChange);
    document.addEventListener('webkitfullscreenchange', onFullScreenChange);
    document.addEventListener('mozfullscreenchange', onFullScreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', onFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullScreenChange);
      document.removeEventListener('mozfullscreenchange', onFullScreenChange);
    };
  }, []);
  
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
  };  // Toggle fullscreen mode
  const toggleFullScreen = () => {
    if (!isFullScreen) {
      // Enter full screen mode
      if (lyricsContainerRef.current.requestFullscreen) {
        lyricsContainerRef.current.requestFullscreen();
      } else if (lyricsContainerRef.current.webkitRequestFullscreen) {
        lyricsContainerRef.current.webkitRequestFullscreen();
      } else if (lyricsContainerRef.current.msRequestFullscreen) {
        lyricsContainerRef.current.msRequestFullscreen();
      }
      setIsFullScreen(true);
    } else {
      // Exit full screen mode
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullScreen(false);
    }
  };
  
  // Toggle settings panel
  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };
  
  // Adjust font size
  const changeFontSize = (increase) => {
    setFontSize(prev => {
      const newSize = increase ? prev + 10 : prev - 10;
      return Math.min(Math.max(newSize, 70), 150); // Limit between 70% and 150%
    });
  };
  
  // Adjust background opacity
  const adjustBgOpacity = (increase) => {
    setBgOpacity(prev => {
      const newOpacity = increase ? prev + 5 : prev - 5;
      return Math.min(Math.max(newOpacity, 30), 95); // Limit between 30% and 95%
    });
  };
  
  // Apply custom styles to container
  const customContainerStyle = {
    backgroundColor: `rgba(0, 0, 0, ${bgOpacity/100})`,
    fontSize: `${fontSize}%`,
  };
    // Apply custom styles to active lyric
  const getCustomLyricStyle = (isActive) => {
    if (isActive) {
      return {
        color: activeColor,
        backgroundColor: `rgba(${parseInt(activeColor.slice(1, 3), 16)}, ${parseInt(activeColor.slice(3, 5), 16)}, ${parseInt(activeColor.slice(5, 7), 16)}, 0.2)`,
      };
    } else {
      return { color: textColor };
    }
  };
  
  // Render lyrics
  return (
    <div 
      className={`lyrics-container ${isFullScreen ? 'fullscreen' : ''}`} 
      style={customContainerStyle}
      ref={lyricsContainerRef}
    >
      <div className="lyrics-controls">
        <button className="lyrics-control-btn" onClick={toggleFullScreen} title={isFullScreen ? "Exit Full Screen" : "Full Screen"}>
          <FontAwesomeIcon icon={isFullScreen ? faCompress : faExpand} />
        </button>
        <button className="lyrics-control-btn" onClick={toggleSettings} title="Settings">
          <FontAwesomeIcon icon={faGear} />
        </button>
      </div>
      
      {isSettingsOpen && (
        <div className="lyrics-settings-panel">
          <div className="lyrics-settings-header">
            <h3>Customize Lyrics</h3>
            <button className="lyrics-close-btn" onClick={toggleSettings}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          
          <div className="lyrics-settings-group">
            <span>Font Size</span>
            <div className="lyrics-settings-controls">
              <button onClick={() => changeFontSize(false)} title="Decrease Font Size">
                <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
              </button>
              <span>{fontSize}%</span>
              <button onClick={() => changeFontSize(true)} title="Increase Font Size">
                <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
              </button>
            </div>
          </div>
          
          <div className="lyrics-settings-group">
            <span>Text Color</span>
            <div className="lyrics-settings-controls">
              <input 
                type="color" 
                value={textColor} 
                onChange={(e) => setTextColor(e.target.value)} 
                title="Change Text Color"
              />
            </div>
          </div>
          
          <div className="lyrics-settings-group">
            <span>Active Lyric Color</span>
            <div className="lyrics-settings-controls">
              <input 
                type="color" 
                value={activeColor} 
                onChange={(e) => setActiveColor(e.target.value)} 
                title="Change Active Lyric Color"
              />
            </div>
          </div>
          
          <div className="lyrics-settings-group">
            <span>Background Opacity</span>
            <div className="lyrics-settings-controls">
              <button onClick={() => adjustBgOpacity(false)} title="Decrease Opacity">-</button>
              <span>{bgOpacity}%</span>
              <button onClick={() => adjustBgOpacity(true)} title="Increase Opacity">+</button>
            </div>
          </div>
        </div>
      )}
      
      <div className="lyrics-scroll-area" ref={scrollAreaRef}>
        {lyrics.map((lyric, index) => {
          // Check if the line contains dots (indicating a musical interlude)
          const hasDots = lyric.text.includes('......');
          
          // Replace multiple dots with a musical interlude symbol
          const formattedText = hasDots 
            ? lyric.text.replace('......', '♪♫♪')
            : lyric.text;
            
          return (            <div
              key={index}
              ref={index === activeLyricIndex ? activeLyricRef : null}
              className={`lyrics-line ${index === activeLyricIndex ? 'active' : ''} ${hasDots ? 'interlude' : ''}`}
              onClick={() => handleLyricClick(lyric.time)}
              style={getCustomLyricStyle(index === activeLyricIndex)}
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

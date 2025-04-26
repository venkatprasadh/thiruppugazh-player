// Service for handling the lyrics functionality

// Cache for parsed lyrics
const lyricsCache = {};

// Function to parse LRC file content
const parseLRC = (lrcContent) => {
  const lines = lrcContent.split('\n');
  const lyrics = [];
  
  lines.forEach(line => {
    if (!line.trim() || line.startsWith('//')) return;
    
    const timeRegex = /\[(\d+):(\d+\.\d+)\](.*)/;
    const match = timeRegex.exec(line);
    
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      const text = match[3].trim();
      
      const time = minutes * 60 + seconds;
      
      // Skip empty lines or lines with just dots
      if (text && !text.match(/^\.+$/)) {
        lyrics.push({ time, text });
      }
    }
  });
  
  // Sort lyrics by time
  return lyrics.sort((a, b) => a.time - b.time);
};

// Function to load lyrics from LRC file
const loadLyrics = async (song) => {
  if (!song || !song.lyricsFile) {
    console.error(`No lyrics file available for song`, song);
    return null;
  }

  // Generate a cache key based on song ID
  const cacheKey = `song-${song.id}`;

  // If already in cache, return from cache
  if (lyricsCache[cacheKey]) {
    return lyricsCache[cacheKey];
  }
  
  try {
    const response = await fetch(song.lyricsFile);
    
    if (!response.ok) {
      throw new Error(`Failed to load lyrics: ${response.status}`);
    }
    
    const lrcContent = await response.text();
    const parsedLyrics = parseLRC(lrcContent);
    
    // Cache the parsed lyrics
    lyricsCache[cacheKey] = parsedLyrics;
    
    return parsedLyrics;
  } catch (error) {
    console.error('Error loading lyrics:', error);
    return null;
  }
};

// Function to get lyrics for a song
export const getLyricsBySong = async (song) => {
  return await loadLyrics(song);
};

// Function to find the current lyric based on the song time
export const getCurrentLyric = (lyrics, currentTime) => {
  if (!lyrics || lyrics.length === 0) {
    return null;
  }
  
  // Find the current lyric and the next one for endTime calculation
  let currentIndex = -1;
  
  for (let i = 0; i < lyrics.length; i++) {
    if (lyrics[i].time <= currentTime) {
      currentIndex = i;
    } else {
      break;
    }
  }
  
  if (currentIndex === -1) {
    return null; // No lyrics for current time
  }
  
  const currentLyric = lyrics[currentIndex];
  const nextLyric = lyrics[currentIndex + 1];
  const endTime = nextLyric ? nextLyric.time : Number.MAX_SAFE_INTEGER;
  
  return {
    text: currentLyric.text,
    startTime: currentLyric.time,
    endTime,
    isActive: currentTime >= currentLyric.time && currentTime < endTime,
    index: currentIndex  };
};
